// ====== 通用工具函数 ======

export function today(): string {
  return new Date().toISOString().slice(0, 10)
}

export function now(): string {
  return new Date().toISOString()
}

export function formatDate(dateStr: string): string {
  const d = new Date(dateStr)
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
}

export function formatDateTime(dateStr: string): string {
  const d = new Date(dateStr)
  const date = formatDate(dateStr)
  const time = `${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`
  return `${date} ${time}`
}

export function formatCurrency(amount: number): string {
  return `¥${amount.toFixed(2)}`
}

export function daysAgo(n: number): string {
  const d = new Date()
  d.setDate(d.getDate() - n)
  return d.toISOString().slice(0, 10)
}

export function getWeekRange(dateStr?: string): { start: string; end: string } {
  const d = dateStr ? new Date(dateStr) : new Date()
  const day = d.getDay()
  const diff = d.getDate() - day + (day === 0 ? -6 : 1) // Monday start
  const monday = new Date(d.setDate(diff))
  const sunday = new Date(monday)
  sunday.setDate(monday.getDate() + 6)
  return {
    start: monday.toISOString().slice(0, 10),
    end: sunday.toISOString().slice(0, 10)
  }
}

export function getMonthRange(dateStr?: string): { start: string; end: string } {
  const d = dateStr ? new Date(dateStr) : new Date()
  const start = new Date(d.getFullYear(), d.getMonth(), 1)
  const end = new Date(d.getFullYear(), d.getMonth() + 1, 0)
  return {
    start: start.toISOString().slice(0, 10),
    end: end.toISOString().slice(0, 10)
  }
}

export function getQuarterRange(dateStr?: string): { start: string; end: string } {
  const d = dateStr ? new Date(dateStr) : new Date()
  const q = Math.floor(d.getMonth() / 3)
  const start = new Date(d.getFullYear(), q * 3, 1)
  const end = new Date(d.getFullYear(), q * 3 + 3, 0)
  return {
    start: start.toISOString().slice(0, 10),
    end: end.toISOString().slice(0, 10)
  }
}

export function getYearRange(dateStr?: string): { start: string; end: string } {
  const d = dateStr ? new Date(dateStr) : new Date()
  const start = new Date(d.getFullYear(), 0, 1)
  const end = new Date(d.getFullYear(), 11, 31)
  return {
    start: start.toISOString().slice(0, 10),
    end: end.toISOString().slice(0, 10)
  }
}

export function getDaysInMonth(year: number, month: number): number {
  return new Date(year, month + 1, 0).getDate()
}

export function getMonthCalendar(year: number, month: number): (number | null)[][] {
  const firstDay = new Date(year, month, 1).getDay()
  const days = getDaysInMonth(year, month)
  const weeks: (number | null)[][] = []
  let week: (number | null)[] = []

  for (let i = 0; i < firstDay; i++) week.push(null)
  for (let d = 1; d <= days; d++) {
    week.push(d)
    if (week.length === 7) {
      weeks.push(week)
      week = []
    }
  }
  if (week.length > 0) {
    while (week.length < 7) week.push(null)
    weeks.push(week)
  }
  return weeks
}

export function debounce<T extends (...args: unknown[]) => void>(
  fn: T,
  delay: number
): (...args: Parameters<T>) => void {
  let timer: ReturnType<typeof setTimeout>
  return (...args: Parameters<T>) => {
    clearTimeout(timer)
    timer = setTimeout(() => fn(...args), delay)
  }
}

export function copyToClipboard(text: string): Promise<void> {
  if (navigator.clipboard) {
    return navigator.clipboard.writeText(text)
  }
  const textarea = document.createElement('textarea')
  textarea.value = text
  textarea.style.position = 'fixed'
  textarea.style.opacity = '0'
  document.body.appendChild(textarea)
  textarea.select()
  document.execCommand('copy')
  document.body.removeChild(textarea)
  return Promise.resolve()
}

// 颜色方案
export const CATEGORY_COLORS: Record<string, string> = {
  '餐饮': '#FF6B6B',
  '购物': '#4ECDC4',
  '交通': '#45B7D1',
  '娱乐': '#96CEB4',
  '医疗': '#FFEAA7',
  '其他': '#DDA0DD'
}

export const CATEGORY_ICONS: Record<string, string> = {
  '餐饮': '🍽️',
  '购物': '🛍️',
  '交通': '🚗',
  '娱乐': '🎮',
  '医疗': '💊',
  '其他': '📦'
}
