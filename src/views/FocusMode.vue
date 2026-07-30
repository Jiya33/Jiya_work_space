<script setup lang="ts">
import { ref, watch, onUnmounted, onMounted } from 'vue'
import { SettingsDB } from '../services/db'

const focusDuration = ref(25) // minutes
const timeLeft = ref(25 * 60) // seconds
const isRunning = ref(false)
const isPaused = ref(false)
const isFinished = ref(false)
const showNoise = ref(false)

let timer: ReturnType<typeof setInterval> | null = null
let audioCtx: AudioContext | null = null
let noiseNode: AudioBufferSourceNode | null = null

const displayMinutes = computed(() => Math.floor(timeLeft.value / 60))
const displaySeconds = computed(() => timeLeft.value % 60)
const progressPercent = computed(() => {
  const total = focusDuration.value * 60
  return Math.round((1 - timeLeft.value / total) * 100)
})

import { computed } from 'vue'

function startTimer() {
  if (isRunning.value) return
  if (!isPaused.value) {
    timeLeft.value = focusDuration.value * 60
    isFinished.value = false
  }
  isRunning.value = true
  isPaused.value = false

  updateTitle()

  timer = setInterval(() => {
    if (timeLeft.value > 0) {
      timeLeft.value--
      updateTitle()
    }
    if (timeLeft.value <= 0) {
      stopTimer()
      isFinished.value = true
      notify()
    }
  }, 1000)
}

function pauseTimer() {
  isRunning.value = false
  isPaused.value = true
  if (timer) { clearInterval(timer); timer = null }
}

function stopTimer() {
  isRunning.value = false
  isPaused.value = false
  if (timer) { clearInterval(timer); timer = null }
  stopNoise()
}

function resetTimer() {
  stopTimer()
  timeLeft.value = focusDuration.value * 60
  isFinished.value = false
  updateTitle()
}

function notify() {
  // 震动
  if (navigator.vibrate) navigator.vibrate([200, 100, 200, 100, 200])
  // 提示音
  try {
    const ctx = new AudioContext()
    const osc = ctx.createOscillator()
    const gain = ctx.createGain()
    osc.connect(gain)
    gain.connect(ctx.destination)
    osc.frequency.value = 880
    gain.gain.value = 0.3
    osc.start()
    osc.stop(ctx.currentTime + 0.5)
  } catch { /* ignore */ }
}

// Pink noise
function toggleNoise() {
  if (showNoise.value) stopNoise()
  else startNoise()
  showNoise.value = !showNoise.value
}

function startNoise() {
  try {
    audioCtx = new AudioContext()
    const bufferSize = 4096
    const buffer = audioCtx.createBuffer(1, bufferSize, audioCtx.sampleRate)
    const data = buffer.getChannelData(0)
    // Pink noise approximation
    let b0 = 0, b1 = 0, b2 = 0, b3 = 0, b4 = 0, b5 = 0, b6 = 0
    for (let i = 0; i < bufferSize; i++) {
      const white = Math.random() * 2 - 1
      b0 = 0.99886 * b0 + white * 0.0555179
      b1 = 0.99332 * b1 + white * 0.0750759
      b2 = 0.96900 * b2 + white * 0.1538520
      b3 = 0.86650 * b3 + white * 0.3104856
      b4 = 0.55000 * b4 + white * 0.5329522
      b5 = -0.7616 * b5 - white * 0.0168980
      data[i] = (b0 + b1 + b2 + b3 + b4 + b5 + b6 + white * 0.5362) * 0.11
      b6 = white * 0.115926
    }
    noiseNode = audioCtx.createBufferSource()
    noiseNode.buffer = buffer
    noiseNode.loop = true
    const gainNode = audioCtx.createGain()
    gainNode.gain.value = 0.5
    noiseNode.connect(gainNode)
    gainNode.connect(audioCtx.destination)
    noiseNode.start()
  } catch { /* ignore */ }
}

function stopNoise() {
  try { noiseNode?.stop(); audioCtx?.close() } catch { /* ignore */ }
  noiseNode = null; audioCtx = null
}

function updateTitle() {
  const m = Math.floor(timeLeft.value / 60)
  const s = timeLeft.value % 60
  document.title = `⏱ ${String(m).padStart(2,'0')}:${String(s).padStart(2,'0')} - 专注中`
}

watch(timeLeft, (val) => {
  if (val <= 0) document.title = '✅ 专注完成！'
})

