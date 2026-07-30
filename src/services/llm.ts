// ====== 大模型 API 服务 ======
import { SettingsDB } from './db'

interface LLMResponse {
  choices: { message: { content: string } }[]
}

export async function callLLM(prompt: string): Promise<string> {
  const settings = await SettingsDB.get()
  const apiKey = await SettingsDB.getSecret('llmApiKey')
  const provider = (settings.llmProvider || 'none') as string

  if (!apiKey || provider === 'none') return ''

  const endpoints: Record<string, { url: string; model: string }> = {
    deepseek: { url: 'https://api.deepseek.com/v1/chat/completions', model: 'deepseek-chat' },
    siliconflow: { url: 'https://api.siliconflow.cn/v1/chat/completions', model: 'Qwen/Qwen2.5-7B-Instruct' },
    lingyi: { url: 'https://api.lingyiwanwu.com/v1/chat/completions', model: 'yi-large' }
  }

  const config = endpoints[provider]
  if (!config) return ''

  try {
    const resp = await fetch(config.url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`
      },
      body: JSON.stringify({
        model: config.model,
        messages: [
          { role: 'system', content: '你是一个专业的内容创作者，擅长撰写爆款笔记和内容整理。' },
          { role: 'user', content: prompt }
        ],
        max_tokens: 4096,
        temperature: 0.8
      })
    })
    const data: LLMResponse = await resp.json()
    return data.choices?.[0]?.message?.content || ''
  } catch (e) {
    console.error('LLM API 调用失败:', e)
    return ''
  }
}

// 生成爆款笔记
export async function generateTrendingNotes(
  materials: { title: string; tags: string[]; content: string }[],
  news: { title: string; summary: string; category: string }[]
): Promise<string> {
  const apiKey = await SettingsDB.getSecret('llmApiKey')
  if (!apiKey) return '' // 使用规则模板

  const materialText = materials.map(m =>
    `[素材] 标题: ${m.title} | 标签: ${m.tags.join(',')} | 内容: ${m.content.slice(0, 200)}`
  ).join('\n')

  const newsText = news.map(n =>
    `[资讯] 标题: ${n.title} | 分类: ${n.category} | 摘要: ${n.summary}`
  ).join('\n')

  const prompt = `基于以下探店素材和AI行业资讯，生成3篇"爆款文案"。
每篇包含：吸引眼球的标题、内容大纲（3-5点）、推荐标签组合（3-5个标签）。

=== 探店素材 ===
${materialText.slice(0, 3000)}

=== AI 资讯 ===
${newsText.slice(0, 2000)}

请用 Markdown 格式输出。`

  return callLLM(prompt)
}

// 规则模板生成简易报告
export function generateRuleBasedReport(
  materials: { title: string; tags: string[]; content: string }[],
  news: { title: string; summary: string; category: string }[]
): string {
  // 标签统计
  const tagCounts: Record<string, number> = {}
  materials.forEach(m => {
    m.tags.forEach(t => {
      tagCounts[t] = (tagCounts[t] || 0) + 1
    })
  })
  const hotTags = Object.entries(tagCounts)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 10)

  // 关键词统计
  const stopWords = ['的', '了', '在', '是', '和', '与', '及', '或', '等', '从', '到', '为', '对', '上', '下', '中', '有']
  const wordCounts: Record<string, number> = {}
  const allText = [...materials.map(m => m.title + m.content), ...news.map(n => n.title + n.summary)].join('')
  allText.replace(/[\u4e00-\u9fa5]{2,}/g, (word) => {
    if (!stopWords.includes(word)) {
      wordCounts[word] = (wordCounts[word] || 0) + 1
    }
    return word
  })
  const hotWords = Object.entries(wordCounts)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 15)

  // 分类统计
  const catCounts: Record<string, number> = {}
  news.forEach(n => {
    catCounts[n.category] = (catCounts[n.category] || 0) + 1
  })

  const today = new Date().toLocaleDateString('zh-CN')
  let report = `# 📊 今日爆款笔记资讯 (${today})\n\n`
  report += `## 📈 数据总览\n`
  report += `- 探店素材：${materials.length} 条\n`
  report += `- AI 资讯：${news.length} 条\n\n`

  report += `## 🏷️ 热门标签 TOP10\n`
  hotTags.forEach(([tag, count], i) => {
    report += `${i + 1}. ${tag}（${count}次）\n`
  })

  report += `\n## 🔥 热点关键词\n`
  report += hotWords.map(([w, c]) => `\`${w}(${c})\``).join(' ')

  report += `\n\n## 📰 资讯分类分布\n`
  Object.entries(catCounts).forEach(([cat, count]) => {
    report += `- ${cat}: ${count} 条\n`
  })

  report += `\n## 📝 最新素材列表\n`
  materials.slice(0, 10).forEach((m, i) => {
    report += `${i + 1}. **${m.title}** [${m.tags.slice(0, 3).join(', ')}]\n`
  })

  if (materials.length > 10) {
    report += `\n... 还有 ${materials.length - 10} 条素材\n`
  }

  report += `\n## 💡 写作建议\n`
  const topTag = hotTags[0]?.[0] || '探店'
  report += `1. 结合热门标签「${topTag}」创作一篇体验分享\n`
  report += `2. 利用热点关键词串联3-5篇资讯做行业解读\n`
  report += `3. 选取最新素材做「合集推荐」类笔记\n`

  return report
}
