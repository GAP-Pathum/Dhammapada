import { useEffect, useRef, useState } from 'react';
import ChatMessage from './ChatMessage';
import ChatInput from './ChatInput';
import ModeTabs from './ModeTabs';
import Suggestions from './Suggestions';
import { useChat } from '../../hooks/useChat';
import { useAuth } from '../../context/AuthContext';

export default function ChatPanel({ onNavigate }) {
  const [activeMode, setActiveMode] = useState('dhamma');
  const { messages, isStreaming, sendMessage, clearChat } = useChat();
  const { user, isLocked, signingIn, authError, loginWithGoogle, logout } = useAuth();
  const messagesEndRef = useRef(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  function handleSend(text) {
    sendMessage(text, activeMode);
  }

  return (
    <div className="right">
      {/* Shimmer top bar */}
      <div className="shimmer-bar" />

      {/* Header */}
      <div className="chat-header">
        <div className="chat-header-left">
          <div className="avatar">
            ☸
            <div className="avatar-status" />
          </div>
          <div className="chat-header-info">
            <h2>Dhamma Companion</h2>
            <p>Guided by the Dharma · AI-Powered</p>
          </div>
        </div>
        <div className="chat-header-actions">
          {user ? (
            <div className="user-profile-actions">
              <div className="chat-user-profile" title={`Signed in as ${user.displayName}`}>
                {user.photoURL ? (
                  <img src={user.photoURL} alt="Profile" className="chat-user-img" referrerPolicy="no-referrer" />
                ) : (
                  <div className="chat-user-initial">{user.displayName ? user.displayName[0] : 'U'}</div>
                )}
              </div>
              <button className="icon-btn logout-btn" onClick={logout} title="Sign Out">🚪</button>
            </div>
          ) : (
            <button
              className="icon-btn login-btn"
              onClick={loginWithGoogle}
              disabled={signingIn}
              title="Sign In with Google"
              style={{ opacity: signingIn ? 0.6 : 1 }}
            >
              {signingIn ? '⏳' : '🔑'}
            </button>
          )}
          <button className="icon-btn" onClick={clearChat} title="Clear chat">🗑</button>
          <button className="icon-btn" onClick={() => onNavigate('meditate')} title="Meditate">🧘</button>
        </div>
      </div>

      {/* Mode tabs */}
      <ModeTabs activeMode={activeMode} onModeChange={setActiveMode} />

      {/* Messages */}
      <div className="chat-messages" id="chatMessages">
        <div className="chat-divider">✦ &nbsp; ✦ &nbsp; ✦</div>
        {messages.map((msg) => (
          <ChatMessage key={msg.id} message={msg} />
        ))}
        <div ref={messagesEndRef} />
      </div>

      {/* Suggestions and Input / Lock Overlay */}
      {isLocked ? (
        <div className="chat-lock-overlay">
          <div className="chat-lock-content">
            <div className="lock-icon-wrap">🔒</div>
            <h3>Deepen Your Dhamma Journey</h3>
            <p>
              You have completed your 3 trial conversations. Sign in with Google to enjoy unlimited chats, track your meditation history, and plan future practices.
            </p>
            {authError && (
              <p className="auth-error-msg">⚠️ {authError}</p>
            )}
            <button
              className="btn-gold google-auth-btn"
              onClick={loginWithGoogle}
              disabled={signingIn}
            >
              {signingIn ? (
                <>
                  <span className="auth-spinner" />
                  Signing in…
                </>
              ) : (
                <>
                  <svg className="google-icon" viewBox="0 0 48 48" width="18" height="18" style={{ marginRight: '10px' }}>
                    <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z" />
                    <path fill="#4285F4" d="M46.5 24c0-1.61-.15-3.16-.42-4.69H24v8.87h12.69c-.55 2.94-2.2 5.43-4.69 7.11l7.29 5.65C43.59 36.5 46.5 30.93 46.5 24z" />
                    <path fill="#FBBC05" d="M10.54 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.98-6.19z" />
                    <path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.29-5.65c-2.03 1.36-4.63 2.17-8.6 2.17-6.26 0-11.57-4.22-13.46-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z" />
                  </svg>
                  Sign In with Google
                </>
              )}
            </button>
          </div>
        </div>
      ) : (
        <>
          <Suggestions activeMode={activeMode} onSend={handleSend} />
          <ChatInput onSend={handleSend} disabled={isStreaming} />
        </>
      )}
    </div>
  );
}

