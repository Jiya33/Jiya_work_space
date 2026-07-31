// ====== 免费 RSS 资讯采集服务 ======
// 纯前端跨域方案：使用公共 CORS 代理，多路 fallback
import type { NewsItem, NewsSource } from '../types'

/** 内置免费资讯源（全部为公开 RSS，无需 API Key） */
export const BUILTIN_SOURCES: NewsSource[] = [
  { id: 'qbitai', name: '量子位', url: 'https://www.qbitai.com/feed', enabled: true, builtin: true },
  { id: 'jiqizhixin', name: '机器之心', url: 'https://www.jiqizhixin.com/rss', enabled: true, builtin: true },
  { id: 'ifanr', name: '爱范儿', url: 'https://www.ifanr.com/feed', enabled: true, builtin: true },
  { id: '36kr', name: '36氪', url: 'https://36kr.com/feed', enabled: true, builtin: true },
  { id: 'woshipm', name: '人人都是产品经理', url: 'https://www.woshipm.com/feed', enabled: true, builtin: true },
  { id: 'sspai', name: '少数派', url: 'https://sspai.com/feed', enabled: false, builtin: true },
  { id: 'infoq', name: 'InfoQ 中文', url: 'https://www.infoq.cn/feed', enabled: false, builtin: true },
  { id: 'openai', name: 'OpenAI News', url: 'https://openai.com/news/rss.xml', enabled: true, builtin: true },
  { id: 'googleai', name: 'Google AI Blog', url: 'https://blog.google/technology/ai/rss/', enabled: false, builtin: true },
  { id: 'hn', name: 'Hacker News 热门', url: 'https://hnrss.org/frontpage?points=150', enabled: false, builtin: true },
  { id: 'github-trending', name: 'GitHub Trending', url: 'https://rsshub.rssforever.com/github/trending/daily/any', enabled: false, builtin: true }
]

/** CORS 代理列表，依次尝试 */
const PROXIES = [
  (u: string) => `https://api.allorigins.win/raw?url=${encodeURIComponent(u)}`,
  (u: string) => `https://api.codetabs.com/v1/proxy?quest=${encodeURIComponent(u)}`,
  (u: string) => `https://corsproxy.io/?url=${encodeURIComponent(u)}`,
  (u: string) => `https://thingproxy.freeboard.io/fetch/${u}`
]

const FETCH_TIMEOUT = 15000

async function fetchWithTimeout(url: string, ms = FETCH_TIMEOUT): Promise<string> {
  const controller = new AbortController()
  const timer = setTimeout(() => controller.abort(), ms)
  try {
    const resp = await fetch(url, { signal: controller.signal })
    if (!resp.ok) throw new Error(`HTTP ${resp.status}`)
    const text = await resp.text()
    if (!text || text.length < 50) throw new Error('内容为空')
    return text
  } finally {
    clearTimeout(timer)
  }
}

/** 通过代理获取 RSS 原文 */
async function fetchViaProxy(feedUrl: string): Promise<string> {
  let lastErr: unknown = null
  for (const build of PROXIES) {
    try {
      return await fetchWithTimeout(build(feedUrl))
    } catch (e) {
      lastErr = e
    }
  }
  throw new Error(`所有代理均失败：${(lastErr as Error)?.message || '未知错误'}`)
}

function stripHtml(html: string, maxLen = 180): string {
  const text = html
    .replace(/<script[\s\S]*?<\/script>/gi, '')
    .replace(/<style[\s\S]*?<\/style>/gi, '')
    .replace(/<[^>]+>/g, '')
    .replace(/&nbsp;/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/\s+/g, ' ')
    .trim()
  return text.length > maxLen ? text.slice(0, maxLen) + '…' : text
}

/** 关键词自动分类 */
const CATEGORY_RULES: { cat: string; words: string[] }[] = [
  { cat: '新开源', words: ['开源', 'open source', 'open-source', 'github', 'apache', 'mit license', '代码库', 'sdk', '框架', 'repo'] },
  { cat: '新产品', words: ['发布', '上线', '推出', '亮相', '新品', 'launch', 'release', 'announce', '上架', '公测', '内测', 'app', '产品'] },
  { cat: '新技术', words: ['模型', '算法', '架构', '训练', '推理', 'llm', 'gpt', 'transformer', 'diffusion', '论文', '研究', 'benchmark', '多模态', 'agent'] },
  { cat: '新点子', words: ['观点', '思考', '方法论', '案例', '复盘', '增长', '设计', '洞察', '趋势', '如何', '为什么'] }
]

