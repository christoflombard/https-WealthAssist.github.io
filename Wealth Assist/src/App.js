import React, { useEffect } from 'react';

function App() {
  useEffect(() => {
    // Add reveal-text class to headings and important text
    const headings = document.querySelectorAll('h1, h2, h3');
    headings.forEach(heading => heading.classList.add('reveal-text'));
    
    // Add hover-glow class to interactive elements
    const interactiveElements = document.querySelectorAll('.cta-button, .model-card, .risk-item');
    interactiveElements.forEach(el => el.classList.add('hover-glow'));
    
    return () => {
      // Clean up any event listeners or effects if needed
      const canvases = document.querySelectorAll('#physicsCanvas, #mouseTrail, #matrixCanvas');
      canvases.forEach(canvas => {
        if (canvas && canvas.parentNode) {
          canvas.parentNode.removeChild(canvas);
        }
      });
    };
  }, []);

  return (
    <div className="App">
      {/* Your app content goes here */}
      <header>
        <nav>
          <div className="logo">Wealth Assist</div>
          <div className="nav-links">
            <a href="#investment-models">Investment Models</a>
            <a href="#why-us">Why Choose Us</a>
            <a href="#risk-mitigation">Risk Mitigation</a>
            <a href="#invest-now">Invest Now</a>
          </div>
        </nav>
      </header>

      <section id="hero" className="glass-container">
        <div className="hero-floating-element"></div>
        <div className="hero-floating-element"></div>
        <div className="hero-floating-element"></div>
        <h1>Redefining Real Estate Investment</h1>
        <p>Wealth Assist combines high returns with social impact through innovative real estate investment models.</p>
        <a href="#invest-now" className="cta-button">Start Investing</a>
      </section>

      {/* Additional sections would go here */}
    </div>
  );
}

export default App;