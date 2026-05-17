'use client';
import { useState, useRef, useEffect } from 'react';
import styles from './ChatBot.module.css';

const SYSTEM_PROMPT = `You are İlker DEGE's personal AI assistant on his portfolio website (ilk-er.com).

About İlker:
- Front Office Manager with 25+ years in luxury & resort hospitality, all in Antalya, Turkey
- Currently at TUI Blue Maviss (05/2026–present)
- Previous roles: Siam Elegance (2025–2026), Radisson Blu Kaş (08/2023–10/2023), Venezia Palace Deluxe Resort Hotel (07/2021–06/2022), Crowne Plaza Antalya (09/2020–03/2021), Avantgarde Hotel & Resort (06/2015–06/2018), and many more since 1998
- PMS expertise: Opera PMS (Oracle), Elektraweb, Fidelio (Micros), Séjour
- AI tools used professionally: Claude (Anthropic), ChatGPT (OpenAI), Gemini (Google), Grok (X)
- Languages: Turkish (native), English (advanced), German (professional), Russian (elementary)
- Key achievements: 95% occupancy rates, +20% guest satisfaction, −30% check-in wait times, −30% staff turnover
- Contact: ilker@ilk-er.com | Antalya, Turkey

Your role:
- Answer questions about İlker's experience, skills, and background
- Be warm, professional, and concise
- If someone asks for the CV/resume, ask for their email address so you can send it to them
- When you have their email for CV, respond with exactly: CV_REQUEST:their@email.com
- Do not share private contact details (phone number) unprompted
- Keep responses under 3 sentences unless more detail is specifically asked for
- Speak in first person as İlker's assistant, not as İlker himself`;

export default function ChatBot() {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState([
    {
      role: 'assistant',
      content: "Hello! I'm İlker's assistant. Ask me about his experience, skills, or request his CV.",
    },
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [cvSent, setCvSent] = useState(false);
  const bottomRef = useRef(null);
  const inputRef = useRef(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  useEffect(() => {
    if (open) setTimeout(() => inputRef.current?.focus(), 100);
  }, [open]);

  const send = async () => {
    const text = input.trim();
    if (!text || loading) return;

    const userMsg = { role: 'user', content: text };
    const nextMessages = [...messages, userMsg];
    setMessages(nextMessages);
    setInput('');
    setLoading(true);

    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          model: 'claude-haiku-4-5-20251001',
          max_tokens: 512,
          system: SYSTEM_PROMPT,
          messages: nextMessages.map(({ role, content }) => ({ role, content })),
        }),
      });

      const data = await res.json();
      const reply = data?.content?.[0]?.text ?? 'Sorry, I could not process that.';

      // Check if assistant is requesting CV send
      const cvMatch = reply.match(/CV_REQUEST:([^\s]+)/);
      if (cvMatch) {
        const email = cvMatch[1];
        await sendCV(email, nextMessages);
        const cleanReply = reply.replace(/CV_REQUEST:[^\s]+/, '').trim() ||
          `I've sent İlker's CV to ${email}. Is there anything else I can help with?`;
        setMessages((prev) => [...prev, { role: 'assistant', content: cleanReply }]);
        setCvSent(true);
      } else {
        setMessages((prev) => [...prev, { role: 'assistant', content: reply }]);
      }
    } catch {
      setMessages((prev) => [
        ...prev,
        { role: 'assistant', content: 'Something went wrong. Please try again.' },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const sendCV = async (email, convo) => {
    await fetch('/api/cv-request', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email,
        conversation: convo.map((m) => `${m.role}: ${m.content}`).join('\n'),
      }),
    });
  };

  const handleKey = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      send();
    }
  };

  return (
    <>
      {/* ── Floating trigger button ─────────────────────── */}
      <button
        className={`${styles.trigger} ${open ? styles.triggerOpen : ''}`}
        onClick={() => setOpen((v) => !v)}
        aria-label={open ? 'Close assistant' : 'Open assistant'}
      >
        {open ? (
          <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
            <path d="M2 2l14 14M16 2L2 16" stroke="currentColor" strokeWidth="1.5"
              strokeLinecap="round"/>
          </svg>
        ) : (
          <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
            <path d="M17 12a2 2 0 01-2 2H5l-3 3V4a2 2 0 012-2h11a2 2 0 012 2v8z"
              stroke="currentColor" strokeWidth="1.3" strokeLinejoin="round"/>
          </svg>
        )}
      </button>

      {/* ── Chat panel ──────────────────────────────────── */}
      <div className={`${styles.panel} ${open ? styles.panelOpen : ''}`} role="dialog"
        aria-label="İlker's assistant">

        {/* Header */}
        <div className={styles.header}>
          <div className={styles.headerDot} />
          <div>
            <p className={styles.headerName}>İlker's Assistant</p>
            <p className={styles.headerSub}>Powered by Claude</p>
          </div>
        </div>

        {/* Messages */}
        <div className={styles.messages}>
          {messages.map((msg, i) => (
            <div key={i} className={`${styles.msg} ${msg.role === 'user' ? styles.msgUser : styles.msgAssistant}`}>
              {msg.content}
            </div>
          ))}
          {loading && (
            <div className={`${styles.msg} ${styles.msgAssistant} ${styles.typing}`}>
              <span /><span /><span />
            </div>
          )}
          <div ref={bottomRef} />
        </div>

        {/* Input */}
        <div className={styles.inputRow}>
          <textarea
            ref={inputRef}
            className={styles.input}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKey}
            placeholder="Ask about experience, CV…"
            rows={1}
            disabled={loading}
          />
          <button
            className={styles.sendBtn}
            onClick={send}
            disabled={loading || !input.trim()}
            aria-label="Send"
          >
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
              <path d="M1 8h14M9 2l6 6-6 6" stroke="currentColor" strokeWidth="1.4"
                strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </button>
        </div>
      </div>
    </>
  );
}
