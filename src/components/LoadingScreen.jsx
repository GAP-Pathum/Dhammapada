import { useEffect, useState } from 'react';

const loadingQuotes = [
  { text: '"The journey of a thousand miles begins with a single step."', attr: '— Buddhist Proverb' },
  { text: '"In the beginner\'s mind there are many possibilities, in the expert\'s mind there are few."', attr: '— Shunryu Suzuki' },
  { text: '"Peace comes from within. Do not seek it without."', attr: '— Gautama Buddha' },
];

export default function LoadingScreen({ onDone }) {
  const [quote] = useState(() => loadingQuotes[Math.floor(Math.random() * loadingQuotes.length)]);
  const [progress, setProgress] = useState(0);
  const [fadeOut, setFadeOut] = useState(false);
  const [particles] = useState(() =>
    [...Array(12)].map(() => ({
      left: `${Math.random() * 100}%`,
      animationDelay: `${Math.random() * 3}s`,
      animationDuration: `${3 + Math.random() * 4}s`,
      width: `${2 + Math.random() * 4}px`,
      height: `${2 + Math.random() * 4}px`,
    }))
  );

  useEffect(() => {
    // Animate progress bar
    const inc = setInterval(() => {
      setProgress((p) => {
        if (p >= 100) { clearInterval(inc); return 100; }
        return p + 2;
      });
    }, 45);

    // Fade and dismiss
    const timer = setTimeout(() => {
      setFadeOut(true);
      setTimeout(onDone, 600);
    }, 2800);

    return () => { clearInterval(inc); clearTimeout(timer); };
  }, [onDone]);

  return (
    <div className={`loading-screen${fadeOut ? ' fade-out' : ''}`}>
      {/* Animated mandala rings */}
      <div className="ls-mandala">
        <div className="ls-ring ls-r1" />
        <div className="ls-ring ls-r2" />
        <div className="ls-ring ls-r3" />

        {/* Dharma wheel SVG */}
        <svg className="ls-dharma" viewBox="0 0 160 160" fill="none" xmlns="http://www.w3.org/2000/svg">
          <circle cx="80" cy="80" r="75" stroke="rgba(201,169,110,0.25)" strokeWidth="1" />
          <circle cx="80" cy="80" r="20" fill="rgba(201,169,110,0.12)" stroke="rgba(201,169,110,0.6)" strokeWidth="1.5" />
          <circle cx="80" cy="80" r="6" fill="rgba(201,169,110,0.9)" />
          <g stroke="rgba(201,169,110,0.55)" strokeWidth="1.5" strokeLinecap="round">
            <line x1="80" y1="20" x2="80" y2="60" /><line x1="80" y1="100" x2="80" y2="140" />
            <line x1="20" y1="80" x2="60" y2="80" /><line x1="100" y1="80" x2="140" y2="80" />
            <line x1="34" y1="34" x2="63" y2="63" /><line x1="97" y1="97" x2="126" y2="126" />
            <line x1="126" y1="34" x2="97" y2="63" /><line x1="63" y1="97" x2="34" y2="126" />
          </g>
          <g fill="rgba(201,169,110,0.5)">
            <circle cx="80" cy="8" r="3" /><circle cx="80" cy="152" r="3" />
            <circle cx="8" cy="80" r="3" /><circle cx="152" cy="80" r="3" />
            <circle cx="29" cy="29" r="3" /><circle cx="131" cy="29" r="3" />
            <circle cx="29" cy="131" r="3" /><circle cx="131" cy="131" r="3" />
          </g>
        </svg>

        {/* Lotus petals */}
        <div className="ls-lotus">
          {[...Array(8)].map((_, i) => (
            <div key={i} className="ls-petal" style={{ transform: `rotate(${i * 45}deg)` }} />
          ))}
        </div>
      </div>

      {/* Text content */}
      <div className="ls-content">
        <div className="ls-brand">☸ &nbsp; Dhamma Path</div>
        <h1 className="ls-title">Awakening the Path…</h1>
        <div className="ls-quote">
          <p className="ls-quote-text">{quote.text}</p>
          <p className="ls-quote-attr">{quote.attr}</p>
        </div>
      </div>

      {/* Progress bar */}
      <div className="ls-progress-wrap">
        <div className="ls-progress-bar" style={{ width: `${progress}%` }} />
      </div>

      {/* Floating particles */}
      <div className="ls-particles">
        {particles.map((pStyle, i) => (
          <div
            key={i}
            className="ls-particle"
            style={pStyle}
          />
        ))}
      </div>
    </div>
  );
}
