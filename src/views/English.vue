<script setup lang="ts">
import { ref, onMounted, computed } from 'vue'
import { LearningDB } from '../services/db'
import { today, getMonthCalendar, formatDate } from '../utils/format'
import { ENGLISH_LESSONS, getTodayLesson } from '../data/english'
import type { LearningRecord, EnglishLesson } from '../types'

const toast = ref({ show: false, msg: '', type: 'success' })
function showToast(msg: string, type = 'success') {
  toast.value = { show: true, msg, type }
  setTimeout(() => { toast.value.show = false }, 2000)
}

const activeTab = ref<'study' | 'record' | 'favorite'>('study')

// ====== 学习资料 ======
const lessons = ENGLISH_LESSONS
const currentLesson = ref<EnglishLesson>(getTodayLesson())
const showZh = ref(true)
const speakingRate = ref(0.9)

function selectLesson(l: EnglishLesson) {
  currentLesson.value = l
  window.scrollTo({ top: 0, behavior: 'smooth' })
}

/** 浏览器 TTS 朗读 */
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

/** 整段朗读对话 */
function speakDialogue() {
  if (!('speechSynthesis' in window)) return
  window.speechSynthesis.cancel()
  currentLesson.value.dialogue.forEach((d, i) => {
    const u = new SpeechSynthesisUtterance(d.en)
    u.lang = 'en-US'
    u.rate = speakingRate.value
    // 交替使用不同音色（若可用）
    const voices = window.speechSynthesis.getVoices().filter(v => v.lang.startsWith('en'))
    if (voices.length > 1) u.voice = voices[i % 2]
    if (i === 0) u.onstart = () => { speaking.value = true }
    if (i === currentLesson.value.dialogue.length - 1) u.onend = () => { speaking.value = false }
    window.speechSynthesis.speak(u)
  })
}

/** 一键收藏本条到学习记录 */
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

/** 完成今日学习打卡 */
async function checkInLesson() {
  await LearningDB.add({
    date: today(),
    category: '课程',
    content: `完成《${currentLesson.value.theme}》学习`,
    isFavorite: false,
    createdAt: new Date().toISOString()
  })
  showToast('🎉 今日英语打卡完成！')
  loadLearning()
}

// ====== 学习记录 ======
const learningRecords = ref<LearningRecord[]>([])
const learnCategory = ref('单词')
const learnContent = ref('')
const learnCategories = ['单词', '短语', '句子', '语法', '听力', '阅读', '口语', '写作', '课程']
const favorites = computed(() => learningRecords.value.filter(r => r.isFavorite))
const showReview = ref(false)
const reviewRecord = ref<LearningRecord | null>(null)

// 日历
const now = new Date()
const calYear = ref(now.getFullYear())
const calMonth = ref(now.getMonth())
const calendar = computed(() => getMonthCalendar(calYear.value, calMonth.value))
const weekDays = ['日', '一', '二', '三', '四', '五', '六']

const streakDays = computed(() => {
  const dates = new Set(learningRecords.value.map(r => r.date))
  let streak = 0
  const d = new Date()
  // eslint-disable-next-line no-constant-condition
  while (true) {
    const key = d.toISOString().slice(0, 10)
    if (dates.has(key)) { streak++; d.setDate(d.getDate() - 1) }
    else break
  }
  return streak
})

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
  await LearningDB.update({ ...record })
  loadLearning()
}

async function deleteLearning(id: number) {
  await LearningDB.delete(id)
  loadLearning()
}

function startReview() {
  const pool = favorites.value.length > 0 ? favorites.value : learningRecords.value
  if (pool.length === 0) { showToast('还没有可复习的内容', 'error'); return }
  reviewRecord.value = pool[Math.floor(Math.random() * pool.length)]
  showReview.value = true
}

async function loadLearning() {
  learningRecords.value = (await LearningDB.getAll()).sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  )
}

onMounted(() => {
  loadLearning()
  // 预加载语音列表
  window.speechSynthesis?.getVoices()
})
</script>

