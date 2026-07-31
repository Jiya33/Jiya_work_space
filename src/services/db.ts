// ====== IndexedDB 封装工具类 ======
import type {
  LearningRecord, SportRecord, Expense, TodoItem,
  AppSettings, NewsItem, SportVideo
} from '../types'

const DB_NAME = 'jiya_workbench'
const DB_VERSION = 2

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
      // v2 新增
      if (!db.objectStoreNames.contains('news_items')) {
        const store = db.createObjectStore('news_items', { keyPath: 'id', autoIncrement: true })
        store.createIndex('link', 'link', { unique: false })
        store.createIndex('category', 'category', { unique: false })
      }
      if (!db.objectStoreNames.contains('sport_videos')) {
        const store = db.createObjectStore('sport_videos', { keyPath: 'id', autoIncrement: true })
        store.createIndex('category', 'category', { unique: false })
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
  const store = await getStore(storeName)
  return new Promise((resolve, reject) => {
    const request = store.getAll()
    request.onsuccess = () => resolve(request.result as T[])
    request.onerror = () => reject(request.error)
  })
}

async function getByIndex<T>(storeName: string, indexName: string, value: string): Promise<T[]> {
  const store = await getStore(storeName)
  return new Promise((resolve, reject) => {
    const index = store.index(indexName)
    const request = index.getAll(value)
    request.onsuccess = () => resolve(request.result as T[])
    request.onerror = () => reject(request.error)
  })
}

async function getByKey<T>(storeName: string, key: number | string): Promise<T | undefined> {
  const store = await getStore(storeName)
  return new Promise((resolve, reject) => {
    const request = store.get(key)
    request.onsuccess = () => resolve(request.result as T)
    request.onerror = () => reject(request.error)
  })
}

async function add<T>(storeName: string, item: T): Promise<number> {
  const store = await getStore(storeName, 'readwrite')
  return new Promise((resolve, reject) => {
    const request = store.add(item)
    request.onsuccess = () => resolve(request.result as number)
    request.onerror = () => reject(request.error)
  })
}

async function put<T>(storeName: string, item: T): Promise<void> {
  const store = await getStore(storeName, 'readwrite')
  return new Promise((resolve, reject) => {
    const request = store.put(item)
    request.onsuccess = () => resolve()
    request.onerror = () => reject(request.error)
  })
}

async function remove(storeName: string, key: number | string): Promise<void> {
  const store = await getStore(storeName, 'readwrite')
  return new Promise((resolve, reject) => {
    const request = store.delete(key)
    request.onsuccess = () => resolve()
    request.onerror = () => reject(request.error)
  })
}

async function clear(storeName: string): Promise<void> {
  const store = await getStore(storeName, 'readwrite')
  return new Promise((resolve, reject) => {
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

// 运动视频资料
export const SportVideoDB = {
  getAll: () => getAll<SportVideo>('sport_videos'),
  add: (v: Omit<SportVideo, 'id'>) => add('sport_videos', v),
  delete: (id: number) => remove('sport_videos', id),
  update: (v: SportVideo) => put('sport_videos', v)
}

// 账单
export const ExpenseDB = {
  getAll: () => getAll<Expense>('expenses'),
  getByDate: (date: string) => getByIndex<Expense>('expenses', 'date', date),
  getById: (id: number) => getByKey<Expense>('expenses', id),
  add: (expense: Omit<Expense, 'id'>) => add('expenses', expense),
  update: (expense: Expense) => put('expenses', expense),
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

// 资讯
export const NewsDB = {
  getAll: () => getAll<NewsItem>('news_items'),
  add: (item: Omit<NewsItem, 'id'>) => add('news_items', item),
  update: (item: NewsItem) => put('news_items', item),
  delete: (id: number) => remove('news_items', id),
  clear: () => clear('news_items'),
  /** 批量写入并按 link 去重，返回新增条数 */
  addMany: async (items: Omit<NewsItem, 'id'>[]): Promise<number> => {
    const existing = await getAll<NewsItem>('news_items')
    const seen = new Set(existing.map(i => i.link))
    let count = 0
    for (const item of items) {
      if (!item.link || seen.has(item.link)) continue
      seen.add(item.link)
      await add('news_items', item)
      count++
    }
    return count
  },
  /** 清理 30 天前的未收藏条目 */
  prune: async (days = 30) => {
    const cutoff = Date.now() - days * 86400000
    const all = await getAll<NewsItem>('news_items')
    for (const item of all) {
      if (item.isFavorite) continue
      if (new Date(item.pubDate || item.createdAt).getTime() < cutoff) {
        await remove('news_items', item.id!)
      }
    }
  }
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
  feishuDailyBriefsTableId: '',
  llmApiKey: '',
  llmProvider: 'none',
  sportPlans: [],
  focusDuration: 25,
  focusSoundVolume: 0.6,
  newsSources: [],
  newsLastFetch: '',
  tencentDocUrl: '',
  theme: 'auto'
}
