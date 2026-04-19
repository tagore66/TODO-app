const crypto = require('crypto');

const ALGORITHM = 'chacha20-poly1305';
const IV_LENGTH = 12; // Standard for ChaCha20-Poly1305
const AUTH_TAG_LENGTH = 16;
const rawKey = (process.env.ENCRYPTION_KEY || '').trim();
if (rawKey.length !== 64) {
  console.error(`CRITICAL: ENCRYPTION_KEY is ${rawKey.length === 0 ? 'MISSING' : 'INVALID LENGTH (' + rawKey.length + ' chars)'}. ChaCha20 encryption will fail!`);
}
const KEY = (rawKey.length === 64) ? Buffer.from(rawKey, 'hex') : null;

/**
 * Encrypts a string using ChaCha20-Poly1305
 * @param {string} text - The plain text to encrypt
 * @returns {string} - The encrypted string in format iv:authTag:ciphertext
 */
function encrypt(text) {
  if (!text) return text;
  
  if (!KEY) {
    console.error('Encryption skipped: No valid KEY provided');
    return text;
  }
  
  try {
    const iv = crypto.randomBytes(IV_LENGTH);
    const cipher = crypto.createCipheriv(ALGORITHM, KEY, iv, {
      authTagLength: AUTH_TAG_LENGTH
    });

    let encrypted = cipher.update(text, 'utf8', 'hex');
    encrypted += cipher.final('hex');

    const authTag = cipher.getAuthTag().toString('hex');

    return `${iv.toString('hex')}:${authTag}:${encrypted}`;
  } catch (err) {
    console.error('Encryption failed:', err.message);
    return text; // Fallback to plaintext to avoid crash
  }
}

/**
 * Decrypts a string using ChaCha20-Poly1305
 * @param {string} encryptedText - The encrypted string in format iv:authTag:ciphertext
 * @returns {string} - The decrypted plain text
 */
function decrypt(encryptedText) {
  if (!encryptedText) return encryptedText;

  const parts = encryptedText.split(':');
  if (parts.length !== 3) {
    // Return original if not in expected encrypted format (handles pre-encryption data)
    return encryptedText;
  }

  const [ivHex, authTagHex, ciphertextHex] = parts;
  const iv = Buffer.from(ivHex, 'hex');
  const authTag = Buffer.from(authTagHex, 'hex');
  const ciphertext = Buffer.from(ciphertextHex, 'hex');

  try {
    if (!KEY) return encryptedText;

    const decipher = crypto.createDecipheriv(ALGORITHM, KEY, iv, {
      authTagLength: AUTH_TAG_LENGTH
    });

    decipher.setAuthTag(authTag);

    let decrypted = decipher.update(ciphertext, 'hex', 'utf8');
    decrypted += decipher.final('utf8');

    return decrypted;
  } catch (err) {
    console.error('Decryption failed:', err.message);
    // If decryption fails, return the original text (might be unencrypted)
    return encryptedText;
  }
}

module.exports = { encrypt, decrypt };
