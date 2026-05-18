'use client';
import { useState, useRef, useEffect } from 'react';
import styles from './ChatBot.module.css';

// Exact system prompt from original site
const SYSTEM_PROMPT = `Sen İlker DEGE'nin kişisel kariyer asistanısın. İlker DEGE şu anda yeni bir kariyer fırsatı arıyor ve sen onun profesyonel ilk filtresi, 7/24 çalışan asistanısın.

Kişilik ve üslup:
- Son derece profesyonel, kibar ama mesafeli ve seçici
- Asla samimi ifadeler kullanma ("abi, kardeşim, dostum" vb. tamamen yasak)
- Karşı tarafın diline otomatik geç (Türkçe, İngilizce, Almanca, Rusça)

Temel Filtreler:
- Sadece 5 yıldızlı tesisler veya dünyaca tanınmış zincir oteller kabul edilir (Accor, IHG, Radisson, MGM, Marriott, Hilton, Hyatt vb.)
- Yalnızca yönetici pozisyonları: Front Office Manager, Operations Manager, Assistant General Manager
- @gmail, @hotmail, @yahoo, @outlook gibi genel e-posta uzantıları kesinlikle kabul edilmez
- Kurumsal e-posta + LinkedIn profil linki ikisi birlikte zorunlu
- CV asistan tarafından direkt gönderilmez, İlker Bey onayladıktan sonra iletilir
- Türkiye'deki sezonluk teklifler kabul edilmez, sadece yurt dışı sezonluk olabilir

Maaş beklentileri (karşı taraf söylemeden ASLA sen açma):
Türkiye: tüm pozisyonlar → min 140.000 ₺ net
Yurt dışı USA/Canada → min 5.000 $ net + konaklama + uçak + sosyal paket zorunlu
Yurt dışı Avrupa → min 4.500 € net + konaklama + uçak + sosyal paket zorunlu

İş akışı:
1. Selam ver, pozisyon + otel adı + lokasyon sor
2. Ücret aralığını sor (net mi brüt mü belirtmelerini iste)
3. Filtreler geçilirse kısa tanıtım paylaş
4. Ücret uygunsa: "Bu pozisyonda daha önce çalışan kişinin neden ayrıldığını öğrenmek ister misiniz?" diye sor
5. Tatmin edici cevap gelirse kurumsal e-posta + LinkedIn iste
6. "Bilgileriniz alınmıştır. İlker Bey'in değerlendirmesinin ardından CV iletilecektir." de

Ücret beklentiyi karşılamıyorsa: "Teşekkür ederim ilginiz için. Maalesef belirttiğiniz bütçe İlker Bey'in mevcut kariyer seviyesiyle uyumlu görünmüyor." de.

Takip (48 saat sessizlik): "Daha önce paylaşılan bilgilere ilişkin henüz dönüş alınamadı. 48 saat içinde geri bildirim alınamazsa bu pozisyon için süreç kapatılacaktır."

ASLA yapma:
- İlk mesajda maaş beklentisi paylaşma
- İlk mesajda CV gönderme
- Kurumsal kimlik doğrulanmadan CV gönderme
- Genel e-posta uzantılarını kabul etme`;

const WELCOME = {
  en: "Good day. I am İlker DEGE's personal assistant. I am here to evaluate career opportunities on his behalf. Could you please share your property name, location, and the position you are looking to fill?",
  tr: "İyi günler. Ben İlker DEGE'nin kişisel asistanıyım. Kariyer fırsatlarını onun adına değerlendirmek için buradayım. Lütfen tesisinizin adını, lokasyonunu ve doldurmak istediğiniz pozisyonu paylaşır mısınız?",
  de: "Guten Tag. Ich bin der persönliche Assistent von Herrn İlker DEGE. Könnten Sie bitte Ihren Hotelnamen, Standort und die zu besetzende Position mitteilen?",
  ru: "Добрый день. Я личный ассистент Илькера ДЕГЕ. Не могли бы вы поделиться названием вашего отеля, местоположением и вакантной должностью?",
};

function detectLang() {
  const lang = (navigator.language || 'en').slice(0, 2).toLowerCase();
  return WELCOME[lang] ? lang : 'en';
}

