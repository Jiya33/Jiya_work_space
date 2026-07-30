// ====== 飞书 API 服务类 ======
import type { FeishuTokenResponse, FeishuRecordsResponse, FeishuRecordItem } from '../types'
import { SettingsDB } from './db'

const FEISHU_BASE = 'https://open.feishu.cn/open-apis'

let cachedToken = ''
let tokenExpiresAt = 0

async function getTenantAccessToken(): Promise<string> {
  const now = Date.now()
  if (cachedToken && now < tokenExpiresAt - 60000) {
    return cachedToken
  }

  const appId = await SettingsDB.getSecret('feishuAppId')
  const appSecret = await SettingsDB.getSecret('feishuAppSecret')

  if (!appId || !appSecret) {
    throw new Error('请先在设置页面配置飞书 App ID 和 App Secret')
  }

  const resp = await fetch(`${FEISHU_BASE}/auth/v3/tenant_access_token/internal`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ app_id: appId, app_secret: appSecret })
  })

  const data: FeishuTokenResponse = await resp.json()
  if (data.code !== 0) {
    throw new Error(`获取飞书 Token 失败: ${data.msg}`)
  }

  cachedToken = data.tenant_access_token
  tokenExpiresAt = now + (data.expire * 1000)
  return cachedToken
}

// 查询记录
export async function queryRecords(
  tableIdKey: string,
  params?: { pageSize?: number; pageToken?: string; filter?: string }
): Promise<{ items: FeishuRecordItem[]; hasMore: boolean; pageToken?: string; total: number }> {
  const tableId = await SettingsDB.getSecret(tableIdKey)
  const appToken = await SettingsDB.getSecret('feishuAppToken')
  if (!appToken || !tableId) throw new Error('请先在设置页面配置飞书多维表格')

  const queryParams = new URLSearchParams()
  if (params?.pageSize) queryParams.set('page_size', String(params.pageSize))
  if (params?.pageToken) queryParams.set('page_token', params.pageToken)
  if (params?.filter) queryParams.set('filter', params.filter)

  const url = `${FEISHU_BASE}/bitable/v1/apps/${appToken}/tables/${tableId}/records?${queryParams}`
  const token = await getTenantAccessToken()
  const resp = await fetch(url, {
    headers: { 'Authorization': `Bearer ${token}` }
  })
  const data: FeishuRecordsResponse = await resp.json()
  if (data.code !== 0) throw new Error(`飞书 API 错误: ${data.msg}`)

  return {
    items: data.data.items,
    hasMore: data.data.has_more,
    pageToken: data.data.page_token,
    total: data.data.total
  }
}

// 新增记录
export async function createRecord(
  tableIdKey: string,
  fields: Record<string, unknown>
): Promise<FeishuRecordItem> {
  const tableId = await SettingsDB.getSecret(tableIdKey)
  const appToken = await SettingsDB.getSecret('feishuAppToken')
  if (!appToken || !tableId) throw new Error('请先在设置页面配置飞书多维表格')

  const url = `${FEISHU_BASE}/bitable/v1/apps/${appToken}/tables/${tableId}/records`
  const token = await getTenantAccessToken()
  const resp = await fetch(url, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json; charset=utf-8'
    },
    body: JSON.stringify({ fields })
  })
  const data = await resp.json()
  if (data.code !== 0) throw new Error(`飞书 API 错误: ${data.msg}`)
  return data.data.record
}

// 更新记录
export async function updateRecord(
  tableIdKey: string,
  recordId: string,
  fields: Record<string, unknown>
): Promise<FeishuRecordItem> {
  const tableId = await SettingsDB.getSecret(tableIdKey)
  const appToken = await SettingsDB.getSecret('feishuAppToken')
  if (!appToken || !tableId) throw new Error('请先在设置页面配置飞书多维表格')

  const url = `${FEISHU_BASE}/bitable/v1/apps/${appToken}/tables/${tableId}/records/${recordId}`
  const token = await getTenantAccessToken()
  const resp = await fetch(url, {
    method: 'PUT',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json; charset=utf-8'
    },
    body: JSON.stringify({ fields })
  })
  const data = await resp.json()
  if (data.code !== 0) throw new Error(`飞书 API 错误: ${data.msg}`)
  return data.data.record
}

