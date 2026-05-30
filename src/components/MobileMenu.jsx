import { useAuth } from '../context/AuthContext';

export default function MobileMenu({ open, onNavigate, onClose, onBeginPractice }) {
  const { user, loginWithGoogle, logout } = useAuth();

  function handleNav(page) {
    onNavigate(page);
    onClose();
  }

  async function handleSignIn() {
    onClose();
    await loginWithGoogle();
  }

  async function handleSignOut() {
    onClose();
    await logout();
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
      <div className="mobile-menu-divider" />
      {user ? (
        <div className="mobile-menu-auth">
          <div className="mobile-menu-user">
            {user.photoURL ? (
              <img src={user.photoURL} alt="Profile" className="mobile-menu-user-img" referrerPolicy="no-referrer" />
            ) : (
              <div className="mobile-menu-user-initial">{user.displayName ? user.displayName[0] : 'U'}</div>
            )}
            <span className="mobile-menu-username">{user.displayName?.split(' ')[0] || 'User'}</span>
          </div>
          <button className="mobile-menu-signout" onClick={handleSignOut}>Sign Out</button>
        </div>
      ) : (
        <button className="mobile-menu-signin" onClick={handleSignIn}>
          <svg viewBox="0 0 48 48" width="16" height="16" style={{ marginRight: '8px', flexShrink: 0 }}>
            <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z" />
            <path fill="#4285F4" d="M46.5 24c0-1.61-.15-3.16-.42-4.69H24v8.87h12.69c-.55 2.94-2.2 5.43-4.69 7.11l7.29 5.65C43.59 36.5 46.5 30.93 46.5 24z" />
            <path fill="#FBBC05" d="M10.54 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.98-6.19z" />
            <path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.29-5.65c-2.03 1.36-4.63 2.17-8.6 2.17-6.26 0-11.57-4.22-13.46-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z" />
          </svg>
          Sign In with Google
        </button>
      )}
    </div>
  );
}
