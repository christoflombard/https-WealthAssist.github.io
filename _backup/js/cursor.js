document.addEventListener('DOMContentLoaded', () => {
    // Create cursor elements and append them to the body
    const cursorDot = document.createElement('div');
    const cursorFollower = document.createElement('div');
    cursorDot.className = 'wa-cursor-dot';
    cursorFollower.className = 'wa-cursor-follower';
    document.body.appendChild(cursorDot);
    document.body.appendChild(cursorFollower);

    // Hide on touch devices
    if ('ontouchstart' in window) {
        cursorDot.style.display = 'none';
        cursorFollower.style.display = 'none';
        return;
    }

    let mouseX = 0, mouseY = 0;
    const interactiveSections = document.querySelectorAll('.minimalist-dark-section');
    
    window.addEventListener('mousemove', (e) => {
        mouseX = e.clientX;
        mouseY = e.clientY;

        // Update CSS variable for the orange mouse glow
        interactiveSections.forEach(section => {
            const rect = section.getBoundingClientRect();
            const x = e.clientX - rect.left;
            const y = e.clientY - rect.top;
            section.style.setProperty('--mouse-x', `${x}px`);
            section.style.setProperty('--mouse-y', `${y}px`);
        });
    });

    const animateCursor = () => {
        cursorDot.style.transform = `translate(${mouseX}px, ${mouseY}px)`;
        cursorFollower.style.transform = `translate(${mouseX}px, ${mouseY}px)`;
        requestAnimationFrame(animateCursor);
    };

    document.body.addEventListener('mouseleave', () => {
        cursorDot.classList.add('wa-cursor-hidden');
        cursorFollower.classList.add('wa-cursor-hidden');
    });

    document.body.addEventListener('mouseenter', () => {
        cursorDot.classList.remove('wa-cursor-hidden');
        cursorFollower.classList.remove('wa-cursor-hidden');
    });
    
    animateCursor();
});