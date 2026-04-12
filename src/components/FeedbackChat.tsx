import React, { useState, useRef, useEffect } from 'react';
import { useAppSelector } from '../store/hooks';

const LABEL_TEXTS = [
  "Sayt haqida fikr bildiring",
  "Kamchiliklarimizni aytsangiz hursand bo'lamiz",
  "Takliflaringizni kutamiz 💬",
];

const TypewriterLabel: React.FC<{ visible: boolean }> = ({ visible }) => {
  const [textIndex, setTextIndex] = useState(0);
  const [displayed, setDisplayed] = useState('');
  const [phase, setPhase] = useState<'typing' | 'pause' | 'erasing'>('typing');
  const frameRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (!visible) return;
    const full = LABEL_TEXTS[textIndex];

    if (phase === 'typing') {
      if (displayed.length < full.length) {
        frameRef.current = setTimeout(() => setDisplayed(full.slice(0, displayed.length + 1)), 45);
      } else {
        frameRef.current = setTimeout(() => setPhase('pause'), 2200);
      }
    } else if (phase === 'pause') {
      frameRef.current = setTimeout(() => setPhase('erasing'), 0);
    } else {
      if (displayed.length > 0) {
        frameRef.current = setTimeout(() => setDisplayed(displayed.slice(0, -1)), 22);
      } else {
        setTextIndex((i) => (i + 1) % LABEL_TEXTS.length);
        setPhase('typing');
      }
    }
    return () => { if (frameRef.current) clearTimeout(frameRef.current); };
  }, [visible, displayed, phase, textIndex]);

  useEffect(() => {
    if (visible) { setDisplayed(''); setPhase('typing'); }
  }, [visible]);

  if (!visible) return null;

  return (
    <div style={{
      position: 'fixed', bottom: 31, left: 86, zIndex: 89,
      display: 'flex', alignItems: 'center', gap: 0,
      pointerEvents: 'none',
    }}>
      {/* Arrow pointing left */}
      <div style={{
        width: 0, height: 0,
        borderTop: '6px solid transparent',
        borderBottom: '6px solid transparent',
        borderRight: '7px solid rgba(255,255,255,0.13)',
        filter: 'drop-shadow(0 1px 0 rgba(255,255,255,0.06))',
      }} />
      <div style={{
        background: 'rgba(255,255,255,0.09)',
        backdropFilter: 'blur(24px)',
        WebkitBackdropFilter: 'blur(24px)',
        border: '1px solid rgba(255,255,255,0.16)',
        borderLeft: 'none',
        borderRadius: '0 14px 14px 0',
        padding: '8px 14px',
        minWidth: 160,
        maxWidth: 'calc(100vw - 100px)',
        boxShadow: '0 4px 24px rgba(0,0,0,0.3), 0 1px 0 rgba(255,255,255,0.10) inset',
      }}>
        <span style={{
          fontSize: 12.5,
          color: 'rgba(255,255,255,0.82)',
          fontWeight: 500,
          letterSpacing: '-0.01em',
          lineHeight: 1.4,
          whiteSpace: 'nowrap',
        }}>
          {displayed}
          <span style={{
            display: 'inline-block', width: 1.5, height: '0.85em',
            background: 'rgba(255,115,0,0.85)',
            marginLeft: 2, verticalAlign: 'middle',
            animation: 'fc-blink 0.9s step-end infinite',
          }} />
        </span>
      </div>
      <style>{`@keyframes fc-blink { 0%,100%{opacity:1} 50%{opacity:0} }`}</style>
    </div>
  );
};

const TELEGRAM_CHAT_ID = '1771950253';
const BOT_TOKEN = (import.meta.env.VITE_TELEGRAM_BOT_TOKEN as string) || '';

interface Message {
  id: number;
  text: string;
  from: 'user' | 'bot';
  time: string;
}

const now = () => new Date().toLocaleTimeString('uz-UZ', { hour: '2-digit', minute: '2-digit' });

const sendToTelegram = async (text: string): Promise<void> => {
  const res = await fetch(`https://api.telegram.org/bot${BOT_TOKEN}/sendMessage`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      chat_id: TELEGRAM_CHAT_ID,
      text,
      parse_mode: 'HTML',
    }),
  });
  if (!res.ok) throw new Error('Telegram error');
};

