<script setup lang="ts">
import { ref, onMounted, computed } from 'vue'
import { LearningDB, SportDB, SettingsDB } from '../services/db'
import { today, getMonthCalendar, formatDate } from '../utils/format'
import type { LearningRecord, SportRecord, SportPlan } from '../types'

const activeTab = ref<'learning' | 'sport'>('learning')
const toast = ref({ show: false, msg: '', type: 'success' })
function showToast(msg: string, type = 'success') {
  toast.value = { show: true, msg, type }
  setTimeout(() => { toast.value.show = false }, 2000)
}

// ====== 英语学习 ======
const learningRecords = ref<LearningRecord[]>([])
const learnCategory = ref('单词')
const learnContent = ref('')
const learnCategories = ['单词', '短语', '语法', '听力', '阅读', '口语', '写作']
const favorites = computed(() => learningRecords.value.filter(r => r.isFavorite))
const showReview = ref(false)
const reviewRecord = ref<LearningRecord | null>(null)

// 日历
const now = new Date()
const calYear = ref(now.getFullYear())
const calMonth = ref(now.getMonth())
const calendar = computed(() => getMonthCalendar(calYear.value, calMonth.value))
const weekDays = ['日', '一', '二', '三', '四', '五', '六']

function hasLearningRecord(day: number): boolean {
  const dateStr = `${calYear.value}-${String(calMonth.value + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`
  return learningRecords.value.some(r => r.date === dateStr)
}

async function addLearning() {
  if (!learnContent.value.trim()) { showToast('请输入内容', 'error'); return }
  await LearningDB.add({
    date: today(),
    category: learnCategory.value,
    content: learnContent.value.trim(),
    isFavorite: false,
    createdAt: new Date().toISOString()
  })
  learnContent.value = ''
  showToast('打卡成功！')
  loadLearning()
}

async function toggleFavorite(record: LearningRecord) {
  record.isFavorite = !record.isFavorite
  await LearningDB.update(record)
  loadLearning()
}

async function deleteLearning(id: number) {
  await LearningDB.delete(id)
  loadLearning()
}

function startReview() {
  const pool = [...learningRecords.value]
  if (pool.length === 0) return
  const random = pool[Math.floor(Math.random() * pool.length)]
  reviewRecord.value = random
  showReview.value = true
}

async function loadLearning() {
  learningRecords.value = (await LearningDB.getAll()).sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  )
}

// ====== 运动计划 ======
const sportRecords = ref<SportRecord[]>([])
const sportPlans = ref<SportPlan[]>([])
const sportTypes = ['游泳', '肩背', '臀腿', '爬坡', '攀岩', '跑步', '瑜伽', 'HIIT']
const customSportName = ref('')
const customSportDuration = ref(30)
const editingPlan = ref(false)

const weeklyStats = computed(() => {
  const now = new Date()
  const day = now.getDay()
  const monday = new Date(now)
  monday.setDate(now.getDate() - day + (day === 0 ? -6 : 1))
  const weekRecords = sportRecords.value.filter(r => {
    const d = new Date(r.date)
    return d >= monday
  })
  const byType: Record<string, number> = {}
  let totalMinutes = 0
  weekRecords.forEach(r => {
    byType[r.type] = (byType[r.type] || 0) + 1
    totalMinutes += r.duration
  })
  return { byType, totalMinutes, count: weekRecords.length }
})

async function addSportRecord() {
  const day = new Date().getDay()
  const plan = sportPlans.value.find(p => p.weekday === day)
  const type = plan?.type || '运动'
  const duration = plan?.duration || 30

  const notes = sportTypes.includes(type) ? type : type
  await SportDB.add({
    date: today(),
    type: notes,
    duration,
    createdAt: new Date().toISOString()
  })
  showToast(`🏃 ${type} ${duration}分钟 打卡成功！`)
  loadSport()
}

async function savePlan() {
  if (!customSportName.value.trim()) { showToast('请输入运动名称', 'error'); return }
  const weekday = new Date().getDay()
  const existingIdx = sportPlans.value.findIndex(p => p.weekday === weekday)
  if (existingIdx >= 0) {
    sportPlans.value[existingIdx] = {
      weekday,
      type: customSportName.value.trim(),
      duration: customSportDuration.value
    }
  } else {
    sportPlans.value.push({
      weekday,
      type: customSportName.value.trim(),
      duration: customSportDuration.value
    })
  }
  await SettingsDB.set('sportPlans', JSON.stringify(sportPlans.value))
  editingPlan.value = false
  showToast('计划已保存')
}

function removePlan(idx: number) {
  sportPlans.value.splice(idx, 1)
  SettingsDB.set('sportPlans', JSON.stringify(sportPlans.value))
}