<template>
  <div>
    <div v-if="toast.show" class="toast" :class="toast.type">{{ toast.msg }}</div>

    <div class="tabs">
      <button class="tab-item" :class="{ active: activeTab === 'study' }" @click="activeTab = 'study'">📖 学习资料</button>
      <button class="tab-item" :class="{ active: activeTab === 'record' }" @click="activeTab = 'record'">✍️ 打卡记录</button>
      <button class="tab-item" :class="{ active: activeTab === 'favorite' }" @click="activeTab = 'favorite'">⭐ 收藏本</button>
    </div>

    <!-- ══════════ 学习资料 ══════════ -->
    <div v-if="activeTab === 'study'">
      <!-- 单元选择 -->
      <div class="card">
        <div class="card-title">📚 学习单元（共 {{ lessons.length }} 个主题）</div>
        <div style="display: flex; gap: 6px; flex-wrap: wrap;">
          <button v-for="l in lessons" :key="l.id" class="btn btn-sm"
            :class="currentLesson.id === l.id ? 'btn-primary' : 'btn-secondary'"
            @click="selectLesson(l)">
            {{ l.emoji }} {{ l.theme.split(' ')[0] }}
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

      <!-- 当前单元头 -->
      <div class="card" style="border-left: 4px solid var(--primary);">
        <div style="display: flex; justify-content: space-between; align-items: center;">
          <div>
            <div style="font-size: 18px; font-weight: 700;">{{ currentLesson.emoji }} {{ currentLesson.theme }}</div>
            <span class="tag tag-primary" style="margin-top: 6px; display: inline-block;">{{ currentLesson.level }}</span>
          </div>
          <button class="btn btn-primary btn-sm" @click="checkInLesson">✓ 打卡</button>
        </div>
      </div>

      <!-- 短语 -->
      <div class="card">
        <div class="card-title">🔤 高频短语 Phrases</div>
        <div v-for="(p, i) in currentLesson.phrases" :key="i"
          style="padding: 10px 0; border-bottom: 1px solid var(--border);">
          <div style="display: flex; justify-content: space-between; align-items: flex-start; gap: 8px;">
            <div style="flex: 1;">
              <div style="font-size: 15px; font-weight: 600; color: var(--text-primary);">{{ p.en }}</div>
              <div v-if="showZh" style="font-size: 13px; color: var(--text-secondary); margin-top: 2px;">{{ p.zh }}</div>
            </div>
            <div style="display: flex; gap: 4px; flex-shrink: 0;">
              <button class="btn btn-sm btn-secondary" @click="speak(p.en)" title="朗读">🔊</button>
              <button class="btn btn-sm btn-secondary" @click="saveToRecords('短语', `${p.en} — ${p.zh}`)" title="收藏">☆</button>
            </div>
          </div>
        </div>
      </div>

      <!-- 句子 -->
      <div class="card">
        <div class="card-title">💬 实用句子 Sentences</div>
        <div v-for="(s, i) in currentLesson.sentences" :key="i"
          style="padding: 10px 0; border-bottom: 1px solid var(--border);">
          <div style="display: flex; justify-content: space-between; align-items: flex-start; gap: 8px;">
            <div style="flex: 1;">
              <div style="font-size: 14px; line-height: 1.6; color: var(--text-primary);">{{ s.en }}</div>
              <div v-if="showZh" style="font-size: 13px; color: var(--text-secondary); margin-top: 4px;">{{ s.zh }}</div>
            </div>
            <div style="display: flex; gap: 4px; flex-shrink: 0;">
              <button class="btn btn-sm btn-secondary" @click="speak(s.en)">🔊</button>
              <button class="btn btn-sm btn-secondary" @click="saveToRecords('句子', `${s.en} — ${s.zh}`)">☆</button>
            </div>
          </div>
        </div>
      </div>

      <!-- 段落精读 -->
      <div class="card">
        <div class="card-title" style="display: flex; justify-content: space-between; align-items: center;">
          <span>📄 段落精读 · {{ currentLesson.paragraph.title }}</span>
          <button class="btn btn-sm btn-secondary" @click="speak(currentLesson.paragraph.en)">🔊 朗读</button>
        </div>
        <p style="font-size: 14px; line-height: 1.9; color: var(--text-primary); text-align: justify;">
          {{ currentLesson.paragraph.en }}
        </p>
        <p v-if="showZh" style="font-size: 13px; line-height: 1.8; color: var(--text-secondary); margin-top: 12px; padding-top: 12px; border-top: 1px dashed var(--border); text-align: justify;">
          {{ currentLesson.paragraph.zh }}
        </p>
        <button class="btn btn-sm btn-secondary" style="margin-top: 10px;"
          @click="saveToRecords('阅读', currentLesson.paragraph.title + '：' + currentLesson.paragraph.en.slice(0, 80) + '...')">
          ☆ 收藏本段
        </button>
      </div>

      <!-- 口语对话 -->
      <div class="card">
        <div class="card-title" style="display: flex; justify-content: space-between; align-items: center;">
          <span>🗣 口语练习 Dialogue</span>
          <button class="btn btn-sm btn-primary" @click="speakDialogue">▶ 播放全部</button>
        </div>
        <div v-for="(d, i) in currentLesson.dialogue" :key="i"
          :style="{
            display: 'flex', gap: '10px', padding: '10px 0',
            borderBottom: '1px solid var(--border)'
          }">
          <div :style="{
            width: '42px', flexShrink: 0, fontSize: '12px', fontWeight: '700',
            color: i % 2 === 0 ? 'var(--primary)' : 'var(--success)'
          }">{{ d.role }}</div>
          <div style="flex: 1;">
            <div style="font-size: 14px; line-height: 1.6;">{{ d.en }}</div>
            <div v-if="showZh" style="font-size: 12px; color: var(--text-secondary); margin-top: 3px;">{{ d.zh }}</div>
          </div>
          <button class="btn btn-sm btn-secondary" style="flex-shrink: 0;" @click="speak(d.en)">🔊</button>
        </div>
        <p style="font-size: 12px; color: var(--text-muted); margin-top: 10px; line-height: 1.6;">
          💡 影子跟读法：点「播放全部」，延迟约 1 秒跟着念，重点模仿语调和连读，不要停下来纠结单个词。
        </p>
      </div>

      <!-- 学习提示 -->
      <div class="card" style="background: rgba(79,70,229,0.04);">
        <div class="card-title">💡 本单元要点</div>
        <ul style="margin: 0; padding-left: 18px; font-size: 13px; line-height: 1.9; color: var(--text-secondary);">
          <li v-for="(t, i) in currentLesson.tips" :key="i">{{ t }}</li>
        </ul>
      </div>
    </div>

    <!-- ══════════ 打卡记录 ══════════ -->
    <div v-if="activeTab === 'record'">
      <!-- 连续天数 -->
      <div class="card" style="text-align: center;">
        <div style="font-size: 32px; font-weight: 700; color: var(--primary);">🔥 {{ streakDays }}</div>
        <div style="font-size: 13px; color: var(--text-muted); margin-top: 4px;">连续打卡天数</div>
      </div>

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
                background: day && hasLearningRecord(day) ? 'rgba(79,70,229,0.15)' : 'transparent',
                color: day ? 'var(--text-primary)' : 'var(--text-muted)',
                fontWeight: day && hasLearningRecord(day) ? '700' : '400'
              }"
            >{{ day || '' }}</div>
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
          <textarea v-model="learnContent" class="textarea" placeholder="输入今天学到的单词、句子、笔记..." rows="3" />
        </div>
        <button class="btn btn-primary btn-block" @click="addLearning">✓ 打卡记录</button>
      </div>

      <!-- 最近记录 -->
      <div class="card">
        <div class="card-title" style="display: flex; justify-content: space-between;">
          <span>📖 最近记录（{{ learningRecords.length }}）</span>
          <button class="btn btn-sm btn-secondary" @click="startReview">🎲 随机复习</button>
        </div>
        <div v-if="learningRecords.length === 0" class="empty-state">
          <div style="font-size: 32px;">📝</div>
          <div>还没有学习记录</div>
        </div>
        <div v-for="r in learningRecords.slice(0, 20)" :key="r.id"
          style="padding: 10px 0; border-bottom: 1px solid var(--border); font-size: 13px;">
          <div style="display: flex; justify-content: space-between; align-items: center;">
            <span class="tag tag-primary">{{ r.category }}</span>
            <span style="font-size: 12px; color: var(--text-muted);">{{ formatDate(r.date) }}</span>
          </div>
          <div style="margin-top: 6px; color: var(--text-primary); line-height: 1.6;">{{ r.content }}</div>
          <div style="display: flex; gap: 8px; margin-top: 6px;">
            <button class="btn btn-sm btn-secondary" @click="toggleFavorite(r)">{{ r.isFavorite ? '⭐ 已收藏' : '☆ 收藏' }}</button>
            <button class="btn btn-sm" style="color: var(--danger);" @click="deleteLearning(r.id!)">删除</button>
          </div>
        </div>
      </div>
    </div>

    <!-- ══════════ 收藏本 ══════════ -->
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
