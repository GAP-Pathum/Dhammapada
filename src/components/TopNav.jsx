import { useAuth } from '../context/AuthContext';

export default function TopNav({ currentPage, onNavigate, onBeginPractice, onToggleMenu }) {
  const { user, loginWithGoogle, logout } = useAuth();

  return (
    <nav className="topnav">
      <a className="nav-logo" href="#" onClick={(e) => { e.preventDefault(); onNavigate('home'); }}>
        <div className="nav-logo-icon">☸</div>
        <span className="nav-logo-text">Dhamma Path</span>
      </a>

      <ul className="nav-links">
        {[
          { id: 'home', label: 'Home' },
          { id: 'about', label: 'About' },
          { id: 'teachings', label: 'Teachings' },
          { id: 'meditate', label: 'Meditate' },
        ].map(({ id, label }) => (
          <li key={id}>
            <a
              href="#"
              id={`nav-${id}`}
              className={currentPage === id ? 'active' : ''}
              onClick={(e) => { e.preventDefault(); onNavigate(id); }}
            >
              {label}
            </a>
          </li>
        ))}
        {user ? (
          <li className="nav-user-item">
            <div className="nav-user-profile" title={`Logged in as ${user.displayName || user.email}`}>
              {user.photoURL ? (
                <img src={user.photoURL} alt="Profile" className="nav-user-img" referrerPolicy="no-referrer" />
              ) : (
                <div className="nav-user-initial">{user.displayName ? user.displayName[0] : 'U'}</div>
              )}
              <span className="nav-username">{user.displayName?.split(' ')[0] || 'User'}</span>
            </div>
            <button className="nav-auth-btn" onClick={logout}>Sign Out</button>
          </li>
        ) : (
          <li>
            <button className="nav-auth-btn" onClick={loginWithGoogle}>Sign In</button>
          </li>
        )}
        <li>
          <button className="nav-cta" onClick={onBeginPractice}>
            Begin Practice ☸
          </button>
        </li>
      </ul>

      <button className="hamburger" id="hamburgerBtn" aria-label="Menu" onClick={onToggleMenu}>
        <span /><span /><span />
      </button>
    </nav>
  );
}