async function loadSport() {
  sportRecords.value = (await SportDB.getAll()).sort(
    (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
  )
  const settings = await SettingsDB.get()
  if (settings.sportPlans) {
    try {
      sportPlans.value = typeof settings.sportPlans === 'string'
        ? JSON.parse(settings.sportPlans as string)
        : settings.sportPlans
    } catch { sportPlans.value = [] }
  }
}

onMounted(() => {
  loadLearning()
  loadSport()
})
</script>

<template>
  <div>
    <div v-if="toast.show" class="toast" :class="toast.type">{{ toast.msg }}</div>

    <!-- Tabs -->
    <div class="tabs">
      <button class="tab-item" :class="{ active: activeTab === 'learning' }" @click="activeTab = 'learning'">📚 英语学习</button>
      <button class="tab-item" :class="{ active: activeTab === 'sport' }" @click="activeTab = 'sport'">🏃 运动计划</button>
    </div>

    <!-- ====== 英语学习 ====== -->
    <div v-if="activeTab === 'learning'">
      <!-- 月度日历 -->
      <div class="card">
        <div class="card-title" style="display: flex; justify-content: space-between; align-items: center;">
          <span>📅 {{ calYear }}年{{ calMonth + 1 }}月</span>
          <div style="display: flex; gap: 8px;">
            <button class="btn btn-sm btn-secondary" @click="calMonth--; if(calMonth<0){calMonth=11;calYear--}">◀</button>
            <button class="btn btn-sm btn-secondary" @click="calMonth++; if(calMonth>11){calMonth=0;calYear++}">▶</button>
          </div>
        </div>
        <div style="display: grid; grid-template-columns: repeat(7, 1fr); gap: 2px; text-align: center;">
          <div v-for="d in weekDays" :key="d" style="font-size: 12px; color: var(--text-muted); padding: 4px 0;">{{ d }}</div>
          <div v-for="(week, wi) in calendar" :key="wi" style="display: contents;">
            <div v-for="(day, di) in week" :key="`${wi}-${di}`"
              :style="{
                padding: '6px 0', fontSize: '13px', borderRadius: '6px',
                background: day && hasLearningRecord(day) ? 'rgba(79,70,229,0.1)' : 'transparent',
                color: day ? 'var(--text-primary)' : 'var(--text-muted)',
                fontWeight: day && hasLearningRecord(day) ? '600' : '400'
              }"
            >
              {{ day || '' }}
            </div>
          </div>
        </div>
      </div>

      <!-- 录入区 -->
      <div class="card">
        <div class="card-title">✍️ 录入学习内容</div>
        <div class="form-group">
          <label class="form-label">分类</label>
          <div style="display: flex; gap: 6px; flex-wrap: wrap;">
            <button v-for="cat in learnCategories" :key="cat" class="btn btn-sm"
              :class="learnCategory === cat ? 'btn-primary' : 'btn-secondary'"
              @click="learnCategory = cat">{{ cat }}</button>
          </div>
        </div>
        <div class="form-group">
          <textarea v-model="learnContent" class="textarea" placeholder="输入学习内容..." rows="3" />
        </div>
        <button class="btn btn-primary btn-block" @click="addLearning">✓ 打卡记录</button>
      </div>

      <!-- 最近记录 -->
      <div class="card">
        <div class="card-title" style="display: flex; justify-content: space-between;">
          <span>📖 最近记录</span>
          <button class="btn btn-sm btn-secondary" @click="startReview">🎲 随机复习</button>
        </div>
        <div v-if="learningRecords.length === 0" class="empty-state">
          <div style="font-size: 32px;">📝</div>
          <div>还没有学习记录</div>
        </div>
        <div v-for="r in learningRecords.slice(0, 10)" :key="r.id"
          style="padding: 10px 0; border-bottom: 1px solid var(--border); font-size: 13px;">
          <div style="display: flex; justify-content: space-between; align-items: center;">
            <span class="tag tag-primary">{{ r.category }}</span>
            <span style="font-size: 12px; color: var(--text-muted);">{{ formatDate(r.date) }}</span>
          </div>
          <div style="margin-top: 6px; color: var(--text-primary);">{{ r.content }}</div>
          <div style="display: flex; gap: 8px; margin-top: 6px;">
            <button class="btn btn-sm" @click="toggleFavorite(r)">
              {{ r.isFavorite ? '⭐' : '☆' }}
            </button>
            <button class="btn btn-sm" style="color: var(--danger);" @click="deleteLearning(r.id!)">删除</button>
          </div>
        </div>
      </div>

      <!-- 收藏本 -->
      <div class="card" v-if="favorites.length > 0">
        <div class="card-title">⭐ 收藏本</div>
        <div v-for="r in favorites" :key="r.id"
          style="padding: 8px 0; border-bottom: 1px solid var(--border); font-size: 13px;">
          <span class="tag tag-primary">{{ r.category }}</span>
          <span style="margin-left: 8px;">{{ r.content }}</span>
        </div>
      </div>

      <!-- 随机复习弹窗 -->
      <div v-if="showReview && reviewRecord" class="modal-overlay" @click.self="showReview = false">
        <div class="modal">
          <div class="modal-header">
            <h3>🎲 随机复���</h3>
            <button class="modal-close" @click="showReview = false">✕</button>
          </div>
          <p style="color: var(--text-secondary); font-size: 14px;">分类：{{ reviewRecord.category }}</p>
          <p style="margin-top: 12px; font-size: 16px; line-height: 1.6;">{{ reviewRecord.content }}</p>
          <div style="margin-top: 16px; display: flex; gap: 8px;">
            <button class="btn btn-primary" @click="startReview()">🔄 换一个</button>
            <button class="btn btn-secondary" @click="showReview = false">关闭</button>
          </div>
        </div>
      </div>
    </div>

    <!-- ====== 运动计划 ====== -->
    <div v-if="activeTab === 'sport'">
      <!-- 周计划 -->
      <div class="card">
        <div class="card-title">📋 周运动计划</div>
        <div v-if="sportPlans.length === 0" style="color: var(--text-muted); font-size: 13px; margin-bottom: 12px;">
          还没有设置运动计划
        </div>
        <div v-for="(plan, idx) in sportPlans.sort((a,b)=>a.weekday-b.weekday)" :key="idx"
          style="display: flex; justify-content: space-between; align-items: center; padding: 8px 0; font-size: 13px;">
          <span>{{ ['周日','周一','周二','周三','周四','周五','周六'][plan.weekday] }}</span>
          <span style="font-weight: 600;">{{ plan.type }} {{ plan.duration }}min</span>
          <button class="btn btn-sm" style="color: var(--danger);" @click="removePlan(idx)">✕</button>
        </div>
        <button class="btn btn-secondary btn-sm" style="margin-top: 8px;" @click="editingPlan = true">+ 设置计划</button>
      </div>

      <!-- 今日打卡 -->
      <div class="card">
        <div class="card-title">🏃 今日运动打卡</div>
        <div style="display: flex; gap: 8px; flex-wrap: wrap; margin-bottom: 12px;">
          <button v-for="t in sportTypes" :key="t" class="btn btn-sm btn-secondary"
            @click="customSportName = t; customSportDuration = 30; addSportRecord()">
            {{ t }}
          </button>
        </div>
        <div style="display: flex; gap: 8px; align-items: center;">
          <input v-model="customSportName" class="input" placeholder="自定义运动" style="flex: 1;" />
          <input v-model.number="customSportDuration" class="input" type="number" placeholder="分钟" style="width: 80px;" min="1" max="300" />
          <button class="btn btn-primary" @click="addSportRecord()">打卡</button>
        </div>
      </div>

      <!-- 本周统计 -->
      <div class="card">
        <div class="card-title">📊 本周统计</div>
        <div style="display: flex; gap: 20px; text-align: center;">
          <div>
            <div style="font-size: 24px; font-weight: 700; color: var(--primary);">{{ weeklyStats.count }}</div>
            <div style="font-size: 12px; color: var(--text-muted);">运动次数</div>
          </div>
          <div>
            <div style="font-size: 24px; font-weight: 700; color: var(--success);">{{ weeklyStats.totalMinutes }}</div>
            <div style="font-size: 12px; color: var(--text-muted);">总分钟</div>
          </div>
        </div>
      </div>

      <!-- 历史记录 -->
      <div class="card">
        <div class="card-title">📜 运动记录</div>
        <div v-if="sportRecords.length === 0" class="empty-state">
          <div style="font-size: 32px;">🏋️</div>
          <div>还没有运动记录</div>
        </div>
        <div v-for="r in sportRecords.slice(0, 15)" :key="r.id"
          style="display: flex; justify-content: space-between; padding: 8px 0; border-bottom: 1px solid var(--border); font-size: 13px;">
          <span>{{ formatDate(r.date) }}</span>
          <span style="font-weight: 600;">{{ r.type }}</span>
          <span style="color: var(--text-secondary);">{{ r.duration }}min</span>
        </div>
      </div>

      <!-- 设置计划弹窗 -->
      <div v-if="editingPlan" class="modal-overlay" @click.self="editingPlan = false">
        <div class="modal">
          <div class="modal-header">
            <h3>设置周计划</h3>
            <button class="modal-close" @click="editingPlan = false">✕</button>
          </div>
          <div class="form-group">
            <label class="form-label">运动类型</label>
            <div style="display: flex; gap: 6px; flex-wrap: wrap;">
              <button v-for="t in sportTypes" :key="t" class="btn btn-sm"
                :class="customSportName === t ? 'btn-primary' : 'btn-secondary'"
                @click="customSportName = t">{{ t }}</button>
            </div>
            <input v-model="customSportName" class="input" placeholder="或输入自定义名称" style="margin-top: 8px;" />
          </div>
          <div class="form-group">
            <label class="form-label">时长（分钟）</label>
            <input v-model.number="customSportDuration" class="input" type="number" min="5" max="300" />
          </div>
          <button class="btn btn-primary btn-block" @click="savePlan">💾 保存计划</button>
        </div>
      </div>
    </div>
  </div>
</template>
