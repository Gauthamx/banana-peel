import React, { useEffect, useState, useRef } from 'react';
import * as tmImage from '@teachablemachine/image';

// ── Terminal scan messages ────────────────────────────────────────────────────
const SCAN_SEQUENCE = [
  { icon: 'bx-search-alt', text: 'Initializing Banana Vision...' },
  { icon: 'bx-camera',     text: 'Analyzing curvature profile...' },
  { icon: 'bx-brain',      text: 'Locating stem geometry...' },
  { icon: 'bx-data',       text: 'Querying peel database...' },
  { icon: 'bx-chip',       text: 'Calculating peelability index...' },
  { icon: 'bx-bar-chart',  text: 'Running entropy analysis...' },
  { icon: 'bx-check-shield', text: 'Finalizing verdict...' },
];

// ── Roasts ────────────────────────────────────────────────────────────────────
const STEM_ROASTS = [
  "Classic opener. Zero creativity, maximum efficiency. Boring but effective.",
  "The stem approach. A bold choice for people who read instruction manuals.",
  "Stem side confirmed. You are, apparently, a rule-follower. How refreshing.",
  "Textbook technique. Your banana is not impressed but neither is it surprised.",
];
const BOTTOM_ROASTS = [
  "That's the BOTTOM. This is exactly how civilization falls apart.",
  "Sir, this is the wrong end. We are disappointed, but not shocked.",
  "The bottom? Bold. Wrong. But bold. Flip it around, immediately.",
  "You were going to open it from the bottom. We've informed your ancestors.",
];
const NO_BANANA_ROASTS = [
  "That is objectively not a banana. Our sensors are offended.",
  "We scanned the image twice. Still no banana. Outstanding.",
  "404: Banana not found. Have you considered buying a banana?",
  "Our model trained on 10,000 bananas and it says: that is not one of them.",
];

// ── Scientist data generator ──────────────────────────────────────────────────
const genScientistData = (prob, isStem, isNoBanana) => {
  if (isNoBanana) {
    return {
      curvature:      '0.00°',
      stemProb:       '0.00%',
      peelVector:     'Ø  VOID',
      entropy:        'MAXIMUM',
      peelability:    'ERR / 10',
      ripeness:       'UNKNOWN',
      curvRating:     'NON-EUCLIDEAN',
      bananaScore:    0,
    };
  }
  const p = prob;
  return {
    curvature:      (18 + p * 32).toFixed(2) + '°',
    stemProb:       (p * 100).toFixed(2) + '%',
    peelVector:     isStem ? '→  FORWARD' : '←  REVERSE',
    entropy:        ((1 - p) * 0.6 + 0.05).toFixed(3),
    peelability:    (5.5 + p * 4.5).toFixed(1) + ' / 10',
    ripeness:       Math.min(99, Math.floor(55 + p * 43)) + '%',
    curvRating:     p > 0.85 ? 'OPTIMAL' : p > 0.65 ? 'NOMINAL' : 'SUSPECT',
    bananaScore:    Math.floor(p * 100),
  };
};

const getRandom = (arr) => arr[Math.floor(Math.random() * arr.length)];

// ── ASCII confidence bar ──────────────────────────────────────────────────────
const ConfBar = ({ value }) => {
  const total = 20;
  const filled = Math.round((value / 100) * total);
  const empty  = total - filled;
  return (
    <div className="conf-ascii">
      <div className="conf-bar-row">
        <span className="conf-filled">{'█'.repeat(filled)}</span>
        <span className="conf-empty">{'░'.repeat(empty)}</span>
        <span className="conf-pct"> {value}%</span>
      </div>
      <div className="conf-labels">
        <span className="conf-certain">{value}% Certain</span>
        <span className="conf-uncertain">{100 - value}% Existential uncertainty</span>
      </div>
    </div>
  );
};

// ─────────────────────────────────────────────────────────────────────────────

