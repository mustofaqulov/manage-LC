import React, { useEffect, useRef, useState } from 'react';
import { getMyAvatar, uploadAvatar, deleteMyAvatar } from '../services/avatarService';
import { showToast } from '../utils/configs/toastConfig';

interface AvatarUploadProps {
  size?: number; // px, default 36
  className?: string;
}

const ACCEPTED = 'image/jpeg,image/png,image/webp';

const AvatarUpload: React.FC<AvatarUploadProps> = ({ size = 36, className = '' }) => {
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    getMyAvatar().then(setAvatarUrl).catch(() => {});
  }, []);

  // Close menu on outside click
  useEffect(() => {
    if (!menuOpen) return;
    const handler = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [menuOpen]);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    e.target.value = '';
    setMenuOpen(false);

    if (!['image/jpeg', 'image/png', 'image/webp'].includes(file.type)) {
      showToast.error('Faqat JPEG, PNG yoki WebP rasm yuklang');
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      showToast.error('Rasm hajmi 5MB dan oshmasligi kerak');
      return;
    }

    setUploading(true);
    try {
      const newUrl = await uploadAvatar(file);
      setAvatarUrl(newUrl);
      showToast.success("Profil rasm yangilandi");
    } catch (err: any) {
      showToast.error(err?.message || "Rasm yuklab bo'lmadi");
    } finally {
      setUploading(false);
    }
  };

  const handleDelete = async () => {
    setMenuOpen(false);
    setUploading(true);
    try {
      await deleteMyAvatar();
      setAvatarUrl(null);
      showToast.success("Profil rasm o'chirildi");
    } catch {
      showToast.error("O'chirib bo'lmadi");
    } finally {
      setUploading(false);
    }
  };

  const s = size;

  return (
    <div className={`relative flex-shrink-0 flex ${className}`} ref={menuRef}>
      <input
        ref={inputRef}
        type="file"
        accept={ACCEPTED}
        className="hidden"
        onChange={handleFileChange}
      />

      {/* Avatar button */}
      <button
        type="button"
        onClick={(e) => { e.preventDefault(); e.stopPropagation(); setMenuOpen((v) => !v); }}
        disabled={uploading}
        style={{ width: s, height: s }}
        className="rounded-xl overflow-hidden border border-white/15 hover:border-orange-400/50 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-orange-400/40 relative bg-white/5"
        aria-label="Profil rasm">
        {uploading ? (
          <div className="w-full h-full flex items-center justify-center bg-white/5">
            <span
              className="border-2 border-white/20 border-t-orange-400 rounded-full animate-spin"
              style={{ width: s * 0.45, height: s * 0.45 }}
            />
          </div>
        ) : avatarUrl ? (
          <img
            src={avatarUrl}
            alt="Avatar"
            className="w-full h-full object-cover block"
            onError={() => setAvatarUrl(null)}
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <svg
              style={{ width: s * 0.55, height: s * 0.55 }}
              className="text-white/50"
              fill="currentColor"
              viewBox="0 0 20 20">
              <path d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" />
            </svg>
          </div>
        )}

        {/* Camera overlay on hover */}
        {!uploading && (
          <div className="absolute inset-0 bg-black/50 opacity-0 hover:opacity-100 transition-opacity flex items-center justify-center">
            <svg className="w-3.5 h-3.5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
          </div>
        )}
      </button>

      {/* Dropdown menu */}
      {menuOpen && (
        <div className="absolute right-0 top-full mt-2 w-44 rounded-xl bg-[#1a1a1a] border border-white/10 shadow-[0_8px_32px_rgba(0,0,0,0.6)] overflow-hidden z-[100]">
          <button
            type="button"
            onClick={() => { setMenuOpen(false); inputRef.current?.click(); }}
            className="w-full flex items-center gap-2.5 px-4 py-2.5 text-sm text-white/80 hover:bg-white/8 hover:text-white transition-colors">
            <svg className="w-4 h-4 text-orange-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
            Rasm yuklash
          </button>
          {avatarUrl && (
            <button
              type="button"
              onClick={handleDelete}
              className="w-full flex items-center gap-2.5 px-4 py-2.5 text-sm text-red-400 hover:bg-red-500/10 transition-colors">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                  d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
              </svg>
              Rasmni o'chirish
            </button>
          )}
        </div>
      )}
    </div>
  );
};

export default AvatarUpload;
