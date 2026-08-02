import type { EnglishLesson } from '../types'
import { LESSONS_A } from './englishLessonsA'
import { LESSONS_B } from './englishLessonsB'

/**
 * 内置英语学习资料库（10 个主题单元）
 * 每个学习块（短语 / 句子 / 段落 / 口语）都是一个「池」，
 * 界面按批展示，点刷新换下一批，进度条随之重置。
 */
export const ENGLISH_LESSONS: EnglishLesson[] = [...LESSONS_A, ...LESSONS_B]

/** 按日期轮换今日推荐单元 */
export function getTodayLesson(date = new Date()): EnglishLesson {
  const start = new Date(date.getFullYear(), 0, 0)
  const dayOfYear = Math.floor((date.getTime() - start.getTime()) / 86400000)
  return ENGLISH_LESSONS[dayOfYear % ENGLISH_LESSONS.length]
}

// ══════════════════ 自建单元：AI 生成 ══════════════════

/** 每个学习块生成的条目数量要求 */
export const GEN_SPEC = {
  phrases: 12,
  sentences: 12,
  paragraphs: 2,
  dialogues: 2,
  dialogueLines: 6,
  tips: 3
}

/**
 * 构造给大模型的提示词。
 * 用户也可以复制这段提示词，粘到任意 AI 网页对话里，再把返回的 JSON 导入。
 */
export function buildLessonPrompt(theme: string, desc: string, level: string): string {
  return `你是一位资深英语教学设计师。请为下面这个学习单元设计一份高质量的英语学习资料，严格以 JSON 格式返回，不要输出任何解释文字或 Markdown 代码块以外的内容。

单元主题：${theme}
适用场景/描述：${desc || '（未提供，请根据主题自行合理设定）'}
难度：${level}

要求：
1. phrases：${GEN_SPEC.phrases} 条高频短语或搭配，每条含 en（英文）和 zh（中文释义，可含用法提示）。要地道、真实场景常用，不要教科书式生硬表达。
2. sentences：${GEN_SPEC.sentences} 条完整实用句子，每条含 en 和 zh。句子长度中等（10-20 词），能直接用于真实对话。
3. paragraphs：${GEN_SPEC.paragraphs} 篇精读短文，每篇含 title（英文标题）、en（60-90 词的英文段落）、zh（对应中文翻译）。内容要有观点和信息量，不要空泛。
4. dialogues：${GEN_SPEC.dialogues} 组口语对话，每组 ${GEN_SPEC.dialogueLines} 轮，每轮含 role（简短角色名，如 A/B/PM/Coach）、en、zh。对话要自然连贯，有起承转合。
5. tips：${GEN_SPEC.tips} 条中文学习提示，针对本单元的表达难点或练习方法。

返回的 JSON 结构必须严格如下（字段名不可更改）：
{
  "theme": "${theme}",
  "emoji": "一个最贴切的 emoji",
  "level": "${level}",
  "desc": "一句话描述这个单元",
  "phrases": [{"en": "", "zh": ""}],
  "sentences": [{"en": "", "zh": ""}],
  "paragraphs": [{"title": "", "en": "", "zh": ""}],
  "dialogues": [[{"role": "", "en": "", "zh": ""}]],
  "tips": [""]
}`
}

/** 从 AI 返回的文本中提取并规范化为 EnglishLesson */
export function parseLessonJson(
  raw: string,
  fallback: { theme: string; desc: string; level: string }
): EnglishLesson {
  // 剥离 Markdown 代码块围栏
  let text = raw.trim()
  const fence = text.match(/```(?:json)?\s*([\s\S]*?)```/)
  if (fence) text = fence[1].trim()
  // 容错：截取第一个 { 到最后一个 }
  const s = text.indexOf('{')
  const e = text.lastIndexOf('}')
  if (s >= 0 && e > s) text = text.slice(s, e + 1)

  const obj = JSON.parse(text) as Record<string, unknown>

  const pairs = (v: unknown) =>
    Array.isArray(v)
      ? v
          .map(x => ({ en: String((x as never)?.['en'] ?? ''), zh: String((x as never)?.['zh'] ?? '') }))
          .filter(x => x.en)
      : []

  const paragraphs = Array.isArray(obj.paragraphs)
    ? (obj.paragraphs as never[])
        .map(p => ({
          title: String(p?.['title'] ?? '精读'),
          en: String(p?.['en'] ?? ''),
          zh: String(p?.['zh'] ?? '')
        }))
        .filter(p => p.en)
    : []

  const dialogues = Array.isArray(obj.dialogues)
    ? (obj.dialogues as never[])
        .map(group =>
          Array.isArray(group)
            ? (group as never[])
                .map(l => ({
                  role: String(l?.['role'] ?? 'A'),
                  en: String(l?.['en'] ?? ''),
                  zh: String(l?.['zh'] ?? '')
                }))
                .filter(l => l.en)
            : []
        )
        .filter(g => g.length > 0)
    : []

  const phrases = pairs(obj.phrases)
  const sentences = pairs(obj.sentences)

  if (phrases.length === 0 && sentences.length === 0 && paragraphs.length === 0) {
    throw new Error('返回内容缺少有效的学习资料字段')
  }

  const lvRaw = String(obj.level ?? fallback.level)
  const level: EnglishLesson['level'] =
    lvRaw === '入门' || lvRaw === '进阶' || lvRaw === '高阶' ? lvRaw : (fallback.level as EnglishLesson['level'])

  return {
    id: `custom-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
    theme: String(obj.theme || fallback.theme),
    emoji: String(obj.emoji || '📘').slice(0, 4),
    level,
    desc: String(obj.desc || fallback.desc),
    custom: true,
    createdAt: new Date().toISOString(),
    phrases,
    sentences,
    paragraphs,
    dialogues,
    tips: Array.isArray(obj.tips) ? (obj.tips as unknown[]).map(String).filter(Boolean) : []
  }
}
