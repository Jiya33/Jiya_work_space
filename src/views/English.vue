<script setup lang="ts">
import { ref, reactive, onMounted, computed, watch } from 'vue'
import { LearningDB, EnglishLessonDB, EnglishCheckInDB } from '../services/db'
import { today, getMonthCalendar } from '../utils/format'
import { ENGLISH_LESSONS, getTodayLesson, buildLessonPrompt, parseLessonJson } from '../data/english'
import { chat, checkLlm } from '../services/llm'
import type { LearningRecord, EnglishLesson, EnglishCheckIn } from '../types'

const toast = ref({ show: false, msg: '', type: 'success' })
function showToast(msg: string, type = 'success') {
  toast.value = { show: true, msg, type }
  setTimeout(() => { toast.value.show = false }, 2400)
}

const activeTab = ref<'study' | 'record' | 'favorite'>('study')

// ══════════════════ 单元 ══════════════════
const customLessons = ref<EnglishLesson[]>([])
const allLessons = computed<EnglishLesson[]>(() => [...ENGLISH_LESSONS, ...customLessons.value])
const currentLesson = ref<EnglishLesson>(getTodayLesson())
const showZh = ref(true)
const speakingRate = ref(0.9)

// ══════════════════ 分批展示 + 进度 ══════════════════
const BATCH = 4   // 短语 / 句子 每批条数

const offsets = reactive({ phrases: 0, sentences: 0, paragraph: 0, dialogue: 0 })
const ok = reactive({
  phrases: [] as boolean[],
  sentences: [] as boolean[],
  paragraph: false,
  dialogue: [] as boolean[]
})

function batchOf<T>(pool: T[], offset: number, size: number): T[] {
  if (!pool || pool.length === 0) return []
  const n = Math.min(size, pool.length)
  const res: T[] = []
  for (let i = 0; i < n; i++) res.push(pool[(offset + i) % pool.length])
  return res
}

const phraseBatch = computed(() => batchOf(currentLesson.value.phrases, offsets.phrases, BATCH))
const sentenceBatch = computed(() => batchOf(currentLesson.value.sentences, offsets.sentences, BATCH))
const currentParagraph = computed(() => {
  const ps = currentLesson.value.paragraphs
  return ps && ps.length > 0 ? ps[offsets.paragraph % ps.length] : null
})
const currentDialogue = computed(() => {
  const ds = currentLesson.value.dialogues
  return ds && ds.length > 0 ? ds[offsets.dialogue % ds.length] : []
})

// 各块批次序号（如 2/3）
const phraseBatchInfo = computed(() => {
  const len = currentLesson.value.phrases.length
  if (len === 0) return ''
  const total = Math.ceil(len / BATCH)
  return `${Math.floor(offsets.phrases / BATCH) % total + 1}/${total}`
})
const sentenceBatchInfo = computed(() => {
  const len = currentLesson.value.sentences.length
  if (len === 0) return ''
  const total = Math.ceil(len / BATCH)
  return `${Math.floor(offsets.sentences / BATCH) % total + 1}/${total}`
})
const paragraphInfo = computed(() => {
  const len = currentLesson.value.paragraphs?.length || 0
  return len ? `${offsets.paragraph % len + 1}/${len}` : ''
})
const dialogueInfo = computed(() => {
  const len = currentLesson.value.dialogues?.length || 0
  return len ? `${offsets.dialogue % len + 1}/${len}` : ''
})

function pct(arr: boolean[]): number {
  if (arr.length === 0) return 100   // 空块不阻塞整体进度
  return Math.round((arr.filter(Boolean).length / arr.length) * 100)
}

const progress = computed(() => ({
  phrases: pct(ok.phrases),
  sentences: pct(ok.sentences),
  paragraph: currentParagraph.value ? (ok.paragraph ? 100 : 0) : 100,
  dialogue: pct(ok.dialogue)
}))

const overall = computed(() => {
  const p = progress.value
  return Math.round((p.phrases + p.sentences + p.paragraph + p.dialogue) / 4)
})

/** 重置某块的完成标记（长度跟随当前批次） */
function resetMarks(key?: 'phrases' | 'sentences' | 'paragraph' | 'dialogue') {
  if (!key || key === 'phrases') ok.phrases = phraseBatch.value.map(() => false)
  if (!key || key === 'sentences') ok.sentences = sentenceBatch.value.map(() => false)
  if (!key || key === 'paragraph') ok.paragraph = false
  if (!key || key === 'dialogue') ok.dialogue = currentDialogue.value.map(() => false)
}

