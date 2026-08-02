<script setup lang="ts">
import { ref, computed, onMounted, watch, nextTick } from 'vue'
import { ExpenseDB } from '../services/db'
import { compressImage } from '../services/image'
import {
  today, formatCurrency, formatDate,
  CATEGORY_COLORS, CATEGORY_ICONS, getWeekRange, getMonthRange, getQuarterRange, getYearRange, daysAgo
} from '../utils/format'
import type { Expense } from '../types'

const toast = ref({ show: false, msg: '', type: 'success' })
function showToast(msg: string, type = 'success') {
  toast.value = { show: true, msg, type }
  setTimeout(() => { toast.value.show = false }, 2000)
}

// 所有账单
const expenses = ref<Expense[]>([])
const searchQuery = ref('')
const filterCategory = ref('')
const categories: Expense['category'][] = ['餐饮', '购物', '交通', '娱乐', '医疗', '其他']
const viewMode = ref<'list' | 'stats'>('list')

// 时间筛选
type TimeRange = 'today' | 'week' | 'month' | 'quarter' | 'year' | 'all' | 'custom'
const timeRange = ref<TimeRange>('month')
const customStart = ref(daysAgo(30))
const customEnd = ref(today())

const timeOptions: { key: TimeRange; label: string }[] = [
  { key: 'today', label: '今天' },
  { key: 'week', label: '本周' },
  { key: 'month', label: '本月' },
  { key: 'quarter', label: '本季' },
  { key: 'year', label: '本年' },
  { key: 'all', label: '全部' },
  { key: 'custom', label: '自定义' }
]
const timeLabel = computed(() => timeOptions.find(o => o.key === timeRange.value)?.label || '本月')

function rangeFor(r: TimeRange): { start: string; end: string } {
  switch (r) {
    case 'today': return { start: today(), end: today() }
    case 'week': return getWeekRange()
    case 'month': return getMonthRange()
    case 'quarter': return getQuarterRange()
    case 'year': return getYearRange()
    case 'all': return { start: '0000-01-01', end: '9999-12-31' }
    case 'custom': return { start: customStart.value, end: customEnd.value }
  }
}

const isIncome = (e: Expense) => e.type === 'income'

const filteredExpenses = computed(() => {
  let result = expenses.value
  if (searchQuery.value) {
    const q = searchQuery.value.toLowerCase()
    result = result.filter(e => e.note?.toLowerCase().includes(q) || e.category.includes(q))
  }
  if (filterCategory.value) {
    result = result.filter(e => e.category === filterCategory.value)
  }
  const { start, end } = rangeFor(timeRange.value)
  result = result.filter(e => e.date >= start && e.date <= end)
  return result.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
})

// 选中周期内的收支持衡（收入 - 支出）
const filteredNet = computed(() =>
  filteredExpenses.value.reduce((s, e) => s + (isIncome(e) ? e.amount : -e.amount), 0)
)

// 今日收支（顶部两张卡）
const todayStr = today()
const todayIncome = computed(() =>
  expenses.value.filter(e => e.date === todayStr && isIncome(e)).reduce((s, e) => s + e.amount, 0)
)
const todayExpense = computed(() =>
  expenses.value.filter(e => e.date === todayStr && !isIncome(e)).reduce((s, e) => s + e.amount, 0)
)

// 金额显示：收入 + 绿 / 支出 - 红
function amountText(e: Expense): string {
  return (isIncome(e) ? '+' : '-') + formatCurrency(e.amount)
}
function amountClass(e: Expense): string {
  return isIncome(e) ? 'amt-income' : 'amt-expense'
}

const categoryStats = computed(() => {
  const map: Record<string, number> = {}
  filteredExpenses.value.forEach(e => {
    map[e.category] = (map[e.category] || 0) + e.amount
  })
  return Object.entries(map).sort((a, b) => b[1] - a[1])
})

// 录入
const showAddForm = ref(false)
const editingId = ref<number | null>(null)
const editingCreatedAt = ref('')
const formType = ref<'expense' | 'income'>('expense')
const formAmount = ref('')
const formCategory = ref<Expense['category']>('餐饮')
const formNote = ref('')
const formImage = ref('')
const formImagePreview = ref('')
const formDate = ref(today())

