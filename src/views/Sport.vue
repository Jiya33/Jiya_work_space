<script setup lang="ts">
import { ref, onMounted, computed, onUnmounted } from 'vue'
import { SportDB, SettingsDB, SportVideoDB } from '../services/db'
import { today, formatDate } from '../utils/format'
import { SPORT_GUIDES, searchLinks, toEmbedUrl } from '../data/sport'
import type { SportRecord, SportPlan, SportVideo, SportGuide } from '../types'

const toast = ref({ show: false, msg: '', type: 'success' })
function showToast(msg: string, type = 'success') {
  toast.value = { show: true, msg, type }
  setTimeout(() => { toast.value.show = false }, 2500)
}

const activeTab = ref<'plan' | 'guide' | 'video'>('plan')
const weekdayNames = ['周日', '周一', '周二', '周三', '周四', '周五', '周六']
const weekOrder = [1, 2, 3, 4, 5, 6, 0]

// ====== 计划与打卡 ======
const sportRecords = ref<SportRecord[]>([])
const sportPlans = ref<SportPlan[]>([])
const sportTypes = ['游泳', '肩背', '臀腿', '爬坡', '攀岩', '跑步', '瑜伽', 'HIIT']
const customSportName = ref('游泳')
const customSportDuration = ref(30)
const editingPlan = ref(false)
const editingWeekday = ref(new Date().getDay())
const currentWeekday = new Date().getDay()

const todayPlan = computed(() => sportPlans.value.find(p => p.weekday === currentWeekday))
const todayDone = computed(() => sportRecords.value.some(r => r.date === today()))

function planOf(wd: number): SportPlan | undefined {
  return sportPlans.value.find(p => p.weekday === wd)
}

const weeklyStats = computed(() => {
  const now = new Date()
  const day = now.getDay()
  const monday = new Date(now)
  monday.setDate(now.getDate() - day + (day === 0 ? -6 : 1))
  monday.setHours(0, 0, 0, 0)
  const weekRecords = sportRecords.value.filter(r => new Date(r.date) >= monday)
  const byType: Record<string, number> = {}
  let totalMinutes = 0
  weekRecords.forEach(r => {
    byType[r.type] = (byType[r.type] || 0) + r.duration
    totalMinutes += r.duration
  })
  return { byType, totalMinutes, count: weekRecords.length }
})

const trend = computed(() => {
  const days: { label: string; minutes: number }[] = []
  for (let i = 6; i >= 0; i--) {
    const d = new Date()
    d.setDate(d.getDate() - i)
    const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
    const minutes = sportRecords.value.filter(r => r.date === key).reduce((s, r) => s + r.duration, 0)
    days.push({ label: `${d.getMonth() + 1}/${d.getDate()}`, minutes })
  }
  return days
})
const trendMax = computed(() => Math.max(...trend.value.map(d => d.minutes), 60))

async function quickCheckIn(type: string, duration: number) {
  if (!type.trim()) { showToast('请输入运动名称', 'error'); return }
  await SportDB.add({ date: today(), type: type.trim(), duration, createdAt: new Date().toISOString() })
  showToast(`🏃 ${type} ${duration} 分钟 打卡成功！`)
  loadSport()
}

function openPlanEditor(wd: number) {
  editingWeekday.value = wd
  const p = planOf(wd)
  customSportName.value = p?.type || '游泳'
  customSportDuration.value = p?.duration || 30
  editingPlan.value = true
}

async function savePlan() {
  if (!customSportName.value.trim()) { showToast('请输入运动名称', 'error'); return }
  const wd = editingWeekday.value
  const idx = sportPlans.value.findIndex(p => p.weekday === wd)
  const plan: SportPlan = { weekday: wd, type: customSportName.value.trim(), duration: customSportDuration.value }
  if (idx >= 0) sportPlans.value[idx] = plan
  else sportPlans.value.push(plan)
  await SettingsDB.set('sportPlans', JSON.parse(JSON.stringify(sportPlans.value)))
  editingPlan.value = false
  showToast('计划已保存')
}

async function removePlan(weekday: number) {
  sportPlans.value = sportPlans.value.filter(p => p.weekday !== weekday)
  await SettingsDB.set('sportPlans', JSON.parse(JSON.stringify(sportPlans.value)))
  showToast('已移除')
}

