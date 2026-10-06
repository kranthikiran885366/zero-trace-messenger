// Encryption utilities for secure anonymous messaging
export class EncryptionService {
  private static instance: EncryptionService;
  
  static getInstance(): EncryptionService {
    if (!EncryptionService.instance) {
      EncryptionService.instance = new EncryptionService();
    }
    return EncryptionService.instance;
  }

  // Generate a secure room key
  generateRoomKey(): string {
    const array = new Uint8Array(32);
    crypto.getRandomValues(array);
    return btoa(String.fromCharCode(...array));
  }

  // Generate a secure room ID
  generateRoomId(): string {
    const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnpqrstuvwxyz23456789';
    let result = '';
    for (let i = 0; i < 16; i++) {
      result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return result;
  }

  private decodeBase64(value: string): Uint8Array {
    return Uint8Array.from(atob(value), (character) => character.charCodeAt(0));
  }

  private encodeBase64(value: Uint8Array): string {
    let binary = '';
    const chunkSize = 0x8000;
    for (let index = 0; index < value.length; index += chunkSize) {
      binary += String.fromCharCode(...value.subarray(index, index + chunkSize));
    }
    return btoa(binary);
  }

  private async deriveKey(key: string): Promise<CryptoKey> {
    const material = await crypto.subtle.importKey(
      'raw',
      new TextEncoder().encode(key),
      'PBKDF2',
      false,
      ['deriveKey'],
    );

    return crypto.subtle.deriveKey(
      { name: 'PBKDF2', salt: new TextEncoder().encode('securechat-room-key-v1'), iterations: 100000, hash: 'SHA-256' },
      material,
      { name: 'AES-GCM', length: 256 },
      false,
      ['encrypt', 'decrypt'],
    );
  }

  async encryptMessage(content: string, key: string): Promise<string> {
    try {
      const iv = crypto.getRandomValues(new Uint8Array(12));
      const cryptoKey = await this.deriveKey(key);
      const ciphertext = await crypto.subtle.encrypt(
        { name: 'AES-GCM', iv },
        cryptoKey,
        new TextEncoder().encode(content),
      );
      return `${this.encodeBase64(iv)}.${this.encodeBase64(new Uint8Array(ciphertext))}`;
    } catch (error) {
      console.error('Encryption failed:', error);
      throw new Error('Failed to encrypt message');
    }
  }

  async decryptMessage(encryptedContent: string, key: string): Promise<string> {
    try {
      const [encodedIv, encodedCiphertext] = encryptedContent.split('.');
      if (!encodedIv || !encodedCiphertext) throw new Error('Invalid encrypted payload');
      const plaintext = await crypto.subtle.decrypt(
        { name: 'AES-GCM', iv: this.decodeBase64(encodedIv) },
        await this.deriveKey(key),
        this.decodeBase64(encodedCiphertext),
      );
      return new TextDecoder().decode(plaintext);
    } catch (error) {
      console.error('Decryption failed:', error);
      throw new Error('Failed to decrypt message');
    }
  }

  // Generate encryption fingerprint
  generateFingerprint(key: string): string {
    // Simple hash for demonstration
    let hash = 0;
    for (let i = 0; i < key.length; i++) {
      const char = key.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash; // Convert to 32-bit integer
    }
    return Math.abs(hash).toString(16).toUpperCase().slice(0, 8);
  }

  // Validate room code format
  validateRoomCode(code: string): boolean {
    return /^[A-Za-z0-9]{8,32}$/.test(code);
  }
}

export const encryption = EncryptionService.getInstance();