// 拍照 / 相册 两个入口
const cameraInput = ref<HTMLInputElement | null>(null)
const albumInput = ref<HTMLInputElement | null>(null)
function pickCamera() { cameraInput.value?.click() }
function pickAlbum() { albumInput.value?.click() }

async function handleImage(e: Event) {
  const input = e.target as HTMLInputElement
  const file = input.files?.[0]
  if (!file) return
  const compressed = await compressImage(file)
  formImage.value = compressed
  formImagePreview.value = compressed
  input.value = '' // 允许重复选择同一文件
}

// 删除单条记录的凭证图片
async function removeExpenseImage(e: Expense) {
  if (!confirm('确定删除这张凭证图片？')) return
  e.imageBase64 = ''
  await ExpenseDB.update(e)
  showToast('图片已删除')
  loadData()
}

async function saveExpense() {
  const amount = parseFloat(formAmount.value)
  if (!amount || amount <= 0) { showToast('请输入有效金额', 'error'); return }
  const payload = {
    date: formDate.value,
    amount,
    category: formCategory.value,
    note: formNote.value,
    imageBase64: formImage.value,
    type: formType.value
  }
  if (editingId.value != null) {
    await ExpenseDB.update({ ...payload, id: editingId.value, createdAt: editingCreatedAt.value })
    showToast('已更新')
  } else {
    await ExpenseDB.add({ ...payload, createdAt: new Date().toISOString() })
    showToast('添加成功')
  }
  resetForm()
  loadData()
}

// 打开编辑：预填已有记录
function openEdit(e: Expense) {
  editingId.value = e.id ?? null
  editingCreatedAt.value = e.createdAt
  formType.value = e.type || 'expense'
  formAmount.value = String(e.amount)
  formCategory.value = e.category
  formNote.value = e.note
  formDate.value = e.date
  formImage.value = e.imageBase64 || ''
  formImagePreview.value = e.imageBase64 || ''
  showAddForm.value = true
}

function clearFormImage() {
  formImage.value = ''
  formImagePreview.value = ''
}

function resetForm() {
  formAmount.value = ''
  formNote.value = ''
  formImage.value = ''
  formImagePreview.value = ''
  formType.value = 'expense'
  editingId.value = null
  editingCreatedAt.value = ''
  showAddForm.value = false
}

async function deleteExpense(id: number) {
  if (!confirm('确定删除此记录？')) return
  await ExpenseDB.delete(id)
  showToast('已删除')
  loadData()
}