/** 刷新某个学习块：换下一批 + 进度归零 */
function refreshBlock(key: 'phrases' | 'sentences' | 'paragraph' | 'dialogue') {
  const l = currentLesson.value
  if (key === 'phrases') {
    const len = l.phrases.length
    if (len > BATCH) offsets.phrases = (offsets.phrases + BATCH) % len
  } else if (key === 'sentences') {
    const len = l.sentences.length
    if (len > BATCH) offsets.sentences = (offsets.sentences + BATCH) % len
  } else if (key === 'paragraph') {
    const len = l.paragraphs?.length || 0
    if (len > 0) offsets.paragraph = (offsets.paragraph + 1) % len
  } else {
    const len = l.dialogues?.length || 0
    if (len > 0) offsets.dialogue = (offsets.dialogue + 1) % len
  }
  resetMarks(key)
  showToast('已换一批，进度重置')
}

function toggleOk(key: 'phrases' | 'sentences' | 'dialogue', i: number) {
  const arr = ok[key]
  arr[i] = !arr[i]
  ok[key] = [...arr]
}

function markAll(key: 'phrases' | 'sentences' | 'dialogue') {
  ok[key] = ok[key].map(() => true)
}

function selectLesson(l: EnglishLesson) {
  currentLesson.value = l
  offsets.phrases = 0; offsets.sentences = 0; offsets.paragraph = 0; offsets.dialogue = 0
  resetMarks()
  window.scrollTo({ top: 0, behavior: 'smooth' })
}

// ══════════════════ 本地进度持久化（当天有效） ══════════════════
const storeKey = () => `en_progress_${today()}`

function saveProgress() {
  try {
    localStorage.setItem(storeKey(), JSON.stringify({
      lessonId: currentLesson.value.id,
      offsets: { ...offsets },
      ok: { phrases: [...ok.phrases], sentences: [...ok.sentences], paragraph: ok.paragraph, dialogue: [...ok.dialogue] }
    }))
  } catch { /* 容量不足时忽略 */ }
}

function loadProgress() {
  try {
    const raw = localStorage.getItem(storeKey())
    if (!raw) { resetMarks(); return }
    const d = JSON.parse(raw)
    const found = allLessons.value.find(l => l.id === d.lessonId)
    if (found) currentLesson.value = found
    Object.assign(offsets, d.offsets || {})
    ok.phrases = Array.isArray(d.ok?.phrases) ? d.ok.phrases : []
    ok.sentences = Array.isArray(d.ok?.sentences) ? d.ok.sentences : []
    ok.paragraph = !!d.ok?.paragraph
    ok.dialogue = Array.isArray(d.ok?.dialogue) ? d.ok.dialogue : []
    // 长度对齐（数据变动时兜底）
    if (ok.phrases.length !== phraseBatch.value.length) ok.phrases = phraseBatch.value.map(() => false)
    if (ok.sentences.length !== sentenceBatch.value.length) ok.sentences = sentenceBatch.value.map(() => false)
    if (ok.dialogue.length !== currentDialogue.value.length) ok.dialogue = currentDialogue.value.map(() => false)
  } catch {
    resetMarks()
  }
}

watch([() => ({ ...offsets }), () => JSON.stringify(ok)], saveProgress, { deep: true })

// ══════════════════ 打卡（100% 自动完成） ══════════════════
const checkIns = ref<EnglishCheckIn[]>([])
const checkedToday = computed(() => checkIns.value.some(c => c.date === today()))

watch(overall, async v => {
  if (v >= 100 && !checkedToday.value) {
    await EnglishCheckInDB.add({
      date: today(),
      lessonId: currentLesson.value.id,
      lessonTheme: currentLesson.value.theme,
      createdAt: new Date().toISOString()
    })
    await loadCheckIns()
    showToast('🎉 今日学习计划 100% 完成，已自动打卡！')
  }
})

async function loadCheckIns() {
  checkIns.value = await EnglishCheckInDB.getAll()
}

const checkedDates = computed(() => new Set(checkIns.value.map(c => c.date)))

const streakDays = computed(() => {
  const dates = checkedDates.value
  let streak = 0
  const d = new Date()
  // 今天还没完成时，从昨天开始算，避免连续天数被清零
  if (!dates.has(d.toISOString().slice(0, 10))) d.setDate(d.getDate() - 1)
  while (dates.has(d.toISOString().slice(0, 10))) {
    streak++
    d.setDate(d.getDate() - 1)
  }
  return streak
})

// 日历
const now = new Date()
const calYear = ref(now.getFullYear())
const calMonth = ref(now.getMonth())
const calendar = computed(() => getMonthCalendar(calYear.value, calMonth.value))
const weekDays = ['日', '一', '二', '三', '四', '五', '六']