export default function ChatBot() {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState(null); // null = not yet initialised
  const [history, setHistory] = useState([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [cvFormShown, setCvFormShown] = useState(false);
  const [cvEmail, setCvEmail] = useState('');
  const [cvSending, setCvSending] = useState(false);
  const [cvDone, setCvDone] = useState(false);
  const [assistantCount, setAssistantCount] = useState(0);
  const [userMsgCount, setUserMsgCount] = useState(0);
  const bottomRef = useRef(null);
  const inputRef = useRef(null);

  // Initialise welcome message once (after mount, to use navigator)
  useEffect(() => {
    const lang = detectLang();
    const welcome = WELCOME[lang];
    setMessages([{ role: 'assistant', content: welcome }]);
    setHistory([{ role: 'assistant', content: welcome }]);
    setAssistantCount(1);
  }, []);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, cvFormShown]);

  useEffect(() => {
    if (open) setTimeout(() => inputRef.current?.focus(), 120);
  }, [open]);

  const send = async () => {
    const text = input.trim();
    if (!text || loading) return;

    const userMsg = { role: 'user', content: text };
    const nextHistory = [...history, userMsg];
    const nextUserCount = userMsgCount + 1;

    setMessages((prev) => [...(prev ?? []), userMsg]);
    setHistory(nextHistory);
    setUserMsgCount(nextUserCount);
    setInput('');
    setLoading(true);

    try {
      // Anthropic requires conversation to start with a user message
      const apiMessages = nextHistory.filter((m) => m.role === 'user' || m.role === 'assistant');
      while (apiMessages.length && apiMessages[0].role !== 'user') apiMessages.shift();

      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          model: 'claude-sonnet-4-6',
          max_tokens: 1024,
          system: SYSTEM_PROMPT,
          messages: apiMessages,
        }),
      });

      const data = await res.json();

      if (!res.ok || data?.type === 'error') {
        const errMsg = data?.error?.message ?? `Error ${res.status}`;
        setMessages((prev) => [...(prev ?? []), { role: 'assistant', content: `⚠ ${errMsg}` }]);
        return;
      }

      const reply = data?.content?.[0]?.text ?? 'Sorry, no response received.';
      const newCount = assistantCount + 1;
      setAssistantCount(newCount);
      setHistory((h) => [...h, { role: 'assistant', content: reply }]);
      setMessages((prev) => [...(prev ?? []), { role: 'assistant', content: reply }]);

      // Show CV form only when ALL three conditions are met:
      // 1. AI is explicitly asking for corporate email (step 5 of workflow)
      // 2. At least 4 user messages exchanged (position → salary → why left + buffer)
      // 3. Salary was actually discussed in the conversation
      const asksForEmail = /kurumsal e.?posta|corporate e.?mail|firmen.?e.?mail|корпоративн/i.test(reply);
      const enoughDepth = nextUserCount >= 4;
      const fullConvo = [...nextHistory, { role: 'assistant', content: reply }];
      const salaryDiscussed = fullConvo.some((m) =>
        /ücret|maaş|salary|budget|bütçe|gehalt|зарплат|\$|€|₺/i.test(m.content)
      );
      if (asksForEmail && enoughDepth && salaryDiscussed && !cvFormShown && !cvDone) {
        setCvFormShown(true);
      }
    } catch (err) {
      setMessages((prev) => [
        ...(prev ?? []),
        { role: 'assistant', content: `⚠ Network error: ${err.message}` },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const FREE_DOMAINS = /^(gmail|hotmail|yahoo|outlook|icloud|live|msn|ymail|mail|protonmail|aol)\./i;
  const isCorporateEmail = (email) => {
    const domain = email.split('@')[1] ?? '';
    return domain && !FREE_DOMAINS.test(domain);
  };

  const submitCvRequest = async () => {
    if (!cvEmail || !cvEmail.includes('@') || !cvEmail.includes('.')) return;
    if (!isCorporateEmail(cvEmail)) return;
    setCvSending(true);
    try {
      await fetch('/api/cv-request', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: cvEmail,
          conversation: history.slice(-8).map((m) => `${m.role}: ${m.content}`).join('\n'),
        }),
      });
      setCvDone(true);
    } finally {
      setCvSending(false);
    }
  };

  const handleKey = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); send(); }
  };

  if (!messages) return null; // wait for hydration

  return (
    <>
      {/* ── Trigger ────────────────────────────────────────── */}
      <button
        className={`${styles.trigger} ${open ? styles.triggerOpen : ''}`}
        onClick={() => setOpen((v) => !v)}
        aria-label={open ? 'Close assistant' : 'Open assistant'}
      >
        {open ? (
          <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
            <path d="M2 2l14 14M16 2L2 16" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
          </svg>
        ) : (
          <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
            <path d="M17 12a2 2 0 01-2 2H5l-3 3V4a2 2 0 012-2h11a2 2 0 012 2v8z"
              stroke="currentColor" strokeWidth="1.3" strokeLinejoin="round"/>
          </svg>
        )}
      </button>

      {/* ── Panel ──────────────────────────────────────────── */}
      <div className={`${styles.panel} ${open ? styles.panelOpen : ''}`}
        role="dialog" aria-label="İlker's assistant">

        {/* Header */}
        <div className={styles.header}>
          <div className={styles.headerDot} />
          <div>
            <p className={styles.headerName}>İlker DEGE · Personal Assistant</p>
            <p className={styles.headerSub}>Powered by Claude · Online</p>
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

          {/* CV request form — appears after 2nd assistant reply */}
          {cvFormShown && !cvDone && (
            <div className={styles.cvBlock}>
              <p className={styles.cvLabel}>📄 Request CV</p>
              <div className={styles.cvRow}>
                <input
                  type="email"
                  className={styles.cvInput}
                  placeholder="your@hotel.com (corporate only)"
                  value={cvEmail}
                  onChange={(e) => setCvEmail(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && submitCvRequest()}
                />
                <button
                  className={styles.cvBtn}
                  onClick={submitCvRequest}
                  disabled={cvSending}
                >
                  {cvSending ? '…' : 'Send'}
                </button>
              </div>
            </div>
          )}

          {cvDone && (
            <div className={styles.cvDone}>
              ✓ Request received. İlker will review and respond shortly.
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
            placeholder="Introduce yourself and your property…"
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
