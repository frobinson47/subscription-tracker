// AES-GCM encryption with PBKDF2 key derivation from PIN
// Two separate cryptographic materials:
// 1. PIN verification hash (verifySalt) — for checking "is this the right PIN?"
// 2. Encryption key (encryptSalt) — for encrypting/decrypting sensitive notes

const ITERATIONS = 100000;
const KEY_LENGTH = 256;

function bufferToBase64(buffer: ArrayBuffer): string {
  const bytes = new Uint8Array(buffer);
  let binary = '';
  for (let i = 0; i < bytes.byteLength; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  return btoa(binary);
}

function base64ToBuffer(base64: string): ArrayBuffer {
  const binary = atob(base64);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) {
    bytes[i] = binary.charCodeAt(i);
  }
  return bytes.buffer;
}

async function deriveKey(pin: string, salt: Uint8Array): Promise<CryptoKey> {
  const encoder = new TextEncoder();
  const keyMaterial = await crypto.subtle.importKey(
    'raw',
    encoder.encode(pin),
    'PBKDF2',
    false,
    ['deriveKey']
  );

  return crypto.subtle.deriveKey(
    { name: 'PBKDF2', salt: salt as unknown as BufferSource, iterations: ITERATIONS, hash: 'SHA-256' },
    keyMaterial,
    { name: 'AES-GCM', length: KEY_LENGTH },
    false,
    ['encrypt', 'decrypt']
  );
}

async function deriveHash(pin: string, salt: Uint8Array): Promise<string> {
  const encoder = new TextEncoder();
  const keyMaterial = await crypto.subtle.importKey(
    'raw',
    encoder.encode(pin),
    'PBKDF2',
    false,
    ['deriveBits']
  );

  const bits = await crypto.subtle.deriveBits(
    { name: 'PBKDF2', salt: salt as unknown as BufferSource, iterations: ITERATIONS, hash: 'SHA-256' },
    keyMaterial,
    KEY_LENGTH
  );

  return bufferToBase64(bits);
}

export function generateSalt(): string {
  const salt = crypto.getRandomValues(new Uint8Array(16));
  return bufferToBase64(salt.buffer);
}

export async function createPinVerification(pin: string): Promise<{
  pinVerifyHash: string;
  pinVerifySalt: string;
  pinEncryptSalt: string;
}> {
  const verifySaltBytes = crypto.getRandomValues(new Uint8Array(16));
  const encryptSaltBytes = crypto.getRandomValues(new Uint8Array(16));

  const hash = await deriveHash(pin, verifySaltBytes);

  return {
    pinVerifyHash: hash,
    pinVerifySalt: bufferToBase64(verifySaltBytes.buffer),
    pinEncryptSalt: bufferToBase64(encryptSaltBytes.buffer),
  };
}

export async function verifyPin(
  pin: string,
  storedHash: string,
  verifySaltBase64: string
): Promise<boolean> {
  const salt = new Uint8Array(base64ToBuffer(verifySaltBase64));
  const hash = await deriveHash(pin, salt);
  return hash === storedHash;
}

export async function getEncryptionKey(pin: string, encryptSaltBase64: string): Promise<CryptoKey> {
  const salt = new Uint8Array(base64ToBuffer(encryptSaltBase64));
  return deriveKey(pin, salt);
}

export async function encryptNote(plaintext: string, key: CryptoKey): Promise<string> {
  const encoder = new TextEncoder();
  const iv = crypto.getRandomValues(new Uint8Array(12));

  const ciphertext = await crypto.subtle.encrypt(
    { name: 'AES-GCM', iv },
    key,
    encoder.encode(plaintext)
  );

  // Store as: base64(iv) + '.' + base64(ciphertext)
  return bufferToBase64(iv.buffer) + '.' + bufferToBase64(ciphertext);
}

export async function decryptNote(encrypted: string, key: CryptoKey): Promise<string | null> {
  try {
    const [ivBase64, ciphertextBase64] = encrypted.split('.');
    if (!ivBase64 || !ciphertextBase64) return null;

    const iv = new Uint8Array(base64ToBuffer(ivBase64));
    const ciphertext = base64ToBuffer(ciphertextBase64);

    const plaintext = await crypto.subtle.decrypt(
      { name: 'AES-GCM', iv },
      key,
      ciphertext
    );

    return new TextDecoder().decode(plaintext);
  } catch {
    return null; // Wrong PIN or corrupted data
  }
}