async function deleteRecord(id: number) {
  await SportDB.delete(id)
  loadSport()
}

async function loadSport() {
  sportRecords.value = (await SportDB.getAll()).sort(
    (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
  )
  const settings = await SettingsDB.get()
  const raw = settings.sportPlans
  if (raw) {
    try {
      sportPlans.value = typeof raw === 'string' ? JSON.parse(raw) : (raw as SportPlan[])
    } catch { sportPlans.value = [] }
  }
}

// ====== 训练资料 ======
const currentGuide = ref<SportGuide>(SPORT_GUIDES[0])
const guideLinks = computed(() => searchLinks(currentGuide.value.refKeyword))

// ====== 视频资料 ======
const videos = ref<SportVideo[]>([])
const showVideoForm = ref(false)
const vTitle = ref('')
const vCategory = ref('游泳')
const vSourceType = ref<'link' | 'file'>('link')
const vUrl = ref('')
const vNote = ref('')
const vFile = ref<File | null>(null)
const videoCategories = [...sportTypes, '其他']
const playingId = ref<number | null>(null)
const objectUrls = new Map<number, string>()

const filterVideoCat = ref('')
const filteredVideos = computed(() =>
  filterVideoCat.value ? videos.value.filter(v => v.category === filterVideoCat.value) : videos.value
)

function onVideoFile(e: Event) {
  const f = (e.target as HTMLInputElement).files?.[0]
  if (!f) return
  if (f.size > 200 * 1024 * 1024) {
    showToast('视频超过 200MB，建议改用链接方式', 'error')
    return
  }
  vFile.value = f
  if (!vTitle.value) vTitle.value = f.name.replace(/\.[^.]+$/, '')
}

async function saveVideo() {
  if (!vTitle.value.trim()) { showToast('请输入标题', 'error'); return }
  if (vSourceType.value === 'link' && !vUrl.value.trim()) { showToast('请输入视频链接', 'error'); return }
  if (vSourceType.value === 'file' && !vFile.value) { showToast('请选择视频文件', 'error'); return }

  await SportVideoDB.add({
    title: vTitle.value.trim(),
    category: vCategory.value,
    sourceType: vSourceType.value,
    url: vSourceType.value === 'link' ? vUrl.value.trim() : undefined,
    blob: vSourceType.value === 'file' ? vFile.value! : undefined,
    note: vNote.value.trim(),
    createdAt: new Date().toISOString()
  })
  showToast('视频已保存到本地')
  showVideoForm.value = false
  vTitle.value = ''
  vUrl.value = ''
  vNote.value = ''
  vFile.value = null
  loadVideos()
}

async function deleteVideo(id: number) {
  if (!confirm('确定删除这个视频？')) return
  const u = objectUrls.get(id)
  if (u) { URL.revokeObjectURL(u); objectUrls.delete(id) }
  await SportVideoDB.delete(id)
  if (playingId.value === id) playingId.value = null
  loadVideos()
}

function fileUrl(v: SportVideo): string {
  if (!v.id || !v.blob) return ''
  if (!objectUrls.has(v.id)) objectUrls.set(v.id, URL.createObjectURL(v.blob))
  return objectUrls.get(v.id) as string
}

function embedOf(v: SportVideo): string | null {
  return v.url ? toEmbedUrl(v.url) : null
}

async function loadVideos() {
  videos.value = (await SportVideoDB.getAll()).sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  )
}

onMounted(() => {
  loadSport()
  loadVideos()
})

onUnmounted(() => {
  objectUrls.forEach(u => URL.revokeObjectURL(u))
  objectUrls.clear()
})
</script>

