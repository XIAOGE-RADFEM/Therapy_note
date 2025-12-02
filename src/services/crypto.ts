

const encoder = new TextEncoder();
const decoder = new TextDecoder();

const arrayBufferToBase64 = (buffer: ArrayBuffer): string => {
  let binary = '';
  const bytes = new Uint8Array(buffer);
  const len = bytes.byteLength;
  for (let i = 0; i < len; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  return window.btoa(binary);
};

const base64ToArrayBuffer = (base64: string): Uint8Array => {
  const binary_string = window.atob(base64);
  const len = binary_string.length;
  const bytes = new Uint8Array(len);
  for (let i = 0; i < len; i++) {
    bytes[i] = binary_string.charCodeAt(i);
  }
  return bytes;
};

export class CryptoService {
  private key: CryptoKey;

  private constructor(key: CryptoKey) {
    this.key = key;
  }

  static async create(password: string, salt: Uint8Array): Promise<CryptoService> {
    const keyMaterial = await window.crypto.subtle.importKey(
      'raw',
      encoder.encode(password),
      { name: 'PBKDF2' },
      false,
      ['deriveKey']
    );

    const key = await window.crypto.subtle.deriveKey(
      { name: 'PBKDF2', salt, iterations: 200000, hash: 'SHA-256' },
      keyMaterial,
      { name: 'AES-GCM', length: 256 },
      true,
      ['encrypt', 'decrypt']
    );
    return new CryptoService(key);
  }

  static async verifyPassword(password: string, salt: Uint8Array, keyCheck: string): Promise<boolean> {
    try {
        const service = await CryptoService.create(password, salt);
        const newKeyCheck = await service.getKeyCheck();
        return newKeyCheck === keyCheck;
    } catch (e) {
        console.error("Verification failed:", e);
        return false;
    }
  }

  async getKeyCheck(): Promise<string> {
    const exportedKey = await window.crypto.subtle.exportKey('raw', this.key);
    const hash = await window.crypto.subtle.digest('SHA-256', exportedKey);
    return arrayBufferToBase64(hash);
  }

  async encrypt(data: object): Promise<string> {
    const iv = window.crypto.getRandomValues(new Uint8Array(12));
    const dataStr = JSON.stringify(data);
    const encodedData = encoder.encode(dataStr);

    const encryptedContent = await window.crypto.subtle.encrypt(
      { name: 'AES-GCM', iv },
      this.key,
      encodedData
    );

    const payload = {
      iv: arrayBufferToBase64(iv),
      data: arrayBufferToBase64(encryptedContent)
    };
    return JSON.stringify(payload);
  }

  async decrypt<T>(encryptedPayload: string): Promise<T> {
    const payload = JSON.parse(encryptedPayload);
    const iv = base64ToArrayBuffer(payload.iv);
    const encryptedContent = base64ToArrayBuffer(payload.data);

    const decryptedContent = await window.crypto.subtle.decrypt(
      { name: 'AES-GCM', iv },
      this.key,
      encryptedContent
    );
    
    const decryptedStr = decoder.decode(decryptedContent);
    return JSON.parse(decryptedStr) as T;
  }
}