/**
 * Advanced Animation System for Wealth Assist
 * Using GSAP for award-winning animations
 */

// Initialize when DOM is fully loaded
document.addEventListener('DOMContentLoaded', function() {
    // Initialize GSAP animations
    initGSAPAnimations();

    // Initialize ScrollTrigger animations
    initScrollTriggerAnimations();

    // Initialize particle system
    initParticleSystem();

    // Initialize 3D card effects
    init3DCardEffects();

    // Initialize magnetic elements
    initMagneticElements();

    // Initialize text animations
    initTextAnimations();
});

/**
 * Initialize GSAP animations for premium effects
 */
function initGSAPAnimations() {
    // Check if GSAP is loaded
    if (typeof gsap === 'undefined') {
        console.warn('GSAP not loaded. Advanced animations disabled.');
        return;
    }

    // Register plugins
    gsap.registerPlugin(ScrollTrigger, TextPlugin, MotionPathPlugin);

    // Hero section animations
    const heroTimeline = gsap.timeline({
        defaults: {
            ease: "power3.out",
            duration: 1.2
        }
    });

    heroTimeline
        .from('#hero h1', {
            y: 50,
            opacity: 0,
            filter: 'blur(10px)',
            duration: 1.5
        })
        .from('#hero p', {
            y: 30,
            opacity: 0,
            filter: 'blur(5px)',
            duration: 1.2
        }, "-=0.8")
        .from('#hero .cta-button', {
            y: 20,
            opacity: 0,
            scale: 0.9,
            duration: 1
        }, "-=0.6")
        .from('.hero-floating-element', {
            opacity: 0,
            scale: 0.5,
            stagger: 0.2,
            duration: 1.5,
            ease: "elastic.out(1, 0.5)"
        }, "-=1");

    // Animate the navigation
    gsap.from('nav', {
        y: -100,
        opacity: 0,
        duration: 1,
        ease: "power3.out",
        delay: 0.5
    });

    // Animate logo with special effect
    const logoElement = document.querySelector('.logo');
    if (logoElement) {
        const logoText = logoElement.textContent;
        logoElement.innerHTML = '';

        // Split text into spans for character animation
        for (let i = 0; i < logoText.length; i++) {
            const span = document.createElement('span');
            span.textContent = logoText[i];
            span.style.display = 'inline-block';
            span.style.opacity = '0';
            span.style.transform = 'translateY(20px)';
            logoElement.appendChild(span);
        }

        // Animate each character
        gsap.to('.logo span', {
            opacity: 1,
            y: 0,
            stagger: 0.05,
            delay: 0.8,
            ease: "back.out(1.7)",
            duration: 0.8
        });
    }

    // Floating animation for hero elements
    gsap.to('.hero-floating-element:nth-child(1)', {
        y: '-20px',
        x: '10px',
        rotation: 5,
        duration: 8,
        repeat: -1,
        yoyo: true,
        ease: "sine.inOut"
    });

    gsap.to('.hero-floating-element:nth-child(2)', {
        y: '-30px',
        x: '-15px',
        rotation: -3,
        duration: 9,
        repeat: -1,
        yoyo: true,
        ease: "sine.inOut",
        delay: 0.5
    });

    gsap.to('.hero-floating-element:nth-child(3)', {
        y: '-15px',
        x: '5px',
        rotation: 2,
        duration: 7,
        repeat: -1,
        yoyo: true,
        ease: "sine.inOut",
        delay: 1
    });
}

/**
 * Initialize ScrollTrigger animations for sections
 */
function initScrollTriggerAnimations() {
    if (typeof gsap === 'undefined' || typeof ScrollTrigger === 'undefined') {
        console.warn('GSAP or ScrollTrigger not loaded. Scroll animations disabled.');
        return;
    }

    // Investment Models section
    gsap.from('#investment-models h2', {
        scrollTrigger: {
            trigger: '#investment-models',
            start: 'top 80%',
            toggleActions: 'play none none none'
        },
        y: 50,
        opacity: 0,
        duration: 1,
        ease: "power3.out"
    });

    gsap.from('.model-card', {
        scrollTrigger: {
            trigger: '#investment-models',
            start: 'top 70%',
            toggleActions: 'play none none none'
        },
        y: 100,
        opacity: 0,
        stagger: 0.3,
        duration: 1.2,
        ease: "back.out(1.7)"
    });

    // Why Choose Us section
    gsap.from('#why-us h2', {
        scrollTrigger: {
            trigger: '#why-us',
            start: 'top 80%',
            toggleActions: 'play none none none'
        },
        y: 50,
        opacity: 0,
        duration: 1,
        ease: "power3.out"
    });

    gsap.from('.jitter-hover', {
        scrollTrigger: {
            trigger: '#why-us',
            start: 'top 70%',
            toggleActions: 'play none none none'
        },
        x: -100,
        opacity: 0,
        stagger: 0.2,
        duration: 1,
        ease: "power3.out"
    });

    // Risk Mitigation section
    gsap.from('#risk-mitigation h2', {
        scrollTrigger: {
            trigger: '#risk-mitigation',
            start: 'top 80%',
            toggleActions: 'play none none none'
        },
        y: 50,
        opacity: 0,
        duration: 1,
        ease: "power3.out"
    });

    gsap.from('.risk-item', {
        scrollTrigger: {
            trigger: '#risk-mitigation',
            start: 'top 70%',
            toggleActions: 'play none none none'
        },
        y: 100,
        opacity: 0,
        stagger: 0.3,
        duration: 1.2,
        ease: "back.out(1.7)"
    });

    // Call to Action section
    gsap.from('#invest-now h2, #invest-now p', {
        scrollTrigger: {
            trigger: '#invest-now',
            start: 'top 80%',
            toggleActions: 'play none none none'
        },
        y: 50,
        opacity: 0,
        stagger: 0.3,
        duration: 1,
        ease: "power3.out"
    });

    gsap.from('#invest-now .cta-button', {
        scrollTrigger: {
            trigger: '#invest-now',
            start: 'top 70%',
            toggleActions: 'play none none none'
        },
        scale: 0.8,
        opacity: 0,
        duration: 1,
        ease: "elastic.out(1, 0.5)"
    });

    gsap.from('#invest-now .contact-info a', {
        scrollTrigger: {
            trigger: '#invest-now .contact-info',
            start: 'top 90%',
            toggleActions: 'play none none none'
        },
        y: 30,
        opacity: 0,
        stagger: 0.2,
        duration: 0.8,
        ease: "back.out(1.7)"
    });
}

