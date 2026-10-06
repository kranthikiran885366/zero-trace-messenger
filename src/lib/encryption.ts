export type EncryptedPayload = `${string}.${string}`;

const encoder = new TextEncoder();
const decoder = new TextDecoder();

export class EncryptionService {
  private static instance: EncryptionService;
  private readonly salt = encoder.encode('securechat-room-key-v2');

  static getInstance(): EncryptionService {
    EncryptionService.instance ??= new EncryptionService();
    return EncryptionService.instance;
  }

  generateRoomKey(): string {
    const bytes = crypto.getRandomValues(new Uint8Array(32));
    return this.encodeBase64(bytes);
  }

  generateRoomId(): string {
    const alphabet = 'ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnpqrstuvwxyz23456789';
    const bytes = crypto.getRandomValues(new Uint8Array(16));
    return Array.from(bytes, (byte) => alphabet[byte % alphabet.length]).join('');
  }

  private encodeBase64(value: Uint8Array): string {
    let binary = '';
    for (let index = 0; index < value.length; index += 0x8000) {
      binary += String.fromCharCode(...value.subarray(index, index + 0x8000));
    }
    return btoa(binary);
  }

  private decodeBase64(value: string): Uint8Array {
    const binary = atob(value);
    return Uint8Array.from(binary, (character) => character.charCodeAt(0));
  }

  private async deriveKey(key: string): Promise<CryptoKey> {
    const material = await crypto.subtle.importKey('raw', encoder.encode(key), 'PBKDF2', false, ['deriveKey']);
    return crypto.subtle.deriveKey(
      { name: 'PBKDF2', salt: this.salt, iterations: 310_000, hash: 'SHA-256' },
      material,
      { name: 'AES-GCM', length: 256 },
      false,
      ['encrypt', 'decrypt'],
    );
  }

  private async encryptBytes(value: Uint8Array, key: string): Promise<EncryptedPayload> {
    if (!key) throw new Error('An encryption key is required');
    const iv = crypto.getRandomValues(new Uint8Array(12));
    const ciphertext = await crypto.subtle.encrypt({ name: 'AES-GCM', iv }, await this.deriveKey(key), value);
    return `${this.encodeBase64(iv)}.${this.encodeBase64(new Uint8Array(ciphertext))}` as EncryptedPayload;
  }

  private async decryptBytes(payload: string, key: string): Promise<Uint8Array> {
    if (!key) throw new Error('An encryption key is required');
    const [encodedIv, encodedCiphertext] = payload.split('.');
    if (!encodedIv || !encodedCiphertext) throw new Error('Invalid encrypted payload');
    const plaintext = await crypto.subtle.decrypt(
      { name: 'AES-GCM', iv: this.decodeBase64(encodedIv) },
      await this.deriveKey(key),
      this.decodeBase64(encodedCiphertext),
    );
    return new Uint8Array(plaintext);
  }

  encryptMessage(content: string, key: string): Promise<EncryptedPayload> {
    return this.encryptBytes(encoder.encode(content), key);
  }

  async decryptMessage(payload: string, key: string): Promise<string> {
    return decoder.decode(await this.decryptBytes(payload, key));
  }

  async encryptFile(file: Blob, key: string): Promise<EncryptedPayload> {
    return this.encryptBytes(new Uint8Array(await file.arrayBuffer()), key);
  }

  async decryptFile(payload: string, key: string, mimeType = 'application/octet-stream'): Promise<Blob> {
    return new Blob([await this.decryptBytes(payload, key)], { type: mimeType });
  }

  async generateFingerprint(key: string): Promise<string> {
    const digest = await crypto.subtle.digest('SHA-256', encoder.encode(key));
    return Array.from(new Uint8Array(digest).slice(0, 8), (byte) => byte.toString(16).padStart(2, '0')).join(':').toUpperCase();
  }

  validateRoomCode(code: string): boolean {
    return /^[A-Za-z0-9]{8,32}$/.test(code);
  }
}

export const encryption = EncryptionService.getInstance();

export function isEncryptedPayload(value: string): value is EncryptedPayload {
  return /^[A-Za-z0-9+/]+=*\.[A-Za-z0-9+/]+=*$/.test(value);
}
