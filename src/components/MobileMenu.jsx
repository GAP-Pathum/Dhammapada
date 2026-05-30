export default function MobileMenu({ open, onNavigate, onClose, onBeginPractice }) {
  function handleNav(page) {
    onNavigate(page);
    onClose();
  }

  return (
    <div className={`mobile-menu${open ? ' open' : ''}`}>
      {[
        { id: 'home', label: '☸ Home' },
        { id: 'about', label: 'About' },
        { id: 'teachings', label: 'Teachings' },
        { id: 'meditate', label: 'Meditate' },
      ].map(({ id, label }) => (
        <a key={id} href="#" onClick={(e) => { e.preventDefault(); handleNav(id); }}>
          {label}
        </a>
      ))}
      <button onClick={() => { handleNav('home'); onBeginPractice(); }}>
        Begin Practice
      </button>
    </div>
  );
}