/**
 * Initialize particle system for background effects
 */
function initParticleSystem() {
    // Create canvas for particles if it doesn't exist
    if (!document.getElementById('particleCanvas')) {
        const canvas = document.createElement('canvas');
        canvas.id = 'particleCanvas';
        canvas.style.position = 'fixed';
        canvas.style.top = '0';
        canvas.style.left = '0';
        canvas.style.width = '100%';
        canvas.style.height = '100%';
        canvas.style.pointerEvents = 'none';
        canvas.style.zIndex = '-2';
        canvas.style.opacity = '0.7';
        document.body.appendChild(canvas);
    }

    const canvas = document.getElementById('particleCanvas');
    const ctx = canvas.getContext('2d');

    // Set canvas size
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    // Particle settings
    const particleCount = 50;
    const particles = [];
    const colors = ['#0ea5e9', '#ab121c', '#0c4a6e', '#f8fafc'];

    // Particle class
    class Particle {
        constructor() {
            this.x = Math.random() * canvas.width;
            this.y = Math.random() * canvas.height;
            this.size = Math.random() * 5 + 1;
            this.speedX = Math.random() * 0.5 - 0.25;
            this.speedY = Math.random() * 0.5 - 0.25;
            this.color = colors[Math.floor(Math.random() * colors.length)];
            this.opacity = Math.random() * 0.5 + 0.1;
            this.blurSize = Math.random() * 2 + 1;
        }

        update() {
            this.x += this.speedX;
            this.y += this.speedY;

            // Bounce off edges
            if (this.x > canvas.width || this.x < 0) {
                this.speedX = -this.speedX;
            }

            if (this.y > canvas.height || this.y < 0) {
                this.speedY = -this.speedY;
            }
        }

        draw() {
            ctx.beginPath();
            ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
            ctx.fillStyle = this.color;
            ctx.globalAlpha = this.opacity;
            ctx.shadowBlur = this.blurSize;
            ctx.shadowColor = this.color;
            ctx.fill();
            ctx.globalAlpha = 1;
            ctx.shadowBlur = 0;
        }
    }

    // Create particles
    for (let i = 0; i < particleCount; i++) {
        particles.push(new Particle());
    }

    // Animation loop
    function animate() {
        ctx.clearRect(0, 0, canvas.width, canvas.height);

        for (let i = 0; i < particles.length; i++) {
            particles[i].update();
            particles[i].draw();
        }

        // Connect particles with lines if they're close enough
        for (let a = 0; a < particles.length; a++) {
            for (let b = a; b < particles.length; b++) {
                const dx = particles[a].x - particles[b].x;
                const dy = particles[a].y - particles[b].y;
                const distance = Math.sqrt(dx * dx + dy * dy);

                if (distance < 100) {
                    ctx.beginPath();
                    ctx.strokeStyle = particles[a].color;
                    ctx.globalAlpha = 0.1 * (1 - distance / 100);
                    ctx.lineWidth = 0.5;
                    ctx.moveTo(particles[a].x, particles[a].y);
                    ctx.lineTo(particles[b].x, particles[b].y);
                    ctx.stroke();
                    ctx.globalAlpha = 1;
                }
            }
        }

        requestAnimationFrame(animate);
    }

    animate();

    // Handle window resize
    window.addEventListener('resize', () => {
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;
    });
}

/**
 * Initialize 3D card effects with advanced techniques
 */