// 导出 JSON
async function exportJSON() {
  const data = JSON.stringify(expenses.value.map(e => ({ ...e, imageBase64: e.imageBase64 ? '[图片]' : '' })), null, 2)
  const blob = new Blob([data], { type: 'application/json' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = `expenses_backup_${today()}.json`
  a.click()
  URL.revokeObjectURL(url)
  showToast('备份已下载')
}

// 简易图表
const showChart = ref(false)
const chartType = ref<'pie' | 'line'>('pie')
const chartCanvas = ref<HTMLCanvasElement | null>(null)
const showFilter = ref(false)

function openChart(type: 'pie' | 'line') {
  chartType.value = type
  showChart.value = true
}

function cssVar(name: string): string {
  return getComputedStyle(document.documentElement).getPropertyValue(name).trim() || '#333'
}

function drawPieChart(ctx: CanvasRenderingContext2D, w: number, h: number) {
  const stats = categoryStats.value
  if (stats.length === 0) return
  const total = stats.reduce((s, [, a]) => s + a, 0)
  const cx = w / 2, cy = h / 2, r = Math.min(w, h) / 2 - 20
  let startAngle = -Math.PI / 2

  ctx.clearRect(0, 0, w, h)
  stats.forEach(([cat, amount]) => {
    const angle = (amount / total) * 2 * Math.PI
    ctx.beginPath()
    ctx.moveTo(cx, cy)
    ctx.arc(cx, cy, r, startAngle, startAngle + angle)
    ctx.fillStyle = CATEGORY_COLORS[cat] || '#ccc'
    ctx.fill()
    ctx.strokeStyle = '#fff'
    ctx.lineWidth = 2
    ctx.stroke()
    startAngle += angle
  })

  // Legend
  let ly = 16
  ctx.font = '12px sans-serif'
  ctx.fillStyle = cssVar('--text-primary')
  stats.forEach(([cat, amount]) => {
    ctx.fillStyle = CATEGORY_COLORS[cat] || '#ccc'
    ctx.fillRect(10, ly, 12, 12)
    ctx.fillStyle = cssVar('--text-primary')
    ctx.fillText(`${CATEGORY_ICONS[cat]} ${cat}: ¥${amount.toFixed(0)}`, 28, ly + 11)
    ly += 20
  })
}

function drawLineChart(ctx: CanvasRenderingContext2D, w: number, h: number) {
  const dailyMap: Record<string, number> = {}
  filteredExpenses.value.forEach(e => { dailyMap[e.date] = (dailyMap[e.date] || 0) + e.amount })
  const entries = Object.entries(dailyMap).sort()
  if (entries.length === 0) return

  const maxAmount = Math.max(...entries.map(([, a]) => a), 1)
  const padding = { top: 20, right: 20, bottom: 40, left: 50 }
  const cw = w - padding.left - padding.right
  const ch = h - padding.top - padding.bottom

  ctx.clearRect(0, 0, w, h)

  // Axes
  ctx.strokeStyle = cssVar('--border')
  ctx.lineWidth = 1
  ctx.beginPath()
  ctx.moveTo(padding.left, padding.top)
  ctx.lineTo(padding.left, h - padding.bottom)
  ctx.lineTo(w - padding.right, h - padding.bottom)
  ctx.stroke()

  // Y axis labels
  ctx.font = '10px sans-serif'
  ctx.fillStyle = cssVar('--text-secondary')
  for (let i = 0; i <= 4; i++) {
    const val = (maxAmount / 4) * i
    const y = h - padding.bottom - (val / maxAmount) * ch
    ctx.fillText(`¥${val.toFixed(0)}`, padding.left - 45, y + 3)
    ctx.beginPath()
    ctx.moveTo(padding.left, y)
    ctx.lineTo(w - padding.right, y)
    ctx.strokeStyle = cssVar('--border')
    ctx.stroke()
  }

  if (entries.length < 2) return

  // Line
  const stepX = cw / (entries.length - 1)
  ctx.strokeStyle = cssVar('--primary')
  ctx.lineWidth = 2
  ctx.beginPath()
  entries.forEach(([, amount], i) => {
    const x = padding.left + i * stepX
    const y = h - padding.bottom - (amount / maxAmount) * ch
    if (i === 0) ctx.moveTo(x, y)
    else ctx.lineTo(x, y)
  })
  ctx.stroke()

  // Dots
  entries.forEach(([, amount], i) => {
    const x = padding.left + i * stepX
    const y = h - padding.bottom - (amount / maxAmount) * ch
    ctx.beginPath()
    ctx.arc(x, y, 4, 0, Math.PI * 2)
    ctx.fillStyle = cssVar('--primary')
    ctx.fill()
  })

  // X labels (show every nth)
  const step = Math.max(1, Math.floor(entries.length / 7))
  ctx.font = '10px sans-serif'
  ctx.fillStyle = cssVar('--text-secondary')
  entries.forEach(([date], i) => {
    if (i % step === 0) {
      const x = padding.left + i * stepX
      ctx.fillText(date.slice(5), x - 20, h - padding.bottom + 16)
    }
  })
}

watch(showChart, async (show) => {
  if (show) {
    await nextTick()
    const canvas = chartCanvas.value
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return
    canvas.width = canvas.offsetWidth * 2
    canvas.height = canvas.offsetHeight * 2
    ctx.scale(2, 2)
    if (chartType.value === 'pie') drawPieChart(ctx, canvas.offsetWidth, canvas.offsetHeight)
    else drawLineChart(ctx, canvas.offsetWidth, canvas.offsetHeight)
  }
})

async function loadData() {
  expenses.value = await ExpenseDB.getAll()
}

onMounted(loadData)
</script>

<template>
  <div class="fin-page">
    <div v-if="toast.show" class="toast" :class="toast.type">{{ toast.msg }}</div>

    <!-- 今日收支概览 -->
    <div class="fin-cards">
      <div class="fin-card income">
        <div class="fin-card-label">📈 今日收入</div>
        <div class="fin-card-amt">{{ formatCurrency(todayIncome) }}</div>
      </div>
      <div class="fin-card expense">
        <div class="fin-card-label">📉 今日支出</div>
        <div class="fin-card-amt">{{ formatCurrency(todayExpense) }}</div>
      </div>
    </div>

    <!-- 明细 -->
    <div class="card">
      <div class="fin-toolbar">
        <input v-model="searchQuery" class="input" placeholder="🔍 搜索备注 / 分类..." />
        <button class="icon-btn" :class="viewMode === 'stats' ? 'on' : ''"
          @click="viewMode = viewMode === 'stats' ? 'list' : 'stats'">📊</button>
        <button class="icon-btn filter" @click="showFilter = true">⏱ 筛选</button>
      </div>
      <div class="fin-sub">
        {{ timeLabel }} · 共 {{ filteredExpenses.length }} 笔 · 结余 {{ formatCurrency(filteredNet) }}
      </div>

      <!-- 列表模式 -->
      <div v-if="viewMode === 'list'">
        <div v-if="filteredExpenses.length === 0" class="empty-state">
          <div style="font-size: 40px;">📭</div>
          <div>暂无记录</div>
        </div>

        <div v-for="e in filteredExpenses" :key="e.id" class="card fin-item">
          <div class="fin-item-row">
            <div class="fin-item-main">
              <div v-if="e.imageBase64"
                style="position: relative; width: 56px; height: 56px; flex-shrink: 0; border-radius: 8px; overflow: hidden;">
                <img :src="e.imageBase64" style="width: 100%; height: 100%; object-fit: cover;" />
                <button class="img-del-btn" title="删除图片" @click="removeExpenseImage(e)">✕</button>
              </div>
              <div class="fin-item-body">
                <span :class="amountClass(e)" style="font-size: 17px; font-weight: 700;">{{ amountText(e) }}</span>
                <div style="display: flex; gap: 8px; margin-top: 4px; font-size: 12px; color: var(--text-secondary); flex-wrap: wrap;">
                  <span class="tag tag-primary">{{ CATEGORY_ICONS[e.category] }} {{ e.category }}</span>
                  <span>{{ formatDate(e.date) }}</span>
                  <span v-if="isIncome(e)" class="tag" style="background: rgba(16,185,129,.12); color: var(--success);">收入</span>
                </div>
                <div v-if="e.note" style="font-size: 13px; color: var(--text-muted); margin-top: 4px;">{{ e.note }}</div>
              </div>
            </div>
            <div class="fin-item-actions">
              <button class="icon-act" title="编辑" @click="openEdit(e)">✏️</button>
              <button class="icon-act danger" title="删除" @click="deleteExpense(e.id!)">🗑</button>
            </div>
          </div>
        </div>
      </div>

      <!-- 统计模式 -->
      <div v-else>
        <div style="display: flex; gap: 8px; margin-bottom: 12px;">
          <button class="btn btn-sm" :class="chartType === 'pie' ? 'btn-primary' : 'btn-secondary'"
            @click="openChart('pie')">🥧 饼图</button>
          <button class="btn btn-sm" :class="chartType === 'line' ? 'btn-primary' : 'btn-secondary'"
            @click="openChart('line')">📈 趋势</button>
        </div>
        <div class="card">
          <div class="card-title">📊 分类统计（{{ timeLabel }}）</div>
          <div v-for="[cat, amount] in categoryStats" :key="cat"
            style="display: flex; justify-content: space-between; align-items: center; padding: 8px 0; font-size: 14px;">
            <span>{{ CATEGORY_ICONS[cat] }} {{ cat }}</span>
            <span style="font-weight: 600;">{{ formatCurrency(amount) }}</span>
          </div>
        </div>
      </div>
    </div>

    <div class="fin-spacer"></div>

    <!-- 底部居中浮动记账按钮 -->
    <button class="fab" @click="showAddForm = true">＋ 记账</button>

    <!-- 筛选浮层 -->
    <div v-if="showFilter" class="modal-overlay" @click.self="showFilter = false">
      <div class="modal">
        <div class="modal-header">
          <h3>⏱ 筛选</h3>
          <button class="modal-close" @click="showFilter = false">✕</button>
        </div>

        <div class="form-label">时间周期</div>
        <div class="chips">
          <button v-for="o in timeOptions" :key="o.key" class="chip"
            :class="timeRange === o.key ? 'on' : ''" @click="timeRange = o.key">{{ o.label }}</button>
        </div>

        <div v-if="timeRange === 'custom'" style="display: flex; gap: 8px; margin-top: 12px;">
          <input type="date" v-model="customStart" class="input" style="font-size: 12px;" />
          <span style="line-height: 44px;">~</span>
          <input type="date" v-model="customEnd" class="input" style="font-size: 12px;" />
        </div>

        <div class="form-label" style="margin-top: 16px;">分类</div>
        <div class="chips">
          <button class="chip" :class="filterCategory === '' ? 'on' : ''" @click="filterCategory = ''">全部</button>
          <button v-for="c in categories" :key="c" class="chip"
            :class="filterCategory === c ? 'on' : ''" @click="filterCategory = c">
            {{ CATEGORY_ICONS[c] }} {{ c }}
          </button>
        </div>

        <button class="btn btn-primary btn-block" style="margin-top: 18px;" @click="showFilter = false">完成</button>
        <button class="btn btn-block" style="margin-top: 8px; background: transparent; color: var(--text-secondary);"
          @click="exportJSON">💾 导出全部备份</button>
      </div>
    </div>

    <!-- 图表弹窗 -->
    <div v-if="showChart" class="modal-overlay" @click.self="showChart = false">
      <div class="modal">
        <div class="modal-header">
          <h3>{{ chartType === 'pie' ? '🥧 支出分布' : '📈 日消费趋势' }}</h3>
          <button class="modal-close" @click="showChart = false">✕</button>
        </div>
        <canvas ref="chartCanvas" style="width: 100%; height: 280px;" />
      </div>
    </div>

    <!-- 添加记账浮窗 -->
    <div v-if="showAddForm" class="modal-overlay" @click.self="showAddForm = false">
      <div class="modal">
        <div class="modal-header">
          <h3>{{ editingId != null ? '✏️ 编辑账单' : '💰 添加账单' }}</h3>
          <button class="modal-close" @click="resetForm">✕</button>
        </div>
        <div class="form-group">
          <label class="form-label">类型</label>
          <div class="seg">
            <button :class="formType === 'expense' ? 'on' : ''" @click="formType = 'expense'">支出</button>
            <button :class="formType === 'income' ? 'on income' : ''" @click="formType = 'income'">收入</button>
          </div>
        </div>
        <div class="form-group">
          <label class="form-label">金额</label>
          <input v-model="formAmount" class="input" type="number" placeholder="0.00" step="0.01" />
        </div>
        <div class="form-group">
          <label class="form-label">日期</label>
          <input v-model="formDate" class="input" type="date" />
        </div>
        <div class="form-group">
          <label class="form-label">分类</label>
          <div style="display: flex; gap: 6px; flex-wrap: wrap;">
            <button v-for="c in categories" :key="c" class="btn btn-sm"
              :class="formCategory === c ? 'btn-primary' : 'btn-secondary'" @click="formCategory = c">
              {{ CATEGORY_ICONS[c] }} {{ c }}
            </button>
          </div>
        </div>
        <div class="form-group">
          <label class="form-label">备注</label>
          <input v-model="formNote" class="input" placeholder="可选备注" />
        </div>
        <div class="form-group">
          <label class="form-label">凭证图片</label>
          <div style="display: flex; gap: 8px;">
            <button type="button" class="btn btn-sm btn-secondary" @click="pickCamera">📷 拍照</button>
            <button type="button" class="btn btn-sm btn-secondary" @click="pickAlbum">🖼️ 相册</button>
          </div>
          <input ref="cameraInput" type="file" accept="image/*" capture="environment" style="display: none;" @change="handleImage" />
          <input ref="albumInput" type="file" accept="image/*" style="display: none;" @change="handleImage" />
          <img v-if="formImagePreview" :src="formImagePreview" style="width: 100%; border-radius: 8px; margin-top: 8px; max-height: 160px; object-fit: cover;" />
          <button v-if="formImagePreview" type="button" class="btn btn-sm btn-secondary" style="margin-top: 8px;" @click="clearFormImage">移除图片</button>
        </div>
        <button class="btn btn-primary btn-block" @click="saveExpense">{{ editingId != null ? '✓ 保存' : '✓ 确认' }}</button>
      </div>
    </div>
  </div>
</template>
