import { useState, useRef, useCallback } from 'react';
import LoadingScreen from './components/LoadingScreen';
import TopNav from './components/TopNav';
import MobileMenu from './components/MobileMenu';
import HomePage from './pages/HomePage';
import AboutPage from './pages/AboutPage';
import TeachingsPage from './pages/TeachingsPage';
import MeditatePage from './pages/MeditatePage';
import { useAudio } from './context/AudioContext';

export default function App() {
  const { isMuted, toggleMute } = useAudio();
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState('home');
  const [mobileOpen, setMobileOpen] = useState(false);
  const askAboutRef = useRef(null);

  const navigate = useCallback((page) => {
    setCurrentPage(page);
    setMobileOpen(false);
  }, []);

  const handleBeginPractice = useCallback(() => {
    setCurrentPage('home');
    setMobileOpen(false);
    setTimeout(() => {
      document.getElementById('userInput')?.focus();
    }, 400);
  }, []);

  // askAbout — used by TeachingsPage to send a topic to the chat
  const handleAskAbout = useCallback((topic) => {
    setTimeout(() => {
      const input = document.getElementById('userInput');
      if (input) {
        input.value = topic;
        input.dispatchEvent(new Event('input', { bubbles: true }));
      }
      // Small delay then trigger send
      setTimeout(() => {
        // Dispatch Enter key to trigger ChatInput's submit
        const el = document.getElementById('userInput');
        if (el) {
          el.value = topic;
          el.dispatchEvent(new KeyboardEvent('keydown', { key: 'Enter', bubbles: true }));
        }
      }, 200);
    }, 400);
  }, []);

  if (loading) {
    return <LoadingScreen onDone={() => setLoading(false)} />;
  }

  return (
    <>
      <TopNav
        currentPage={currentPage}
        onNavigate={navigate}
        onBeginPractice={handleBeginPractice}
        onToggleMenu={() => setMobileOpen((prev) => !prev)}
      />
      <MobileMenu
        open={mobileOpen}
        onNavigate={navigate}
        onClose={() => setMobileOpen(false)}
        onBeginPractice={handleBeginPractice}
      />

      {/* Pages — use CSS visibility (matching original design) */}
      <div className={`page-container${currentPage === 'home' ? ' page-visible' : ' page-hidden'}`}>
        <HomePage onNavigate={navigate} askAboutRef={askAboutRef} />
      </div>
      <div className={`page-container${currentPage === 'about' ? ' page-visible' : ' page-hidden'}`}>
        <AboutPage onNavigate={navigate} />
      </div>
      <div className={`page-container${currentPage === 'teachings' ? ' page-visible' : ' page-hidden'}`}>
        <TeachingsPage onNavigate={navigate} onAskAbout={handleAskAbout} />
      </div>
      <div className={`page-container${currentPage === 'meditate' ? ' page-visible' : ' page-hidden'}`}>
        <MeditatePage />
      </div>

      {/* Footer */}
      {currentPage !== 'home' && (
        <footer className="site-footer">
          <span>Made with <span className="footer-heart">♥</span> love by</span>
          <strong className="footer-name">GAP-Pathum</strong>
          <span className="footer-sep">·</span>
          <span>Dhamma Path</span>
          <span className="footer-sep">·</span>
          <span>☸</span>
        </footer>
      )}

      {/* Floating Audio Button */}
      <button 
        className="floating-audio-btn"
        onClick={toggleMute}
        title={isMuted ? 'Unmute Music' : 'Mute Music'}
        style={{
          position: 'fixed',
          bottom: '10px',
          left: '10px',
          zIndex: 9999,
          background: 'rgba(30, 20, 10, 0.8)',
          border: '1px solid rgba(201, 169, 110, 0.5)',
          borderRadius: '50%',
          width: '10px',
          height: '10px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: '1rem',
          cursor: 'pointer',
          color: '#C9A96E',
          boxShadow: '0 4px 12px rgba(0,0,0,0.5)',
          transition: 'all 0.3s ease'
        }}
      >
        {isMuted ? '🔇' : '🔊'}
      </button>
    </>
  );
}