function init3DCardEffects() {
    const cards = document.querySelectorAll('.model-card, .risk-item');

    cards.forEach(card => {
        // Create shine effect element
        const shine = document.createElement('div');
        shine.classList.add('card-shine');
        shine.style.position = 'absolute';
        shine.style.top = '0';
        shine.style.left = '0';
        shine.style.width = '100%';
        shine.style.height = '100%';
        shine.style.borderRadius = 'inherit';
        shine.style.background = 'radial-gradient(circle at 50% 50%, rgba(255,255,255,0.1), rgba(255,255,255,0) 60%)';
        shine.style.pointerEvents = 'none';
        shine.style.opacity = '0';
        shine.style.transition = 'opacity 0.3s ease';
        shine.style.zIndex = '1';

        // Make sure card has position relative
        card.style.position = 'relative';
        card.appendChild(shine);

        // Advanced 3D effect on mousemove
        card.addEventListener('mousemove', e => {
            const rect = card.getBoundingClientRect();
            const x = e.clientX - rect.left;
            const y = e.clientY - rect.top;

            // Calculate rotation based on mouse position
            const centerX = rect.width / 2;
            const centerY = rect.height / 2;

            const rotateX = (y - centerY) / 10;
            const rotateY = (centerX - x) / 10;

            // Apply 3D transform with smooth transition
            card.style.transform = `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) translateZ(20px)`;
            card.style.transition = 'transform 0.1s ease-out';

            // Update shine effect position
            shine.style.opacity = '1';
            shine.style.background = `radial-gradient(circle at ${x}px ${y}px, rgba(255,255,255,0.2), rgba(255,255,255,0) 60%)`;

            // Lift card content slightly
            const cardContent = card.querySelectorAll('h3, p, .cta-button');
            cardContent.forEach((element, index) => {
                element.style.transform = `translateZ(${20 + index * 10}px)`;
            });
        });

        // Reset card on mouse leave
        card.addEventListener('mouseleave', () => {
            card.style.transform = 'perspective(1000px) rotateX(0) rotateY(0) translateZ(0)';
            card.style.transition = 'transform 0.5s ease-out';
            shine.style.opacity = '0';

            // Reset content
            const cardContent = card.querySelectorAll('h3, p, .cta-button');
            cardContent.forEach(element => {
                element.style.transform = 'translateZ(0)';
            });
        });
    });
}

/**
 * Initialize magnetic elements that attract to cursor
 */
function initMagneticElements() {
    const buttons = document.querySelectorAll('.cta-button');

    buttons.forEach(button => {
        button.addEventListener('mousemove', e => {
            const rect = button.getBoundingClientRect();
            const x = e.clientX - rect.left;
            const y = e.clientY - rect.top;

            const centerX = rect.width / 2;
            const centerY = rect.height / 2;

            // Calculate distance from center
            const distanceX = x - centerX;
            const distanceY = y - centerY;

            // Calculate attraction strength based on distance
            const distance = Math.sqrt(distanceX * distanceX + distanceY * distanceY);
            const maxDistance = Math.sqrt(centerX * centerX + centerY * centerY);
            const strength = 0.5 * (1 - Math.min(1, distance / maxDistance));

            // Apply magnetic effect
            const moveX = distanceX * strength;
            const moveY = distanceY * strength;

            // Apply transform with GSAP for smooth animation
            if (typeof gsap !== 'undefined') {
                gsap.to(button, {
                    x: moveX,
                    y: moveY,
                    duration: 0.3,
                    ease: "power2.out"
                });

                // Add subtle rotation based on movement direction
                gsap.to(button, {
                    rotationY: moveX * 0.1,
                    rotationX: -moveY * 0.1,
                    duration: 0.3,
                    ease: "power2.out"
                });
            } else {
                button.style.transform = `translate(${moveX}px, ${moveY}px)`;
            }
        });

        button.addEventListener('mouseleave', () => {
            // Return to original position with GSAP
            if (typeof gsap !== 'undefined') {
                gsap.to(button, {
                    x: 0,
                    y: 0,
                    rotationY: 0,
                    rotationX: 0,
                    duration: 0.7,
                    ease: "elastic.out(1, 0.5)"
                });
            } else {
                button.style.transform = 'translate(0, 0)';
            }
        });
    });
}

/**
 * Initialize text animations for headings
 */
function initTextAnimations() {
    const headings = document.querySelectorAll('h1, h2');

    headings.forEach(heading => {
        // Add data attribute to prevent multiple initializations
        if (heading.getAttribute('data-text-animated') === 'true') return;
        heading.setAttribute('data-text-animated', 'true');

        // Store original text
        const originalText = heading.innerHTML;

        // Add hover effect
        heading.addEventListener('mouseenter', () => {
            if (typeof gsap !== 'undefined' && typeof SplitText !== 'undefined') {
                // Use GSAP SplitText for advanced text animation
                const split = new SplitText(heading, { type: "chars" });

                gsap.fromTo(split.chars, {
                    y: 0,
                    opacity: 1
                }, {
                    y: -10,
                    opacity: 1,
                    stagger: 0.02,
                    duration: 0.3,
                    ease: "power2.out",
                    yoyo: true,
                    repeat: 1
                });
            } else {
                // Fallback animation
                heading.style.transform = 'translateY(-5px)';
                setTimeout(() => {
                    heading.style.transform = 'translateY(0)';
                }, 300);
            }
        });
    });
}