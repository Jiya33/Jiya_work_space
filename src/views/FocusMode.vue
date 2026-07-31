<script setup lang="ts">
import { ref, computed, watch, onUnmounted, onMounted } from 'vue'
import { SettingsDB } from '../services/db'

const focusDuration = ref(25) // minutes
const timeLeft = ref(25 * 60) // seconds
const isRunning = ref(false)
const isPaused = ref(false)
const isFinished = ref(false)
const showNoise = ref(false)
const soundVolume = ref(0.6)

let timer: ReturnType<typeof setInterval> | null = null

const displayMinutes = computed(() => Math.floor(timeLeft.value / 60))
const displaySeconds = computed(() => timeLeft.value % 60)
const progressPercent = computed(() => {
  const total = focusDuration.value * 60
  return Math.round((1 - timeLeft.value / total) * 100)
})

// ====== 火柴 / 柴火燃烧声（Web Audio 合成） ======
// 低频轰鸣床（棕色噪音低通） + 随机噼啪爆裂（带通短脉冲）
let audioCtx: AudioContext | null = null
let fireStop: (() => void) | null = null
let fireMaster: GainNode | null = null
let crackleTimer: ReturnType<typeof setTimeout> | null = null

function buildBrownNoiseBuffer(ctx: AudioContext): AudioBuffer {
  const bufferSize = 2 * ctx.sampleRate
  const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate)
  const data = buffer.getChannelData(0)
  let last = 0
  for (let i = 0; i < bufferSize; i++) {
    const white = Math.random() * 2 - 1
    last = (last + 0.02 * white) / 1.02
    data[i] = last * 3.5
  }
  return buffer
}

function startFire() {
  try {
    const ctx = new (window.AudioContext || (window as any).webkitAudioContext)()
    audioCtx = ctx
    const master = ctx.createGain()
    master.gain.value = soundVolume.value
    master.connect(ctx.destination)
    fireMaster = master

    const noiseBuffer = buildBrownNoiseBuffer(ctx)

    // 低频轰鸣床
    const bed = ctx.createBufferSource()
    bed.buffer = noiseBuffer
    bed.loop = true
    const bedLp = ctx.createBiquadFilter()
    bedLp.type = 'lowpass'
    bedLp.frequency.value = 430
    const bedGain = ctx.createGain()
    bedGain.gain.value = 0.55
    bed.connect(bedLp)
    bedLp.connect(bedGain)
    bedGain.connect(master)
    bed.start()

    let stopped = false

    function scheduleCrackle() {
      if (stopped) return
      const now = ctx.currentTime
      const pops = 1 + Math.floor(Math.random() * 3)
      for (let p = 0; p < pops; p++) {
        const at = now + Math.random() * 0.18
        const pop = ctx.createBufferSource()
        pop.buffer = noiseBuffer
        const bp = ctx.createBiquadFilter()
        bp.type = 'bandpass'
        bp.frequency.value = 900 + Math.random() * 2600
        bp.Q.value = 0.9
        const g = ctx.createGain()
        const peak = 0.12 + Math.random() * 0.5
        g.gain.setValueAtTime(0.0001, at)
        g.gain.linearRampToValueAtTime(peak, at + 0.004)
        g.gain.exponentialRampToValueAtTime(0.0001, at + 0.035 + Math.random() * 0.06)
        pop.connect(bp)
        bp.connect(g)
        g.connect(master)
        pop.start(at)
        pop.stop(at + 0.25)
      }
      const next = 100 + Math.random() * 650
      crackleTimer = setTimeout(scheduleCrackle, next)
    }
    crackleTimer = setTimeout(scheduleCrackle, 200)

    fireStop = () => {
      stopped = true
      if (crackleTimer) clearTimeout(crackleTimer)
      try { bed.stop() } catch { /* ignore */ }
      master.gain.setTargetAtTime(0, ctx.currentTime, 0.12)
      setTimeout(() => { try { ctx.close() } catch { /* ignore */ } }, 350)
      fireMaster = null
    }
  } catch { /* ignore */ }
}

function stopFire() {
  fireStop?.()
  fireStop = null
  audioCtx = null
}

function toggleNoise() {
  if (showNoise.value) stopFire()
  else startFire()
  showNoise.value = !showNoise.value
}

function onVolumeChange() {
  if (fireMaster && audioCtx) {
    fireMaster.gain.setTargetAtTime(soundVolume.value, audioCtx.currentTime, 0.05)
  }
  SettingsDB.set('focusSoundVolume', soundVolume.value)
}

// 实时调整音量：复用已存在 master 节点
watch(soundVolume, (v) => {
  if (fireMaster && audioCtx) {
    fireMaster.gain.setTargetAtTime(v, audioCtx.currentTime, 0.05)
  }
  SettingsDB.set('focusSoundVolume', v)
})

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
  stopFire()
  showNoise.value = false
}

function resetTimer() {
  stopTimer()
  timeLeft.value = focusDuration.value * 60
  isFinished.value = false
  updateTitle()
}

function notify() {
  if (navigator.vibrate) navigator.vibrate([200, 100, 200, 100, 200])
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

function updateTitle() {
  const m = Math.floor(timeLeft.value / 60)
  const s = timeLeft.value % 60
  document.title = `⏱ ${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')} - 专注中`
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
  if (typeof settings.focusSoundVolume === 'number') soundVolume.value = settings.focusSoundVolume
  timeLeft.value = focusDuration.value * 60
})

onUnmounted(() => {
  if (timer) clearInterval(timer)
  stopFire()
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

    <!-- 柴火燃烧声 -->
    <div class="card">
      <button class="btn btn-block" :class="showNoise ? 'btn-primary' : 'btn-secondary'"
        @click="toggleNoise">
        {{ showNoise ? '🔥 柴火噼啪声 开' : '🔇 柴火噼啪声 关' }}
      </button>
      <div style="display: flex; gap: 8px; align-items: center; margin-top: 12px;">
        <span style="font-size: 13px; color: var(--text-muted);">🔉</span>
        <input type="range" min="0" max="1" step="0.05" v-model.number="soundVolume"
          @change="onVolumeChange" style="flex: 1;" />
        <span style="font-size: 13px; color: var(--text-muted); width: 32px; text-align: right;">{{ Math.round(soundVolume * 100) }}</span>
        <span style="font-size: 13px; color: var(--text-muted);">🔊</span>
      </div>
      <p style="font-size: 11px; color: var(--text-muted); margin-top: 8px;">
        模拟火柴 / 柴火燃烧的噼啪声，比白噪音更让人放松
      </p>
    </div>

    <!-- 专注技巧 -->
    <div class="card">
      <div class="card-title">💡 专注技巧</div>
      <p style="font-size: 13px; color: var(--text-secondary); line-height: 1.6; text-align: left;">
        🍅 番茄工作法：25分钟专注 + 5分钟休息<br>
        📵 手机静音，关闭通知<br>
        🔥 听着柴火声，想象自己在篝火旁<br>
        📝 完成后记录完成的任务
      </p>
    </div>
  </div>
</template>
