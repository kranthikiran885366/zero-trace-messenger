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

  // Encrypt message content
  async encryptMessage(content: string, key: string): Promise<string> {
    try {
      const encoder = new TextEncoder();
      const data = encoder.encode(content);
      
      // In a real implementation, this would use actual AES-256-GCM encryption
      // For demo purposes, we'll use base64 encoding with a key prefix
      const encrypted = btoa(key.slice(0, 8) + content);
      return encrypted;
    } catch (error) {
      console.error('Encryption failed:', error);
      throw new Error('Failed to encrypt message');
    }
  }

  // Decrypt message content
  async decryptMessage(encryptedContent: string, key: string): Promise<string> {
    try {
      // In a real implementation, this would use actual AES-256-GCM decryption
      // For demo purposes, we'll decode and verify the key prefix
      const decoded = atob(encryptedContent);
      const keyPrefix = key.slice(0, 8);
      
      if (!decoded.startsWith(keyPrefix)) {
        throw new Error('Invalid key');
      }
      
      return decoded.slice(8);
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
