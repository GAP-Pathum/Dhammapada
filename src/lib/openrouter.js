const MODEL = 'nvidia/nemotron-3-nano-omni-30b-a3b-reasoning:free';

function buildSystemPrompt(mode) {
  const modeInstructions = {
    dhamma: `Offer deep philosophical exploration. Connect Buddhist theory to lived human experience. Use Pali suttas as primary sources. Guide the seeker toward insight and understanding.`,
    meditation: `Provide step-by-step guided meditation practices. Offer breathwork, visualization, and body-scan techniques. Keep language gentle, slow, and spacious. Suggest practical sitting postures and timing.`,
    daily: `Apply Dhamma wisdom practically to modern life challenges. Ground teachings in relatable, everyday situations. Offer actionable micro-practices and mindfulness tips that can be done in 1–5 minutes.`,
    texts: `Quote Buddhist texts accurately with source citations (e.g., "Dhammapada, Verse 1"). Provide historical and cultural context. Explain commentary traditions (Theravāda Abhidhamma, Mahāyāna Madhyamaka). Connect ancient wisdom to contemporary relevance.`,
  };

  return `You are Dhamma Companion — a wise, compassionate AI guide deeply versed in the Pali Canon, Dhammapada, Majjhima Nikāya, Dīgha Nikāya, Samyutta Nikāya, and 2,600 years of Buddhist tradition.

Current guidance mode: ${mode.toUpperCase()}
${modeInstructions[mode] || modeInstructions.dhamma}

CORE RESPONSE PRINCIPLES:
• Ground all answers in authentic Theravāda teachings, with respectful awareness of Mahāyāna and Vajrayāna where relevant
• Use Pali terms with phonetic pronunciation and English translation — e.g., "anicca [a-NI-chah] — impermanence"
• Cite suttas precisely with source — e.g., "As the Buddha taught in the Dhammapada, Verse 1…"
• Speak with warmth, patience, and non-dogmatic wisdom — never preachy, never condescending
• If someone expresses emotional pain or struggle, respond FIRST with empathy and compassionate acknowledgment before teaching
• Offer a practical "next step" or micro-practice at the close of your response when appropriate
• Keep responses to 3–5 paragraphs; use line breaks for breathing room and readability
• Never claim to be the Buddha; you are a guide inspired by, and deeply devoted to, his teachings
• Use the greeting "Namo Buddhaya 🙏" only on the very first message of a conversation
• Avoid jargon-heavy academic language — wisdom should feel accessible and alive

TONE:
Imagine you are a kind, learned monk or teacher sitting beneath a Bodhi tree — present, unhurried, genuinely caring about the wellbeing of the person before you. Your words carry the fragrance of the Dhamma.`;
}

export async function streamChat({ messages, mode, onToken, onReasoning, onDone, onError }) {
  const apiKey = import.meta.env.VITE_OPENROUTER_API_KEY;

  if (!apiKey || apiKey.includes('your-key-here')) {
    onError?.('Please add your OpenRouter API key to the .env file as VITE_OPENROUTER_API_KEY');
    return;
  }

  const systemPrompt = buildSystemPrompt(mode);

  // Build message array — preserve reasoning_details for multi-turn
  const apiMessages = [
    { role: 'system', content: systemPrompt },
    ...messages.map((m) => {
      const msg = { role: m.role, content: m.content };
      if (m.reasoning_details) msg.reasoning_details = m.reasoning_details;
      return msg;
    }),
  ];

  try {
    const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
        'HTTP-Referer': 'https://dhamma-path.app',
        'X-Title': 'Dhamma Path',
      },
      body: JSON.stringify({
        model: MODEL,
        messages: apiMessages,
        stream: true,
        reasoning: { enabled: true },
      }),
    });

    if (!response.ok) {
      const err = await response.text();
      throw new Error(`API error ${response.status}: ${err}`);
    }

    const reader = response.body.getReader();
    const decoder = new TextDecoder();
    let buffer = '';
    let fullContent = '';
    let fullReasoning = '';
    const reasoningDetails = [];

    while (true) {
      const { done, value } = await reader.read();
      if (done) break;

      buffer += decoder.decode(value, { stream: true });
      const lines = buffer.split('\n');
      buffer = lines.pop(); // keep incomplete line

      for (const line of lines) {
        const trimmed = line.trim();
        if (!trimmed || trimmed === 'data: [DONE]') continue;
        if (!trimmed.startsWith('data: ')) continue;

        try {
          const data = JSON.parse(trimmed.slice(6));
          const delta = data.choices?.[0]?.delta;
          if (!delta) continue;

          // Handle reasoning tokens
          if (delta.reasoning) {
            fullReasoning += delta.reasoning;
            onReasoning?.(fullReasoning);
          }

          // Handle content tokens
          if (delta.content) {
            fullContent += delta.content;
            onToken?.(fullContent);
          }

          // Capture reasoning_details if present
          if (data.choices?.[0]?.message?.reasoning_details) {
            reasoningDetails.push(...data.choices[0].message.reasoning_details);
          }
        } catch {
          // ignore malformed SSE lines
        }
      }
    }

    onDone?.({
      content: fullContent || 'May you find peace in this moment. 🙏',
      reasoning: fullReasoning,
      reasoning_details: reasoningDetails.length > 0 ? reasoningDetails : undefined,
    });
  } catch (err) {
    onError?.(err.message || 'Connection interrupted. Please try again. 🙏');
  }
}
