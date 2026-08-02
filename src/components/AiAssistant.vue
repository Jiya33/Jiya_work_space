<script setup lang="ts">
import { ref, computed, onMounted, nextTick } from 'vue'
import { useRouter } from 'vue-router'
import { chat, checkLlm } from '../services/llm'
import { buildWorkbenchContext } from '../services/assistant'
import type { ChatMessage } from '../services/llm'

const router = useRouter()

const STORAGE_KEY = 'ai_assistant_history_v1'

const SYSTEM_PROMPT = `你是「Jiya 智能工作台」的内置 AI 助手。你可以读取用户工作台里的全部真实数据（记账、待办、英语学习、运动计划、AI 资讯等），并据实回答用户的问题、帮ta整理日报、提醒任务进度。

规则：
- 始终以工作台提供的真实数据为准，不要编造数字、记录或功能。
- 如果某类数据为空，如实说明「暂无」。
- 用简体中文回答，简洁友好；需要时用列表、分段或加粗让结构清晰。
- 当用户要求「整理日报 / 周报 / 热点」时，基于提供的 AI 资讯与任务、收支数据，生成结构清晰的摘要。
- 你只能查询与建议，不能替用户执行写操作（不能记账、不能改设置）。`

const GREETING = `👋 你好，我是你的工作台 AI 助手。我可以读取工作台里的真实数据，帮你：

- 查询「今天花了多少钱」「还有哪些任务没做完」
- 把今天的新技术热点整理成日报
- 提醒英语学习 / 运动进度
- 回答工作台相关的各种问题

直接问我吧～`

type Msg = { role: 'user' | 'assistant'; content: string }

const open = ref(false)
const input = ref('')
const messages = ref<Msg[]>([])
const sending = ref(false)
const llmReady = ref<boolean | null>(null)
const msgBox = ref<HTMLElement | null>(null)

function loadHistory() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (raw) {
      const parsed = JSON.parse(raw) as Msg[]
      if (Array.isArray(parsed) && parsed.length) {
        messages.value = parsed
        return
      }
    }
  } catch { /* ignore */ }
  messages.value = [{ role: 'assistant', content: GREETING }]
}

function saveHistory() {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(messages.value.slice(-50)))
  } catch { /* ignore */ }
}

function toggle() {
  open.value = !open.value
  if (open.value) {
    if (llmReady.value === null) checkLlm().then(s => { llmReady.value = s.ready }).catch(() => { llmReady.value = false })
    nextTick(scrollToBottom)
  }
}

function collapse() {
  open.value = false
}

function resetChat() {
  if (!confirm('确定清空所有聊天记录？')) return
  messages.value = [{ role: 'assistant', content: GREETING }]
  saveHistory()
  nextTick(scrollToBottom)
}

function scrollToBottom() {
  if (msgBox.value) msgBox.value.scrollTop = msgBox.value.scrollHeight
}

function renderMarkdown(src: string): string {
  let s = src
    .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
  s = s.replace(/^### (.*)$/gm, '<h4>$1</h4>')
       .replace(/^## (.*)$/gm, '<h3>$1</h3>')
       .replace(/^# (.*)$/gm, '<h2>$1</h2>')
  s = s.replace(/\*\*(.+?)\*\*/g, '<b>$1</b>')
  s = s.replace(/(?:^|\n)((?:- .*(?:\n|$))+)/g, (m) => {
    const items = m.trim().split('\n').map(l => l.replace(/^- /, '')).map(l => `<li>${l}</li>`).join('')
    return `<ul>${items}</ul>`
  })
  s = s.replace(/\n/g, '<br>')
  return s
}

async function send() {
  const text = input.value.trim()
  if (!text || sending.value) return
  messages.value.push({ role: 'user', content: text })
  input.value = ''
  sending.value = true
  nextTick(scrollToBottom)
  try {
    const ctx = await buildWorkbenchContext()
    const history: ChatMessage[] = messages.value.slice(-24).map(m => ({ role: m.role, content: m.content }))
    const apiMessages: ChatMessage[] = [
      { role: 'system', content: SYSTEM_PROMPT + '\n\n以下是当前工作台的真实数据，回答时务必以这些数据为准：\n' + ctx },
      ...history
    ]
    const reply = await chat('', { messages: apiMessages })
    messages.value.push({ role: 'assistant', content: reply })
  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : '请求失败，请稍后重试'
    messages.value.push({ role: 'assistant', content: '⚠️ ' + msg })
  } finally {
    sending.value = false
    saveHistory()
    nextTick(scrollToBottom)
  }
}

function onKeydown(e: KeyboardEvent) {
  if (e.key === 'Enter' && !e.shiftKey) {
    e.preventDefault()
    send()
  }
}

const canSend = computed(() => input.value.trim().length > 0 && !sending.value)

onMounted(loadHistory)
</script>

<template>
  <!-- 浮动触发按钮 -->
  <button v-if="!open" class="ai-fab" @click="toggle" title="工作台 AI 助手" aria-label="AI 助手">🤖</button>

  <!-- 对话抽屉 -->
  <div v-if="open" class="ai-overlay" @click.self="collapse">
    <div class="ai-drawer">
      <div class="ai-header">
        <h3>🤖 工作台 AI 助手</h3>
        <button class="ai-icon-btn" title="收起" @click="collapse">⌄</button>
        <button class="ai-icon-btn" title="清空聊天记录" @click="resetChat">🗑</button>
      </div>

      <div v-if="llmReady === false" class="ai-banner">
        <span>⚠️ 尚未配置大模型，请先到「设置」填写 API Key</span>
        <button @click="router.push('/settings')">去设置</button>
      </div>

      <div ref="msgBox" class="ai-msgs">
        <div v-for="(m, i) in messages" :key="i"
          class="ai-msg" :class="m.role === 'user' ? 'user' : 'bot'"
          v-html="m.role === 'assistant' ? renderMarkdown(m.content) : m.content">
        </div>
        <div v-if="sending" class="ai-typing">正在思考…</div>
      </div>

      <div class="ai-input-row">
        <textarea
          v-model="input"
          class="input"
          rows="1"
          placeholder="问问工作台：今天花了多少钱？帮我整理今日日报…"
          @keydown="onKeydown"
        ></textarea>
        <button class="btn btn-primary" :disabled="!canSend" @click="send">发送</button>
      </div>
    </div>
  </div>
</template>
