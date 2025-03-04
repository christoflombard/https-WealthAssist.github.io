/**
 * WebGL Interactive Background for Wealth Assist
 * Creates a stunning, interactive 3D background with parallax effect
 */

// Initialize when DOM is fully loaded
document.addEventListener('DOMContentLoaded', function() {
    // Create WebGL canvas
    createWebGLCanvas();
    
    // Initialize WebGL
    initWebGL();
});

/**
 * Create WebGL canvas and append to body
 */
function createWebGLCanvas() {
    // Create canvas if it doesn't exist
    if (!document.getElementById('webgl-background')) {
        const canvas = document.createElement('canvas');
        canvas.id = 'webgl-background';
        canvas.style.position = 'fixed';
        canvas.style.top = '0';
        canvas.style.left = '0';
        canvas.style.width = '100%';
        canvas.style.height = '100%';
        canvas.style.zIndex = '-3';
        canvas.style.pointerEvents = 'none';
        document.body.appendChild(canvas);
        
        // Add CSS for the canvas
        const style = document.createElement('style');
        style.textContent = `
            #webgl-background {
                position: fixed;
                top: 0;
                left: 0;
                width: 100%;
                height: 100%;
                z-index: -3;
                pointer-events: none;
            }
        `;
        document.head.appendChild(style);
    }
}

/**
 * Initialize WebGL with Three.js
 */
function initWebGL() {
    // Check if Three.js is loaded
    if (typeof THREE === 'undefined') {
        // Load Three.js dynamically
        const script = document.createElement('script');
        script.src = 'https://cdnjs.cloudflare.com/ajax/libs/three.js/r128/three.min.js';
        script.onload = setupThreeJS;
        document.head.appendChild(script);
    } else {
        setupThreeJS();
    }
}

/**
 * Setup Three.js scene, camera, renderer
 */
function setupThreeJS() {
    const canvas = document.getElementById('webgl-background');
    
    // Create scene
    const scene = new THREE.Scene();
    
    // Create camera
    const camera = new THREE.PerspectiveCamera(
        75,
        window.innerWidth / window.innerHeight,
        0.1,
        1000
    );
    camera.position.z = 30;
    
    // Create renderer
    const renderer = new THREE.WebGLRenderer({
        canvas: canvas,
        antialias: true,
        alpha: true
    });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(window.devicePixelRatio);
    renderer.setClearColor(0x000000, 0);
    
    // Create gradient background
    const gradientTexture = createGradientTexture();
    const gradientMaterial = new THREE.MeshBasicMaterial({
        map: gradientTexture,
        transparent: true,
        opacity: 0.5
    });
    const gradientPlane = new THREE.PlaneGeometry(window.innerWidth, window.innerHeight);
    const gradientMesh = new THREE.Mesh(gradientPlane, gradientMaterial);
    gradientMesh.position.z = -10;
    scene.add(gradientMesh);
    
    // Create particles
    const particles = createParticles();
    scene.add(particles);
    
    // Create floating shapes
    const shapes = createFloatingShapes();
    scene.add(shapes);
    
    // Create light effects
    const lights = createLights();
    lights.forEach(light => scene.add(light));
    
    // Mouse movement for parallax
    let mouseX = 0;
    let mouseY = 0;
    let targetX = 0;
    let targetY = 0;
    
    document.addEventListener('mousemove', (event) => {
        mouseX = (event.clientX / window.innerWidth) * 2 - 1;
        mouseY = -(event.clientY / window.innerHeight) * 2 + 1;
    });
    
    // Handle window resize
    window.addEventListener('resize', () => {
        camera.aspect = window.innerWidth / window.innerHeight;
        camera.updateProjectionMatrix();
        renderer.setSize(window.innerWidth, window.innerHeight);
        
        // Update gradient plane size
        gradientMesh.geometry = new THREE.PlaneGeometry(window.innerWidth, window.innerHeight);
    });
    
    // Animation loop
    function animate() {
        requestAnimationFrame(animate);
        
        // Smooth parallax effect
        targetX = mouseX * 0.1;
        targetY = mouseY * 0.1;
        
        camera.position.x += (targetX - camera.position.x) * 0.05;
        camera.position.y += (targetY - camera.position.y) * 0.05;
        camera.lookAt(scene.position);
        
        // Animate particles
        const particlePositions = particles.geometry.attributes.position.array;
        for (let i = 0; i < particlePositions.length; i += 3) {
            particlePositions[i + 1] += Math.sin((i + Date.now() * 0.001) * 0.1) * 0.01;
        }
        particles.geometry.attributes.position.needsUpdate = true;
        
        // Animate shapes
        shapes.children.forEach((shape, i) => {
            shape.rotation.x += 0.001;
            shape.rotation.y += 0.002;
            shape.position.y += Math.sin((Date.now() * 0.001) + i) * 0.01;
        });
        
        renderer.render(scene, camera);
    }
    
    animate();
}

