/**
 * Dynamic Interactive Hover Effects for Wealth Assist
 * Creates advanced, physics-based hover interactions
 */

// Initialize when DOM is fully loaded
document.addEventListener('DOMContentLoaded', function() {
    // Initialize magnetic hover effects
    initMagneticHover();
    
    // Initialize 3D hover effects
    init3DHover();
    
    // Initialize liquid hover effects
    initLiquidHover();
    
    // Initialize particle burst effects
    initParticleBurst();
    
    // Initialize text scramble effects
    initTextScramble();
});

/**
 * Initialize magnetic hover effects
 */
function initMagneticHover() {
    const magneticElements = document.querySelectorAll('.cta-button, .model-card, .risk-item');
    
    magneticElements.forEach(element => {
        // Create magnetic field
        const field = document.createElement('div');
        field.className = 'magnetic-field';
        field.style.cssText = `
            position: absolute;
            top: -50px;
            left: -50px;
            width: calc(100% + 100px);
            height: calc(100% + 100px);
            pointer-events: none;
            z-index: -1;
            opacity: 0;
            transition: opacity 0.3s ease;
        `;
        
        // Make sure element has position relative
        if (getComputedStyle(element).position === 'static') {
            element.style.position = 'relative';
        }
        
        element.appendChild(field);
        
        // Track mouse position
        document.addEventListener('mousemove', e => {
            const rect = element.getBoundingClientRect();
            const centerX = rect.left + rect.width / 2;
            const centerY = rect.top + rect.height / 2;
            
            // Calculate distance from center
            const distanceX = e.clientX - centerX;
            const distanceY = e.clientY - centerY;
            const distance = Math.sqrt(distanceX * distanceX + distanceY * distanceY);
            
            // Calculate magnetic pull (stronger when closer)
            const maxDistance = 300;
            if (distance < maxDistance) {
                // Show magnetic field
                field.style.opacity = 1 - (distance / maxDistance);
                
                // Calculate pull strength (inverse to distance)
                const pull = 1 - (distance / maxDistance);
                const moveX = distanceX * pull * 0.3;
                const moveY = distanceY * pull * 0.3;
                
                // Apply magnetic pull with physics
                element.style.transform = `translate(${moveX}px, ${moveY}px)`;
                element.style.transition = 'transform 0.2s cubic-bezier(0.2, 0.8, 0.2, 1)';
            } else {
                // Hide magnetic field
                field.style.opacity = 0;
                
                // Reset position with physics
                element.style.transform = 'translate(0, 0)';
                element.style.transition = 'transform 0.5s cubic-bezier(0.2, 0.8, 0.2, 1)';
            }
        });
    });
}

/**
 * Initialize 3D hover effects
 */