async function saveDuration() {
  await SettingsDB.set('focusDuration', focusDuration.value)
}

onMounted(async () => {
  const settings = await SettingsDB.get()
  if (settings.focusDuration) focusDuration.value = settings.focusDuration
  timeLeft.value = focusDuration.value * 60
})

onUnmounted(() => {
  if (timer) clearInterval(timer)
  stopNoise()
  document.title = 'Jiya 智能工作台'
})
</script>

<template>
  <div style="text-align: center; padding: 20px 0;">
    <!-- 倒计时显示 -->
    <div style="font-size: 72px; font-weight: 200; font-variant-numeric: tabular-nums; color: var(--primary); margin: 20px 0;">
      {{ String(displayMinutes).padStart(2, '0') }}:{{ String(displaySeconds).padStart(2, '0') }}
    </div>

    <!-- 进度条 -->
    <div style="height: 6px; background: var(--border); border-radius: 3px; margin: 16px 0; overflow: hidden;">
      <div style="height: 100%; background: var(--primary); border-radius: 3px; transition: width 1s linear;"
        :style="{ width: progressPercent + '%' }" />
    </div>

    <!-- 时长设置 -->
    <div class="card" v-if="!isRunning">
      <div class="card-title">⏱ 专注时长</div>
      <div style="display: flex; gap: 8px; flex-wrap: wrap; justify-content: center;">
        <button v-for="m in [5, 15, 25, 45, 60, 90, 120]" :key="m" class="btn btn-sm"
          :class="focusDuration === m ? 'btn-primary' : 'btn-secondary'"
          @click="focusDuration = m; timeLeft = m * 60; saveDuration()">
          {{ m }}min
        </button>
      </div>
      <div style="display: flex; gap: 8px; align-items: center; margin-top: 8px; justify-content: center;">
        <input v-model.number="focusDuration" class="input" type="number" min="5" max="300" style="width: 80px; text-align: center;" @change="timeLeft = focusDuration * 60; saveDuration()" />
        <span style="font-size: 13px; color: var(--text-muted);">分钟</span>
      </div>
    </div>

    <!-- 控制按钮 -->
    <div style="display: flex; gap: 12px; justify-content: center; margin: 20px 0;">
      <button v-if="!isRunning" class="btn btn-primary" style="font-size: 16px; padding: 12px 32px;" @click="startTimer">
        ▶ 开始专注
      </button>
      <template v-else>
        <button class="btn btn-secondary" style="font-size: 14px; padding: 12px 24px;" @click="pauseTimer">
          ⏸ 暂停
        </button>
        <button class="btn btn-danger" style="font-size: 14px; padding: 12px 24px;" @click="stopTimer">
          ⏹ 结束
        </button>
      </template>
      <button v-if="!isRunning && (isPaused || isFinished)" class="btn btn-secondary" style="font-size: 14px; padding: 12px 24px;" @click="resetTimer">
        🔄 重置
      </button>
    </div>

    <!-- 完成提示 -->
    <div v-if="isFinished" class="card" style="border: 2px solid var(--success);">
      <div style="font-size: 40px;">🎉</div>
      <div style="font-size: 16px; font-weight: 600; color: var(--success); margin-top: 8px;">
        专注完成！
      </div>
      <div style="font-size: 13px; color: var(--text-secondary); margin-top: 4px;">
        你专注了 {{ focusDuration }} 分钟
      </div>
    </div>

    <!-- 白噪音 -->
    <div class="card">
      <button class="btn btn-block" :class="showNoise ? 'btn-primary' : 'btn-secondary'"
        @click="toggleNoise">
        {{ showNoise ? '🔊 粉红噪音 开' : '🔇 粉红噪音 关' }}
      </button>
      <p style="font-size: 11px; color: var(--text-muted); margin-top: 6px;">
        粉红噪音有助于提高专注力
      </p>
    </div>

    <!-- 专注技巧 -->
    <div class="card">
      <div class="card-title">💡 专注技巧</div>
      <p style="font-size: 13px; color: var(--text-secondary); line-height: 1.6; text-align: left;">
        🍅 番茄工作法：25分钟专注 + 5分钟休息<br>
        📵 手机静音，关闭通知<br>
        🎯 明确当前任务目标<br>
        📝 完成后记录完成的任务
      </p>
    </div>
  </div>
</template>
