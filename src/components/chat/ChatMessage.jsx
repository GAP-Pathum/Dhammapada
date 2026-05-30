import { useState } from 'react';

function renderContent(content) {
  // Convert markdown-like **bold** and line breaks
  return content
    .split('\n')
    .map((line, i) => {
      const parts = line.split(/\*\*(.*?)\*\*/g);
      const rendered = parts.map((part, j) =>
        j % 2 === 1 ? <strong key={j}>{part}</strong> : part
      );
      return <span key={i}>{rendered}{i < content.split('\n').length - 1 && <br />}</span>;
    });
}

export default function ChatMessage({ message }) {
  const { role, content, reasoning, time, streaming, isError } = message;
  const isUser = role === 'user';
  const [reasoningOpen, setReasoningOpen] = useState(false);

  return (
    <div className={`msg-row${isUser ? ' user' : ''}`}>
      <div className={`msg-avatar ${isUser ? 'user' : 'ai'}`}>
        {isUser ? 'You' : '☸'}
      </div>
      <div>
        {/* Reasoning block */}
        {reasoning && !isUser && (
          <div className="reasoning-block">
            <button
              className="reasoning-toggle"
              onClick={() => setReasoningOpen((o) => !o)}
            >
              <span className="reasoning-dot" />
              {reasoningOpen ? 'Hide reasoning' : 'Contemplating…'}
              <span className={`reasoning-arrow${reasoningOpen ? ' open' : ''}`}>▾</span>
            </button>
            {reasoningOpen && (
              <div className="reasoning-content">
                {reasoning}
              </div>
            )}
          </div>
        )}

        {/* Message bubble */}
        <div className={`bubble ${isUser ? 'user' : 'ai'}${isError ? ' error' : ''}`}>
          {content ? (
            <>
              {renderContent(content)}
              {streaming && <span className="streaming-cursor" />}
            </>
          ) : streaming ? (
            <div className="typing-dots">
              <span /><span /><span />
            </div>
          ) : null}
        </div>
        <div className={`bubble-time${isUser ? ' text-right' : ''}`}>{time}</div>
      </div>
    </div>
  );
}