function init3DHover() {
    const elements = document.querySelectorAll('.model-card, .risk-item');
    
    elements.forEach(element => {
        element.addEventListener('mousemove', e => {
            // Get mouse position relative to element
            const rect = element.getBoundingClientRect();
            const x = e.clientX - rect.left;
            const y = e.clientY - rect.top;
            
            // Calculate rotation based on mouse position
            const centerX = rect.width / 2;
            const centerY = rect.height / 2;
            
            const rotateX = (y - centerY) / 10;
            const rotateY = (centerX - x) / 10;
            
            // Apply 3D transform with smooth transition
            element.style.transform = `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) scale3d(1.05, 1.05, 1.05)`;
            element.style.transition = 'none';
            
            // Add dynamic lighting effect
            const intensity = 100 - Math.min(
                100,
                Math.sqrt(
                    Math.pow(x - centerX, 2) +
                    Math.pow(y - centerY, 2)
                ) / Math.sqrt(
                    Math.pow(centerX, 2) +
                    Math.pow(centerY, 2)
                ) * 100
            );
            
            // Calculate light position
            const lightX = (x / rect.width) * 100;
            const lightY = (y / rect.height) * 100;
            
            // Apply dynamic lighting with CSS variables
            element.style.setProperty('--light-x', `${lightX}%`);
            element.style.setProperty('--light-y', `${lightY}%`);
            element.style.setProperty('--light-intensity', `${intensity}%`);
            
            // Add CSS for lighting if not already present
            if (!document.querySelector('#dynamic-lighting-style')) {
                const style = document.createElement('style');
                style.id = 'dynamic-lighting-style';
                style.textContent = `
                    .model-card, .risk-item {
                        position: relative;
                        overflow: hidden;
                    }
                    
                    .model-card::before, .risk-item::before {
                        content: '';
                        position: absolute;
                        top: 0;
                        left: 0;
                        width: 100%;
                        height: 100%;
                        background: radial-gradient(
                            circle at var(--light-x, 50%) var(--light-y, 50%),
                            rgba(255, 255, 255, 0.2) 0%,
                            transparent 80%
                        );
                        opacity: var(--light-intensity, 0);
                        z-index: 1;
                        pointer-events: none;
                    }
                `;
                document.head.appendChild(style);
            }
            
            // Lift content for 3D effect
            const content = element.querySelectorAll('h3, p, .cta-button, img');
            content.forEach((el, index) => {
                const z = 30 + (index * 10);
                el.style.transform = `translateZ(${z}px)`;
                el.style.transition = 'none';
            });
        });
        
        // Reset on mouse leave
        element.addEventListener('mouseleave', () => {
            element.style.transform = 'perspective(1000px) rotateX(0) rotateY(0) scale3d(1, 1, 1)';
            element.style.transition = 'all 0.5s cubic-bezier(0.2, 0.8, 0.2, 1)';
            
            // Reset content
            const content = element.querySelectorAll('h3, p, .cta-button, img');
            content.forEach(el => {
                el.style.transform = 'translateZ(0)';
                el.style.transition = 'all 0.5s cubic-bezier(0.2, 0.8, 0.2, 1)';
            });
        });
    });
}

/**
 * Initialize liquid hover effects
 */
function initLiquidHover() {
    const buttons = document.querySelectorAll('.cta-button');
    
    buttons.forEach(button => {
        // Create liquid effect container
        const liquid = document.createElement('div');
        liquid.className = 'liquid-effect';
        liquid.style.cssText = `
            position: absolute;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            overflow: hidden;
            border-radius: inherit;
            z-index: -1;
        `;
        
        // Make sure button has position relative
        if (getComputedStyle(button).position === 'static') {
            button.style.position = 'relative';
        }
        
        button.appendChild(liquid);
        
        // Add CSS for liquid effect
        if (!document.querySelector('#liquid-effect-style')) {
            const style = document.createElement('style');
            style.id = 'liquid-effect-style';
            style.textContent = `
                @keyframes liquid-wave {
                    0% {
                        transform: translate(-50%, -75%) rotate(0deg);
                    }
                    100% {
                        transform: translate(-50%, -75%) rotate(360deg);
                    }
                }
                
                .liquid-effect::before {
                    content: '';
                    position: absolute;
                    top: 50%;
                    left: 50%;
                    width: 200%;
                    height: 200%;
                    background: linear-gradient(45deg, rgba(14, 165, 233, 0.8) 0%, rgba(171, 18, 28, 0.8) 100%);
                    border-radius: 40%;
                    transform: translate(-50%, -75%) rotate(0);
                    animation: liquid-wave 10s linear infinite;
                    opacity: 0;
                    transition: opacity 0.5s ease;
                }
                
                .cta-button:hover .liquid-effect::before {
                    opacity: 0.3;
                }
            `;
            document.head.appendChild(style);
        }
    });
}

/**
 * Initialize particle burst effects
 */
