export type StoredMedia = {
  id: string
  name: string
  kind: "audio" | "video"
  size: number
  addedAt: number
  type: string
  blob: Blob
}

const DB_NAME = "melodix-local-library"
const STORE_NAME = "media"

function openMediaDb(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, 1)
    request.onupgradeneeded = () => {
      const database = request.result
      if (!database.objectStoreNames.contains(STORE_NAME)) database.createObjectStore(STORE_NAME, { keyPath: "id" })
    }
    request.onsuccess = () => resolve(request.result)
    request.onerror = () => reject(request.error)
  })
}

export async function listStoredMedia(): Promise<StoredMedia[]> {
  const database = await openMediaDb()
  return new Promise((resolve, reject) => {
    const request = database.transaction(STORE_NAME, "readonly").objectStore(STORE_NAME).getAll()
    request.onsuccess = () => resolve(request.result as StoredMedia[])
    request.onerror = () => reject(request.error)
  })
}

export async function saveStoredMedia(items: StoredMedia[]) {
  const database = await openMediaDb()
  return new Promise<void>((resolve, reject) => {
    const transaction = database.transaction(STORE_NAME, "readwrite")
    items.forEach((item) => transaction.objectStore(STORE_NAME).put(item))
    transaction.oncomplete = () => resolve()
    transaction.onerror = () => reject(transaction.error)
  })
}

export async function deleteStoredMedia(id: string) {
  const database = await openMediaDb()
  return new Promise<void>((resolve, reject) => {
    const request = database.transaction(STORE_NAME, "readwrite").objectStore(STORE_NAME).delete(id)
    request.onsuccess = () => resolve()
    request.onerror = () => reject(request.error)
  })
}

export function toMediaUrl(blob: Blob) {
  return URL.createObjectURL(blob)
}
