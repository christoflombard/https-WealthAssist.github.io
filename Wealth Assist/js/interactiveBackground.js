// Interactive WebGL Background with Dynamic Hover Effects
// Uses Three.js for rendering and shader-based effects

import * as THREE from 'https://cdn.jsdelivr.net/npm/three@0.132.2/build/three.module.js';
import { EffectComposer } from 'https://cdn.jsdelivr.net/npm/three@0.132.2/examples/jsm/postprocessing/EffectComposer.js';
import { RenderPass } from 'https://cdn.jsdelivr.net/npm/three@0.132.2/examples/jsm/postprocessing/RenderPass.js';
import { UnrealBloomPass } from 'https://cdn.jsdelivr.net/npm/three@0.132.2/examples/jsm/postprocessing/UnrealBloomPass.js';
import { ShaderPass } from 'https://cdn.jsdelivr.net/npm/three@0.132.2/examples/jsm/postprocessing/ShaderPass.js';

// Initialize variables
let scene, camera, renderer, composer;
let mouseMoved = false;
let mouseX = 0, mouseY = 0;
let targetMouseX = 0, targetMouseY = 0;
let windowHalfX = window.innerWidth / 2;
let windowHalfY = window.innerHeight / 2;
let particles = [];
let particleSystem;
const particleCount = 1000;
const particleDistance = 100;
const colors = [
  new THREE.Color(0x0ea5e9), // Light blue
  new THREE.Color(0xab121c)  // Red
];

// Custom shader for the particles
const particleShader = {
  vertexShader: `
    attribute float size;
    attribute vec3 customColor;
    varying vec3 vColor;
    uniform float time;
    uniform vec2 mouse;
    
    void main() {
      vColor = customColor;
      
      // Calculate distance from mouse
      vec4 mvPosition = modelViewMatrix * vec4(position, 1.0);
      vec2 screenPos = mvPosition.xy / mvPosition.z;
      float distToMouse = distance(screenPos, mouse) * 0.05;
      
      // Apply sine wave movement + mouse interaction
      float yOffset = sin(position.x * 0.05 + time * 0.2) * 10.0;
      float xOffset = cos(position.z * 0.05 + time * 0.2) * 10.0;
      float mouseInfluence = max(0.0, 5.0 - distToMouse) * 2.0;
      
      // Modify position based on mouse and time
      vec3 newPos = position;
      newPos.y += yOffset;
      newPos.x += xOffset;
      
      // Apply mouse influence - particles move away from mouse
      vec2 direction = normalize(screenPos - mouse);
      newPos.x += direction.x * mouseInfluence;
      newPos.y += direction.y * mouseInfluence;
      
      // Project to clip space
      gl_Position = projectionMatrix * modelViewMatrix * vec4(newPos, 1.0);
      
      // Size based on z-position for depth effect
      gl_PointSize = size * (100.0 / -mvPosition.z) * (1.0 + mouseInfluence * 0.2);
    }
  `,
  fragmentShader: `
    varying vec3 vColor;
    uniform float time;
    
    void main() {
      // Create soft circular particles
      float r = distance(gl_PointCoord, vec2(0.5, 0.5));
      float alpha = 1.0 - smoothstep(0.3, 0.5, r);
      
      // Pulse effect
      alpha *= 0.6 + 0.4 * sin(time * 0.8);
      
      if (alpha < 0.05) discard;
      
      gl_FragColor = vec4(vColor, alpha);
    }
  `
};