function dateKey(day: number) {
  return `${calYear.value}-${String(calMonth.value + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`
}
function isDone(day: number) {
  return checkedDates.value.has(dateKey(day))
}
function isToday(day: number) {
  return dateKey(day) === today()
}
const monthDoneCount = computed(() => {
  const prefix = `${calYear.value}-${String(calMonth.value + 1).padStart(2, '0')}`
  return [...checkedDates.value].filter(d => d.startsWith(prefix)).length
})

function prevMonth() {
  calMonth.value--
  if (calMonth.value < 0) { calMonth.value = 11; calYear.value-- }
}
function nextMonth() {
  calMonth.value++
  if (calMonth.value > 11) { calMonth.value = 0; calYear.value++ }
}

// ══════════════════ 朗读 ══════════════════
const speaking = ref(false)
function speak(text: string) {
  if (!('speechSynthesis' in window)) { showToast('当前浏览器不支持朗读', 'error'); return }
  window.speechSynthesis.cancel()
  const u = new SpeechSynthesisUtterance(text)
  u.lang = 'en-US'
  u.rate = speakingRate.value
  u.onstart = () => { speaking.value = true }
  u.onend = () => { speaking.value = false }
  window.speechSynthesis.speak(u)
}
function stopSpeak() {
  window.speechSynthesis?.cancel()
  speaking.value = false
}
function speakDialogue() {
  if (!('speechSynthesis' in window)) return
  window.speechSynthesis.cancel()
  const lines = currentDialogue.value
  lines.forEach((d, i) => {
    const u = new SpeechSynthesisUtterance(d.en)
    u.lang = 'en-US'
    u.rate = speakingRate.value
    const voices = window.speechSynthesis.getVoices().filter(v => v.lang.startsWith('en'))
    if (voices.length > 1) u.voice = voices[i % 2]
    if (i === 0) u.onstart = () => { speaking.value = true }
    if (i === lines.length - 1) u.onend = () => { speaking.value = false }
    window.speechSynthesis.speak(u)
  })
}

// ══════════════════ 收藏本 ══════════════════
const learningRecords = ref<LearningRecord[]>([])
const favorites = computed(() => learningRecords.value.filter(r => r.isFavorite))
const showReview = ref(false)
const reviewRecord = ref<LearningRecord | null>(null)

async function saveToRecords(category: string, content: string) {
  await LearningDB.add({
    date: today(),
    category,
    content,
    isFavorite: true,
    createdAt: new Date().toISOString()
  })
  showToast('已加入收藏本')
  loadLearning()
}

async function deleteLearning(id: number) {
  await LearningDB.delete(id)
  loadLearning()
}

function startReview() {
  if (favorites.value.length === 0) { showToast('还没有收藏内容', 'error'); return }
  reviewRecord.value = favorites.value[Math.floor(Math.random() * favorites.value.length)]
  showReview.value = true
}

async function loadLearning() {
  learningRecords.value = (await LearningDB.getAll()).sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  )
}

// ══════════════════ 添加自定义单元 ══════════════════
const showAddUnit = ref(false)
const newTheme = ref('')
const newDesc = ref('')
const newEmoji = ref('📘')
const newLevel = ref<'入门' | '进阶' | '高阶'>('进阶')
const generating = ref(false)
const genStep = ref('')
const pasteJson = ref('')
const llmReady = ref(false)
const llmLabel = ref('未配置')

async function refreshLlmStatus() {
  const s = await checkLlm()
  llmReady.value = s.ready
  llmLabel.value = s.ready ? s.label : (s.reason || '未配置')
}

function openAddUnit() {
  newTheme.value = ''
  newDesc.value = ''
  newEmoji.value = '📘'
  newLevel.value = '进阶'
  pasteJson.value = ''
  genStep.value = ''
  showAddUnit.value = true
  refreshLlmStatus()
}

function currentPrompt() {
  return buildLessonPrompt(newTheme.value.trim(), newDesc.value.trim(), newLevel.value)
}

async function copyPrompt() {
  if (!newTheme.value.trim()) { showToast('请先填写单元名称', 'error'); return }
  try {
    await navigator.clipboard.writeText(currentPrompt())
    showToast('提示词已复制，粘到任意 AI 对话里生成后再回来导入')
  } catch {
    showToast('复制失败，请手动选中复制', 'error')
  }
}