<template>
  <div>
    <div v-if="toast.show" class="toast" :class="toast.type">{{ toast.msg }}</div>

    <div class="tabs">
      <button class="tab-item" :class="{ active: activeTab === 'plan' }" @click="activeTab = 'plan'">📋 计划打卡</button>
      <button class="tab-item" :class="{ active: activeTab === 'guide' }" @click="activeTab = 'guide'">📖 训练资料</button>
      <button class="tab-item" :class="{ active: activeTab === 'video' }" @click="activeTab = 'video'">🎬 视频库</button>
    </div>

    <!-- ══════════ 计划与打卡 ══════════ -->
    <div v-if="activeTab === 'plan'">
      <div class="card" :style="{ borderLeft: `4px solid ${todayDone ? 'var(--success)' : 'var(--primary)'}` }">
        <div class="card-title">🎯 今日计划</div>
        <div v-if="todayPlan" style="display: flex; justify-content: space-between; align-items: center;">
          <div>
            <div style="font-size: 20px; font-weight: 700;">{{ todayPlan.type }}</div>
            <div style="font-size: 13px; color: var(--text-muted); margin-top: 2px;">{{ todayPlan.duration }} 分钟</div>
          </div>
          <button v-if="!todayDone" class="btn btn-primary" @click="quickCheckIn(todayPlan.type, todayPlan.duration)">✓ 完成打卡</button>
          <span v-else style="color: var(--success); font-weight: 600;">✅ 已完成</span>
        </div>
        <div v-else style="font-size: 13px; color: var(--text-muted); line-height: 1.6;">
          今天（{{ weekdayNames[currentWeekday] }}）没有安排运动，休息日也是训练的一部分 💤
        </div>
      </div>

      <div class="card">
        <div class="card-title">📅 周循环计划</div>
        <div v-for="wd in weekOrder" :key="wd"
          style="display: flex; align-items: center; gap: 8px; padding: 9px 0; border-bottom: 1px solid var(--border); font-size: 14px;">
          <span :style="{
            width: '44px', flexShrink: 0,
            color: wd === currentWeekday ? 'var(--primary)' : 'var(--text-secondary)',
            fontWeight: wd === currentWeekday ? '700' : '400'
          }">{{ weekdayNames[wd] }}</span>
          <span style="flex: 1;">
            <template v-if="planOf(wd)">
              <b>{{ planOf(wd)!.type }}</b>
              <span style="color: var(--text-muted); font-size: 13px;"> · {{ planOf(wd)!.duration }}min</span>
            </template>
            <span v-else style="color: var(--text-muted); font-size: 13px;">休息</span>
          </span>
          <button class="btn btn-sm btn-secondary" @click="openPlanEditor(wd)">{{ planOf(wd) ? '编辑' : '+ 添加' }}</button>
          <button v-if="planOf(wd)" class="btn btn-sm" style="color: var(--danger);" @click="removePlan(wd)">✕</button>
        </div>
      </div>

      <div class="card">
        <div class="card-title">⚡ 快速打卡</div>
        <div style="display: flex; gap: 8px; flex-wrap: wrap; margin-bottom: 12px;">
          <button v-for="t in sportTypes" :key="t" class="btn btn-sm btn-secondary"
            @click="quickCheckIn(t, 30)">{{ t }} 30min</button>
        </div>
        <div style="display: flex; gap: 8px; align-items: center;">
          <input v-model="customSportName" class="input" placeholder="自定义运动" style="flex: 1;" />
          <input v-model.number="customSportDuration" class="input" type="number" style="width: 76px;" min="1" max="300" />
          <button class="btn btn-primary" @click="quickCheckIn(customSportName, customSportDuration)">打卡</button>
        </div>
      </div>

      <div class="card">
        <div class="card-title">📊 本周统计</div>
        <div style="display: flex; gap: 24px; text-align: center; margin-bottom: 16px;">
          <div>
            <div style="font-size: 26px; font-weight: 700; color: var(--primary);">{{ weeklyStats.count }}</div>
            <div style="font-size: 12px; color: var(--text-muted);">运动次数</div>
          </div>
          <div>
            <div style="font-size: 26px; font-weight: 700; color: var(--success);">{{ weeklyStats.totalMinutes }}</div>
            <div style="font-size: 12px; color: var(--text-muted);">总分钟</div>
          </div>
          <div>
            <div style="font-size: 26px; font-weight: 700; color: var(--warning);">{{ Object.keys(weeklyStats.byType).length }}</div>
            <div style="font-size: 12px; color: var(--text-muted);">运动种类</div>
          </div>
        </div>

        <div style="display: flex; align-items: flex-end; gap: 6px; height: 100px; padding-top: 8px;">
          <div v-for="(d, i) in trend" :key="i"
            style="flex: 1; display: flex; flex-direction: column; align-items: center; gap: 4px; height: 100%;">
            <div style="flex: 1; width: 100%; display: flex; align-items: flex-end;">
              <div :style="{
                width: '100%',
                height: `${Math.max((d.minutes / trendMax) * 100, d.minutes > 0 ? 6 : 2)}%`,
                background: d.minutes > 0 ? 'var(--primary)' : 'var(--border)',
                borderRadius: '4px 4px 0 0',
                transition: 'height .3s'
              }" :title="`${d.minutes} 分钟`" />
            </div>
            <div style="font-size: 10px; color: var(--text-muted);">{{ d.label }}</div>
          </div>
        </div>
      </div>

      <div class="card">
        <div class="card-title">📜 运动记录（{{ sportRecords.length }}）</div>
        <div v-if="sportRecords.length === 0" class="empty-state">
          <div style="font-size: 32px;">🏋️</div>
          <div>还没有运动记录</div>
        </div>
        <div v-for="r in sportRecords.slice(0, 20)" :key="r.id"
          style="display: flex; justify-content: space-between; align-items: center; padding: 9px 0; border-bottom: 1px solid var(--border); font-size: 13px;">
          <span style="color: var(--text-secondary); width: 90px;">{{ formatDate(r.date) }}</span>
          <span style="font-weight: 600; flex: 1;">{{ r.type }}</span>
          <span style="color: var(--text-secondary); margin-right: 8px;">{{ r.duration }}min</span>
          <button class="btn btn-sm" style="color: var(--danger);" @click="deleteRecord(r.id!)">✕</button>
        </div>
      </div>

      <!-- 计划编辑弹窗 -->
      <div v-if="editingPlan" class="modal-overlay" @click.self="editingPlan = false">
        <div class="modal">
          <div class="modal-header">
            <h3>设置 {{ weekdayNames[editingWeekday] }} 计划</h3>
            <button class="modal-close" @click="editingPlan = false">✕</button>
          </div>
          <div class="form-group">
            <label class="form-label">星期</label>
            <div style="display: flex; gap: 4px; flex-wrap: wrap;">
              <button v-for="wd in weekOrder" :key="wd" class="btn btn-sm"
                :class="editingWeekday === wd ? 'btn-primary' : 'btn-secondary'"
                @click="editingWeekday = wd">{{ weekdayNames[wd] }}</button>
            </div>
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

    <!-- ══════════ 训练资料 ══════════ -->
    <div v-if="activeTab === 'guide'">
      <div class="card">
        <div class="card-title">🏋️ 选择项目</div>
        <div style="display: flex; gap: 6px; flex-wrap: wrap;">
          <button v-for="g in SPORT_GUIDES" :key="g.id" class="btn btn-sm"
            :class="currentGuide.id === g.id ? 'btn-primary' : 'btn-secondary'"
            @click="currentGuide = g">{{ g.emoji }} {{ g.name }}</button>
        </div>
      </div>

      <div class="card" style="border-left: 4px solid var(--primary);">
        <div style="font-size: 18px; font-weight: 700;">{{ currentGuide.emoji }} {{ currentGuide.name }}</div>
        <p style="font-size: 13px; color: var(--text-secondary); line-height: 1.7; margin-top: 8px;">
          {{ currentGuide.intro }}
        </p>
        <div style="display: flex; gap: 8px; margin-top: 12px; flex-wrap: wrap;">
          <button class="btn btn-sm btn-primary" @click="quickCheckIn(currentGuide.name, 40)">✓ 完成打卡 40min</button>
          <a class="btn btn-sm btn-secondary" :href="guideLinks.bilibili" target="_blank">📺 B站教学</a>
          <a class="btn btn-sm btn-secondary" :href="guideLinks.youtube" target="_blank">▶️ YouTube</a>
        </div>
      </div>

      <div class="card">
        <div class="card-title">🔥 热身（必做）</div>
        <ol style="margin: 0; padding-left: 20px; font-size: 13px; line-height: 2; color: var(--text-secondary);">
          <li v-for="(w, i) in currentGuide.warmup" :key="i">{{ w }}</li>
        </ol>
      </div>

      <div class="card">
        <div class="card-title">💪 训练动作</div>
        <div v-for="(a, i) in currentGuide.actions" :key="i"
          style="padding: 12px 0; border-bottom: 1px solid var(--border);">
          <div style="display: flex; align-items: baseline; gap: 8px;">
            <span style="font-size: 12px; color: var(--text-muted); font-weight: 700;">{{ i + 1 }}</span>
            <span style="font-size: 15px; font-weight: 600;">{{ a.name }}</span>
          </div>
          <div style="font-size: 13px; color: var(--text-secondary); margin-top: 5px; line-height: 1.6;">{{ a.detail }}</div>
          <div style="display: flex; gap: 8px; flex-wrap: wrap; margin-top: 8px;">
            <span class="tag tag-primary">{{ a.sets }}</span>
          </div>
          <div style="font-size: 12px; color: var(--warning); margin-top: 6px; line-height: 1.6;">
            ⚡ 要点：{{ a.key }}
          </div>
        </div>
      </div>

      <div class="card">
        <div class="card-title">🧘 放松拉伸</div>
        <ul style="margin: 0; padding-left: 20px; font-size: 13px; line-height: 2; color: var(--text-secondary);">
          <li v-for="(c, i) in currentGuide.cooldown" :key="i">{{ c }}</li>
        </ul>
      </div>

      <div class="card" style="border-left: 4px solid var(--danger);">
        <div class="card-title">⚠️ 常见错误</div>
        <ul style="margin: 0; padding-left: 20px; font-size: 13px; line-height: 2; color: var(--text-secondary);">
          <li v-for="(m, i) in currentGuide.mistakes" :key="i">{{ m }}</li>
        </ul>
      </div>
    </div>

    <!-- ══════════ 视频库 ══════════ -->
    <div v-if="activeTab === 'video'">
      <div class="card">
        <div class="card-title" style="display: flex; justify-content: space-between; align-items: center;">
          <span>🎬 我的训练视频（{{ videos.length }}）</span>
          <button class="btn btn-sm btn-primary" @click="showVideoForm = true">+ 添加</button>
        </div>
        <p style="font-size: 12px; color: var(--text-muted); line-height: 1.6;">
          支持两种方式：① 粘贴 B站 / YouTube 链接（自动内嵌播放，不占本地空间）② 上传本地视频文件（存在浏览器 IndexedDB，完全离线可看）
        </p>
        <div style="display: flex; gap: 6px; flex-wrap: wrap; margin-top: 10px;">
          <button class="btn btn-sm" :class="filterVideoCat === '' ? 'btn-primary' : 'btn-secondary'"
            @click="filterVideoCat = ''">全部</button>
          <button v-for="c in videoCategories" :key="c" class="btn btn-sm"
            :class="filterVideoCat === c ? 'btn-primary' : 'btn-secondary'"
            @click="filterVideoCat = c">{{ c }}</button>
        </div>
      </div>

      <div v-if="filteredVideos.length === 0" class="empty-state">
        <div style="font-size: 40px;">🎬</div>
        <div>还没有视频资料</div>
        <div style="font-size: 12px; color: var(--text-muted); margin-top: 4px;">点右上角「+ 添加」保存你的教学视频</div>
      </div>

      <div v-for="v in filteredVideos" :key="v.id" class="card">
        <div style="display: flex; justify-content: space-between; align-items: flex-start; gap: 8px;">
          <div style="flex: 1;">
            <div style="font-size: 15px; font-weight: 600;">{{ v.title }}</div>
            <div style="display: flex; gap: 8px; margin-top: 6px; align-items: center;">
              <span class="tag tag-primary">{{ v.category }}</span>
              <span style="font-size: 11px; color: var(--text-muted);">
                {{ v.sourceType === 'link' ? '🔗 链接' : '📁 本地文件' }}
              </span>
            </div>
          </div>
          <div style="display: flex; gap: 4px; flex-shrink: 0;">
            <button class="btn btn-sm btn-secondary" @click="playingId = playingId === v.id ? null : v.id!">
              {{ playingId === v.id ? '收起' : '▶ 播放' }}
            </button>
            <button class="btn btn-sm" style="color: var(--danger);" @click="deleteVideo(v.id!)">✕</button>
          </div>
        </div>

        <p v-if="v.note" style="font-size: 12px; color: var(--text-secondary); margin-top: 8px; line-height: 1.6;">{{ v.note }}</p>

        <div v-if="playingId === v.id" style="margin-top: 12px;">
          <!-- 本地文件 -->
          <video v-if="v.sourceType === 'file'" :src="fileUrl(v)" controls playsinline
            style="width: 100%; border-radius: 8px; background: #000; max-height: 420px;" />
          <!-- 可嵌入链接 -->
          <div v-else-if="embedOf(v)" style="position: relative; width: 100%; padding-bottom: 56.25%; border-radius: 8px; overflow: hidden; background: #000;">
            <iframe :src="embedOf(v)!" frameborder="0" allowfullscreen scrolling="no"
              style="position: absolute; top: 0; left: 0; width: 100%; height: 100%;" />
          </div>
          <!-- 直链 mp4 -->
          <video v-else-if="v.url && /\.(mp4|webm|ogg|mov)(\?|$)/i.test(v.url)" :src="v.url" controls playsinline
            style="width: 100%; border-radius: 8px; background: #000; max-height: 420px;" />
          <!-- 无法内嵌 -->
          <div v-else style="padding: 16px; text-align: center;">
            <p style="font-size: 13px; color: var(--text-secondary);">该链接不支持内嵌播放</p>
            <a class="btn btn-primary btn-sm" style="margin-top: 8px;" :href="v.url" target="_blank">🔗 在新窗口打开</a>
          </div>
        </div>
      </div>

      <!-- 添加视频弹窗 -->
      <div v-if="showVideoForm" class="modal-overlay" @click.self="showVideoForm = false">
        <div class="modal">
          <div class="modal-header">
            <h3>🎬 添加训练视频</h3>
            <button class="modal-close" @click="showVideoForm = false">✕</button>
          </div>

          <div class="form-group">
            <label class="form-label">来源方式</label>
            <div style="display: flex; gap: 8px;">
              <button class="btn btn-sm" :class="vSourceType === 'link' ? 'btn-primary' : 'btn-secondary'"
                @click="vSourceType = 'link'">🔗 视频链接</button>
              <button class="btn btn-sm" :class="vSourceType === 'file' ? 'btn-primary' : 'btn-secondary'"
                @click="vSourceType = 'file'">📁 本地文件</button>
            </div>
          </div>

          <div class="form-group" v-if="vSourceType === 'link'">
            <label class="form-label">视频链接 *</label>
            <input v-model="vUrl" class="input" placeholder="B站 BV 链接 / YouTube 链接 / mp4 直链" />
            <p style="font-size: 11px; color: var(--text-muted); margin-top: 4px; line-height: 1.5;">
              B站和 YouTube 会自动转换为内嵌播放器
            </p>
          </div>

          <div class="form-group" v-else>
            <label class="form-label">选择视频文件 *</label>
            <input type="file" accept="video/*" @change="onVideoFile" />
            <p v-if="vFile" style="font-size: 12px; color: var(--success); margin-top: 6px;">
              已选择：{{ vFile.name }}（{{ (vFile.size / 1024 / 1024).toFixed(1) }} MB）
            </p>
            <p style="font-size: 11px; color: var(--text-muted); margin-top: 4px; line-height: 1.5;">
              建议单个文件 &lt; 200MB。文件仅保存在你自己的浏览器中，不会上传到任何服务器。
            </p>
          </div>

          <div class="form-group">
            <label class="form-label">标题 *</label>
            <input v-model="vTitle" class="input" placeholder="例：自由泳高肘抱水分解教学" />
          </div>

          <div class="form-group">
            <label class="form-label">分类</label>
            <div style="display: flex; gap: 6px; flex-wrap: wrap;">
              <button v-for="c in videoCategories" :key="c" class="btn btn-sm"
                :class="vCategory === c ? 'btn-primary' : 'btn-secondary'"
                @click="vCategory = c">{{ c }}</button>
            </div>
          </div>

          <div class="form-group">
            <label class="form-label">笔记（可选）</label>
            <textarea v-model="vNote" class="textarea" rows="2" placeholder="记录动作要点、需要注意的地方..." />
          </div>

          <button class="btn btn-primary btn-block" @click="saveVideo">💾 保存</button>
        </div>
      </div>
    </div>
  </div>
</template>
