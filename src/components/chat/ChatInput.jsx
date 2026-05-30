import { useRef } from 'react';

export default function ChatInput({ onSend, disabled }) {
  const ref = useRef(null);

  function handleKey(e) {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      submit();
    }
  }

  function submit() {
    const val = ref.current?.value.trim();
    if (!val || disabled) return;
    onSend(val);
    ref.current.value = '';
    ref.current.style.height = 'auto';
  }

  function autoResize(el) {
    el.style.height = 'auto';
    el.style.height = Math.min(el.scrollHeight, 90) + 'px';
  }

  return (
    <div className="chat-input-area">
      <div style={{ flex: 1 }}>
        <div className="input-wrap">
          <textarea
            id="userInput"
            ref={ref}
            rows={1}
            placeholder="Ask about Dhamma, life, peace…"
            onKeyDown={handleKey}
            onInput={(e) => autoResize(e.target)}
            disabled={disabled}
          />
        </div>
        <div className="input-footer">May your words be guided by compassion</div>
      </div>
      <button
        className="send-btn"
        onClick={submit}
        aria-label="Send"
        disabled={disabled}
      >
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <line x1="22" y1="2" x2="11" y2="13" />
          <polygon points="22 2 15 22 11 13 2 9 22 2" />
        </svg>
      </button>
    </div>
  );
}