/**
 * Create gradient texture for background
 */
function createGradientTexture() {
    const canvas = document.createElement('canvas');
    canvas.width = 1024;
    canvas.height = 1024;
    
    const ctx = canvas.getContext('2d');
    
    // Create gradient
    const gradient = ctx.createRadialGradient(
        canvas.width / 2,
        canvas.height / 2,
        0,
        canvas.width / 2,
        canvas.height / 2,
        canvas.width / 2
    );
    
    // Add colors
    gradient.addColorStop(0, 'rgba(14, 165, 233, 0.2)');
    gradient.addColorStop(0.5, 'rgba(15, 23, 42, 0.2)');
    gradient.addColorStop(1, 'rgba(171, 18, 28, 0.2)');
    
    // Fill with gradient
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    // Create texture
    const texture = new THREE.Texture(canvas);
    texture.needsUpdate = true;
    
    return texture;
}

/**
 * Create particles system
 */
function createParticles() {
    const particleCount = 1000;
    const positions = new Float32Array(particleCount * 3);
    const colors = new Float32Array(particleCount * 3);
    const sizes = new Float32Array(particleCount);
    
    const color1 = new THREE.Color(0x0ea5e9); // Blue
    const color2 = new THREE.Color(0xab121c); // Red
    
    for (let i = 0; i < particleCount; i++) {
        // Position
        positions[i * 3] = (Math.random() - 0.5) * 100; // x
        positions[i * 3 + 1] = (Math.random() - 0.5) * 100; // y
        positions[i * 3 + 2] = (Math.random() - 0.5) * 100; // z
        
        // Color
        const mixedColor = color1.clone().lerp(color2, Math.random());
        colors[i * 3] = mixedColor.r;
        colors[i * 3 + 1] = mixedColor.g;
        colors[i * 3 + 2] = mixedColor.b;
        
        // Size
        sizes[i] = Math.random() * 2;
    }
    
    const geometry = new THREE.BufferGeometry();
    geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    geometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));
    geometry.setAttribute('size', new THREE.BufferAttribute(sizes, 1));
    
    const material = new THREE.PointsMaterial({
        size: 0.1,
        vertexColors: true,
        transparent: true,
        opacity: 0.8,
        sizeAttenuation: true
    });
    
    return new THREE.Points(geometry, material);
}

/**
 * Create floating shapes
 */
function createFloatingShapes() {
    const group = new THREE.Group();
    
    // Materials
    const blueMaterial = new THREE.MeshPhongMaterial({
        color: 0x0ea5e9,
        transparent: true,
        opacity: 0.2,
        side: THREE.DoubleSide
    });
    
    const redMaterial = new THREE.MeshPhongMaterial({
        color: 0xab121c,
        transparent: true,
        opacity: 0.2,
        side: THREE.DoubleSide
    });
    
    // Create shapes
    for (let i = 0; i < 20; i++) {
        let geometry;
        const type = Math.floor(Math.random() * 3);
        
        switch (type) {
            case 0:
                geometry = new THREE.IcosahedronGeometry(Math.random() * 2 + 1, 0);
                break;
            case 1:
                geometry = new THREE.OctahedronGeometry(Math.random() * 2 + 1, 0);
                break;
            case 2:
                geometry = new THREE.TetrahedronGeometry(Math.random() * 2 + 1, 0);
                break;
        }
        
        const material = Math.random() > 0.5 ? blueMaterial : redMaterial;
        const shape = new THREE.Mesh(geometry, material);
        
        // Position
        shape.position.x = (Math.random() - 0.5) * 80;
        shape.position.y = (Math.random() - 0.5) * 80;
        shape.position.z = (Math.random() - 0.5) * 50;
        
        // Rotation
        shape.rotation.x = Math.random() * Math.PI;
        shape.rotation.y = Math.random() * Math.PI;
        
        group.add(shape);
    }
    
    return group;
}

/**
 * Create lights for the scene
 */
function createLights() {
    const lights = [];
    
    // Ambient light
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
    lights.push(ambientLight);
    
    // Point lights
    const blueLight = new THREE.PointLight(0x0ea5e9, 1, 100);
    blueLight.position.set(30, 30, 30);
    lights.push(blueLight);
    
    const redLight = new THREE.PointLight(0xab121c, 1, 100);
    redLight.position.set(-30, -30, 30);
    lights.push(redLight);
    
    return lights;
}