// 删除记录
export async function deleteRecord(tableIdKey: string, recordId: string): Promise<void> {
  const tableId = await SettingsDB.getSecret(tableIdKey)
  const appToken = await SettingsDB.getSecret('feishuAppToken')
  if (!appToken || !tableId) throw new Error('请先在设置页面配置飞书多维表格')

  const url = `${FEISHU_BASE}/bitable/v1/apps/${appToken}/tables/${tableId}/records/${recordId}`
  const token = await getTenantAccessToken()
  const resp = await fetch(url, {
    method: 'DELETE',
    headers: { 'Authorization': `Bearer ${token}` }
  })
  const data = await resp.json()
  if (data.code !== 0) throw new Error(`飞书 API 错误: ${data.msg}`)
}

// ====== 业务 API：AI 资讯 ======
export const AiNewsAPI = {
  list: (params?: { pageSize?: number; filter?: string }) =>
    queryRecords('feishuAiNewsTableId', params),

  create: (data: { title: string; link: string; summary: string; category: string }) =>
    createRecord('feishuAiNewsTableId', {
      '标题': data.title,
      '链接': { link: data.link, text: data.title },
      '摘要': data.summary,
      '分类': data.category,
      '创建时间': Date.now()
    }),

  update: (recordId: string, data: Record<string, unknown>) =>
    updateRecord('feishuAiNewsTableId', recordId, data),

  delete: (recordId: string) =>
    deleteRecord('feishuAiNewsTableId', recordId)
}

// ====== 业务 API：探店素材 ======
export const ShopMaterialsAPI = {
  list: (params?: { pageSize?: number; filter?: string }) =>
    queryRecords('feishuShopMaterialsTableId', params),

  create: (data: {
    title: string; tags: string[]; category: string;
    content: string; sourceLink: string
  }) =>
    createRecord('feishuShopMaterialsTableId', {
      '标题': data.title,
      '标签': data.tags,
      '探店分类': data.category,
      '正文内容': data.content,
      '来源链接': data.sourceLink,
      '创建时间': Date.now()
    }),

  update: (recordId: string, data: Record<string, unknown>) =>
    updateRecord('feishuShopMaterialsTableId', recordId, data),

  delete: (recordId: string) =>
    deleteRecord('feishuShopMaterialsTableId', recordId)
}

// ====== 业务 API：每日简报 ======
export const DailyBriefsAPI = {
  list: (params?: { pageSize?: number }) =>
    queryRecords('feishuDailyBriefsTableId', params),

  create: (data: {
    title: string; content: string; newsCount: number; materialCount: number
  }) =>
    createRecord('feishuDailyBriefsTableId', {
      '日期': new Date().toISOString().slice(0, 10),
      '标题': data.title,
      '内容': data.content,
      '资讯数': data.newsCount,
      '素材数': data.materialCount,
      '创建时间': Date.now()
    }),

  delete: (recordId: string) =>
    deleteRecord('feishuDailyBriefsTableId', recordId)
}

// 获取所有记录（自动翻页）
export async function fetchAllRecords(
  tableIdKey: string,
  filter?: string
): Promise<FeishuRecordItem[]> {
  const allItems: FeishuRecordItem[] = []
  let pageToken: string | undefined

  do {
    const result = await queryRecords(tableIdKey, {
      pageSize: 200,
      pageToken,
      filter
    })
    allItems.push(...result.items)
    pageToken = result.hasMore ? result.pageToken : undefined
  } while (pageToken)

  return allItems
}

// 验证飞书配置
export async function verifyFeishuConfig(): Promise<boolean> {
  try {
    await getTenantAccessToken()
    return true
  } catch {
    return false
  }
}

// 清除 Token 缓存（配置变更时调用）
export function clearFeishuToken() {
  cachedToken = ''
  tokenExpiresAt = 0
}
