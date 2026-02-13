/**
 * JWT Debug Utility
 * Bu fayl JWT tokenni decode qilish va debug qilish uchun
 */

export const decodeJWT = (token: string): any => {
  try {
    // JWT format: header.payload.signature
    const parts = token.split('.');
    if (parts.length !== 3) {
      console.error('❌ Invalid JWT format');
      return null;
    }

    // Payload qismini decode qilish (Base64URL)
    const payload = parts[1];
    const base64 = payload.replace(/-/g, '+').replace(/_/g, '/');
    const jsonPayload = decodeURIComponent(
      atob(base64)
        .split('')
        .map((c) => {
          return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
        })
        .join(''),
    );

    return JSON.parse(jsonPayload);
  } catch (error) {
    console.error('❌ Error decoding JWT:', error);
    return null;
  }
};

export const debugToken = () => {
  const token = localStorage.getItem('auth_token');

  if (!token) {
    console.warn('⚠️ No token found in localStorage');
    return;
  }


  const decoded = decodeJWT(token);
  if (decoded) {

    if (decoded.exp && decoded.exp * 1000 < Date.now()) {
      console.error('❌ TOKEN IS EXPIRED!');
    }
  }
};

// Global funksiya sifatida expose qilish
if (typeof window !== 'undefined') {
  (window as any).debugToken = debugToken;
}