export function classifyNews(title: string, summary: string): string {
  const text = `${title} ${summary}`.toLowerCase()
  let best = { cat: '新技术', score: 0 }
  for (const rule of CATEGORY_RULES) {
    let score = 0
    for (const w of rule.words) {
      if (text.includes(w)) score++
    }
    if (score > best.score) best = { cat: rule.cat, score }
  }
  return best.cat
}

/** 解析 RSS 2.0 / Atom */
function parseFeed(xml: string, sourceName: string): Omit<NewsItem, 'id'>[] {
  const parser = new DOMParser()
  const doc = parser.parseFromString(xml, 'text/xml')
  if (doc.querySelector('parsererror')) {
    // 有些代理会包一层 HTML，尝试用 html 模式再解析
    const doc2 = parser.parseFromString(xml, 'text/html')
    if (!doc2.querySelector('item, entry')) throw new Error('XML 解析失败')
    return extractItems(doc2, sourceName)
  }
  return extractItems(doc, sourceName)
}

function textOf(el: Element | null): string {
  return el?.textContent?.trim() || ''
}

function extractItems(doc: Document, sourceName: string): Omit<NewsItem, 'id'>[] {
  const nodes = Array.from(doc.querySelectorAll('item, entry'))
  const now = new Date().toISOString()
  const result: Omit<NewsItem, 'id'>[] = []

  for (const node of nodes.slice(0, 30)) {
    const title = textOf(node.querySelector('title'))
    if (!title) continue

    // link：RSS 用 <link>text</link>，Atom 用 <link href="">
    let link = textOf(node.querySelector('link'))
    if (!link) {
      const linkEl = node.querySelector('link[href]')
      link = linkEl?.getAttribute('href') || ''
    }
    if (!link) link = textOf(node.querySelector('guid'))
    if (!link) continue

    const rawSummary =
      textOf(node.querySelector('description')) ||
      textOf(node.querySelector('summary')) ||
      textOf(node.querySelector('content')) ||
      ''
    const summary = stripHtml(rawSummary)

    const rawDate =
      textOf(node.querySelector('pubDate')) ||
      textOf(node.querySelector('published')) ||
      textOf(node.querySelector('updated')) ||
      ''
    let pubDate = now
    if (rawDate) {
      const d = new Date(rawDate)
      if (!isNaN(d.getTime())) pubDate = d.toISOString()
    }

    result.push({
      title: stripHtml(title, 120),
      link: link.trim(),
      summary,
      source: sourceName,
      category: classifyNews(title, summary),
      pubDate,
      isRead: false,
      isFavorite: false,
      createdAt: now
    })
  }
  return result
}

export interface FetchResult {
  source: string
  ok: boolean
  count: number
  error?: string
}

/** 抓取单个源 */
export async function fetchSource(source: NewsSource): Promise<Omit<NewsItem, 'id'>[]> {
  const xml = await fetchViaProxy(source.url)
  return parseFeed(xml, source.name)
}

/** 并发抓取全部启用的源 */
export async function fetchAllSources(
  sources: NewsSource[],
  onProgress?: (done: number, total: number, name: string) => void
): Promise<{ items: Omit<NewsItem, 'id'>[]; results: FetchResult[] }> {
  const enabled = sources.filter(s => s.enabled)
  const results: FetchResult[] = []
  const items: Omit<NewsItem, 'id'>[] = []
  let done = 0

  await Promise.all(
    enabled.map(async (src) => {
      try {
        const list = await fetchSource(src)
        items.push(...list)
        results.push({ source: src.name, ok: true, count: list.length })
      } catch (e) {
        results.push({ source: src.name, ok: false, count: 0, error: (e as Error).message })
      } finally {
        done++
        onProgress?.(done, enabled.length, src.name)
      }
    })
  )

  items.sort((a, b) => new Date(b.pubDate).getTime() - new Date(a.pubDate).getTime())
  return { items, results }
}

/** 生成 Markdown（用于复制到腾讯文档 / 其他知识库） */
export function toMarkdown(items: NewsItem[], title = 'AI 资讯精选'): string {
  const date = new Date().toLocaleDateString('zh-CN')
  const lines: string[] = [`# ${title}（${date}）`, '']
  const byCat: Record<string, NewsItem[]> = {}
  for (const i of items) {
    ;(byCat[i.category] ||= []).push(i)
  }
  for (const [cat, list] of Object.entries(byCat)) {
    lines.push(`## ${cat}（${list.length}）`, '')
    list.forEach((n, idx) => {
      lines.push(`${idx + 1}. **[${n.title}](${n.link})**`)
      if (n.summary) lines.push(`   > ${n.summary}`)
      lines.push(`   > 来源：${n.source} · ${new Date(n.pubDate).toLocaleDateString('zh-CN')}`)
      lines.push('')
    })
  }
  return lines.join('\n')
}