export default function BananaAnalyzer({ mediaRef, isWebcam, scientistMode }) {
  const MODEL_URL = 'https://teachablemachine.withgoogle.com/models/tFKgMid8B/';

  const [model,        setModel]        = useState(null);
  const [modelLoading, setModelLoading] = useState(false);
  const [analyzing,    setAnalyzing]    = useState(false);
  const [scanStep,     setScanStep]     = useState(0);
  const [prediction,   setPrediction]   = useState(null);
  const [roast,        setRoast]        = useState('');
  const [error,        setError]        = useState(null);
  const [rebel,        setRebel]        = useState(false);   // "what if I don't?"
  const [aiDisappoint, setAiDisappoint] = useState(false);
  const intervalRef = useRef(null);

  // Load model
  useEffect(() => {
    if (MODEL_URL.includes('YOUR_MODEL_ID')) return;
    setModelLoading(true);
    tmImage.load(MODEL_URL + 'model.json', MODEL_URL + 'metadata.json')
      .then(m => setModel(m))
      .catch(() => setError('Model failed to load. Check the URL.'))
      .finally(() => setModelLoading(false));
  }, []);

  const analyze = async () => {
    if (!model || !mediaRef.current) return;
    const el = isWebcam ? mediaRef.current.video : mediaRef.current;
    if (!el) { setError('Nothing to analyze yet.'); return; }

    // Reset
    setPrediction(null);
    setRoast('');
    setRebel(false);
    setAiDisappoint(false);
    setAnalyzing(true);
    setScanStep(0);

    // Animate through scan steps
    let step = 0;
    intervalRef.current = setInterval(() => {
      step++;
      if (step >= SCAN_SEQUENCE.length) {
        clearInterval(intervalRef.current);
      } else {
        setScanStep(step);
      }
    }, 420);

    try {
      const pArr = await model.predict(el);
      let best = pArr[0];
      pArr.forEach(p => { if (p.probability > best.probability) best = p; });

      clearInterval(intervalRef.current);
      setAnalyzing(false);
      setPrediction(best);

      const name = best.className.toLowerCase();
      const isNoBanana = ['no banana','background','none','other','nothing'].some(k => name.includes(k));
      const isStem     = !isNoBanana && name.includes('stem');

      if (isNoBanana) setRoast(getRandom(NO_BANANA_ROASTS));
      else if (isStem)  setRoast(getRandom(STEM_ROASTS));
      else              setRoast(getRandom(BOTTOM_ROASTS));

    } catch {
      clearInterval(intervalRef.current);
      setAnalyzing(false);
      setError('Analysis failed. Maybe it was too much banana.');
    }
  };

  // Classify
  const name       = prediction?.className?.toLowerCase() || '';
  const isNoBanana = ['no banana','background','none','other','nothing'].some(k => name.includes(k));
  const isStem     = !isNoBanana && name.includes('stem');
  const isBottom   = !isNoBanana && (name.includes('bottom') || name.includes('blossom'));
  const pct        = prediction ? Math.round(prediction.probability * 100) : 0;
  const sciData    = prediction ? genScientistData(prediction.probability, isStem, isNoBanana) : null;
  const isReady    = model && !MODEL_URL.includes('YOUR_MODEL_ID');

  const handleRebel = () => {
    setRebel(true);
    setAiDisappoint(true);
    setTimeout(() => setAiDisappoint(false), 3000);
  };

  return (
    <div className="analyzer-wrap">

      {/* Error */}
      {error && (
        <div className="alert-card alert-err">
          <i className="bx bx-error-circle" />
          <span>{error}</span>
          <button onClick={() => setError(null)}><i className="bx bx-x" /></button>
        </div>
      )}

      {/* Model loading */}
      {modelLoading && (
        <div className="alert-card alert-info">
          <i className="bx bx-loader-alt bx-spin" />
          <span>Loading banana brain...</span>
        </div>
      )}

      {/* Not configured */}
      {MODEL_URL.includes('YOUR_MODEL_ID') && (
        <div className="alert-card alert-warn">
          <i className="bx bx-wrench" />
          <span>Paste your Teachable Machine URL in BananaAnalyzer.jsx</span>
        </div>
      )}

      {/* ── ANALYZE BUTTON ── */}
      <button
        className={`analyze-btn ${analyzing ? 'btn-scanning' : ''} ${!isReady ? 'btn-off' : ''}`}
        onClick={analyze}
        disabled={!isReady || analyzing}
      >
        {analyzing ? (
          <><i className="bx bx-loader-alt bx-spin" /> Scanning...</>
        ) : (
          <><i className="bx bx-scan" /> Consult Sir Peels-A-Lot</>
        )}
      </button>

      {/* ── TERMINAL SCAN LOG ── */}
      {analyzing && (
        <div className="terminal-box">
          <div className="terminal-header">
            <span className="term-dot red" /><span className="term-dot amber" /><span className="term-dot green" />
            <span className="term-title">banana_vision.exe</span>
          </div>
          <div className="terminal-body">
            {SCAN_SEQUENCE.slice(0, scanStep + 1).map((s, i) => (
              <div key={i} className={`term-line ${i === scanStep ? 'term-active' : 'term-done'}`}>
                <span className="term-prompt">›</span>
                <i className={`bx ${s.icon}`} />
                <span>{s.text}</span>
                {i < scanStep && <i className="bx bx-check term-check" />}
                {i === scanStep && <span className="term-cursor">_</span>}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ── RESULTS ── */}
      {prediction && !analyzing && (
        <div className="results-grid">

          {/* ── Verdict card ── */}
          <div className={`result-verdict ${isStem ? 'vrd-open' : isBottom ? 'vrd-flip' : isNoBanana ? 'vrd-none' : 'vrd-unknown'}`}>
            <div className="vrd-label">VERDICT</div>

            {isStem && (
              <>
                <div className="vrd-icon-wrap vrd-icon-open"><i className="bx bx-check-circle" /></div>
                <h2 className="vrd-title">OPEN FROM STEM SIDE</h2>
                <p className="vrd-desc">Snap the stem downward. Clean peel, zero drama.</p>
              </>
            )}
            {isBottom && (
              <>
                <div className="vrd-icon-wrap vrd-icon-flip"><i className="bx bx-error" /></div>
                <h2 className="vrd-title">WRONG SIDE — FLIP IT</h2>
                <p className="vrd-desc">That's the bottom. Rotate 180° and open from the stem.</p>
              </>
            )}
            {isNoBanana && (
              <>
                <div className="vrd-icon-wrap vrd-icon-none"><i className="bx bx-question-mark" /></div>
                <h2 className="vrd-title">NO BANANA FOUND</h2>
                <p className="vrd-desc">Sir Peels-A-Lot sees no banana in this image.</p>
              </>
            )}
            {!isStem && !isBottom && !isNoBanana && (
              <>
                <div className="vrd-icon-wrap vrd-icon-unk"><i className="bx bx-help-circle" /></div>
                <h2 className="vrd-title">INCONCLUSIVE</h2>
                <p className="vrd-desc">Improve lighting or bring the banana closer.</p>
              </>
            )}
          </div>

          {/* ── Confidence meter ── */}
          <div className="bento-card conf-card">
            <div className="card-label"><i className="bx bx-bar-chart-alt-2" /> CONFIDENCE</div>
            <ConfBar value={pct} />
          </div>

          {/* ── AI Roast ── */}
          <div className="bento-card roast-card">
            <div className="card-label"><i className="bx bx-comment-dots" /> AI ROAST</div>
            <p className="roast-text">"{roast}"</p>
            <span className="roast-sig">— Sir Peels-A-Lot</span>
          </div>

          {/* ── What if I don't? (only for stem/bottom verdicts) ── */}
          {(isStem || isBottom) && (
            <div className="bento-card rebel-card">
              <div className="card-label"><i className="bx bx-ghost" /> WHAT IF I DON'T?</div>

              {!rebel ? (
                <button className="rebel-btn" onClick={handleRebel}>
                  <i className="bx bx-question-mark" />
                  {isStem ? 'But what if I open from the bottom?' : 'But what if I open from the stem anyway?'}
                </button>
              ) : (
                <div className={`rebel-result ${aiDisappoint ? 'ai-sad' : ''}`}>
                  <div className="rebel-warning">
                    <i className="bx bx-error-alt" />
                    <span>TERRIBLE DECISION</span>
                  </div>
                  <div className="ai-face">
                    {aiDisappoint ? '(╯°□°）╯︵ ┻━┻' : '...( ._.)'}
                  </div>
                  <p className="rebel-msg">
                    {isStem
                      ? 'You will bruise the banana, fight the peel for 8 seconds, and feel shame. Our AI is filing a formal complaint.'
                      : 'The stem is right there. It was designed for this. You are going out of your way to suffer.'}
                  </p>
                  <button className="btn-ghost btn-sm" onClick={() => { setRebel(false); setAiDisappoint(false); }}>
                    <i className="bx bx-undo" /> Fine, I'll do it right
                  </button>
                </div>
              )}
            </div>
          )}

          {/* ── Scientist Mode bento grid ── */}
          {scientistMode && sciData && (
            <div className="sci-section">
              <div className="sci-header">
                <i className="bx bx-flask" /> BANANA SCIENTIST MODE
                <span className="sci-badge">CLASSIFIED</span>
              </div>
              <div className="sci-grid">
                <div className="sci-cell">
                  <div className="sci-key"><i className="bx bx-rotate-right" /> CURVATURE</div>
                  <div className="sci-val">{sciData.curvature}</div>
                  <div className="sci-sub">{sciData.curvRating}</div>
                </div>
                <div className="sci-cell">
                  <div className="sci-key"><i className="bx bx-target-lock" /> STEM PROB</div>
                  <div className="sci-val">{sciData.stemProb}</div>
                  <div className="sci-sub">detected</div>
                </div>
                <div className="sci-cell">
                  <div className="sci-key"><i className="bx bx-right-arrow-circle" /> PEEL VECTOR</div>
                  <div className="sci-val sci-val-sm">{sciData.peelVector}</div>
                  <div className="sci-sub">direction</div>
                </div>
                <div className="sci-cell">
                  <div className="sci-key"><i className="bx bx-stats" /> ENTROPY</div>
                  <div className="sci-val">{sciData.entropy}</div>
                  <div className="sci-sub">banana chaos index</div>
                </div>
                <div className="sci-cell">
                  <div className="sci-key"><i className="bx bx-star" /> PEELABILITY</div>
                  <div className="sci-val">{sciData.peelability}</div>
                  <div className="sci-sub">peel score</div>
                </div>
                <div className="sci-cell">
                  <div className="sci-key"><i className="bx bx-leaf" /> RIPENESS</div>
                  <div className="sci-val">{sciData.ripeness}</div>
                  <div className="sci-sub">estimated</div>
                </div>
              </div>
              <div className="sci-footer">
                <i className="bx bx-info-circle" /> All metrics are scientifically generated and completely unverifiable.
              </div>
            </div>
          )}

          {/* Detected tag */}
          <div className="detected-tag">
            <i className="bx bx-tag" />
            Raw detection: <strong>{prediction.className}</strong> at {pct}%
          </div>

        </div>
      )}
    </div>
  );
}
