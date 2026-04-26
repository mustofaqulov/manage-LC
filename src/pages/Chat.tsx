import React, { useEffect, useRef, useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { chatApi, type ChatMessage } from '../services/chatApi';
import { useAppSelector } from '../store/hooks';
import * as mutations from '../services/mutations';
import { showToast } from '../utils/configs/toastConfig';

const POLL_INTERVAL_MS = 4000;
const MAX_LENGTH = 1000;

const formatTime = (iso: string): string => {
  try {
    const d = new Date(iso);
    const now = new Date();
    const sameDay = d.toDateString() === now.toDateString();
    if (sameDay) {
      return d.toLocaleTimeString('uz-UZ', { hour: '2-digit', minute: '2-digit' });
    }
    return d.toLocaleString('uz-UZ', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' });
  } catch {
    return iso;
  }
};

const initialFromName = (name: string | null, phone: string): string => {
  if (name) {
    const parts = name.trim().split(/\s+/);
    return (parts[0]?.[0] || '') + (parts[1]?.[0] || '');
  }
  return phone.slice(-2);
};

const Chat: React.FC = () => {
  const navigate = useNavigate();
  const { isAuthenticated, user } = useAppSelector((state) => state.auth);
  const isAdmin = (user as any)?.roles?.includes?.('ADMIN') ?? false;
  const myUserId = (user as any)?.id ?? null;

  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [text, setText] = useState('');
  const [sending, setSending] = useState(false);
  const [pendingImage, setPendingImage] = useState<File | null>(null);
  const [pendingImagePreview, setPendingImagePreview] = useState<string | null>(null);
  const [loaded, setLoaded] = useState(false);
  const lastSeenRef = useRef<string | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/login');
    }
  }, [isAuthenticated, navigate]);

  const scrollToBottom = useCallback(() => {
    requestAnimationFrame(() => {
      const el = scrollRef.current;
      if (el) el.scrollTop = el.scrollHeight;
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

  // Poll for new messages
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
        const nearBottom = el && el.scrollHeight - el.scrollTop - el.clientHeight < 200;
        if (nearBottom) scrollToBottom();
      } catch {
        // silent
      }
    };
    const id = setInterval(tick, POLL_INTERVAL_MS);
    return () => clearInterval(id);
  }, [loaded, scrollToBottom]);

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
      scrollToBottom();
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
    <div className="relative min-h-screen bg-[#050505] py-20 sm:py-24 px-4 sm:px-6 md:px-12">
      <div className="absolute inset-0 bg-gradient-to-br from-[#0a0a0a] via-[#0e0a18] to-black pointer-events-none" />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,rgba(99,102,241,0.18),transparent_55%)] pointer-events-none" />

      <div className="relative z-10 max-w-4xl mx-auto">
        <div className="mb-6 flex items-center justify-between">
          <div>
            <h1 className="text-2xl sm:text-3xl font-black bg-gradient-to-r from-orange-400 to-amber-300 bg-clip-text text-transparent">
              Umumiy chat
            </h1>
            <p className="text-white/40 text-xs sm:text-sm mt-1">Hamma birga muhokama qiladigan joy</p>
          </div>
        </div>

        <div className="rounded-2xl border border-white/10 bg-white/[0.03] backdrop-blur-xl shadow-[0_15px_50px_rgba(0,0,0,0.6)] flex flex-col h-[calc(100vh-220px)] min-h-[500px]">
          <div ref={scrollRef} className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-3">
            {!loaded && (
              <div className="flex items-center justify-center h-full">
                <div className="w-8 h-8 border-2 border-orange-500/30 border-t-orange-500 rounded-full animate-spin" />
              </div>
            )}
            {loaded && messages.length === 0 && (
              <div className="text-center text-white/40 text-sm py-10">Hali xabarlar yo'q. Birinchi bo'ling!</div>
            )}
            {messages.map((m) => {
              const isMine = m.userId === myUserId;
              const initials = initialFromName(m.userName, m.userPhone);
              return (
                <div key={m.id} className={`flex gap-3 ${isMine ? 'flex-row-reverse' : ''}`}>
                  <div className={`w-9 h-9 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0 ${isMine ? 'bg-orange-500/20 text-orange-300' : 'bg-white/10 text-white/70'}`}>
                    {initials.toUpperCase()}
                  </div>
                  <div className={`max-w-[75%] ${isMine ? 'items-end' : 'items-start'} flex flex-col gap-1 group`}>
                    <div className={`text-[11px] text-white/40 px-1 flex items-center gap-2 ${isMine ? 'flex-row-reverse' : ''}`}>
                      <span>{m.userName || `+${m.userPhone}`}</span>
                      <span>•</span>
                      <span>{formatTime(m.createdAt)}</span>
                      {isAdmin && !isMine && (
                        <>
                          <button
                            type="button"
                            onClick={() => handleDelete(m.id)}
                            className="opacity-0 group-hover:opacity-100 text-red-400 hover:text-red-300 transition"
                          >
                            o'chirish
                          </button>
                          <button
                            type="button"
                            onClick={() => handleMute(m.userId, m.userName)}
                            className="opacity-0 group-hover:opacity-100 text-amber-400 hover:text-amber-300 transition"
                          >
                            mute
                          </button>
                        </>
                      )}
                    </div>
                    <div className={`px-4 py-2.5 rounded-2xl text-sm leading-relaxed ${isMine ? 'bg-gradient-to-br from-orange-500 to-amber-500 text-white rounded-tr-sm' : 'bg-white/[0.06] text-white border border-white/10 rounded-tl-sm'}`}>
                      {m.content && <div className="whitespace-pre-wrap break-words">{m.content}</div>}
                      {m.imageUrl && (
                        <a href={m.imageUrl} target="_blank" rel="noreferrer" className="block mt-2">
                          <img src={m.imageUrl} alt="attachment" className="max-w-full max-h-72 rounded-lg" />
                        </a>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {pendingImagePreview && (
            <div className="px-4 sm:px-6 py-2 border-t border-white/[0.06] flex items-center gap-3">
              <img src={pendingImagePreview} alt="preview" className="w-12 h-12 rounded-lg object-cover border border-white/10" />
              <span className="text-white/70 text-xs flex-1 truncate">{pendingImage?.name}</span>
              <button onClick={clearImage} className="text-white/50 hover:text-white text-xs">olib tashlash</button>
            </div>
          )}

          <div className="border-t border-white/[0.06] p-3 sm:p-4 flex items-end gap-2">
            <input ref={fileInputRef} type="file" accept="image/*" onChange={handlePickImage} className="hidden" />
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              disabled={sending}
              className="w-10 h-10 rounded-xl bg-white/[0.05] hover:bg-white/[0.1] border border-white/10 flex items-center justify-center text-white/60 hover:text-white transition disabled:opacity-50"
              title="Rasm qo'shish"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
            </button>
            <textarea
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
              className="flex-1 resize-none bg-white/[0.04] border border-white/10 rounded-xl px-4 py-2.5 text-white placeholder-white/40 text-sm focus:outline-none focus:border-orange-500/50 max-h-32"
            />
            <button
              type="button"
              onClick={handleSend}
              disabled={sending || (!text.trim() && !pendingImage)}
              className="px-5 h-10 rounded-xl bg-gradient-to-r from-orange-500 to-amber-500 text-white text-sm font-bold disabled:opacity-40 disabled:cursor-not-allowed hover:shadow-[0_8px_25px_rgba(255,140,0,0.35)] transition"
            >
              {sending ? '...' : 'Yuborish'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Chat;
