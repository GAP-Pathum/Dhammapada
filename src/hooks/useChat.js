import { useState, useCallback, useRef } from 'react';
import { useAuth } from '../context/AuthContext';
import { streamChat } from '../lib/openrouter';

function getTime() {
  return new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
}

const WELCOME_MSG = {
  id: 'welcome',
  role: 'assistant',
  content: 'Namo Buddhaya 🙏\n\nWelcome, dear friend. I am your **Dhamma Companion** — powered by wisdom and compassion, here to walk with you on the path.\n\nAsk me about the Buddha\'s teachings, the nature of suffering and its end, meditation, mindfulness — or simply share what weighs on your heart today.',
  time: getTime(),
};

export function useChat() {
  const { isLocked, incrementChatCount } = useAuth();
  const [messages, setMessages] = useState([WELCOME_MSG]);
  const [isStreaming, setIsStreaming] = useState(false);
  const [streamingId, setStreamingId] = useState(null);
  const abortRef = useRef(false);

  const sendMessage = useCallback(async (userText, mode) => {
    if (!userText.trim() || isStreaming || isLocked) return;

    const userMsg = {
      id: `user-${Date.now()}`,
      role: 'user',
      content: userText.trim(),
      time: getTime(),
    };

    const aiId = `ai-${Date.now()}`;
    const aiMsg = {
      id: aiId,
      role: 'assistant',
      content: '',
      reasoning: '',
      time: getTime(),
      streaming: true,
    };

    setMessages((prev) => [...prev, userMsg, aiMsg]);
    setIsStreaming(true);
    setStreamingId(aiId);
    abortRef.current = false;

    // Build conversation history for API (exclude welcome, only user/assistant pairs)
    const history = [];
    setMessages((prev) => {
      const allMsgs = [...prev];
      for (const m of allMsgs) {
        if (m.id === 'welcome') continue;
        if (m.id === aiId) continue; // exclude current placeholder
        if (m.role === 'user' || m.role === 'assistant') {
          const entry = { role: m.role, content: m.content };
          if (m.reasoning_details) entry.reasoning_details = m.reasoning_details;
          history.push(entry);
        }
      }
      return prev;
    });

    // Add the current user message
    history.push({ role: 'user', content: userText.trim() });

    await streamChat({
      messages: history,
      mode,
      onToken: (text) => {
        if (abortRef.current) return;
        setMessages((prev) =>
          prev.map((m) => (m.id === aiId ? { ...m, content: text } : m))
        );
      },
      onReasoning: (reasoning) => {
        if (abortRef.current) return;
        setMessages((prev) =>
          prev.map((m) => (m.id === aiId ? { ...m, reasoning } : m))
        );
      },
      onDone: ({ content, reasoning, reasoning_details }) => {
        if (abortRef.current) return;
        setMessages((prev) =>
          prev.map((m) =>
            m.id === aiId
              ? { ...m, content, reasoning, reasoning_details, streaming: false }
              : m
          )
        );
        setIsStreaming(false);
        setStreamingId(null);
        incrementChatCount();
      },
      onError: (errMsg) => {
        setMessages((prev) =>
          prev.map((m) =>
            m.id === aiId
              ? {
                  ...m,
                  content: `I am here with you. ${errMsg}\n\nPlease try your question again, and I will do my best to offer guidance. 🙏`,
                  streaming: false,
                  isError: true,
                }
              : m
          )
        );
        setIsStreaming(false);
        setStreamingId(null);
      },
    });
  }, [isStreaming, isLocked, incrementChatCount]);

  const clearChat = useCallback(() => {
    abortRef.current = true;
    setIsStreaming(false);
    setStreamingId(null);
    setMessages([
      {
        ...WELCOME_MSG,
        id: `welcome-${Date.now()}`,
        content: 'The chat has been cleared. A fresh beginning — like each mindful breath. What would you like to explore? 🙏',
        time: getTime(),
      },
    ]);
  }, []);

  return { messages, isStreaming, streamingId, sendMessage, clearChat };
}
