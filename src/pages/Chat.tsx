import React, { useEffect, useRef, useState, useCallback, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { chatApi, type ChatMessage } from '../services/chatApi';
import { useAppSelector } from '../store/hooks';
import * as mutations from '../services/mutations';
import { showToast } from '../utils/configs/toastConfig';

const POLL_INTERVAL_MS = 4000;
const MAX_LENGTH = 1000;

// Telegram-like avatar gradient palette — color picked deterministically from userId
const AVATAR_GRADIENTS = [
  'from-pink-500 to-rose-500',
  'from-orange-500 to-amber-500',
  'from-yellow-500 to-orange-500',
  'from-emerald-500 to-teal-500',
  'from-cyan-500 to-blue-500',
  'from-blue-500 to-indigo-500',
  'from-violet-500 to-purple-500',
  'from-fuchsia-500 to-pink-500',
];

const gradientForUserId = (id: string): string => {
  let hash = 0;
  for (let i = 0; i < id.length; i++) hash = (hash * 31 + id.charCodeAt(i)) | 0;
  return AVATAR_GRADIENTS[Math.abs(hash) % AVATAR_GRADIENTS.length];
};

const initialFromName = (name: string | null, phone: string): string => {
  if (name) {
    const parts = name.trim().split(/\s+/);
    return ((parts[0]?.[0] || '') + (parts[1]?.[0] || '')).toUpperCase();
  }
  return phone.slice(-2);
};

const formatTime = (iso: string): string => {
  try {
    return new Date(iso).toLocaleTimeString('uz-UZ', { hour: '2-digit', minute: '2-digit' });
  } catch {
    return '';
  }
};

const formatDateSeparator = (iso: string): string => {
  const d = new Date(iso);
  const now = new Date();
  const isToday = d.toDateString() === now.toDateString();
  const yesterday = new Date(now); yesterday.setDate(now.getDate() - 1);
  const isYesterday = d.toDateString() === yesterday.toDateString();
  if (isToday) return 'Bugun';
  if (isYesterday) return 'Kecha';
  return d.toLocaleDateString('uz-UZ', { day: 'numeric', month: 'long', year: 'numeric' });
};

const sameDay = (a: string, b: string): boolean => {
  return new Date(a).toDateString() === new Date(b).toDateString();
};

const PremiumBadge: React.FC<{ small?: boolean }> = ({ small }) => (
  <span className={`inline-flex items-center gap-0.5 px-1.5 ${small ? 'py-[1px]' : 'py-0.5'} rounded-md bg-gradient-to-r from-amber-400 to-yellow-300 text-black ${small ? 'text-[9px]' : 'text-[10px]'} font-black uppercase tracking-wider shadow-[0_2px_8px_rgba(251,191,36,0.4)]`}>
    <svg className={small ? 'w-2.5 h-2.5' : 'w-3 h-3'} fill="currentColor" viewBox="0 0 20 20">
      <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
    </svg>
    Pro
  </span>
);

const AdminBadge: React.FC = () => (
  <span className="inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded-md bg-orange-500/20 border border-orange-500/40 text-orange-400 text-[10px] font-black uppercase tracking-wider">
    Admin
  </span>
);

const Chat: React.FC = () => {
  const navigate = useNavigate();
  const { isAuthenticated, user } = useAppSelector((state) => state.auth);
  const myUserId: string | null = (user as any)?.id ?? null;
  const myIsAdmin = ((user as any)?.roles ?? []).includes?.('ADMIN') ?? false;

  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [text, setText] = useState('');
  const [sending, setSending] = useState(false);
  const [pendingImage, setPendingImage] = useState<File | null>(null);
  const [pendingImagePreview, setPendingImagePreview] = useState<string | null>(null);
  const [loaded, setLoaded] = useState(false);
  const lastSeenRef = useRef<string | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const textAreaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    if (!isAuthenticated) navigate('/login');
  }, [isAuthenticated, navigate]);

  const scrollToBottom = useCallback((smooth = false) => {
    requestAnimationFrame(() => {
      const el = scrollRef.current;
      if (!el) return;
      if (smooth) el.scrollTo({ top: el.scrollHeight, behavior: 'smooth' });
      else el.scrollTop = el.scrollHeight;
    });
  }, []);

  // Initial load
  useEffect(() => {
    let cancelled = false;
    chatApi.listMessages({ limit: 100 })
      .then((data) => {
        if (cancelled) return;
        const sorted = [...data].sort((a, b) => a.createdAt.localeCompare(b.createdAt));
        setMessages(sorted);
        if (sorted.length > 0) lastSeenRef.current = sorted[sorted.length - 1].createdAt;
        setLoaded(true);
        scrollToBottom();
      })
      .catch(() => { if (!cancelled) setLoaded(true); });
    return () => { cancelled = true; };
  }, [scrollToBottom]);

  // Polling for new messages
  useEffect(() => {
    if (!loaded) return;
    const tick = async () => {
      try {
        const since = lastSeenRef.current;
        if (!since) return;
        const fresh = await chatApi.listSince(since);
        if (fresh.length === 0) return;
        setMessages((prev) => {
          const known = new Set(prev.map((m) => m.id));
          const merged = [...prev];
          for (const m of fresh) if (!known.has(m.id)) merged.push(m);
          return merged;
        });
        lastSeenRef.current = fresh[fresh.length - 1].createdAt;
        const el = scrollRef.current;
        const nearBottom = el && el.scrollHeight - el.scrollTop - el.clientHeight < 250;
        if (nearBottom) scrollToBottom(true);
      } catch {
        // silent
      }
    };
    const id = setInterval(tick, POLL_INTERVAL_MS);
    return () => clearInterval(id);
  }, [loaded, scrollToBottom]);

  // Auto-resize textarea
  useEffect(() => {
    const el = textAreaRef.current;
    if (!el) return;
    el.style.height = 'auto';
    el.style.height = `${Math.min(el.scrollHeight, 140)}px`;
  }, [text]);

  // Group messages: render with avatar/name only when sender changes or > 5min gap
  const grouped = useMemo(() => {
    const result: Array<{ type: 'date'; key: string; label: string } | { type: 'msg'; msg: ChatMessage; showHeader: boolean; tail: boolean }> = [];
    let lastUserId: string | null = null;
    let lastTimestamp: string | null = null;
    for (let i = 0; i < messages.length; i++) {
      const m = messages[i];
      if (i === 0 || !sameDay(m.createdAt, messages[i - 1].createdAt)) {
        result.push({ type: 'date', key: `d-${m.id}`, label: formatDateSeparator(m.createdAt) });
        lastUserId = null;
        lastTimestamp = null;
      }
      const gapMs = lastTimestamp ? new Date(m.createdAt).getTime() - new Date(lastTimestamp).getTime() : Infinity;
      const showHeader = lastUserId !== m.userId || gapMs > 5 * 60 * 1000;
      const next = messages[i + 1];
      const tail = !next || next.userId !== m.userId || !sameDay(next.createdAt, m.createdAt);
      result.push({ type: 'msg', msg: m, showHeader, tail });
      lastUserId = m.userId;
      lastTimestamp = m.createdAt;
    }
    return result;
  }, [messages]);

  const handlePickImage = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 5 * 1024 * 1024) {
      showToast.warning('Rasm 5MB dan oshmasligi kerak');
      return;
    }
    setPendingImage(file);
    setPendingImagePreview(URL.createObjectURL(file));
  };

  const clearImage = () => {
    if (pendingImagePreview) URL.revokeObjectURL(pendingImagePreview);
    setPendingImage(null);
    setPendingImagePreview(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleSend = async () => {
    if (sending) return;
    const trimmed = text.trim();
    if (!trimmed && !pendingImage) return;
    if (trimmed.length > MAX_LENGTH) {
      showToast.warning(`Xabar ${MAX_LENGTH} belgidan oshmasligi kerak`);
      return;
    }

    setSending(true);
    try {
      let imageAssetId: string | null = null;
      if (pendingImage) {
        const presign = await mutations.presignUpload({
          assetType: 'IMAGE',
          mimeType: pendingImage.type,
          contextType: 'chat',
          filename: pendingImage.name,
          fileSizeBytes: pendingImage.size,
        });
        await mutations.uploadToS3({
          uploadUrl: presign.uploadUrl,
          file: pendingImage,
          headers: presign.headers,
        });
        imageAssetId = presign.assetId;
      }

      const newMsg = await chatApi.sendMessage({ content: trimmed, imageAssetId });
      setMessages((prev) => [...prev, newMsg]);
      lastSeenRef.current = newMsg.createdAt;
      setText('');
      clearImage();
      scrollToBottom(true);
    } catch (err: any) {
      const msg = err?.response?.data?.message || err?.message || 'Xabarni yuborib bo\'lmadi';
      showToast.error(msg);
    } finally {
      setSending(false);
    }
  };

  const handleDelete = async (messageId: string) => {
    if (!confirm('Xabarni o\'chirishni xohlaysizmi?')) return;
    try {
      await chatApi.deleteMessage(messageId);
      setMessages((prev) => prev.filter((m) => m.id !== messageId));
    } catch {
      showToast.error('O\'chirib bo\'lmadi');
    }
  };

  const handleMute = async (userId: string, name: string | null) => {
    const minutesStr = prompt(`${name || 'Foydalanuvchi'}'ni necha daqiqaga mute qilamiz? (bo'sh = doimiy)`);
    if (minutesStr === null) return;
    const minutes = minutesStr.trim() === '' ? null : Number(minutesStr);
    if (minutes !== null && (!Number.isFinite(minutes) || minutes <= 0)) {
      showToast.warning('Noto\'g\'ri qiymat');
      return;
    }
    const reason = prompt('Sabab? (ixtiyoriy)') ?? '';
    try {
      await chatApi.muteUser(userId, { durationMinutes: minutes, reason: reason || null });
      showToast.success('Mute qilindi');
    } catch {
      showToast.error('Mute qilib bo\'lmadi');
    }
  };

  return (
    <div className="relative min-h-screen bg-[#0a0d12] py-20 sm:py-24 px-2 sm:px-4 md:px-12">
      {/* Telegram-style background — subtle pattern + gradient */}
      <div className="absolute inset-0 bg-gradient-to-br from-[#0e1218] via-[#0a0d12] to-[#0e0a18] pointer-events-none" />
      <div className="absolute inset-0 opacity-[0.05] pointer-events-none"
        style={{ backgroundImage: 'radial-gradient(circle at 20% 30%, rgba(255,140,0,0.6), transparent 40%), radial-gradient(circle at 80% 70%, rgba(99,102,241,0.6), transparent 40%)' }} />

      <div className="relative z-10 max-w-3xl mx-auto">
        {/* Header */}
        <div className="rounded-t-2xl bg-gradient-to-b from-[#1a1f28] to-[#151920] border border-white/[0.08] border-b-0 px-4 sm:px-5 py-3 flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-orange-500 to-amber-500 flex items-center justify-center text-white font-black text-sm shadow-lg">
            ML
          </div>
          <div className="flex-1 min-w-0">
            <div className="text-white font-bold text-sm sm:text-base truncate">Umumiy chat</div>
            <div className="text-emerald-400 text-[11px] flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
              online
            </div>
          </div>
        </div>

        {/* Messages container */}
        <div
          ref={scrollRef}
          className="bg-[#0e1218] border border-white/[0.08] border-y-0 overflow-y-auto px-3 sm:px-5 py-4"
          style={{ height: 'calc(100vh - 280px)', minHeight: '480px' }}
        >
          {!loaded && (
            <div className="flex items-center justify-center h-full">
              <div className="w-8 h-8 border-2 border-orange-500/30 border-t-orange-500 rounded-full animate-spin" />
            </div>
          )}
          {loaded && messages.length === 0 && (
            <div className="flex flex-col items-center justify-center h-full text-center text-white/40">
              <svg className="w-16 h-16 mb-4 opacity-30" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
              </svg>
              <div className="text-sm">Hali xabarlar yo'q</div>
              <div className="text-xs opacity-70 mt-1">Birinchi bo'lib yozing!</div>
            </div>
          )}

          <div className="space-y-1">
            {grouped.map((item) => {
              if (item.type === 'date') {
                return (
                  <div key={item.key} className="flex justify-center my-4">
                    <div className="bg-white/[0.06] backdrop-blur-sm text-white/60 text-[11px] font-semibold px-3 py-1 rounded-full border border-white/[0.08]">
                      {item.label}
                    </div>
                  </div>
                );
              }
              const m = item.msg;
              const isMine = m.userId === myUserId;
              const initials = initialFromName(m.userName, m.userPhone);
              const gradient = gradientForUserId(m.userId);
              const showName = item.showHeader && !isMine;

              return (
                <div key={m.id} className={`flex gap-2 group ${isMine ? 'justify-end' : 'justify-start'} ${item.tail ? 'mb-2' : 'mb-0.5'}`}>
                  {/* Left avatar (others) */}
                  {!isMine && (
                    <div className="w-9 flex-shrink-0">
                      {item.tail && (
                        <div className={`w-9 h-9 rounded-full bg-gradient-to-br ${gradient} flex items-center justify-center text-white font-bold text-xs shadow-md`}>
                          {initials}
                        </div>
                      )}
                    </div>
                  )}

                  <div className={`flex flex-col ${isMine ? 'items-end' : 'items-start'} max-w-[78%] sm:max-w-[70%]`}>
                    {/* Header (name + badges) for non-mine messages */}
                    {showName && (
                      <div className="flex items-center gap-1.5 mb-0.5 px-1">
                        <span className="text-orange-300 text-xs font-bold">
                          {m.userName || `+${m.userPhone}`}
                        </span>
                        {m.isAdmin && <AdminBadge />}
                        {m.isPremium && !m.isAdmin && <PremiumBadge small />}
                      </div>
                    )}

                    {/* Bubble */}
                    <div
                      className={`relative px-3 py-2 text-sm leading-snug max-w-full
                        ${isMine
                          ? `bg-gradient-to-br from-orange-500 to-amber-500 text-white shadow-[0_2px_8px_rgba(255,140,0,0.25)] ${item.tail ? 'rounded-2xl rounded-br-sm' : 'rounded-2xl rounded-br-2xl'}`
                          : `bg-[#1a1f28] text-white border border-white/[0.06] ${item.tail ? 'rounded-2xl rounded-bl-sm' : 'rounded-2xl rounded-bl-2xl'}`
                        }
                      `}
                    >
                      {m.imageUrl && (
                        <a href={m.imageUrl} target="_blank" rel="noreferrer" className="block mb-1 -mx-1 -mt-1">
                          <img
                            src={m.imageUrl}
                            alt="attachment"
                            className="max-w-full max-h-80 rounded-xl"
                          />
                        </a>
                      )}
                      {m.content && (
                        <div className={`whitespace-pre-wrap break-words ${isMine ? 'text-white' : 'text-white/95'}`}>
                          {m.content}
                        </div>
                      )}
                      <div className={`text-[10px] mt-1 flex items-center gap-1 ${isMine ? 'text-white/70 justify-end' : 'text-white/40 justify-end'}`}>
                        {/* Premium star inline next to time for own premium messages */}
                        {isMine && m.isPremium && (
                          <svg className="w-3 h-3 text-amber-200" fill="currentColor" viewBox="0 0 20 20">
                            <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                          </svg>
                        )}
                        <span>{formatTime(m.createdAt)}</span>
                      </div>
                    </div>

                    {/* Admin actions for other people's messages */}
                    {myIsAdmin && !isMine && (
                      <div className="flex gap-2 mt-1 px-1 opacity-0 group-hover:opacity-100 transition">
                        <button onClick={() => handleDelete(m.id)} className="text-red-400 text-[11px] hover:text-red-300">
                          o'chirish
                        </button>
                        <button onClick={() => handleMute(m.userId, m.userName)} className="text-amber-400 text-[11px] hover:text-amber-300">
                          mute
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Input area */}
        <div className="rounded-b-2xl bg-gradient-to-t from-[#1a1f28] to-[#151920] border border-white/[0.08] border-t-0 p-2 sm:p-3">
          {pendingImagePreview && (
            <div className="mb-2 flex items-center gap-3 bg-white/[0.04] rounded-xl p-2">
              <img src={pendingImagePreview} alt="preview" className="w-12 h-12 rounded-lg object-cover" />
              <span className="text-white/70 text-xs flex-1 truncate">{pendingImage?.name}</span>
              <button onClick={clearImage} className="text-white/50 hover:text-white p-1">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
              </button>
            </div>
          )}

          <div className="flex items-end gap-2">
            <input ref={fileInputRef} type="file" accept="image/*" onChange={handlePickImage} className="hidden" />
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              disabled={sending}
              className="w-10 h-10 rounded-full text-white/60 hover:text-white hover:bg-white/[0.08] flex items-center justify-center transition disabled:opacity-50"
              title="Rasm qo'shish"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13" />
              </svg>
            </button>

            <textarea
              ref={textAreaRef}
              value={text}
              onChange={(e) => setText(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault();
                  handleSend();
                }
              }}
              placeholder="Xabar yozing..."
              rows={1}
              maxLength={MAX_LENGTH}
              className="flex-1 resize-none bg-[#0e1218] border border-white/[0.08] rounded-2xl px-4 py-2.5 text-white placeholder-white/40 text-sm focus:outline-none focus:border-orange-500/40 max-h-[140px]"
            />

            <button
              type="button"
              onClick={handleSend}
              disabled={sending || (!text.trim() && !pendingImage)}
              className="w-10 h-10 rounded-full bg-gradient-to-br from-orange-500 to-amber-500 flex items-center justify-center text-white shadow-[0_4px_15px_rgba(255,140,0,0.35)] disabled:opacity-30 disabled:cursor-not-allowed hover:scale-105 transition active:scale-95"
              title="Yuborish"
            >
              {sending ? (
                <div className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" />
              ) : (
                <svg className="w-5 h-5 -translate-x-px" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M10.894 2.553a1 1 0 00-1.788 0l-7 14a1 1 0 001.169 1.409l5-1.429A1 1 0 009 15.571V11a1 1 0 112 0v4.571a1 1 0 00.725.962l5 1.428a1 1 0 001.17-1.408l-7-14z" />
                </svg>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Chat;
