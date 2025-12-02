import { Client, Session } from '../types';
import { CryptoService } from './crypto';

const DB_NAME = 'TherapyLogDB_Encrypted';
const DB_VERSION = 1;
const CLIENT_STORE = 'clients';
const SESSION_STORE = 'sessions';

export class DBService {
  private db: IDBDatabase | null = null;
  private crypto: CryptoService | null = null;

  setCrypto(crypto: CryptoService) {
    this.crypto = crypto;
  }

  async connect(): Promise<void> {
    return new Promise((resolve, reject) => {
      const request = indexedDB.open(DB_NAME, DB_VERSION);

      request.onerror = () => reject('Error opening database');

      request.onsuccess = (event) => {
        this.db = (event.target as IDBOpenDBRequest).result;
        resolve();
      };

      request.onupgradeneeded = (event) => {
        const db = (event.target as IDBOpenDBRequest).result;
        if (!db.objectStoreNames.contains(CLIENT_STORE)) {
          // The keyPath (client_id) remains unencrypted for lookups.
          // The payload will be encrypted.
          db.createObjectStore(CLIENT_STORE, { keyPath: 'client_id' });
        }
        if (!db.objectStoreNames.contains(SESSION_STORE)) {
          // The keyPath (auto-incrementing id) remains unencrypted.
          db.createObjectStore(SESSION_STORE, { keyPath: 'id', autoIncrement: true });
        }
      };
    });
  }

  async saveClient(client: Client): Promise<string> {
    if (!this.crypto) throw new Error('Crypto service not set');
    const encryptedPayload = await this.crypto.encrypt(client);
    const dataToStore = { client_id: client.client_id, payload: encryptedPayload };
    return this.put(CLIENT_STORE, dataToStore);
  }
  
  async saveSession(session: Session): Promise<number> {
    if (!this.crypto) throw new Error('Crypto service not set');
    const encryptedPayload = await this.crypto.encrypt(session);
    // Remove id from object if it exists so auto-increment works for new sessions
    const sessionData = { ...session };
    delete sessionData.id;
    const dataToStore = { ...sessionData, id: session.id, payload: encryptedPayload };
    return this.put(SESSION_STORE, dataToStore);
  }
  
  async deleteClient(clientId: string): Promise<void> {
    return this.delete(CLIENT_STORE, clientId);
  }

  async deleteSession(sessionId: number): Promise<void> {
    return this.delete(SESSION_STORE, sessionId);
  }

  async loadAndDecryptAll(): Promise<{ clients: Client[], sessions: Session[] }> {
    if (!this.crypto) throw new Error('Crypto service not set');

    const encryptedClients = await this.getAll<{ client_id: string, payload: string }>(CLIENT_STORE);
    const encryptedSessions = await this.getAll<{ id: number, payload: string }>(SESSION_STORE);

    const clients = await Promise.all(
        encryptedClients.map(c => this.crypto!.decrypt<Client>(c.payload))
    );
    const sessions = await Promise.all(
        encryptedSessions.map(s => this.crypto!.decrypt<Session>(s.payload))
    );

    return { clients, sessions };
  }

  async exportData(): Promise<any> {
    if (!this.db) throw new Error('DB not initialized');
    const clients = await this.getAll(CLIENT_STORE);
    const sessions = await this.getAll(SESSION_STORE);
    const salt = localStorage.getItem('therapylog.salt');
    const keyCheck = localStorage.getItem('therapylog.keyCheck');
    return {
      clients,
      sessions,
      meta: {
        salt,
        keyCheck,
        version: 1,
        exportedAt: new Date().toISOString()
      }
    };
  }

  async verifyImportData(data: any): Promise<boolean> {
    if (!data || typeof data !== 'object') return false;
    if (!Array.isArray(data.clients) || !Array.isArray(data.sessions)) return false;
    // Check for metadata to ensure compatibility
    if (!data.meta || !data.meta.salt || !data.meta.keyCheck) return false;
    return true;
  }

  async importData(data: any): Promise<void> {
    return new Promise((resolve, reject) => {
        if (!this.db) return reject('DB not initialized');
        
        const transaction = this.db.transaction([CLIENT_STORE, SESSION_STORE], 'readwrite');
        
        transaction.onabort = () => reject('Transaction aborted');
        transaction.onerror = () => reject(transaction.error);
        transaction.oncomplete = () => {
             // Update LocalStorage
             if (data.meta && data.meta.salt && data.meta.keyCheck) {
                 localStorage.setItem('therapylog.salt', data.meta.salt);
                 localStorage.setItem('therapylog.keyCheck', data.meta.keyCheck);
             }
             resolve();
        };

        const clientStore = transaction.objectStore(CLIENT_STORE);
        const sessionStore = transaction.objectStore(SESSION_STORE);

        clientStore.clear();
        sessionStore.clear();

        data.clients.forEach((c: any) => clientStore.put(c));
        data.sessions.forEach((s: any) => sessionStore.put(s));
    });
  }

  async clearAllData(): Promise<void> {
    return new Promise((resolve, reject) => {
       if (!this.db) return reject('DB not initialized');
       const t = this.db.transaction([CLIENT_STORE, SESSION_STORE], 'readwrite');
       t.objectStore(CLIENT_STORE).clear();
       t.objectStore(SESSION_STORE).clear();
       t.oncomplete = () => resolve();
       t.onerror = () => reject(t.error);
    });
  }

  private async getAll<T>(storeName: string): Promise<T[]> {
    return new Promise((resolve, reject) => {
      if (!this.db) return reject('DB not initialized');
      const transaction = this.db.transaction([storeName], 'readonly');
      const store = transaction.objectStore(storeName);
      const request = store.getAll();
      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    });
  }

  private async put(storeName: string, item: any): Promise<any> {
    return new Promise((resolve, reject) => {
      if (!this.db) return reject('DB not initialized');
      const transaction = this.db.transaction([storeName], 'readwrite');
      const store = transaction.objectStore(storeName);
      const request = store.put(item);
      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    });
  }

  private async delete(storeName: string, key: any): Promise<void> {
    return new Promise((resolve, reject) => {
      if (!this.db) return reject('DB not initialized');
      const transaction = this.db.transaction([storeName], 'readwrite');
      const store = transaction.objectStore(storeName);
      const request = store.delete(key);
      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });
  }
}

export const db = new DBService();