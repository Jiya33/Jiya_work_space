<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { ExpenseDB } from '../services/db'
import { compressImage } from '../services/image'
import {
  today, formatCurrency, formatDate,
  CATEGORY_COLORS, CATEGORY_ICONS, getWeekRange, getMonthRange, daysAgo
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
type TimeRange = 'week' | 'month' | 'custom'
const timeRange = ref<TimeRange>('month')
const customStart = ref(daysAgo(30))
const customEnd = ref(today())

const filteredExpenses = computed(() => {
  let result = expenses.value
  if (searchQuery.value) {
    const q = searchQuery.value.toLowerCase()
    result = result.filter(e => e.note?.toLowerCase().includes(q) || e.category.includes(q))
  }
  if (filterCategory.value) {
    result = result.filter(e => e.category === filterCategory.value)
  }

  // 时间筛选
  let start = '', end = ''
  if (timeRange.value === 'week') {
    const r = getWeekRange()
    start = r.start; end = r.end
  } else if (timeRange.value === 'month') {
    const r = getMonthRange()
    start = r.start; end = r.end
  } else {
    start = customStart.value; end = customEnd.value
  }
  if (start && end) {
    result = result.filter(e => e.date >= start && e.date <= end)
  }

  return result.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
})

const totalAmount = computed(() => filteredExpenses.value.reduce((s, e) => s + e.amount, 0))

const categoryStats = computed(() => {
  const map: Record<string, number> = {}
  filteredExpenses.value.forEach(e => {
    map[e.category] = (map[e.category] || 0) + e.amount
  })
  return Object.entries(map).sort((a, b) => b[1] - a[1])
})

// 录入
const showAddForm = ref(false)
const formAmount = ref('')
const formCategory = ref<Expense['category']>('餐饮')
const formNote = ref('')
const formImage = ref('')
const formImagePreview = ref('')
const formDate = ref(today())

async function handleImage(e: Event) {
  const file = (e.target as HTMLInputElement).files?.[0]
  if (!file) return
  const compressed = await compressImage(file)
  formImage.value = compressed
  formImagePreview.value = compressed
}

async function addExpense() {
  const amount = parseFloat(formAmount.value)
  if (!amount || amount <= 0) { showToast('请输入有效金额', 'error'); return }
  await ExpenseDB.add({
    date: formDate.value,
    amount,
    category: formCategory.value,
    note: formNote.value,
    imageBase64: formImage.value,
    createdAt: new Date().toISOString()
  })
  resetForm()
  showToast('添加成功')
  loadData()
}

function resetForm() {
  formAmount.value = ''
  formNote.value = ''
  formImage.value = ''
  formImagePreview.value = ''
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

// 简易图���
const showChart = ref(false)
const chartType = ref<'pie' | 'line'>('pie')
const chartCanvas = ref<HTMLCanvasElement | null>(null)

function openChart(type: 'pie' | 'line') {
  chartType.value = type
  showChart.value = true
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
  stats.forEach(([cat, amount]) => {
    ctx.fillStyle = CATEGORY_COLORS[cat] || '#ccc'
    ctx.fillRect(10, ly, 12, 12)
    ctx.fillStyle = '#333'
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
  ctx.strokeStyle = '#ddd'
  ctx.lineWidth = 1
  ctx.beginPath()
  ctx.moveTo(padding.left, padding.top)
  ctx.lineTo(padding.left, h - padding.bottom)
  ctx.lineTo(w - padding.right, h - padding.bottom)
  ctx.stroke()

  // Y axis labels
  ctx.font = '10px sans-serif'
  ctx.fillStyle = '#666'
  for (let i = 0; i <= 4; i++) {
    const val = (maxAmount / 4) * i
    const y = h - padding.bottom - (val / maxAmount) * ch
    ctx.fillText(`¥${val.toFixed(0)}`, padding.left - 45, y + 3)
    ctx.beginPath()
    ctx.moveTo(padding.left, y)
    ctx.lineTo(w - padding.right, y)
    ctx.strokeStyle = '#eee'
    ctx.stroke()
  }

  if (entries.length < 2) return

  // Line
  const stepX = cw / (entries.length - 1)
  ctx.strokeStyle = '#4F46E5'
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
    ctx.fillStyle = '#4F46E5'
    ctx.fill()
  })

  // X labels (show every nth)
  const step = Math.max(1, Math.floor(entries.length / 7))
  ctx.font = '10px sans-serif'
  ctx.fillStyle = '#666'
  entries.forEach(([date], i) => {
    if (i % step === 0) {
      const x = padding.left + i * stepX
      ctx.fillText(date.slice(5), x - 20, h - padding.bottom + 16)
    }
  })
}

import { nextTick } from 'vue'
import { watch } from 'vue'
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
  <div>
    <div v-if="toast.show" class="toast" :class="toast.type">{{ toast.msg }}</div>

    <!-- 总览 -->
    <div class="card">
      <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 12px;">
        <span class="card-title" style="margin-bottom: 0;">💰 {{ timeRange === 'week' ? '本周' : timeRange === 'month' ? '本月' : '自定义' }}支出</span>
        <div style="display: flex; gap: 4px;">
          <button class="btn btn-sm" :class="timeRange==='week'?'btn-primary':'btn-secondary'" @click="timeRange='week'">本周</button>
          <button class="btn btn-sm" :class="timeRange==='month'?'btn-primary':'btn-secondary'" @click="timeRange='month'">本月</button>
          <button class="btn btn-sm" :class="timeRange==='custom'?'btn-primary':'btn-secondary'" @click="timeRange='custom'">自定义</button>
        </div>
      </div>

      <div v-if="timeRange === 'custom'" style="display: flex; gap: 8px; margin-bottom: 12px;">
        <input type="date" v-model="customStart" class="input" style="font-size: 12px;" />
        <span style="line-height: 44px;">~</span>
        <input type="date" v-model="customEnd" class="input" style="font-size: 12px;" />
      </div>

      <div style="font-size: 28px; font-weight: 700; color: var(--danger);">
        {{ formatCurrency(totalAmount) }}
      </div>
      <div style="font-size: 13px; color: var(--text-muted); margin-top: 4px;">
        {{ filteredExpenses.length }} 笔记录
      </div>
    </div>

    <!-- 图表 & 操作 -->
    <div style="display: flex; gap: 8px; margin-bottom: 12px;">
      <button class="btn btn-sm" :class="viewMode==='list'?'btn-primary':'btn-secondary'" @click="viewMode='list'">📋 列表</button>
      <button class="btn btn-sm" :class="viewMode==='stats'?'btn-primary':'btn-secondary'" @click="viewMode='stats'">📊 统计</button>
      <button class="btn btn-sm btn-primary" @click="showAddForm = true">+ 记账</button>
      <button class="btn btn-sm btn-secondary" @click="exportJSON">💾 备份</button>
    </div>

    <!-- 列表模式 -->
    <div v-if="viewMode === 'list'">
      <!-- 筛选 -->
      <div style="display: flex; gap: 8px; margin-bottom: 12px;">
        <input v-model="searchQuery" class="input" placeholder="搜索..." style="flex: 1;" />
        <select v-model="filterCategory" class="select" style="width: 100px;">
          <option value="">全部分类</option>
          <option v-for="c in categories" :key="c" :value="c">{{ CATEGORY_ICONS[c] }} {{ c }}</option>
        </select>
      </div>

      <div v-if="filteredExpenses.length === 0" class="empty-state">
        <div style="font-size: 40px;">📭</div>
        <div>暂无记录</div>
      </div>

      <div v-for="e in filteredExpenses" :key="e.id" class="card" style="padding: 12px;">
        <div style="display: flex; gap: 12px;">
          <div v-if="e.imageBase64" style="width: 60px; height: 60px; flex-shrink: 0; border-radius: 8px; overflow: hidden;">
            <img :src="e.imageBase64" style="width: 100%; height: 100%; object-fit: cover;" />
          </div>
          <div style="flex: 1;">
            <div style="display: flex; justify-content: space-between; align-items: center;">
              <span style="font-size: 17px; font-weight: 700;">{{ formatCurrency(e.amount) }}</span>
              <button class="btn btn-sm" style="color: var(--danger);" @click="deleteExpense(e.id!)">删除</button>
            </div>
            <div style="display: flex; gap: 8px; margin-top: 4px; font-size: 12px; color: var(--text-secondary);">
              <span class="tag tag-primary">{{ CATEGORY_ICONS[e.category] }} {{ e.category }}</span>
              <span>{{ formatDate(e.date) }}</span>
            </div>
            <div v-if="e.note" style="font-size: 13px; color: var(--text-muted); margin-top: 4px;">{{ e.note }}</div>
          </div>
        </div>
      </div>
    </div>

    <!-- 统计模式 -->
    <div v-if="viewMode === 'stats'">
      <div style="display: flex; gap: 8px; margin-bottom: 12px;">
        <button class="btn btn-sm" :class="chartType==='pie'?'btn-primary':'btn-secondary'" @click="openChart('pie')">🥧 饼图</button>
        <button class="btn btn-sm" :class="chartType==='line'?'btn-primary':'btn-secondary'" @click="openChart('line')">📈 趋势</button>
      </div>

      <div class="card">
        <div class="card-title">📊 分类统计</div>
        <div v-for="[cat, amount] in categoryStats" :key="cat"
          style="display: flex; justify-content: space-between; align-items: center; padding: 8px 0; font-size: 14px;">
          <span>{{ CATEGORY_ICONS[cat] }} {{ cat }}</span>
          <span style="font-weight: 600;">{{ formatCurrency(amount) }}</span>
        </div>
      </div>

      <!-- 简易图表弹窗 -->
      <div v-if="showChart" class="modal-overlay" @click.self="showChart = false">
        <div class="modal">
          <div class="modal-header">
            <h3>{{ chartType === 'pie' ? '🥧 支出分布' : '📈 日消费趋势' }}</h3>
            <button class="modal-close" @click="showChart = false">✕</button>
          </div>
          <canvas ref="chartCanvas" style="width: 100%; height: 280px;" />
        </div>
      </div>
    </div>

    <!-- 添加记账浮窗 -->
    <div v-if="showAddForm" class="modal-overlay" @click.self="showAddForm = false">
      <div class="modal">
        <div class="modal-header">
          <h3>💰 添加账单</h3>
          <button class="modal-close" @click="resetForm">✕</button>
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
              :class="formCategory===c?'btn-primary':'btn-secondary'" @click="formCategory = c">
              {{ CATEGORY_ICONS[c] }} {{ c }}
            </button>
          </div>
        </div>
        <div class="form-group">
          <label class="form-label">备注</label>
          <input v-model="formNote" class="input" placeholder="可选备注" />
        </div>
        <div class="form-group">
          <label class="form-label">拍照</label>
          <input type="file" accept="image/*" capture="environment" @change="handleImage" />
          <img v-if="formImagePreview" :src="formImagePreview" style="width: 100%; border-radius: 8px; margin-top: 8px; max-height: 160px; object-fit: cover;" />
        </div>
        <button class="btn btn-primary btn-block" @click="addExpense">✓ 确认</button>
      </div>
    </div>
  </div>
</template>
