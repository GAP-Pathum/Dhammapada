import watPhoImg from '../assets/images/61eb82a86c1358588fc92ac149245c36.jpg';

export default function AboutPage({ onNavigate }) {
  return (
    <div className="about-page-inner" id="aboutPage" style={{height:'100%',overflowY:'auto',background:'var(--deep2)'}}>
      <div className="about-container">
        {/* Hero */}
        <div className="about-hero">
          <div className="about-hero-text">
            <div className="about-gold-line" />
            <h1>Walking the <em>Path</em> of Awakening</h1>
            <p>
              Dhamma Path is a contemplative sanctuary — an AI companion rooted in the timeless
              wisdom of the Buddha's teachings, offering guidance, reflection, and stillness to
              those who seek it.
            </p>
            <p>
              Drawing from the Pali Canon, the Dhammapada, and 2,600 years of Buddhist tradition,
              every response is crafted with care, accuracy, and deep compassion.
            </p>
            <button className="btn-gold" onClick={() => onNavigate('home')}>
              Begin Your Practice ☸
            </button>
          </div>
          <div className="about-hero-img">
            <img
              src={watPhoImg}
              alt="Temple Buddha"
            />
            <div className="img-caption">Reclining Buddha, Wat Pho, Thailand</div>
          </div>
        </div>

        {/* Pillars */}
        <div className="pillars">
          {[
            { icon: '🪷', title: 'Wisdom', desc: 'Prajñā — the clarity that sees things as they truly are, beyond illusion and attachment.' },
            { icon: '🤲', title: 'Compassion', desc: 'Karuṇā — the open heart that meets all beings with kindness, without exception.' },
            { icon: '☮️', title: 'Liberation', desc: 'Nibbāna — the peaceful release from the cycle of craving, suffering, and rebirth.' },
          ].map(({ icon, title, desc }) => (
            <div className="pillar" key={title}>
              <div className="pillar-icon">{icon}</div>
              <h3>{title}</h3>
              <p>{desc}</p>
            </div>
          ))}
        </div>

        {/* Four Noble Truths */}
        <div className="teachings-section">
          <h2>The Four Noble Truths</h2>
          <p className="sub">The foundation of all Buddhist teaching</p>
          <div className="teachings-grid">
            {[
              { num: 'I', title: 'Dukkha', desc: 'Life contains suffering, unsatisfactoriness, and imperfection. To acknowledge this is the beginning of wisdom.' },
              { num: 'II', title: 'Samudāya', desc: 'Suffering arises from craving and clinging — tanhā. There is always a cause; nothing appears without condition.' },
              { num: 'III', title: 'Nirodha', desc: 'The cessation of craving is possible. Liberation is not a dream — it is the nature of mind when freed.' },
              { num: 'IV', title: 'Magga', desc: 'The Noble Eightfold Path is the way to the end of suffering — practical, livable, and within your reach.' },
            ].map(({ num, title, desc }) => (
              <div className="teaching-card" key={num}>
                <div className="teaching-card-head">
                  <span className="teaching-num">{num}</span>
                  <h4>{title}</h4>
                </div>
                <p>{desc}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Quote */}
        <div className="about-quote">
          <blockquote>
            "All conditioned things are impermanent — when one sees this with wisdom, one turns away from suffering."
          </blockquote>
          <cite>— Dhammapada, Verse 277</cite>
        </div>

        {/* Credits section */}
        <div className="credits-section">
          <div className="credits-lotus">🪷</div>
          <div className="credits-heart-text">
            Made with <span className="credits-heart">♥</span> love by{' '}
            <strong className="credits-name">GAP-Pathum</strong>
          </div>
          <p className="credits-sub">
            Dhamma Path · A contemplative AI sanctuary rooted in Buddhist wisdom
          </p>
          <div className="credits-divider">✦ &nbsp; ☸ &nbsp; ✦</div>
          <p className="credits-tagline">
            "May all beings be happy. May all beings be free from suffering."
          </p>
        </div>
      </div>
    </div>
  );
}
