// ====== 大模型调用（用于自动生成学习资料 / 全局 AI 助手）======
import { SettingsDB } from './db'

interface ProviderConfig {
  url: string
  model: string
  label: string
}

const PROVIDERS: Record<string, ProviderConfig> = {
  deepseek: {
    url: 'https://api.deepseek.com/chat/completions',
    model: 'deepseek-chat',
    label: 'DeepSeek'
  },
  siliconflow: {
    url: 'https://api.siliconflow.cn/v1/chat/completions',
    model: 'Qwen/Qwen2.5-14B-Instruct',
    label: '硅基流动'
  },
  lingyi: {
    url: 'https://api.lingyiwanwu.com/v1/chat/completions',
    model: 'yi-large',
    label: '零一万物'
  }
}

/**
 * 各服务商提供的可选模型清单（供设置页选择具体模型）。
 * 未列出的模型可在设置页以「自定义模型名」输入。
 */
export const PROVIDER_MODELS: Record<string, { value: string; label: string }[]> = {
  deepseek: [
    { value: 'deepseek-chat', label: 'DeepSeek-V3（deepseek-chat）· 通用对话' },
    { value: 'deepseek-reasoner', label: 'DeepSeek-R1（deepseek-reasoner）· 深度推理' }
  ],
  siliconflow: [
    { value: 'Qwen/Qwen2.5-14B-Instruct', label: 'Qwen2.5-14B' },
    { value: 'Qwen/Qwen2.5-32B-Instruct', label: 'Qwen2.5-32B' },
    { value: 'Qwen/Qwen2.5-72B-Instruct', label: 'Qwen2.5-72B' },
    { value: 'deepseek-ai/DeepSeek-V3', label: 'DeepSeek-V3' },
    { value: 'deepseek-ai/DeepSeek-R1', label: 'DeepSeek-R1' },
    { value: 'THUDM/glm-4-9b-chat', label: 'GLM-4-9B' },
    { value: 'meta-llama/Llama-3.1-8B-Instruct', label: 'Llama-3.1-8B' }
  ],
  lingyi: [
    { value: 'yi-large', label: 'Yi-Large · 旗舰' },
    { value: 'yi-large-turbo', label: 'Yi-Large-Turbo · 高速' },
    { value: 'yi-medium', label: 'Yi-Medium' },
    { value: 'yi-spark', label: 'Yi-Spark · 轻量' }
  ]
}

export interface LlmStatus {
  ready: boolean
  provider: string
  label: string
  model: string
  reason?: string
}

export type ChatRole = 'system' | 'user' | 'assistant'
export interface ChatMessage {
  role: ChatRole
  content: string
}

/** 读取设置中「实际生效」的模型名（自定义或未配置时回退到厂商默认） */
function resolveModel(provider: string, saved?: string): string {
  const cfg = PROVIDERS[provider]
  if (!cfg) return saved || ''
  return saved && saved.trim() ? saved.trim() : cfg.model
}

/** 检查大模型是否已配置可用 */
export async function checkLlm(): Promise<LlmStatus> {
  const s = await SettingsDB.get()
  const provider = (s.llmProvider as string) || 'none'
  if (provider === 'none' || !PROVIDERS[provider]) {
    return { ready: false, provider, label: '未配置', model: '', reason: '未选择服务商' }
  }
  const model = resolveModel(provider, s.llmModel as string)
  const key = await SettingsDB.getSecret('llmApiKey')
  if (!key) {
    return { ready: false, provider, label: PROVIDERS[provider].label, model, reason: '缺少 API Key' }
  }
  return { ready: true, provider, label: PROVIDERS[provider].label, model }
}

/**
 * 真实联通性测试：用一条极短对话验证 API Key + 所选模型是否生效。
 * 读取已保存的配置（调用前应 saveLLM）。
 */
export async function testLlm(): Promise<{ ok: boolean; model?: string; error?: string }> {
  const s = await SettingsDB.get()
  const provider = (s.llmProvider as string) || 'none'
  const cfg = PROVIDERS[provider]
  if (!cfg) return { ok: false, error: '未选择服务商' }
  const key = await SettingsDB.getSecret('llmApiKey')
  if (!key) return { ok: false, error: '缺少 API Key' }
  const model = resolveModel(provider, s.llmModel as string)
  let resp: Response
  try {
    resp = await fetch(cfg.url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${key}`
      },
      body: JSON.stringify({
        model,
        messages: [{ role: 'user', content: 'ping' }],
        max_tokens: 8,
        stream: false
      })
    })
  } catch {
    return { ok: false, error: `无法连接 ${cfg.label}，可能是网络或跨域限制` }
  }
  if (!resp.ok) {
    const text = await resp.text().catch(() => '')
    if (resp.status === 401) return { ok: false, error: '鉴权失败，请检查 API Key' }
    if (resp.status === 402) return { ok: false, error: '余额不足，请充值' }
    if (resp.status === 429) return { ok: false, error: '请求过于频繁，稍后再试' }
    return { ok: false, error: `返回 ${resp.status}：${text.slice(0, 120)}` }
  }
  return { ok: true, model }
}

/**
 * 发起一次对话补全，返回纯文本内容。
 * - 兼容旧用法：直接传 prompt 字符串，等价于单条 user 消息。
 * - 多轮对话：通过 opts.messages 传入完整消息数组（可含 system / user / assistant）。
 * 失败时抛出带可读信息的 Error。
 */
export async function chat(
  prompt: string,
  opts?: { temperature?: number; maxTokens?: number; messages?: ChatMessage[] }
): Promise<string> {
  const s = await SettingsDB.get()
  const provider = (s.llmProvider as string) || 'none'
  const cfg = PROVIDERS[provider]
  if (!cfg) throw new Error('未配置大模型服务商，请先到「设置」中选择并填写 API Key')

  const key = await SettingsDB.getSecret('llmApiKey')
  if (!key) throw new Error(`${cfg.label} 的 API Key 为空，请到「设置」中填写`)

  const model = resolveModel(provider, s.llmModel as string)
  const messages = opts?.messages ?? [{ role: 'user', content: prompt }]

  let resp: Response
  try {
    resp = await fetch(cfg.url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${key}`
      },
      body: JSON.stringify({
        model,
        messages,
        temperature: opts?.temperature ?? 0.7,
        max_tokens: opts?.maxTokens ?? 4000,
        stream: false
      })
    })
  } catch {
    throw new Error(`无法连接 ${cfg.label}，可能是网络或跨域限制`)
  }

  if (!resp.ok) {
    const text = await resp.text().catch(() => '')
    if (resp.status === 401) throw new Error(`${cfg.label} 鉴权失败，请检查 API Key`)
    if (resp.status === 402) throw new Error(`${cfg.label} 余额不足，请充值`)
    if (resp.status === 429) throw new Error(`${cfg.label} 请求过于频繁，稍后再试`)
    throw new Error(`${cfg.label} 返回 ${resp.status}：${text.slice(0, 120)}`)
  }

  const data = await resp.json()
  const content = data?.choices?.[0]?.message?.content
  if (!content) throw new Error('模型返回内容为空')
  return String(content)
}