function initParticleBurst() {
    const elements = document.querySelectorAll('.cta-button, .model-card, .risk-item');
    
    elements.forEach(element => {
        element.addEventListener('mouseenter', e => {
            createParticleBurst(e.clientX, e.clientY);
        });
    });
    
    function createParticleBurst(x, y) {
        // Create container for particles
        const burstContainer = document.createElement('div');
        burstContainer.className = 'particle-burst';
        burstContainer.style.cssText = `
            position: fixed;
            top: ${y}px;
            left: ${x}px;
            width: 0;
            height: 0;
            pointer-events: none;
            z-index: 9999;
        `;
        
        document.body.appendChild(burstContainer);
        
        // Create particles
        const colors = ['#0ea5e9', '#ab121c', '#ffffff'];
        const particleCount = 20;
        
        for (let i = 0; i < particleCount; i++) {
            const particle = document.createElement('div');
            const size = Math.random() * 8 + 4;
            const color = colors[Math.floor(Math.random() * colors.length)];
            
            particle.style.cssText = `
                position: absolute;
                top: 0;
                left: 0;
                width: ${size}px;
                height: ${size}px;
                background-color: ${color};
                border-radius: 50%;
                transform: translate(-50%, -50%);
                opacity: 1;
            `;
            
            burstContainer.appendChild(particle);
            
            // Animate particle
            const angle = Math.random() * Math.PI * 2;
            const velocity = Math.random() * 100 + 50;
            const vx = Math.cos(angle) * velocity;
            const vy = Math.sin(angle) * velocity;
            
            // Use GSAP if available, otherwise use regular animation
            if (typeof gsap !== 'undefined') {
                gsap.to(particle, {
                    x: vx,
                    y: vy,
                    opacity: 0,
                    duration: Math.random() * 1 + 0.5,
                    ease: 'power2.out',
                    onComplete: () => {
                        particle.remove();
                    }
                });
            } else {
                // Fallback animation
                const startTime = Date.now();
                const duration = Math.random() * 1000 + 500;
                
                function animateParticle() {
                    const elapsed = Date.now() - startTime;
                    const progress = Math.min(elapsed / duration, 1);
                    
                    particle.style.transform = `translate(
                        calc(${vx * progress}px - 50%), 
                        calc(${vy * progress}px - 50%)
                    )`;
                    particle.style.opacity = 1 - progress;
                    
                    if (progress < 1) {
                        requestAnimationFrame(animateParticle);
                    } else {
                        particle.remove();
                    }
                }
                
                requestAnimationFrame(animateParticle);
            }
        }
        
        // Remove container after all particles are gone
        setTimeout(() => {
            burstContainer.remove();
        }, 2000);
    }
}

/**
 * Initialize text scramble effects
 */
function initTextScramble() {
    const headings = document.querySelectorAll('h1, h2, h3');
    
    headings.forEach(heading => {
        // Skip if already initialized
        if (heading.getAttribute('data-scramble-initialized') === 'true') return;
        heading.setAttribute('data-scramble-initialized', 'true');
        
        // Store original text
        const originalText = heading.textContent;
        heading.setAttribute('data-original-text', originalText);
        
        // Create scramble effect on hover
        heading.addEventListener('mouseenter', () => {
            scrambleText(heading, originalText);
        });
    });
    
    function scrambleText(element, finalText) {
        // Characters to use for scrambling
        const chars = '!<>-_\\/[]{}—=+*^?#________';
        
        // Current state of text
        let currentText = element.textContent;
        
        // Frames to run
        const frameCount = 20;
        let frame = 0;
        
        // Start animation
        const interval = setInterval(() => {
            // Generate scrambled text
            let scrambledText = '';
            
            for (let i = 0; i < finalText.length; i++) {
                // If we've "resolved" this character, use the final character
                if (i < frame / frameCount * finalText.length) {
                    scrambledText += finalText[i];
                } else if (finalText[i] === ' ') {
                    // Preserve spaces
                    scrambledText += ' ';
                } else {
                    // Otherwise use a random character
                    scrambledText += chars[Math.floor(Math.random() * chars.length)];
                }
            }
            
            // Update text
            element.textContent = scrambledText;
            
            // Increment frame
            frame++;
            
            // Stop when done
            if (frame > frameCount) {
                clearInterval(interval);
                element.textContent = finalText;
            }
        }, 30);
    }
}