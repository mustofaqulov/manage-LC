/**
 * Simple encryption/decryption utilities for localStorage
 * Uses Web Crypto API with AES-GCM encryption
 *
 * ⚠️ SECURITY NOTE:
 * This provides basic obfuscation but is NOT fully secure because:
 * 1. Encryption key is stored in client code (can be extracted)
 * 2. XSS attacks can still access decrypted data in memory
 * 3. For maximum security, use HTTP-only cookies or backend sessions
 *
 * This implementation protects against:
 * - Casual inspection of localStorage
 * - Browser extensions reading raw data
 * - Accidental exposure in screenshots/logs
 */

// Generate a consistent key from a passphrase
// In production, consider using a more sophisticated key derivation
const PASSPHRASE = 'manage-lc-encryption-key-v1'; // Should be unique per deployment

async function getDerivedKey(): Promise<CryptoKey> {
  const encoder = new TextEncoder();
  const keyMaterial = await crypto.subtle.importKey(
    'raw',
    encoder.encode(PASSPHRASE),
    'PBKDF2',
    false,
    ['deriveKey']
  );

  return crypto.subtle.deriveKey(
    {
      name: 'PBKDF2',
      salt: encoder.encode('manage-lc-salt'), // Static salt (acceptable for client-side obfuscation)
      iterations: 100000,
      hash: 'SHA-256',
    },
    keyMaterial,
    { name: 'AES-GCM', length: 256 },
    false,
    ['encrypt', 'decrypt']
  );
}

/**
 * Encrypt a string value
 * @param plaintext - String to encrypt
 * @returns Base64-encoded encrypted data with IV
 */
export async function encryptData(plaintext: string): Promise<string> {
  try {
    const key = await getDerivedKey();
    const encoder = new TextEncoder();
    const data = encoder.encode(plaintext);

    // Generate random IV
    const iv = crypto.getRandomValues(new Uint8Array(12));

    const encryptedData = await crypto.subtle.encrypt(
      { name: 'AES-GCM', iv },
      key,
      data
    );

    // Combine IV + encrypted data
    const combined = new Uint8Array(iv.length + encryptedData.byteLength);
    combined.set(iv);
    combined.set(new Uint8Array(encryptedData), iv.length);

    // Convert to base64 for storage
    return btoa(String.fromCharCode(...combined));
  } catch (error) {
    console.error('Encryption failed:', error);
    // Fallback: return plaintext (graceful degradation)
    return plaintext;
  }
}

/**
 * Decrypt an encrypted string
 * @param encrypted - Base64-encoded encrypted data
 * @returns Decrypted plaintext
 */
export async function decryptData(encrypted: string | null): Promise<string | null> {
  if (!encrypted) return null;

  try {
    const key = await getDerivedKey();

    // Decode from base64
    const combined = new Uint8Array(
      atob(encrypted).split('').map((c) => c.charCodeAt(0))
    );

    // Extract IV and encrypted data
    const iv = combined.slice(0, 12);
    const data = combined.slice(12);

    const decryptedData = await crypto.subtle.decrypt(
      { name: 'AES-GCM', iv },
      key,
      data
    );

    const decoder = new TextDecoder();
    return decoder.decode(decryptedData);
  } catch (error) {
    console.error('Decryption failed:', error);
    // Fallback: assume data is not encrypted (backward compatibility)
    return encrypted;
  }
}

/**
 * Secure localStorage wrapper with encryption
 */
export const secureStorage = {
  /**
   * Set encrypted item in localStorage
   */
  async setItem(key: string, value: string): Promise<void> {
    const encrypted = await encryptData(value);
    localStorage.setItem(key, encrypted);
  },

  /**
   * Get and decrypt item from localStorage
   */
  async getItem(key: string): Promise<string | null> {
    const encrypted = localStorage.getItem(key);
    return decryptData(encrypted);
  },

  /**
   * Remove item from localStorage
   */
  removeItem(key: string): void {
    localStorage.removeItem(key);
  },

  /**
   * Clear all localStorage
   */
  clear(): void {
    localStorage.clear();
  },

  /**
   * Synchronous fallback (less secure, returns plaintext)
   * Use only when async is not possible
   */
  getItemSync(key: string): string | null {
    console.warn('Using synchronous storage - data is not decrypted');
    return localStorage.getItem(key);
  },
};