// Custom shader for post-processing
const customPass = {
  uniforms: {
    'tDiffuse': { value: null },
    'uTime': { value: 0 },
    'uMouse': { value: new THREE.Vector2(0.5, 0.5) },
    'uResolution': { value: new THREE.Vector2(window.innerWidth, window.innerHeight) }
  },
  vertexShader: `
    varying vec2 vUv;
    void main() {
      vUv = uv;
      gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
    }
  `,
  fragmentShader: `
    uniform sampler2D tDiffuse;
    uniform float uTime;
    uniform vec2 uMouse;
    uniform vec2 uResolution;
    varying vec2 vUv;
    
    // Noise function
    float noise(vec2 p) {
      return fract(sin(dot(p, vec2(12.9898, 78.233))) * 43758.5453);
    }
    
    void main() {
      // Basic screen coordinates
      vec2 uv = vUv;
      vec2 screenPos = uv * uResolution;
      
      // Distance from mouse
      float distToMouse = distance(uv, uMouse) * 2.0;
      float mouseInfluence = max(0.0, 1.0 - distToMouse) * 0.5;
      
      // Distortion based on mouse position
      float distortionX = sin(uv.y * 10.0 + uTime) * 0.001 * mouseInfluence;
      float distortionY = cos(uv.x * 10.0 + uTime) * 0.001 * mouseInfluence;
      vec2 distortedUv = uv + vec2(distortionX, distortionY);
      
      // Add subtle noise
      float noiseVal = noise(uv * 100.0 + uTime * 0.1) * 0.01 * mouseInfluence;
      distortedUv += noiseVal;
      
      // Sample color
      vec4 color = texture2D(tDiffuse, distortedUv);
      
      // Add glow around mouse position
      float glow = smoothstep(0.5, 0.0, distToMouse) * 0.4;
      color.rgb += mix(vec3(0.0, 0.4, 0.8), vec3(0.8, 0.0, 0.2), uMouse.x) * glow;
      
      gl_FragColor = color;
    }
  `
};

// Create a custom numbers effect (matrix-like)
class MatrixEffect {
  constructor() {
    this.canvas = document.createElement('canvas');
    this.canvas.width = window.innerWidth;
    this.canvas.height = window.innerHeight;
    this.canvas.id = 'matrixCanvas';
    this.canvas.style.position = 'fixed';
    this.canvas.style.top = '0';
    this.canvas.style.left = '0';
    this.canvas.style.zIndex = '-1';
    this.canvas.style.opacity = '0.15';
    this.canvas.style.pointerEvents = 'none';
    document.body.appendChild(this.canvas);
    
    this.ctx = this.canvas.getContext('2d');
    this.characters = '0123456789ABCDEF$%&+-./:;=?@#';
    this.columns = Math.floor(this.canvas.width / 20);
    this.drops = [];
    
    for (let i = 0; i < this.columns; i++) {
      this.drops[i] = Math.floor(Math.random() * -20);
    }
    
    this.draw = this.draw.bind(this);
    this.mouseX = window.innerWidth / 2;
    this.mouseY = window.innerHeight / 2;
    
    window.addEventListener('mousemove', (e) => {
      this.mouseX = e.clientX;
      this.mouseY = e.clientY;
    });
    
    this.draw();
  }
  
  draw() {
    // Semi-transparent background to create fade effect
    this.ctx.fillStyle = 'rgba(15, 23, 42, 0.05)';
    this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
    
    // Calculate distance from mouse for each column
    for (let i = 0; i < this.columns; i++) {
      // Position of this column
      const x = i * 20;
      const y = this.drops[i] * 20;
      
      // Distance from mouse
      const dx = x - this.mouseX;
      const dy = y - this.mouseY;
      const distance = Math.sqrt(dx * dx + dy * dy);
      
      // Character color based on distance from mouse
      if (distance < 200) {
        this.ctx.fillStyle = `rgba(171, 18, 28, ${1 - distance/200})`;
      } else {
        this.ctx.fillStyle = 'rgba(14, 165, 233, 0.8)';
      }
      
      // Random character
      const text = this.characters[Math.floor(Math.random() * this.characters.length)];
      this.ctx.font = '15px monospace';
      this.ctx.fillText(text, x, y);
      
      // Reset when off screen or randomly
      if (y > this.canvas.height || Math.random() > 0.99) {
        this.drops[i] = 0;
      }
      
      // Speed based on distance from mouse
      const speed = distance < 200 ? 1.5 : 1;
      this.drops[i]++;
    }
    
    requestAnimationFrame(this.draw);
  }
  
  resize() {
    this.canvas.width = window.innerWidth;
    this.canvas.height = window.innerHeight;
    this.columns = Math.floor(this.canvas.width / 20);
    this.drops = [];
    
    for (let i = 0; i < this.columns; i++) {
      this.drops[i] = Math.floor(Math.random() * -20);
    }
  }
}