async function generateUnit() {
  const theme = newTheme.value.trim()
  if (!theme) { showToast('请填写单元名称', 'error'); return }
  if (!llmReady.value) {
    showToast('未配置大模型，可用下方「复制提示词 + 粘贴导入」方式', 'error')
    return
  }
  generating.value = true
  genStep.value = '正在生成学习资料，约需 20-60 秒…'
  try {
    const raw = await chat(currentPrompt(), { temperature: 0.8, maxTokens: 6000 })
    genStep.value = '正在解析…'
    const lesson = parseLessonJson(raw, { theme, desc: newDesc.value.trim(), level: newLevel.value })
    if (newEmoji.value.trim()) lesson.emoji = newEmoji.value.trim()
    await EnglishLessonDB.add(lesson)
    await loadCustomLessons()
    showAddUnit.value = false
    selectLesson(lesson)
    showToast(`《${lesson.theme}》已生成，共 ${lesson.phrases.length} 短语 / ${lesson.sentences.length} 句子`)
  } catch (e) {
    showToast((e as Error).message || '生成失败', 'error')
    genStep.value = ''
  } finally {
    generating.value = false
  }
}

async function importJson() {
  const text = pasteJson.value.trim()
  if (!text) { showToast('请先粘贴 AI 返回的 JSON', 'error'); return }
  try {
    const lesson = parseLessonJson(text, {
      theme: newTheme.value.trim() || '自定义单元',
      desc: newDesc.value.trim(),
      level: newLevel.value
    })
    if (newEmoji.value.trim()) lesson.emoji = newEmoji.value.trim()
    await EnglishLessonDB.add(lesson)
    await loadCustomLessons()
    showAddUnit.value = false
    selectLesson(lesson)
    showToast(`《${lesson.theme}》导入成功`)
  } catch (e) {
    showToast('JSON 解析失败：' + (e as Error).message, 'error')
  }
}

async function deleteCustomLesson(l: EnglishLesson) {
  if (!confirm(`确定删除自建单元《${l.theme}》？此操作不可恢复。`)) return
  await EnglishLessonDB.delete(l.id)
  await loadCustomLessons()
  if (currentLesson.value.id === l.id) selectLesson(ENGLISH_LESSONS[0])
  showToast('已删除')
}

async function loadCustomLessons() {
  customLessons.value = (await EnglishLessonDB.getAll()).sort(
    (a, b) => new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime()
  )
}

onMounted(async () => {
  await Promise.all([loadLearning(), loadCheckIns(), loadCustomLessons()])
  loadProgress()
  window.speechSynthesis?.getVoices()
})
</script>

