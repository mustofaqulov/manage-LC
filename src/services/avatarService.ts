const AVATAR_BASE = (import.meta.env.VITE_AVATAR_API_URL as string) || 'https://manage-avatar-production.up.railway.app';

const getToken = (): string | null => localStorage.getItem('auth_token');

const authHeaders = (): HeadersInit => ({
  Authorization: `Bearer ${getToken()}`,
});

export const getMyAvatar = async (): Promise<string | null> => {
  const res = await fetch(`${AVATAR_BASE}/avatar/me`, { headers: authHeaders() });
  if (!res.ok) return null;
  const data = await res.json();
  return data.avatarUrl ?? null;
};

export const uploadAvatar = async (file: File): Promise<string> => {
  const form = new FormData();
  form.append('file', file);
  const res = await fetch(`${AVATAR_BASE}/avatar/upload`, {
    method: 'POST',
    headers: authHeaders(), // Content-Type multipart ni browser o'zi qo'yadi
    body: form,
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error((err as any).error || 'Upload failed');
  }
  const data = await res.json();
  return data.avatarUrl as string;
};

export const deleteMyAvatar = async (): Promise<void> => {
  const res = await fetch(`${AVATAR_BASE}/avatar`, {
    method: 'DELETE',
    headers: authHeaders(),
  });
  if (!res.ok && res.status !== 404) throw new Error('Delete failed');
};
