// ====== 工作台 AI 助手：实时数据上下文 ======
import {
  ExpenseDB, NewsDB, EnglishCheckInDB, TodoDB, SportDB, SettingsDB
} from './db'
import { today } from '../utils/format'
import { getTodayLesson } from '../data/english'

const WEEKDAYS = ['周日', '周一', '周二', '周三', '周四', '周五', '周六']

/**
 * 收集工作台当前（以今日为主）的真实数据，整理成结构化文本，
 * 注入给大模型作为回答依据，避免模型凭空编造。
 */
export async function buildWorkbenchContext(): Promise<string> {
  const t = today()
  const now = new Date()
  const out: string[] = []

  out.push(`当前日期：${t}（${WEEKDAYS[now.getDay()]}）`)

  // ===== 今日收支 =====
  const expenses = await ExpenseDB.getAll()
  const todayExp = expenses.filter(e => e.date === t)
  const income = todayExp.filter(e => e.type === 'income').reduce((s, e) => s + e.amount, 0)
  const spend = todayExp.filter(e => e.type !== 'income').reduce((s, e) => s + e.amount, 0)
  out.push('\n【今日收支】')
  out.push(`- 收入 ¥${income.toFixed(2)}，支出 ¥${spend.toFixed(2)}，结余 ¥${(income - spend).toFixed(2)}`)
  if (todayExp.length) {
    const byCat: Record<string, number> = {}
    todayExp.forEach(e => { byCat[e.category] = (byCat[e.category] || 0) + e.amount })
    out.push('- 分类明细：' + Object.entries(byCat).map(([c, a]) => `${c} ¥${a.toFixed(2)}`).join('，'))
  } else {
    out.push('- 今日暂无记账记录')
  }

  // ===== 今日任务 =====
  const todos = await TodoDB.getAll()
  const todayTodos = todos.filter(td => td.date === t)
  const done = todayTodos.filter(td => td.completed).length
  out.push('\n【今日任务】')
  out.push(`- 共 ${todayTodos.length} 项，已完成 ${done} 项，待办 ${todayTodos.length - done} 项`)
  todayTodos.forEach(td => out.push(`  - [${td.completed ? '✓' : ' '}] ${td.content}`))

  // ===== 英语学习 =====
  const checkins = await EnglishCheckInDB.getByDate(t)
  const lesson = getTodayLesson(now)
  out.push('\n【英语学习】')
  out.push(`- 今日单元：${lesson.theme}（${lesson.level}）`)
  out.push(`- 打卡状态：${checkins.length > 0 ? '已完成 ✅' : '未完成 ❌'}`)
  out.push(`- 单元内容：${lesson.phrases?.length || 0} 短语 / ${lesson.sentences?.length || 0} 句子 / ${lesson.paragraphs?.length || 0} 段落 / ${lesson.dialogues?.length || 0} 对话`)

  // ===== 今日运动 =====
  const settings = await SettingsDB.get()
  const plan = (settings.sportPlans || []).find(p => p.weekday === now.getDay())
  const sportRec = await SportDB.getByDate(t)
  out.push('\n【今日运动】')
  out.push(plan ? `- 计划：${plan.type} ${plan.duration} 分钟` : '- 今日无运动计划')
  out.push(sportRec.length ? `- 已记录 ${sportRec.length} 次运动` : '- 暂无运动记录')

  // ===== AI 资讯 =====
  const news = await NewsDB.getAll()
  const todayNews = news.filter(n => (n.pubDate || n.createdAt || '').slice(0, 10) === t)
  const pool = todayNews.length
    ? todayNews
    : news.slice().sort((a, b) =>
        new Date(b.pubDate || b.createdAt || 0).getTime() - new Date(a.pubDate || a.createdAt || 0).getTime())
  const top = pool.slice(0, 20)
  out.push('\n【AI 资讯】')
  out.push(todayNews.length
    ? `- 今日新增 ${todayNews.length} 条`
    : `- 无今日数据，展示最近 ${top.length} 条`)
  const byCat: Record<string, number> = {}
  top.forEach(n => { byCat[n.category] = (byCat[n.category] || 0) + 1 })
  out.push('- 分类分布：' + Object.entries(byCat).map(([c, n]) => `${c} ${n}`).join('，'))
  top.slice(0, 15).forEach(n => out.push(`  · [${n.category}] ${n.title}（来源：${n.source}）`))

  return out.join('\n')
}
