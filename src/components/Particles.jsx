import { useEffect, useRef } from 'react';

export default function Particles() {
  const containerRef = useRef(null);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    function makeParticle(type) {
      const el = document.createElement('div');
      el.className = type;
      if (type === 'particle') {
        const size = Math.random() * 3 + 2;
        el.style.width = size + 'px';
        el.style.height = size + 'px';
      }
      el.style.left = Math.random() * 100 + '%';
      const dur = Math.random() * 20 + 15;
      el.style.animationDuration = dur + 's';
      el.style.animationDelay = Math.random() * dur + 's';
      el.style.setProperty('--drift', (Math.random() - 0.5) * 70 + 'px');
      container.appendChild(el);
      setTimeout(() => el.remove(), dur * 2 * 1000);
    }

    const p1 = setInterval(() => makeParticle('particle'), 900);
    const p2 = setInterval(() => makeParticle('petal'), 3500);

    return () => {
      clearInterval(p1);
      clearInterval(p2);
    };
  }, []);

  return <div id="particles" ref={containerRef} />;
}
