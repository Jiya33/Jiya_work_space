// ====== IndexedDB 封装工具类 ======
import type {
  LearningRecord, SportRecord, Expense, TodoItem,
  AppSettings
} from '../types'

const DB_NAME = 'jiya_workbench'
const DB_VERSION = 1

function openDB(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION)
    request.onupgradeneeded = () => {
      const db = request.result
      if (!db.objectStoreNames.contains('learning_records')) {
        const store = db.createObjectStore('learning_records', { keyPath: 'id', autoIncrement: true })
        store.createIndex('date', 'date', { unique: false })
      }
      if (!db.objectStoreNames.contains('sport_records')) {
        const store = db.createObjectStore('sport_records', { keyPath: 'id', autoIncrement: true })
        store.createIndex('date', 'date', { unique: false })
      }
      if (!db.objectStoreNames.contains('expenses')) {
        const store = db.createObjectStore('expenses', { keyPath: 'id', autoIncrement: true })
        store.createIndex('date', 'date', { unique: false })
      }
      if (!db.objectStoreNames.contains('todo_items')) {
        const store = db.createObjectStore('todo_items', { keyPath: 'id', autoIncrement: true })
        store.createIndex('date', 'date', { unique: false })
      }
      if (!db.objectStoreNames.contains('settings')) {
        db.createObjectStore('settings', { keyPath: 'key' })
      }
    }
    request.onsuccess = () => resolve(request.result)
    request.onerror = () => reject(request.error)
  })
}

// 通用 CRUD
async function getStore(storeName: string, mode: IDBTransactionMode = 'readonly') {
  const db = await openDB()
  const tx = db.transaction(storeName, mode)
  return tx.objectStore(storeName)
}

async function getAll<T>(storeName: string): Promise<T[]> {
  return new Promise(async (resolve, reject) => {
    const store = await getStore(storeName)
    const request = store.getAll()
    request.onsuccess = () => resolve(request.result as T[])
    request.onerror = () => reject(request.error)
  })
}

async function getByIndex<T>(storeName: string, indexName: string, value: string): Promise<T[]> {
  return new Promise(async (resolve, reject) => {
    const store = await getStore(storeName)
    const index = store.index(indexName)
    const request = index.getAll(value)
    request.onsuccess = () => resolve(request.result as T[])
    request.onerror = () => reject(request.error)
  })
}

async function getByKey<T>(storeName: string, key: number | string): Promise<T | undefined> {
  return new Promise(async (resolve, reject) => {
    const store = await getStore(storeName)
    const request = store.get(key)
    request.onsuccess = () => resolve(request.result as T)
    request.onerror = () => reject(request.error)
  })
}

async function add<T>(storeName: string, item: T): Promise<number> {
  return new Promise(async (resolve, reject) => {
    const store = await getStore(storeName, 'readwrite')
    const request = store.add(item)
    request.onsuccess = () => resolve(request.result as number)
    request.onerror = () => reject(request.error)
  })
}

async function put<T>(storeName: string, item: T): Promise<void> {
  return new Promise(async (resolve, reject) => {
    const store = await getStore(storeName, 'readwrite')
    const request = store.put(item)
    request.onsuccess = () => resolve()
    request.onerror = () => reject(request.error)
  })
}

async function remove(storeName: string, key: number | string): Promise<void> {
  return new Promise(async (resolve, reject) => {
    const store = await getStore(storeName, 'readwrite')
    const request = store.delete(key)
    request.onsuccess = () => resolve()
    request.onerror = () => reject(request.error)
  })
}

async function clear(storeName: string): Promise<void> {
  return new Promise(async (resolve, reject) => {
    const store = await getStore(storeName, 'readwrite')
    const request = store.clear()
    request.onsuccess = () => resolve()
    request.onerror = () => reject(request.error)
  })
}

// ====== 业务 API ======

// 学习记录
export const LearningDB = {
  getAll: () => getAll<LearningRecord>('learning_records'),
  getByDate: (date: string) => getByIndex<LearningRecord>('learning_records', 'date', date),
  add: (record: Omit<LearningRecord, 'id'>) => add('learning_records', record),
  delete: (id: number) => remove('learning_records', id),
  update: (record: LearningRecord) => put('learning_records', record)
}

// 运动记录
export const SportDB = {
  getAll: () => getAll<SportRecord>('sport_records'),
  getByDate: (date: string) => getByIndex<SportRecord>('sport_records', 'date', date),
  add: (record: Omit<SportRecord, 'id'>) => add('sport_records', record),
  delete: (id: number) => remove('sport_records', id),
  update: (record: SportRecord) => put('sport_records', record)
}

// 账单
export const ExpenseDB = {
  getAll: () => getAll<Expense>('expenses'),
  getByDate: (date: string) => getByIndex<Expense>('expenses', 'date', date),
  getById: (id: number) => getByKey<Expense>('expenses', id),
  add: (expense: Omit<Expense, 'id'>) => add('expenses', expense),
  delete: (id: number) => remove('expenses', id)
}

// Todo
export const TodoDB = {
  getAll: () => getAll<TodoItem>('todo_items'),
  getByDate: (date: string) => getByIndex<TodoItem>('todo_items', 'date', date),
  add: (item: Omit<TodoItem, 'id'>) => add('todo_items', item),
  delete: (id: number) => remove('todo_items', id),
  update: (item: TodoItem) => put('todo_items', item),
  clear: () => clear('todo_items')
}

// 设置
export const SettingsDB = {
  get: async (): Promise<Partial<AppSettings>> => {
    const all = await getAll<{ key: string; value: unknown }>('settings')
    const result: Record<string, unknown> = {}
    for (const item of all) {
      result[item.key] = item.value
    }
    return result as Partial<AppSettings>
  },
  set: async (key: string, value: unknown) => {
    return put('settings', { key, value })
  },
  setMultiple: async (settings: Record<string, unknown>) => {
    for (const [key, value] of Object.entries(settings)) {
      await put('settings', { key, value })
    }
  },
  // 加密存储密钥（简单 Base64 混淆）
  setSecret: async (key: string, value: string) => {
    const encoded = btoa(encodeURIComponent(value))
    return put('settings', { key: `_secret_${key}`, value: encoded })
  },
  getSecret: async (key: string): Promise<string> => {
    const item = await getByKey<{ key: string; value: string }>('settings', `_secret_${key}`)
    if (!item) return ''
    try {
      return decodeURIComponent(atob(item.value))
    } catch {
      return ''
    }
  }
}

// 默认设置
export const DEFAULT_SETTINGS: AppSettings = {
  feishuAppId: '',
  feishuAppSecret: '',
  feishuAppToken: '',
  feishuAiNewsTableId: '',
  feishuShopMaterialsTableId: '',
  feishuDailyBriefsTableId: '',
  llmApiKey: '',
  llmProvider: 'none',
  sportPlans: [],
  focusDuration: 25,
  dataSourceUrl: '',
  theme: 'auto'
}
