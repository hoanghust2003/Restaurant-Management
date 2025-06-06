import { webcrypto } from 'crypto';
import { v4 as uuidv4 } from 'uuid';

// Polyfill for crypto.randomUUID in Node.js versions < 19
if (!globalThis.crypto) {
  globalThis.crypto = webcrypto as Crypto;
}

// Polyfill for crypto.randomUUID specifically
if (!globalThis.crypto.randomUUID) {
  try {
    globalThis.crypto.randomUUID = () => webcrypto.randomUUID();
  } catch (error) {
    // Fallback to uuid package if webcrypto.randomUUID is not available
    globalThis.crypto.randomUUID = () =>
      uuidv4() as `${string}-${string}-${string}-${string}-${string}`;
  }
}
