const DB_NAME = "ai-assistant-db-8080";
const STORE_NAME = "chat-ai-8080";
const TYPE_INDEX = "data_type_idx";
const DB_VERSION = 2;
export const role = Object.freeze({ user: "USER", assistant: "ASSISTANT" });
export const type = Object.freeze({ chat: "CHAT", consensus: "CONSENSUS" });

export class DocumentDBService {
  static instance;
  #db = null;
  constructor() {}
  static getInstance() {
    if (!DocumentDBService.instance) {
      DocumentDBService.instance = new DocumentDBService();
    }
    return DocumentDBService.instance;
  }
  openDB() {
    return new Promise((resolve, reject) => {
      if (this.#db) return resolve(this.#db);
      const request = indexedDB.open(DB_NAME, DB_VERSION);

      request.onupgradeneeded = (event) => {
        const db = event.target.result;
        let store;
        if (!db.objectStoreNames.contains(STORE_NAME)) {
          store = db.createObjectStore(STORE_NAME, { keyPath: "id" });
        } else {
          store = request?.transaction?.objectStore(STORE_NAME);
        }
        // Create the index if it doesn't exist
        if (!store.indexNames.contains(TYPE_INDEX)) {
          store.createIndex(TYPE_INDEX, "type", { unique: false });
        }
      };

      request.onsuccess = () => {
        this.#db = request.result;
        resolve(request.result);
      };
      request.onerror = () => reject(request.error);
    });
  }
  // CREATE or UPDATE
  async saveDocument(doc) {
    const db = await this.openDB();
    return new Promise((resolve, reject) => {
      const transaction = db.transaction([STORE_NAME], "readwrite");
      const store = transaction.objectStore(STORE_NAME);
      // Ensure there is an ID
      if (!doc.id) doc.id = crypto.randomUUID();
      if (!doc.qId) doc.qId = crypto.randomUUID() + "_q";
      const request = store.put(doc);
      request.onsuccess = () => resolve(doc);
      request.onerror = () => reject("Failed to save document");
    });
  }
  // READ (All)
  async getAllDocuments(type) {
    const db = await this.openDB();
    return new Promise((resolve, reject) => {
      const transaction = db.transaction([STORE_NAME], "readonly");
      const store = transaction.objectStore(STORE_NAME);
      let request;
      if (type) {
        // Use the Index for fast filtered lookup
        const index = store.index(TYPE_INDEX);
        request = index.getAll(type);
      } else {
        // No type provided, get everything from the main store
        request = store.getAll();
      }
      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject("Failed to fetch documents");
    });
  }
  // READ (Single)
  async getDocumentById(id) {
    const db = await this.openDB();
    return new Promise((resolve, reject) => {
      const transaction = db.transaction([STORE_NAME], "readonly");
      const store = transaction.objectStore(STORE_NAME);
      const request = store.get(id);

      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject("Failed to fetch document");
    });
  }
  // DELETE
  async deleteDocument(id) {
    const db = await this.openDB();
    return new Promise((resolve, reject) => {
      const transaction = db.transaction([STORE_NAME], "readwrite");
      const store = transaction.objectStore(STORE_NAME);
      const request = store.delete(id);

      request.onsuccess = () => resolve(id);
      request.onerror = () => reject("Failed to delete document");
    });
  }
}
