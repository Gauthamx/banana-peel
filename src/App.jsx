import React, { useRef, useState, useEffect } from 'react';
import './App.css';
import ImageInput from './components/ImageInput';
import BananaAnalyzer from './components/BananaAnalyzer';

function App() {
  const mediaRef = useRef(null);
  const [isWebcam, setIsWebcam] = useState(false);
  const [scientistMode, setScientistMode] = useState(false);
  const glowRef = useRef(null);

  useEffect(() => {
    const handleMouseMove = (e) => {
      if (glowRef.current) {
        glowRef.current.style.transform = `translate(${e.clientX}px, ${e.clientY}px)`;
      }
    };
    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  return (
    <div className="root-bg">
      <div className="cursor-glow" ref={glowRef} />
      {/* Animated gradient orbs */}
      <div className="orb orb-1" />
      <div className="orb orb-2" />
      <div className="orb orb-3" />

      <div className="page-wrap">
        {/* ── NAV BAR ── */}
        <nav className="topbar glass-panel">
          <div className="topbar-brand">
            <i className="bx bx-scan" />
            <span>BANANA<strong>AI</strong></span>
          </div>

          <div className="scientist-toggle">
            <span className="toggle-label">Scientist Mode</span>
            <button
              className={`toggle-pill ${scientistMode ? 'toggle-on' : ''}`}
              onClick={() => setScientistMode(s => !s)}
              aria-label="Toggle Scientist Mode"
            >
              <span className="toggle-thumb" />
            </button>
          </div>
        </nav>

        {/* ── HERO ── */}
        <header className="hero">
          <div className="hero-badge">
            <i className="bx bx-chip" /> AI-POWERED FRUIT ANALYSIS
          </div>
          <h1 className="hero-title">Sir Peels-A-Lot</h1>
          <p className="hero-sub">
            The world's only AI banana opening consultant.
            <br />
            <span className="hero-muted">Yes, this is a real job. No, we are not sorry.</span>
          </p>
        </header>

        {/* ── BENTO GRID ── */}
        <main className="bento-grid">
          {/* Input — left / top */}
          <section className="bento-cell bento-input glass-panel">
            <div className="cell-label">
              <i className="bx bx-camera" /> INPUT
            </div>
            <ImageInput ref={mediaRef} onModeChange={setIsWebcam} />
          </section>

          {/* Analyzer — right / bottom */}
          <section className="bento-cell bento-analyzer glass-panel">
            <div className="cell-label">
              <i className="bx bx-brain" /> ANALYSIS
            </div>
            <BananaAnalyzer
              mediaRef={mediaRef}
              isWebcam={isWebcam}
              scientistMode={scientistMode}
            />
          </section>
        </main>

        <footer className="site-footer">
          <span>Powered by a tiny AI that has seen <em>way</em> too many bananas.</span>
          <span className="footer-dot">·</span>
          <span>No bananas were harmed. A few were eaten.</span>
        </footer>
      </div>
    </div>
  );
}

export default App;
