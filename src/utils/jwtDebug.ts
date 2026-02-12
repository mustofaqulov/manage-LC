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

  console.log('🔍 Token Debug:');
  console.log('Token (first 50 chars):', token.substring(0, 50) + '...');

  const decoded = decodeJWT(token);
  if (decoded) {
    console.log('📦 Decoded JWT Payload:', decoded);
    console.log('👤 User ID (sub):', decoded.sub);
    console.log('🎭 Role:', decoded.role || decoded.roles || decoded.authorities);
    console.log('⏰ Issued At:', decoded.iat ? new Date(decoded.iat * 1000).toISOString() : 'N/A');
    console.log('⌛ Expires At:', decoded.exp ? new Date(decoded.exp * 1000).toISOString() : 'N/A');
    console.log('🕐 Is Expired:', decoded.exp ? decoded.exp * 1000 < Date.now() : 'Unknown');

    if (decoded.exp && decoded.exp * 1000 < Date.now()) {
      console.error('❌ TOKEN IS EXPIRED!');
    }
  }
};

// Global funksiya sifatida expose qilish
if (typeof window !== 'undefined') {
  (window as any).debugToken = debugToken;
}