const FeedbackChat: React.FC = () => {
  const { user, isAuthenticated } = useAppSelector((s) => s.auth);
  const [open, setOpen] = useState(false);
  const [input, setInput] = useState('');
  const [sending, setSending] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    {
      id: 0,
      from: 'bot',
      text: 'Salom! 👋 Bizga fikr-mulohaza yoki savollaringizni yuboring.',
      time: now(),
    },
  ]);
  const bottomRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (open) {
      bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
      setTimeout(() => inputRef.current?.focus(), 100);
    }
  }, [open, messages]);

  const handleSend = async () => {
    const text = input.trim();
    if (!text || sending) return;

    const userMsg: Message = { id: Date.now(), from: 'user', text, time: now() };
    setMessages((prev) => [...prev, userMsg]);
    setInput('');
    setSending(true);

    const userInfo = isAuthenticated && user
      ? `👤 <b>${user.firstName ? `${user.firstName} ${user.lastName ?? ''}`.trim() : 'Noma\'lum'}</b>\n📞 ${user.phone}`
      : '👤 <b>Mehmон</b>';

    const telegramText = `💬 <b>Feedback — ManageLC</b>\n\n${userInfo}\n\n📝 ${text}`;

    try {
      await sendToTelegram(telegramText);
      setMessages((prev) => [
        ...prev,
        {
          id: Date.now() + 1,
          from: 'bot',
          text: "Xabaringiz qabul qilindi! Ko'rib chiqamiz va tez orada javob beramiz. 🙏",
          time: now(),
        },
      ]);
    } catch {
      setMessages((prev) => [
        ...prev,
        {
          id: Date.now() + 1,
          from: 'bot',
          text: "Xabar yuborishda xatolik yuz berdi. Qaytadan urinib ko'ring.",
          time: now(),
        },
      ]);
    } finally {
      setSending(false);
    }
  };

  return (
    <>
      {/* Chat window */}
      {open && (
        <div
          className="fixed bottom-24 left-5 sm:left-6 z-[90] w-[340px] sm:w-[370px] flex flex-col"
          style={{
            maxHeight: '520px',
            borderRadius: '24px',
            overflow: 'hidden',
            background: 'rgba(255,255,255,0.07)',
            backdropFilter: 'blur(40px) saturate(180%)',
            WebkitBackdropFilter: 'blur(40px) saturate(180%)',
            border: '1px solid rgba(255,255,255,0.18)',
            boxShadow: '0 8px 32px rgba(0,0,0,0.45), 0 1.5px 0 rgba(255,255,255,0.12) inset, 0 -1px 0 rgba(0,0,0,0.2) inset',
          }}>

          {/* Specular highlight top edge */}
          <div style={{
            position: 'absolute', top: 0, left: 0, right: 0, height: '1px',
            background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.35), transparent)',
            pointerEvents: 'none', zIndex: 1,
          }} />

          {/* Header */}
          <div style={{
            display: 'flex', alignItems: 'center', gap: '12px',
            padding: '14px 16px',
            background: 'rgba(255,255,255,0.06)',
            borderBottom: '1px solid rgba(255,255,255,0.10)',
            backdropFilter: 'blur(20px)',
            WebkitBackdropFilter: 'blur(20px)',
          }}>
            <div style={{
              width: 36, height: 36, borderRadius: 14, flexShrink: 0,
              background: 'linear-gradient(135deg, #ff7300, #f59e0b)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              boxShadow: '0 4px 16px rgba(255,115,0,0.45), 0 1px 0 rgba(255,255,255,0.25) inset',
            }}>
              <svg width="16" height="16" fill="none" stroke="white" strokeWidth="2" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
              </svg>
            </div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <p style={{ color: 'rgba(255,255,255,0.95)', fontSize: 13, fontWeight: 700, lineHeight: 1, letterSpacing: '-0.01em' }}>
                ManageLC Support
              </p>
              <p style={{ display: 'flex', alignItems: 'center', gap: 5, color: 'rgba(255,255,255,0.4)', fontSize: 11, marginTop: 4 }}>
                <span style={{ width: 6, height: 6, borderRadius: '50%', background: '#4ade80', display: 'inline-block', boxShadow: '0 0 6px #4ade80' }} />
                Online
              </p>
            </div>
            <button
              onClick={() => setOpen(false)}
              style={{
                width: 28, height: 28, borderRadius: 10, border: '1px solid rgba(255,255,255,0.12)',
                background: 'rgba(255,255,255,0.07)', display: 'flex', alignItems: 'center', justifyContent: 'center',
                cursor: 'pointer', transition: 'all 0.2s',
              }}
              onMouseEnter={e => (e.currentTarget.style.background = 'rgba(255,255,255,0.14)')}
              onMouseLeave={e => (e.currentTarget.style.background = 'rgba(255,255,255,0.07)')}>
              <svg width="13" height="13" fill="none" stroke="rgba(255,255,255,0.6)" strokeWidth="2" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          {/* Messages */}
          <div
            className="overflow-y-auto"
            style={{
              flex: 1, padding: '16px', display: 'flex', flexDirection: 'column', gap: '10px',
              minHeight: '260px', maxHeight: '330px',
              background: 'rgba(0,0,0,0.15)',
            }}>
            {messages.map((msg) => (
              <div key={msg.id} style={{ display: 'flex', justifyContent: msg.from === 'user' ? 'flex-end' : 'flex-start' }}>
                <div style={{
                  maxWidth: '78%',
                  padding: '10px 14px',
                  borderRadius: msg.from === 'user' ? '18px 18px 4px 18px' : '18px 18px 18px 4px',
                  fontSize: 13,
                  lineHeight: 1.55,
                  ...(msg.from === 'user' ? {
                    background: 'linear-gradient(135deg, rgba(255,115,0,0.9), rgba(245,158,11,0.85))',
                    color: 'white',
                    border: '1px solid rgba(255,140,0,0.4)',
                    boxShadow: '0 4px 16px rgba(255,115,0,0.25), 0 1px 0 rgba(255,255,255,0.15) inset',
                    backdropFilter: 'blur(10px)',
                  } : {
                    background: 'rgba(255,255,255,0.10)',
                    color: 'rgba(255,255,255,0.88)',
                    border: '1px solid rgba(255,255,255,0.14)',
                    boxShadow: '0 2px 12px rgba(0,0,0,0.2), 0 1px 0 rgba(255,255,255,0.08) inset',
                    backdropFilter: 'blur(16px)',
                  }),
                }}>
                  <p style={{ margin: 0 }}>{msg.text}</p>
                  <p style={{
                    fontSize: 10, marginTop: 4, margin: '4px 0 0',
                    color: msg.from === 'user' ? 'rgba(255,255,255,0.55)' : 'rgba(255,255,255,0.28)',
                    textAlign: msg.from === 'user' ? 'right' : 'left',
                  }}>
                    {msg.time}
                  </p>
                </div>
              </div>
            ))}
            {sending && (
              <div style={{ display: 'flex', justifyContent: 'flex-start' }}>
                <div style={{
                  background: 'rgba(255,255,255,0.10)',
                  border: '1px solid rgba(255,255,255,0.14)',
                  borderRadius: '18px 18px 18px 4px',
                  padding: '12px 16px',
                  display: 'flex', alignItems: 'center', gap: 6,
                  backdropFilter: 'blur(16px)',
                }}>
                  {[0, 150, 300].map((d) => (
                    <span key={d} className="animate-bounce" style={{
                      width: 6, height: 6, borderRadius: '50%',
                      background: 'rgba(255,255,255,0.45)',
                      display: 'inline-block',
                      animationDelay: `${d}ms`,
                    }} />
                  ))}
                </div>
              </div>
            )}
            <div ref={bottomRef} />
          </div>

          {/* Input */}
          <div style={{
            display: 'flex', alignItems: 'center', gap: 8,
            padding: '12px',
            background: 'rgba(255,255,255,0.05)',
            borderTop: '1px solid rgba(255,255,255,0.10)',
            backdropFilter: 'blur(20px)',
            WebkitBackdropFilter: 'blur(20px)',
          }}>
            <input
              ref={inputRef}
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSend()}
              placeholder="Xabar yozing..."
              style={{
                flex: 1,
                background: 'rgba(255,255,255,0.08)',
                border: '1px solid rgba(255,255,255,0.14)',
                borderRadius: 14,
                padding: '10px 14px',
                fontSize: 13,
                color: 'rgba(255,255,255,0.9)',
                outline: 'none',
                backdropFilter: 'blur(10px)',
                transition: 'border-color 0.2s, box-shadow 0.2s',
              }}
              onFocus={e => {
                e.target.style.borderColor = 'rgba(255,115,0,0.45)';
                e.target.style.boxShadow = '0 0 0 3px rgba(255,115,0,0.12)';
              }}
              onBlur={e => {
                e.target.style.borderColor = 'rgba(255,255,255,0.14)';
                e.target.style.boxShadow = 'none';
              }}
            />
            <button
              onClick={handleSend}
              disabled={!input.trim() || sending}
              style={{
                width: 40, height: 40, borderRadius: 13, flexShrink: 0,
                background: input.trim() && !sending
                  ? 'linear-gradient(135deg, #ff7300, #f59e0b)'
                  : 'rgba(255,255,255,0.08)',
                border: '1px solid rgba(255,255,255,0.14)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                cursor: input.trim() && !sending ? 'pointer' : 'default',
                opacity: !input.trim() || sending ? 0.35 : 1,
                transition: 'all 0.2s',
                boxShadow: input.trim() && !sending
                  ? '0 4px 14px rgba(255,115,0,0.35), 0 1px 0 rgba(255,255,255,0.2) inset'
                  : 'none',
              }}>
              <svg width="15" height="15" fill="none" stroke="white" strokeWidth="2" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
              </svg>
            </button>
          </div>
        </div>
      )}

      <TypewriterLabel visible={!open} />

      {/* Floating button */}
      <button
        onClick={() => setOpen((v) => !v)}
        style={{
          position: 'fixed', bottom: 24, left: 20, zIndex: 90,
          width: 56, height: 56, borderRadius: 18,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          cursor: 'pointer',
          transition: 'transform 0.3s cubic-bezier(0.34,1.56,0.64,1), box-shadow 0.3s ease',
          background: open
            ? 'rgba(255,255,255,0.08)'
            : 'rgba(255,255,255,0.11)',
          backdropFilter: 'blur(32px) saturate(200%)',
          WebkitBackdropFilter: 'blur(32px) saturate(200%)',
          border: open
            ? '1px solid rgba(255,255,255,0.18)'
            : '1px solid rgba(255,255,255,0.22)',
          boxShadow: open
            ? '0 4px 20px rgba(0,0,0,0.35), 0 1px 0 rgba(255,255,255,0.12) inset'
            : '0 8px 32px rgba(0,0,0,0.4), 0 1.5px 0 rgba(255,255,255,0.22) inset, 0 -1px 0 rgba(0,0,0,0.15) inset',
          overflow: 'hidden',
        }}
        onMouseEnter={e => { e.currentTarget.style.transform = 'scale(1.09)'; e.currentTarget.style.boxShadow = '0 12px 40px rgba(0,0,0,0.45), 0 1.5px 0 rgba(255,255,255,0.28) inset'; }}
        onMouseLeave={e => { e.currentTarget.style.transform = 'scale(1)'; e.currentTarget.style.boxShadow = open ? '0 4px 20px rgba(0,0,0,0.35), 0 1px 0 rgba(255,255,255,0.12) inset' : '0 8px 32px rgba(0,0,0,0.4), 0 1.5px 0 rgba(255,255,255,0.22) inset, 0 -1px 0 rgba(0,0,0,0.15) inset'; }}>

        {/* Top specular shine */}
        <div style={{
          position: 'absolute', top: 0, left: 0, right: 0, height: '55%',
          background: 'linear-gradient(180deg, rgba(255,255,255,0.22) 0%, rgba(255,255,255,0.04) 100%)',
          borderRadius: '18px 18px 0 0',
          pointerEvents: 'none',
        }} />

        {/* Side rim light */}
        <div style={{
          position: 'absolute', inset: 0,
          background: 'radial-gradient(ellipse at 20% 30%, rgba(255,255,255,0.14) 0%, transparent 65%)',
          pointerEvents: 'none',
        }} />

        {/* Orange glow dot when closed */}
        {!open && (
          <div style={{
            position: 'absolute', bottom: 10, right: 10,
            width: 7, height: 7, borderRadius: '50%',
            background: 'rgba(255,115,0,0.9)',
            boxShadow: '0 0 8px rgba(255,115,0,0.8)',
          }} />
        )}

        {open ? (
          <svg width="18" height="18" fill="none" stroke="rgba(255,255,255,0.8)" strokeWidth="2.5" viewBox="0 0 24 24" style={{ position: 'relative', zIndex: 1 }}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
          </svg>
        ) : (
          <svg width="22" height="22" fill="none" stroke="rgba(255,255,255,0.92)" strokeWidth="1.8" viewBox="0 0 24 24" style={{ position: 'relative', zIndex: 1 }}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
          </svg>
        )}
      </button>
    </>
  );
};

export default FeedbackChat;