// Initialize the scene
function init() {
  // Set up scene
  scene = new THREE.Scene();
  scene.fog = new THREE.FogExp2(0x0f172a, 0.002);
  
  // Set up camera
  camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 1, 1000);
  camera.position.z = 150;
  
  // Set up renderer
  renderer = new THREE.WebGLRenderer({ 
    alpha: true,
    antialias: true 
  });
  renderer.setPixelRatio(window.devicePixelRatio);
  renderer.setSize(window.innerWidth, window.innerHeight);
  renderer.setClearColor(0x0f172a, 1);
  renderer.domElement.id = 'physicsCanvas';
  
  // Check if physicsCanvas already exists
  const existingCanvas = document.getElementById('physicsCanvas');
  if (existingCanvas) {
    // Replace the existing canvas
    existingCanvas.parentNode.replaceChild(renderer.domElement, existingCanvas);
  } else {
    // Add the new canvas
    document.body.appendChild(renderer.domElement);
  }
  
  // Set up post-processing
  composer = new EffectComposer(renderer);
  composer.addPass(new RenderPass(scene, camera));
  
  // Add bloom effect
  const bloomPass = new UnrealBloomPass(
    new THREE.Vector2(window.innerWidth, window.innerHeight),
    0.5,  // strength
    0.4,  // radius
    0.85   // threshold
  );
  composer.addPass(bloomPass);
  
  // Add custom shader pass
  const customShaderPass = new ShaderPass({
    uniforms: customPass.uniforms,
    vertexShader: customPass.vertexShader,
    fragmentShader: customPass.fragmentShader
  });
  composer.addPass(customShaderPass);
  
  // Create particle system
  createParticles();
  
  // Create matrix-like number effect
  const matrixEffect = new MatrixEffect();
  
  // Handle window resize
  window.addEventListener('resize', onWindowResize);
  
  // Add mouse move listener
  document.addEventListener('mousemove', onMouseMove);
  
  // Start animation
  animate();
}

// Create particles for the particle system
function createParticles() {
  const geometry = new THREE.BufferGeometry();
  const positions = new Float32Array(particleCount * 3);
  const colors = new Float32Array(particleCount * 3);
  const sizes = new Float32Array(particleCount);
  
  const colorOptions = [
    new THREE.Color(0x0ea5e9),  // Light blue
    new THREE.Color(0xab121c)   // Red
  ];
  
  for (let i = 0; i < particleCount; i++) {
    // Positions - spread in a 3D space
    const spread = particleDistance;
    positions[i * 3] = (Math.random() - 0.5) * spread;     // x
    positions[i * 3 + 1] = (Math.random() - 0.5) * spread; // y
    positions[i * 3 + 2] = (Math.random() - 0.5) * spread; // z
    
    // Colors - mix between blue and red
    const color = colorOptions[Math.floor(Math.random() * colorOptions.length)];
    colors[i * 3] = color.r;
    colors[i * 3 + 1] = color.g;
    colors[i * 3 + 2] = color.b;
    
    // Sizes - random variation
    sizes[i] = Math.random() * 3 + 1;
  }
  
  geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
  geometry.setAttribute('customColor', new THREE.BufferAttribute(colors, 3));
  geometry.setAttribute('size', new THREE.BufferAttribute(sizes, 1));
  
  // Particle material using custom shader
  const material = new THREE.ShaderMaterial({
    uniforms: {
      time: { value: 0 },
      mouse: { value: new THREE.Vector2(0, 0) }
    },
    vertexShader: particleShader.vertexShader,
    fragmentShader: particleShader.fragmentShader,
    transparent: true,
    blending: THREE.AdditiveBlending,
    depthTest: false
  });
  
  // Create the particle system
  particleSystem = new THREE.Points(geometry, material);
  scene.add(particleSystem);
}

// Handle window resize
function onWindowResize() {
  windowHalfX = window.innerWidth / 2;
  windowHalfY = window.innerHeight / 2;
  
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  
  renderer.setSize(window.innerWidth, window.innerHeight);
  composer.setSize(window.innerWidth, window.innerHeight);
  
  // Update custom shader uniforms
  const customShaderPass = composer.passes[2];
  customShaderPass.uniforms.uResolution.value.set(window.innerWidth, window.innerHeight);
  
  // Update matrix effect if it exists
  const matrixCanvas = document.getElementById('matrixCanvas');
  if (matrixCanvas) {
    const matrixEffect = new MatrixEffect();
    matrixEffect.resize();
  }
}

