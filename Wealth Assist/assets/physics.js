/**
 * Physics-Based Background Animation for Wealth Assist
 * Using Matter.js to create interactive falling numbers and particles
 */

// Wait for DOM to be fully loaded
document.addEventListener('DOMContentLoaded', function() {
    // Initialize Matter.js
    initPhysics();
});

function initPhysics() {
    // Destructure Matter.js modules
    const { Engine, Render, Runner, Bodies, World, Body, Composite, Common, Mouse, MouseConstraint } = Matter;

    // Create engine
    const engine = Engine.create({
        gravity: { x: 0, y: 0.2 } // Reduced gravity for slower falling
    });
    const world = engine.world;

    // Create renderer
    const render = Render.create({
        canvas: document.getElementById('physicsCanvas'),
        engine: engine,
        options: {
            width: window.innerWidth,
            height: window.innerHeight,
            wireframes: false,
            background: 'transparent',
            showSleeping: false,
            showDebug: false,
            showBroadphase: false,
            showBounds: false,
            showVelocity: false,
            showCollisions: false,
            showSeparations: false,
            showAxes: false,
            showPositions: false,
            showAngleIndicator: false,
            showIds: false,
            showShadows: false,
            showVertexNumbers: false,
            showConvexHulls: false,
            showInternalEdges: false,
            showMousePosition: false
        }
    });

    // Run the engine and renderer
    Render.run(render);
    const runner = Runner.create();
    Runner.run(runner, engine);

    // Create boundaries to keep objects on screen
    const wallThickness = 50;
    const walls = [
        // Bottom wall
        Bodies.rectangle(window.innerWidth / 2, window.innerHeight + wallThickness / 2, window.innerWidth, wallThickness, { 
            isStatic: true,
            render: { visible: false }
        }),
        // Left wall
        Bodies.rectangle(-wallThickness / 2, window.innerHeight / 2, wallThickness, window.innerHeight, { 
            isStatic: true,
            render: { visible: false }
        }),
        // Right wall
        Bodies.rectangle(window.innerWidth + wallThickness / 2, window.innerHeight / 2, wallThickness, window.innerHeight, { 
            isStatic: true,
            render: { visible: false }
        })
    ];
    World.add(world, walls);

    // Create percentage numbers
    const percentages = ['15%', '20%', '31%', '75%', '20.9%'];
    const colors = ['#00d4ff', '#ab121c', '#00d4ff', '#ab121c', '#00d4ff'];
    
    function createPercentage() {
        const size = Common.random(30, 50);
        const x = Common.random(50, window.innerWidth - 50);
        const y = -Common.random(50, 200);
        const percentIndex = Math.floor(Common.random(0, percentages.length));
        const percentage = percentages[percentIndex];
        const color = colors[percentIndex];
        
        const percentageBody = Bodies.circle(x, y, size, {
            restitution: 0.6, // Bounciness
            friction: 0.01,
            frictionAir: 0.001,
            render: {
                fillStyle: color,
                text: {
                    content: percentage,
                    color: '#ffffff',
                    size: `${size * 0.8}px`,
                    family: 'Inter, sans-serif',
                    weight: 'bold'
                }
            }
        });
        
        // Add random rotation and velocity
        Body.setAngularVelocity(percentageBody, Common.random(-0.05, 0.05));
        Body.setVelocity(percentageBody, { 
            x: Common.random(-1, 1), 
            y: Common.random(0, 2) 
        });
        
        return percentageBody;
    }

    // Create property icons
    function createPropertyIcon() {
        const size = Common.random(40, 60);
        const x = Common.random(50, window.innerWidth - 50);
        const y = -Common.random(50, 200);
        
        // Create a house-like shape
        const houseBody = Bodies.rectangle(x, y, size, size, {
            restitution: 0.4,
            friction: 0.01,
            frictionAir: 0.002,
            chamfer: { radius: 5 },
            render: {
                fillStyle: '#ffffff',
                opacity: 0.2,
                sprite: {
                    texture: createHouseTexture(size, size),
                    xScale: 1,
                    yScale: 1
                }
            }
        });
        
        // Add random rotation and velocity
        Body.setAngularVelocity(houseBody, Common.random(-0.05, 0.05));
        Body.setVelocity(houseBody, { 
            x: Common.random(-1, 1), 
            y: Common.random(0, 2) 
        });
        
        return houseBody;
    }
    
    // Create a house texture using canvas
    function createHouseTexture(width, height) {
        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        
        // Draw house shape
        ctx.fillStyle = 'rgba(255, 255, 255, 0.1)';
        ctx.strokeStyle = '#00d4ff';
        ctx.lineWidth = 2;
        
        // House body
        ctx.beginPath();
        ctx.rect(width * 0.2, height * 0.4, width * 0.6, height * 0.5);
        ctx.fill();
        ctx.stroke();
        
        // Roof
        ctx.beginPath();
        ctx.moveTo(width * 0.1, height * 0.4);
        ctx.lineTo(width * 0.5, height * 0.1);
        ctx.lineTo(width * 0.9, height * 0.4);
        ctx.closePath();
        ctx.fill();
        ctx.stroke();
        
        // Door
        ctx.fillStyle = '#ab121c';
        ctx.beginPath();
        ctx.rect(width * 0.4, height * 0.65, width * 0.2, height * 0.25);
        ctx.fill();
        ctx.stroke();
        
        // Window
        ctx.fillStyle = '#00d4ff';
        ctx.beginPath();
        ctx.rect(width * 0.6, height * 0.5, width * 0.15, height * 0.15);
        ctx.fill();
        ctx.stroke();
        
        return canvas.toDataURL();
    }

    // Add initial objects
    for (let i = 0; i < 10; i++) {
        if (i % 2 === 0) {
            World.add(world, createPercentage());
        } else {
            World.add(world, createPropertyIcon());
        }
    }

    // Add new objects periodically
    setInterval(() => {
        // Remove objects that are too far below the screen to improve performance
        const bodies = Composite.allBodies(world);
        for (let i = 0; i < bodies.length; i++) {
            const body = bodies[i];
            if (body.position.y > window.innerHeight + 100 && !body.isStatic) {
                World.remove(world, body);
            }
        }
        
        // Add new objects if there aren't too many
        if (Composite.allBodies(world).length < 30) {
            if (Math.random() > 0.5) {
                World.add(world, createPercentage());
            } else {
                World.add(world, createPropertyIcon());
            }
        }
    }, 2000);

    // Add mouse interaction
    const mouse = Mouse.create(render.canvas);
    const mouseConstraint = MouseConstraint.create(engine, {
        mouse: mouse,
        constraint: {
            stiffness: 0.2,
            render: {
                visible: false
            }
        }
    });
    World.add(world, mouseConstraint);
    
    // Keep the mouse in sync with rendering
    render.mouse = mouse;
    
    // Add click event to create new objects
    document.getElementById('physicsCanvas').addEventListener('click', function(event) {
        if (!mouseConstraint.body) {
            const x = event.clientX;
            const y = event.clientY;
            
            if (Math.random() > 0.5) {
                const percentageBody = createPercentage();
                Body.setPosition(percentageBody, { x, y });
                World.add(world, percentageBody);
            } else {
                const propertyBody = createPropertyIcon();
                Body.setPosition(propertyBody, { x, y });
                World.add(world, propertyBody);
            }
        }
    });

    // Handle window resize
    window.addEventListener('resize', function() {
        render.options.width = window.innerWidth;
        render.options.height = window.innerHeight;
        render.canvas.width = window.innerWidth;
        render.canvas.height = window.innerHeight;
        
        // Update bottom wall position
        Body.setPosition(walls[0], { 
            x: window.innerWidth / 2, 
            y: window.innerHeight + wallThickness / 2 
        });
        
        // Update right wall position
        Body.setPosition(walls[2], { 
            x: window.innerWidth + wallThickness / 2, 
            y: window.innerHeight / 2 
        });
    });
    
    // Add hover effect to percentage bodies
    const Events = Matter.Events;
    Events.on(mouseConstraint, 'mousemove', function(event) {
        const bodies = Composite.allBodies(world);
        for (let i = 0; i < bodies.length; i++) {
            const body = bodies[i];
            if (!body.isStatic) {
                const distance = Matter.Vector.magnitude(Matter.Vector.sub(body.position, mouse.position));
                if (distance < 100) {
                    // Apply a gentle force towards the mouse
                    const force = Matter.Vector.mult(
                        Matter.Vector.normalise(Matter.Vector.sub(mouse.position, body.position)),
                        0.001 * body.mass
                    );
                    Body.applyForce(body, body.position, force);
                    
                    // Make the body rotate slightly
                    Body.setAngularVelocity(body, Common.random(-0.05, 0.05));
                    
                    // Scale the body slightly
                    const currentScale = body.render.sprite ? body.render.sprite.xScale : 1;
                    if (currentScale < 1.2) {
                        if (body.render.sprite) {
                            body.render.sprite.xScale = 1.1;
                            body.render.sprite.yScale = 1.1;
                        } else {
                            Body.scale(body, 1.01, 1.01);
                        }
                    }
                }
            }
        }
    });
}