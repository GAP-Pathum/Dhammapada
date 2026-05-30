import { useEffect, useState } from 'react';
import Particles from '../components/Particles';
import ChatPanel from '../components/chat/ChatPanel';
import { quotes } from '../constants/quotes';
import img1 from '../assets/images/1b7981a84606ae881c6c698775aabe8b.jpg';
import img2 from '../assets/images/61eb82a86c1358588fc92ac149245c36.jpg';
import img3 from '../assets/images/73ca7cb7414534eeac3afcd88fdbb85f.jpg';
import img4 from '../assets/images/c584aceb7129c0f868376d3a8cf4ff10.jpg';

const backgroundImages = [img1, img2, img3, img4];

export default function HomePage({ onNavigate }) {
  const [quoteIdx, setQuoteIdx] = useState(0);
  const [quoteVisible, setQuoteVisible] = useState(true);
  const [bgIdx, setBgIdx] = useState(0);

  useEffect(() => {
    const quoteInterval = setInterval(() => {
      setQuoteVisible(false);
      setTimeout(() => {
        setQuoteIdx((i) => (i + 1) % quotes.length);
        setQuoteVisible(true);
      }, 600);
    }, 8000);

    const bgInterval = setInterval(() => {
      setBgIdx((i) => (i + 1) % backgroundImages.length);
    }, 12000);

    return () => {
      clearInterval(quoteInterval);
      clearInterval(bgInterval);
    };
  }, []);

  return (
    <div style={{height:'100%'}} id="homePage">
      <div className="layout">
        {/* ── LEFT PANEL ── */}
        <div className="left">
          <div className="left-bg" style={{ zIndex: 0 }} />
          
          {/* Dynamic Background Images */}
          {backgroundImages.map((src, idx) => (
            <img 
              key={src}
              src={src}
              alt="Background"
              style={{
                position: 'absolute',
                inset: 0,
                width: '100%',
                height: '100%',
                objectFit: 'cover',
                opacity: idx === bgIdx ? 0.35 : 0,
                transition: 'opacity 2.5s ease-in-out',
                zIndex: 1,
                pointerEvents: 'none'
              }}
            />
          ))}

          {/* Mandala */}
          <div className="mandala-wrap" style={{ zIndex: 2 }}>
            <div className="mandala-ring ring1" />
            <div className="mandala-ring ring2" />
            <div className="mandala-ring ring3" />
            <div className="mandala-ring ring4" />
            <svg className="dharma-center" viewBox="0 0 160 160" fill="none" xmlns="http://www.w3.org/2000/svg">
              <circle cx="80" cy="80" r="75" stroke="rgba(201,169,110,0.2)" strokeWidth="1" />
              <circle cx="80" cy="80" r="20" fill="rgba(201,169,110,0.1)" stroke="rgba(201,169,110,0.55)" strokeWidth="1.5" />
              <circle cx="80" cy="80" r="6" fill="rgba(201,169,110,0.8)" />
              <g stroke="rgba(201,169,110,0.5)" strokeWidth="1.5" strokeLinecap="round">
                <line x1="80" y1="20" x2="80" y2="60" /><line x1="80" y1="100" x2="80" y2="140" />
                <line x1="20" y1="80" x2="60" y2="80" /><line x1="100" y1="80" x2="140" y2="80" />
                <line x1="34" y1="34" x2="63" y2="63" /><line x1="97" y1="97" x2="126" y2="126" />
                <line x1="126" y1="34" x2="97" y2="63" /><line x1="63" y1="97" x2="34" y2="126" />
              </g>
              <g fill="rgba(201,169,110,0.45)">
                <circle cx="80" cy="8" r="2.5" /><circle cx="80" cy="152" r="2.5" />
                <circle cx="8" cy="80" r="2.5" /><circle cx="152" cy="80" r="2.5" />
                <circle cx="29" cy="29" r="2.5" /><circle cx="131" cy="29" r="2.5" />
                <circle cx="29" cy="131" r="2.5" /><circle cx="131" cy="131" r="2.5" />
              </g>
            </svg>
          </div>

          {/* Particles */}
          <Particles />

          {/* Text content */}
          <div className="left-content">
            <div className="brand">☸ &nbsp; Dhamma Path</div>
            <div className="center-text">
              <h1 className="main-title">
                Find Peace<br />in the <em>Present</em><br />Moment
              </h1>
              <p className="subtitle">Wisdom · Compassion · Liberation</p>
              <div className="quote-block">
                <p
                  className="quote-text"
                  id="rotating-quote"
                  style={{
                    opacity: quoteVisible ? 1 : 0,
                    transition: 'opacity 0.6s ease',
                  }}
                >
                  {quotes[quoteIdx].text}
                </p>
                <p
                  className="quote-attr"
                  id="quote-attr"
                  style={{
                    opacity: quoteVisible ? 1 : 0,
                    transition: 'opacity 0.6s ease',
                  }}
                >
                  {quotes[quoteIdx].attr}
                </p>
              </div>
            </div>
            <div className="left-footer">
              <div className="noble-paths">
                <div className="path-item">Right View</div>
                <div className="path-item">Right Intention</div>
                <div className="path-item">Right Mindfulness</div>
              </div>
              <div className="dharma-footer-symbol">☸</div>
            </div>
          </div>
        </div>

        {/* ── RIGHT PANEL (CHAT) ── */}
        <ChatPanel onNavigate={onNavigate} />
      </div>
    </div>
  );
}