// Handle mouse movement
function onMouseMove(event) {
  mouseMoved = true;
  
  // Normalized mouse coordinates
  mouseX = (event.clientX - windowHalfX) / windowHalfX;
  mouseY = (event.clientY - windowHalfY) / windowHalfY;
  
  // Update shader uniforms for custom effects
  const customShaderPass = composer.passes[2];
  customShaderPass.uniforms.uMouse.value.x = event.clientX / window.innerWidth;
  customShaderPass.uniforms.uMouse.value.y = 1.0 - (event.clientY / window.innerHeight);
  
  // Update particle system mouse position
  if (particleSystem) {
    particleSystem.material.uniforms.mouse.value.set(
      (event.clientX / window.innerWidth) * 2 - 1,
      -(event.clientY / window.innerHeight) * 2 + 1
    );
  }
}

// Animation loop
function animate() {
  requestAnimationFrame(animate);
  
  const time = performance.now() * 0.001; // time in seconds
  
  // Smooth mouse movement
  targetMouseX = mouseX;
  targetMouseY = mouseY;
  
  // Rotate particle system
  if (particleSystem) {
    particleSystem.rotation.x += 0.0005;
    particleSystem.rotation.y += 0.001;
    
    // Update time uniform
    particleSystem.material.uniforms.time.value = time;
  }
  
  // Update custom effect time
  const customShaderPass = composer.passes[2];
  customShaderPass.uniforms.uTime.value = time;
  
  // Camera movement based on mouse
  if (mouseMoved) {
    camera.position.x += (targetMouseX * 30 - camera.position.x) * 0.05;
    camera.position.y += (-targetMouseY * 30 - camera.position.y) * 0.05;
    camera.lookAt(scene.position);
  }
  
  // Render
  composer.render();
}

// Initialize once the DOM is loaded
document.addEventListener('DOMContentLoaded', init);

// Create a mouse trail effect
class MouseTrail {
  constructor() {
    this.points = [];
    this.maxPoints = 20;
    this.trail = document.createElement('canvas');
    this.trail.width = window.innerWidth;
    this.trail.height = window.innerHeight;
    this.trail.id = 'mouseTrail';
    this.trail.style.position = 'fixed';
    this.trail.style.top = '0';
    this.trail.style.left = '0';
    this.trail.style.zIndex = '0';
    this.trail.style.pointerEvents = 'none';
    this.ctx = this.trail.getContext('2d');
    
    document.body.appendChild(this.trail);
    
    this.addPoint = this.addPoint.bind(this);
    this.render = this.render.bind(this);
    
    window.addEventListener('mousemove', this.addPoint);
    this.render();
  }
  
  addPoint(e) {
    const point = {
      x: e.clientX,
      y: e.clientY,
      size: 10,
      color: `hsl(${Math.floor(Math.random() * 220 + 180)}, 80%, 60%)`,
      age: 0
    };
    
    this.points.push(point);
    
    if (this.points.length > this.maxPoints) {
      this.points.shift();
    }
  }
  
  render() {
    this.ctx.clearRect(0, 0, this.trail.width, this.trail.height);
    
    for (let i = 0; i < this.points.length; i++) {
      const point = this.points[i];
      point.age++;
      
      // Fade out based on age
      const alpha = 1 - (point.age / 30);
      if (alpha <= 0) {
        this.points.splice(i, 1);
        i--;
        continue;
      }
      
      // Draw glow
      const gradient = this.ctx.createRadialGradient(
        point.x, point.y, 1,
        point.x, point.y, point.size * 2
      );
      
      gradient.addColorStop(0, `rgba(14, 165, 233, ${alpha})`);
      gradient.addColorStop(0.5, `rgba(171, 18, 28, ${alpha * 0.5})`);
      gradient.addColorStop(1, `rgba(0, 0, 0, 0)`);
      
      this.ctx.beginPath();
      this.ctx.fillStyle = gradient;
      this.ctx.arc(point.x, point.y, point.size, 0, Math.PI * 2);
      this.ctx.fill();
    }
    
    requestAnimationFrame(this.render);
  }
  
  resize() {
    this.trail.width = window.innerWidth;
    this.trail.height = window.innerHeight;
  }
}

// Initialize mouse trail
document.addEventListener('DOMContentLoaded', () => {
  const mouseTrail = new MouseTrail();
  
  window.addEventListener('resize', () => {
    mouseTrail.resize();
  });
});