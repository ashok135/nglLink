/**
 * Hashes a string using SHA-256 via the Web Crypto API.
 * Falls back to a simple hash function if Web Crypto is unavailable (e.g. non-HTTPS environments).
 */
export async function sha256(message: string): Promise<string> {
  if (!message) return '';

  try {
    const msgBuffer = new TextEncoder().encode(message);
    const hashBuffer = await crypto.subtle.digest('SHA-256', msgBuffer);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
  } catch (error) {
    console.warn('Web Crypto API not available or failed, using fallback hash:', error);
    
    // Fallback hash implementation (FNV-1a 32-bit hash converted to hex)
    let hash = 2166136261;
    for (let i = 0; i < message.length; i++) {
      hash ^= message.charCodeAt(i);
      hash = Math.imul(hash, 16777619);
    }
    return (hash >>> 0).toString(16).padStart(8, '0');
  }
}