<template>
  <div>
    <div v-if="toast.show" class="toast" :class="toast.type">{{ toast.msg }}</div>

    <div class="tabs">
      <button class="tab-item" :class="{ active: activeTab === 'study' }" @click="activeTab = 'study'">📖 学习资料</button>
      <button class="tab-item" :class="{ active: activeTab === 'record' }" @click="activeTab = 'record'">📅 打卡记录</button>
      <button class="tab-item" :class="{ active: activeTab === 'favorite' }" @click="activeTab = 'favorite'">⭐ 收藏本</button>
    </div>

    <!-- ══════════════════ 学习资料 ══════════════════ -->
    <div v-if="activeTab === 'study'">
      <!-- 单元选择 -->
      <div class="card">
        <div class="card-title" style="display: flex; justify-content: space-between; align-items: center;">
          <span>📚 学习单元（{{ allLessons.length }}）</span>
          <button class="btn btn-sm btn-primary" @click="openAddUnit">＋ 添加单元</button>
        </div>
        <div style="display: flex; gap: 6px; flex-wrap: wrap;">
          <button v-for="l in allLessons" :key="l.id" class="btn btn-sm"
            :class="currentLesson.id === l.id ? 'btn-primary' : 'btn-secondary'"
            @click="selectLesson(l)">
            {{ l.emoji }} {{ l.theme.split(' ')[0] }}<span v-if="l.custom"> ·自建</span>
          </button>
        </div>
        <div style="display: flex; gap: 12px; align-items: center; margin-top: 12px; flex-wrap: wrap;">
          <label style="display: flex; align-items: center; gap: 6px; font-size: 13px;">
            <input type="checkbox" v-model="showZh" style="width: 18px; height: 18px; accent-color: var(--primary);" />
            显示中文
          </label>
          <label style="display: flex; align-items: center; gap: 6px; font-size: 13px;">
            语速
            <input type="range" v-model.number="speakingRate" min="0.5" max="1.2" step="0.1" style="width: 90px;" />
            <span style="color: var(--text-muted);">{{ speakingRate.toFixed(1) }}x</span>
          </label>
          <button v-if="speaking" class="btn btn-sm btn-danger" @click="stopSpeak">⏹ 停止</button>
        </div>
      </div>

      <!-- 当前单元 + 总进度 -->
      <div class="card" style="border-left: 4px solid var(--primary);">
        <div style="display: flex; justify-content: space-between; align-items: flex-start; gap: 10px;">
          <div style="flex: 1;">
            <div style="font-size: 18px; font-weight: 700;">{{ currentLesson.emoji }} {{ currentLesson.theme }}</div>
            <div v-if="currentLesson.desc" style="font-size: 12px; color: var(--text-secondary); margin-top: 4px;">
              {{ currentLesson.desc }}
            </div>
            <div style="margin-top: 6px; display: flex; gap: 6px; align-items: center;">
              <span class="tag tag-primary">{{ currentLesson.level }}</span>
              <span v-if="currentLesson.custom" class="tag" style="background: rgba(16,185,129,.12); color: var(--success);">自建</span>
              <button v-if="currentLesson.custom" class="btn btn-sm" style="color: var(--danger); padding: 2px 6px;"
                @click="deleteCustomLesson(currentLesson)">删除单元</button>
            </div>
          </div>
          <div style="text-align: right; flex-shrink: 0;">
            <div style="font-size: 26px; font-weight: 700;" :style="{ color: overall >= 100 ? 'var(--success)' : 'var(--primary)' }">
              {{ overall }}%
            </div>
            <div style="font-size: 11px; color: var(--text-muted);">今日完成度</div>
          </div>
        </div>
        <div class="blk-bar" style="margin-top: 12px; height: 8px;">
          <div class="blk-bar-fill" :class="{ done: overall >= 100 }" :style="{ width: overall + '%' }"></div>
        </div>
        <div style="font-size: 12px; color: var(--text-muted); margin-top: 8px;">
          <span v-if="checkedToday" style="color: var(--success); font-weight: 600;">✓ 今日已打卡</span>
          <span v-else>四个学习块全部完成后自动打卡</span>
        </div>
      </div>

      <!-- 短语 -->
      <div class="card">
        <div class="card-title" style="display: flex; justify-content: space-between; align-items: center;">
          <span>🔤 高频短语 <span style="font-size: 12px; color: var(--text-muted); font-weight: 400;">{{ phraseBatchInfo }}</span></span>
          <div style="display: flex; gap: 6px; align-items: center;">
            <span class="blk-pct">{{ progress.phrases }}%</span>
            <button class="btn btn-sm btn-secondary" @click="markAll('phrases')" title="全部标记已记住">✓✓</button>
            <button class="btn btn-sm btn-secondary" @click="refreshBlock('phrases')">🔄 换一批</button>
          </div>
        </div>
        <div class="blk-bar"><div class="blk-bar-fill" :class="{ done: progress.phrases >= 100 }" :style="{ width: progress.phrases + '%' }"></div></div>

        <div v-for="(p, i) in phraseBatch" :key="`ph-${offsets.phrases}-${i}`"
          class="learn-row" :class="{ marked: ok.phrases[i] }">
          <div style="flex: 1;">
            <div style="font-size: 15px; font-weight: 600; color: var(--text-primary);">{{ p.en }}</div>
            <div v-if="showZh" style="font-size: 13px; color: var(--text-secondary); margin-top: 2px;">{{ p.zh }}</div>
          </div>
          <div style="display: flex; gap: 4px; flex-shrink: 0; align-items: center;">
            <button class="btn btn-sm btn-secondary" @click="speak(p.en)" title="朗读">🔊</button>
            <button class="btn btn-sm btn-secondary" @click="saveToRecords('短语', `${p.en} — ${p.zh}`)" title="收藏">☆</button>
            <button class="ok-btn" :class="{ on: ok.phrases[i] }" @click="toggleOk('phrases', i)">
              {{ ok.phrases[i] ? '✓ 已记住' : 'OK' }}
            </button>
          </div>
        </div>
      </div>

      <!-- 句子 -->
      <div class="card">
        <div class="card-title" style="display: flex; justify-content: space-between; align-items: center;">
          <span>💬 实用句子 <span style="font-size: 12px; color: var(--text-muted); font-weight: 400;">{{ sentenceBatchInfo }}</span></span>
          <div style="display: flex; gap: 6px; align-items: center;">
            <span class="blk-pct">{{ progress.sentences }}%</span>
            <button class="btn btn-sm btn-secondary" @click="markAll('sentences')" title="全部标记已学习">✓✓</button>
            <button class="btn btn-sm btn-secondary" @click="refreshBlock('sentences')">🔄 换一批</button>
          </div>
        </div>
        <div class="blk-bar"><div class="blk-bar-fill" :class="{ done: progress.sentences >= 100 }" :style="{ width: progress.sentences + '%' }"></div></div>

        <div v-for="(s, i) in sentenceBatch" :key="`se-${offsets.sentences}-${i}`"
          class="learn-row" :class="{ marked: ok.sentences[i] }">
          <div style="flex: 1;">
            <div style="font-size: 14px; line-height: 1.6; color: var(--text-primary);">{{ s.en }}</div>
            <div v-if="showZh" style="font-size: 13px; color: var(--text-secondary); margin-top: 4px;">{{ s.zh }}</div>
          </div>
          <div style="display: flex; gap: 4px; flex-shrink: 0; align-items: center;">
            <button class="btn btn-sm btn-secondary" @click="speak(s.en)">🔊</button>
            <button class="btn btn-sm btn-secondary" @click="saveToRecords('句子', `${s.en} — ${s.zh}`)">☆</button>
            <button class="ok-btn" :class="{ on: ok.sentences[i] }" @click="toggleOk('sentences', i)">
              {{ ok.sentences[i] ? '✓ 已学习' : 'OK' }}
            </button>
          </div>
        </div>
      </div>

      <!-- 段落精读 -->
      <div class="card" v-if="currentParagraph">
        <div class="card-title" style="display: flex; justify-content: space-between; align-items: center;">
          <span>📄 段落精读 <span style="font-size: 12px; color: var(--text-muted); font-weight: 400;">{{ paragraphInfo }}</span></span>
          <div style="display: flex; gap: 6px; align-items: center;">
            <span class="blk-pct">{{ progress.paragraph }}%</span>
            <button class="btn btn-sm btn-secondary" @click="speak(currentParagraph.en)">🔊</button>
            <button class="btn btn-sm btn-secondary" @click="refreshBlock('paragraph')">🔄 换一篇</button>
          </div>
        </div>
        <div class="blk-bar"><div class="blk-bar-fill" :class="{ done: progress.paragraph >= 100 }" :style="{ width: progress.paragraph + '%' }"></div></div>

        <div style="font-size: 14px; font-weight: 700; margin: 10px 0 6px;">{{ currentParagraph.title }}</div>
        <p style="font-size: 14px; line-height: 1.9; color: var(--text-primary); text-align: justify;">
          {{ currentParagraph.en }}
        </p>
        <p v-if="showZh" style="font-size: 13px; line-height: 1.8; color: var(--text-secondary); margin-top: 12px; padding-top: 12px; border-top: 1px dashed var(--border); text-align: justify;">
          {{ currentParagraph.zh }}
        </p>
        <div style="display: flex; gap: 8px; margin-top: 12px;">
          <button class="ok-btn" :class="{ on: ok.paragraph }" @click="ok.paragraph = !ok.paragraph">
            {{ ok.paragraph ? '✓ 已读完' : 'OK 我读完了' }}
          </button>
          <button class="btn btn-sm btn-secondary"
            @click="saveToRecords('阅读', currentParagraph.title + '：' + currentParagraph.en.slice(0, 80) + '...')">
            ☆ 收藏本段
          </button>
        </div>
      </div>

      <!-- 口语练习 -->
      <div class="card" v-if="currentDialogue.length">
        <div class="card-title" style="display: flex; justify-content: space-between; align-items: center;">
          <span>🗣 口语练习 <span style="font-size: 12px; color: var(--text-muted); font-weight: 400;">{{ dialogueInfo }}</span></span>
          <div style="display: flex; gap: 6px; align-items: center;">
            <span class="blk-pct">{{ progress.dialogue }}%</span>
            <button class="btn btn-sm btn-primary" @click="speakDialogue">▶ 全部</button>
            <button class="btn btn-sm btn-secondary" @click="refreshBlock('dialogue')">🔄 换一段</button>
          </div>
        </div>
        <div class="blk-bar"><div class="blk-bar-fill" :class="{ done: progress.dialogue >= 100 }" :style="{ width: progress.dialogue + '%' }"></div></div>

        <div v-for="(d, i) in currentDialogue" :key="`dl-${offsets.dialogue}-${i}`"
          class="learn-row" :class="{ marked: ok.dialogue[i] }">
          <div :style="{
            width: '42px', flexShrink: 0, fontSize: '12px', fontWeight: '700',
            color: i % 2 === 0 ? 'var(--primary)' : 'var(--success)'
          }">{{ d.role }}</div>
          <div style="flex: 1;">
            <div style="font-size: 14px; line-height: 1.6;">{{ d.en }}</div>
            <div v-if="showZh" style="font-size: 12px; color: var(--text-secondary); margin-top: 3px;">{{ d.zh }}</div>
          </div>
          <div style="display: flex; gap: 4px; flex-shrink: 0; align-items: center;">
            <button class="btn btn-sm btn-secondary" @click="speak(d.en)">🔊</button>
            <button class="ok-btn" :class="{ on: ok.dialogue[i] }" @click="toggleOk('dialogue', i)">
              {{ ok.dialogue[i] ? '✓' : 'OK' }}
            </button>
          </div>
        </div>
        <div style="display: flex; gap: 8px; margin-top: 10px;">
          <button class="btn btn-sm btn-secondary" @click="markAll('dialogue')">✓✓ 全部跟读完成</button>
        </div>
        <p style="font-size: 12px; color: var(--text-muted); margin-top: 10px; line-height: 1.6;">
          💡 影子跟读法：点「全部」，延迟约 1 秒跟着念，重点模仿语调和连读，不要停下来纠结单个词。
        </p>
      </div>

      <!-- 本单元要点 -->
      <div class="card" v-if="currentLesson.tips.length" style="background: rgba(160,106,67,0.06);">
        <div class="card-title">💡 本单元要点</div>
        <ul style="margin: 0; padding-left: 18px; font-size: 13px; line-height: 1.9; color: var(--text-secondary);">
          <li v-for="(t, i) in currentLesson.tips" :key="i">{{ t }}</li>
        </ul>
      </div>
    </div>

    <!-- ══════════════════ 打卡记录 ══════════════════ -->
    <div v-if="activeTab === 'record'">
      <div class="card" style="text-align: center;">
        <div style="font-size: 34px; font-weight: 700; color: var(--primary);">🔥 {{ streakDays }}</div>
        <div style="font-size: 13px; color: var(--text-muted); margin-top: 4px;">连续打卡天数</div>
      </div>

      <div class="card">
        <div class="card-title" style="display: flex; justify-content: space-between; align-items: center;">
          <span>📅 {{ calYear }}年{{ calMonth + 1 }}月<span style="font-size: 12px; color: var(--text-muted); font-weight: 400;">（完成 {{ monthDoneCount }} 天）</span></span>
          <div style="display: flex; gap: 8px;">
            <button class="btn btn-sm btn-secondary" @click="prevMonth">◀</button>
            <button class="btn btn-sm btn-secondary" @click="nextMonth">▶</button>
          </div>
        </div>
        <div style="display: grid; grid-template-columns: repeat(7, 1fr); gap: 4px; text-align: center;">
          <div v-for="d in weekDays" :key="d" style="font-size: 12px; color: var(--text-muted); padding: 4px 0;">{{ d }}</div>
          <div v-for="(week, wi) in calendar" :key="wi" style="display: contents;">
            <div v-for="(day, di) in week" :key="`${wi}-${di}`" class="cal-cell"
              :class="{ done: day && isDone(day), today: day && isToday(day) }">
              {{ day || '' }}
            </div>
          </div>
        </div>
        <div style="display: flex; gap: 16px; margin-top: 14px; font-size: 12px; color: var(--text-muted); align-items: center;">
          <span style="display: flex; align-items: center; gap: 6px;">
            <i class="cal-legend done"></i> 当日学习计划 100% 完成
          </span>
          <span style="display: flex; align-items: center; gap: 6px;">
            <i class="cal-legend"></i> 未完成
          </span>
        </div>
      </div>

      <div class="card" style="background: rgba(160,106,67,0.06);">
        <div style="font-size: 13px; color: var(--text-secondary); line-height: 1.8;">
          打卡由「学习资料」页的完成度自动写入：短语、句子、段落、口语四个学习块全部标记完成（总进度 100%）后，
          当天日历自动填色。中途点「换一批」会重置对应块的进度。
        </div>
      </div>
    </div>

    <!-- ══════════════════ 收藏本 ══════════════════ -->
    <div v-if="activeTab === 'favorite'">
      <div class="card">
        <div class="card-title" style="display: flex; justify-content: space-between;">
          <span>⭐ 收藏本（{{ favorites.length }}）</span>
          <button class="btn btn-sm btn-primary" @click="startReview">🎲 随机复习</button>
        </div>
        <div v-if="favorites.length === 0" class="empty-state">
          <div style="font-size: 32px;">⭐</div>
          <div>还没有收藏内容</div>
          <div style="font-size: 12px; color: var(--text-muted); margin-top: 4px;">在「学习资料」中点 ☆ 即可收藏</div>
        </div>
        <div v-for="r in favorites" :key="r.id"
          style="padding: 12px 0; border-bottom: 1px solid var(--border); font-size: 14px;">
          <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 6px;">
            <span class="tag tag-primary">{{ r.category }}</span>
            <div style="display: flex; gap: 6px;">
              <button class="btn btn-sm btn-secondary" @click="speak(r.content.split(' — ')[0])">🔊</button>
              <button class="btn btn-sm" style="color: var(--danger);" @click="deleteLearning(r.id!)">✕</button>
            </div>
          </div>
          <div style="line-height: 1.7;">{{ r.content }}</div>
        </div>
      </div>
    </div>

    <!-- ══════════════════ 添加单元弹窗 ══════════════════ -->
    <div v-if="showAddUnit" class="modal-overlay" @click.self="showAddUnit = false">
      <div class="modal" style="max-width: 520px;">
        <div class="modal-header">
          <h3>＋ 添加学习单元</h3>
          <button class="modal-close" @click="showAddUnit = false">✕</button>
        </div>

        <div class="form-group">
          <label class="form-label">单元名称 *</label>
          <input v-model="newTheme" class="input" placeholder="如：《小王子》场景英语 / 医疗英语 / 咖啡店点单" />
        </div>
        <div class="form-group">
          <label class="form-label">描述 / 适用场景</label>
          <textarea v-model="newDesc" class="textarea" rows="2"
            placeholder="如：围绕《小王子》原著的经典对白与意象，适合文学阅读与情感表达练习" />
        </div>
        <div style="display: flex; gap: 10px;">
          <div class="form-group" style="width: 90px;">
            <label class="form-label">图标</label>
            <input v-model="newEmoji" class="input" maxlength="4" style="text-align: center;" />
          </div>
          <div class="form-group" style="flex: 1;">
            <label class="form-label">难度</label>
            <select v-model="newLevel" class="select">
              <option value="入门">入门</option>
              <option value="进阶">进阶</option>
              <option value="高阶">高阶</option>
            </select>
          </div>
        </div>

        <div style="padding: 10px 12px; border-radius: 8px; background: var(--bg); font-size: 12px; color: var(--text-secondary); line-height: 1.7;">
          生成内容包含：12 条短语 · 12 条句子 · 2 篇精读段落 · 2 组口语对话 · 3 条学习要点<br />
          大模型状态：<strong :style="{ color: llmReady ? 'var(--success)' : 'var(--danger)' }">{{ llmLabel }}</strong>
          <span v-if="!llmReady">（可到「设置 → 大模型配置」填写 API Key）</span>
        </div>

        <button class="btn btn-primary btn-block" style="margin-top: 12px;"
          :disabled="generating" @click="generateUnit">
          {{ generating ? '⏳ ' + genStep : '✨ AI 自动生成学习资料' }}
        </button>

        <details style="margin-top: 14px;">
          <summary style="font-size: 13px; color: var(--text-secondary); cursor: pointer;">
            没有 API Key？用免费方式生成 ▾
          </summary>
          <div style="margin-top: 10px;">
            <p style="font-size: 12px; color: var(--text-muted); line-height: 1.7;">
              1. 点下方「复制提示词」→ 2. 粘贴到任意 AI 对话（豆包 / DeepSeek 网页 / Kimi 等）→
              3. 把返回的 JSON 整段复制回来粘贴到下框 → 4. 点「导入」。
            </p>
            <button class="btn btn-secondary btn-block" style="margin: 8px 0;" @click="copyPrompt">📋 复制提示词</button>
            <textarea v-model="pasteJson" class="textarea" rows="4" placeholder="在此粘贴 AI 返回的 JSON…" />
            <button class="btn btn-primary btn-block" style="margin-top: 8px;" @click="importJson">📥 导入 JSON</button>
          </div>
        </details>

        <div v-if="customLessons.length" style="margin-top: 16px; padding-top: 12px; border-top: 1px solid var(--border);">
          <div style="font-size: 13px; font-weight: 600; margin-bottom: 8px;">已有自建单元</div>
          <div v-for="l in customLessons" :key="l.id"
            style="display: flex; justify-content: space-between; align-items: center; padding: 6px 0; font-size: 13px;">
            <span>{{ l.emoji }} {{ l.theme }}</span>
            <button class="btn btn-sm" style="color: var(--danger);" @click="deleteCustomLesson(l)">删除</button>
          </div>
        </div>
      </div>
    </div>

    <!-- 随机复习弹窗 -->
    <div v-if="showReview && reviewRecord" class="modal-overlay" @click.self="showReview = false">
      <div class="modal">
        <div class="modal-header">
          <h3>🎲 随机复习</h3>
          <button class="modal-close" @click="showReview = false">✕</button>
        </div>
        <p style="color: var(--text-secondary); font-size: 13px;">分类：{{ reviewRecord.category }}</p>
        <p style="margin-top: 12px; font-size: 16px; line-height: 1.7;">{{ reviewRecord.content }}</p>
        <div style="margin-top: 16px; display: flex; gap: 8px;">
          <button class="btn btn-secondary" @click="speak(reviewRecord.content.split(' — ')[0])">🔊 朗读</button>
          <button class="btn btn-primary" @click="startReview()">🔄 换一个</button>
          <button class="btn btn-secondary" @click="showReview = false">关闭</button>
        </div>
      </div>
    </div>
  </div>
</template>
