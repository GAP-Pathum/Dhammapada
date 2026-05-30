import { teachings } from '../constants/teachings';

export default function TeachingsPage({ onNavigate, onAskAbout }) {
  return (
    <div className="teachings-page-inner" id="teachingsPage" style={{height:'100%',overflowY:'auto',background:'var(--deep2)'}}>
      <div className="teachings-container">
        <div className="page-header">
          <div className="label">☸ Core Teachings</div>
          <h1>Dhamma in Depth</h1>
        </div>

        {teachings.map((t) => (
          <div className="teaching-full" key={t.id}>
            <h3>
              <span>{t.icon}</span> {t.title}
            </h3>
            {t.body.map((para, i) => (
              <p key={i} dangerouslySetInnerHTML={{ __html: para }} />
            ))}
            <button
              className="ask-btn"
              onClick={() => {
                onNavigate('home');
                onAskAbout(t.ask);
              }}
            >
              {t.askLabel}
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
