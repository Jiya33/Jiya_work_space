<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { SettingsDB } from '../services/db'
import { verifyFeishuConfig, clearFeishuToken } from '../services/feishu'
import { BUILTIN_SOURCES } from '../services/news'
import type { AppSettings, NewsSource } from '../types'

const toast = ref({ show: false, msg: '', type: 'success' })
function showToast(msg: string, type = 'success') {
  toast.value = { show: true, msg, type }
  setTimeout(() => { toast.value.show = false }, 2000)
}

// 飞书配置
const feishuAppId = ref('')
const feishuAppSecret = ref('')
const feishuAppToken = ref('')
const feishuAiNewsTableId = ref('')
const feishuDailyBriefsTableId = ref('')
const feishuTesting = ref(false)
const feishuStatus = ref<'idle' | 'testing' | 'success' | 'error'>('idle')
const feishuStatusMsg = ref('')

async function saveFeishu() {
  await SettingsDB.setSecret('feishuAppId', feishuAppId.value)
  await SettingsDB.setSecret('feishuAppSecret', feishuAppSecret.value)
  await SettingsDB.setSecret('feishuAppToken', feishuAppToken.value)
  await SettingsDB.setSecret('feishuAiNewsTableId', feishuAiNewsTableId.value)
  await SettingsDB.setSecret('feishuDailyBriefsTableId', feishuDailyBriefsTableId.value)
  clearFeishuToken()
  showToast('飞书配置已保存')
}

async function testFeishu() {
  await saveFeishu()
  feishuTesting.value = true
  feishuStatus.value = 'testing'
  feishuStatusMsg.value = '正在验证...'
  try {
    const ok = await verifyFeishuConfig()
    if (ok) {
      feishuStatus.value = 'success'
      feishuStatusMsg.value = '飞书连接成功！'
      showToast('连接验证成功！')
    } else {
      feishuStatus.value = 'error'
      feishuStatusMsg.value = '验证失败，请检查配置'
    }
  } catch (e: any) {
    feishuStatus.value = 'error'
    feishuStatusMsg.value = e.message
  } finally {
    feishuTesting.value = false
  }
}

// 大模型配置
const llmApiKey = ref('')
const llmProvider = ref<AppSettings['llmProvider']>('none')

async function saveLLM() {
  await SettingsDB.setSecret('llmApiKey', llmApiKey.value)
  await SettingsDB.set('llmProvider', llmProvider.value)
  showToast('大模型配置已保存')
}

// 资讯源管理
const newsSources = ref<NewsSource[]>([])
const customSourceName = ref('')
const customSourceUrl = ref('')

async function saveNewsSources() {
  await SettingsDB.set('newsSources', newsSources.value.map(s => ({ ...s })))
  showToast('资讯源已保存')
}

function toggleSource(id: string) {
  const s = newsSources.value.find(x => x.id === id)
  if (s) s.enabled = !s.enabled
}

function resetNewsSources() {
  newsSources.value = BUILTIN_SOURCES.map(s => ({ ...s }))
  saveNewsSources()
}

function addCustomSource() {
  if (!customSourceName.value.trim() || !customSourceUrl.value.trim()) {
    showToast('请填写名称和链接', 'error'); return
  }
  newsSources.value.push({
    id: 'custom-' + Date.now(),
    name: customSourceName.value.trim(),
    url: customSourceUrl.value.trim(),
    enabled: true,
    builtin: false
  })
  customSourceName.value = ''
  customSourceUrl.value = ''
  saveNewsSources()
}

function removeSource(id: string) {
  newsSources.value = newsSources.value.filter(s => s.id !== id)
  saveNewsSources()
}

// 腾讯文档快捷入口
const tencentDocUrl = ref('')

async function saveTencentDoc() {
  await SettingsDB.set('tencentDocUrl', tencentDocUrl.value.trim())
  showToast('已保存腾讯文档入口')
}

// 数据管理
async function exportAllData() {
  const settings = await SettingsDB.get()
  const learningRecords = await (await import('../services/db')).LearningDB.getAll()
  const sportRecords = await (await import('../services/db')).SportDB.getAll()
  const expenses = await (await import('../services/db')).ExpenseDB.getAll()
  const todos = await (await import('../services/db')).TodoDB.getAll()

  // 去除敏感图片 base64
  const cleanExpenses = expenses.map(e => ({ ...e, imageBase64: e.imageBase64 ? '[图片数据]' : '' }))

  const data = { settings, learningRecords, sportRecords, expenses: cleanExpenses, todos }
  const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = `jiya_backup_${new Date().toISOString().slice(0, 10)}.json`
  a.click()
  URL.revokeObjectURL(url)
  showToast('数据已导出')
}

async function importData(e: Event) {
  const input = e.target as HTMLInputElement
  const file = input.files?.[0]
  if (!file) return
  const text = await file.text()
  try {
    const data = JSON.parse(text)
    if (data.settings) {
      for (const [key, value] of Object.entries(data.settings)) {
        await SettingsDB.set(key, value)
      }
    }
    showToast('数据导入成功！请刷新页面')
  } catch {
    showToast('导入失败：文件格式错误', 'error')
  }
}

async function clearAllData() {
  if (!confirm('⚠️ 确定清除所有本地数据？此操作不可撤销！')) return
  // Clear IndexedDB by deleting the database
  return new Promise<void>((resolve) => {
    const req = indexedDB.deleteDatabase('jiya_workbench')
    req.onsuccess = () => {
      showToast('所有数据已清除，请刷新页面')
      resolve()
    }
    req.onerror = () => {
      showToast('清除失败', 'error')
      resolve()
    }
  })
}

async function loadSettings() {
  const s = await SettingsDB.get()
  feishuAppId.value = await SettingsDB.getSecret('feishuAppId')
  feishuAppSecret.value = await SettingsDB.getSecret('feishuAppSecret')
  feishuAppToken.value = await SettingsDB.getSecret('feishuAppToken')
  feishuAiNewsTableId.value = await SettingsDB.getSecret('feishuAiNewsTableId')
  feishuDailyBriefsTableId.value = await SettingsDB.getSecret('feishuDailyBriefsTableId')
  llmApiKey.value = await SettingsDB.getSecret('llmApiKey')
  llmProvider.value = (s.llmProvider as AppSettings['llmProvider']) || 'none'
  newsSources.value = (s.newsSources as NewsSource[] | undefined)?.length
    ? (s.newsSources as NewsSource[])
    : BUILTIN_SOURCES.map(x => ({ ...x }))
  tencentDocUrl.value = (s.tencentDocUrl as string) || ''
}

onMounted(loadSettings)
</script>

<template>
  <div>
    <div v-if="toast.show" class="toast" :class="toast.type">{{ toast.msg }}</div>

    <!-- 安全提示 -->
    <div class="card" style="border-left: 4px solid var(--warning); background: #FFF8E1;">
      <div style="display: flex; gap: 8px; align-items: flex-start;">
        <span style="font-size: 20px;">⚠️</span>
        <div>
          <div style="font-size: 14px; font-weight: 600; color: #E65100;">安全提示</div>
          <p style="font-size: 12px; color: var(--text-secondary); margin-top: 4px; line-height: 1.5;">
            飞书 App Secret 和大模型 API Key 将存储在浏览器本地。
            此方案仅适用于个人使用/私有部署场景。建议创建<b>仅限本人使用的飞书企业自建应用</b>，
            并授予最小权限（仅操作指定多维表格）。代码中不做任何云端日志上报。
          </p>
        </div>
      </div>
    </div>

    <!-- ====== 飞书配置 ====== -->
    <div class="card">
      <div class="card-title">🪶 飞书知识库配置</div>

      <div class="form-group">
        <label class="form-label">App ID</label>
        <input v-model="feishuAppId" class="input" placeholder="飞书应用的 App ID" />
      </div>
      <div class="form-group">
        <label class="form-label">App Secret</label>
        <input v-model="feishuAppSecret" class="input" type="password" placeholder="飞书应用的 App Secret" />
      </div>
      <div class="form-group">
        <label class="form-label">多维表格 App Token</label>
        <input v-model="feishuAppToken" class="input" placeholder="飞书多维表格的 app_token（从 URL 获取）" />
        <p style="font-size: 11px; color: var(--text-muted); margin-top: 4px;">
          打开飞书多维表格，URL 中 /apps/ 后面的部分即为 app_token
        </p>
      </div>
      <div class="form-group">
        <label class="form-label">AI 资讯表 ID</label>
        <input v-model="feishuAiNewsTableId" class="input" placeholder="ai_news 数据表 ID" />
      </div>
      <div class="form-group">
        <label class="form-label">每日简报表 ID（可选）</label>
        <input v-model="feishuDailyBriefsTableId" class="input" placeholder="daily_briefs 数据表 ID" />
      </div>

      <div style="display: flex; gap: 8px;">
        <button class="btn btn-primary" @click="saveFeishu">💾 保存</button>
        <button class="btn btn-secondary" @click="testFeishu" :disabled="feishuTesting">
          {{ feishuTesting ? '验证中...' : '🔍 测试连接' }}
        </button>
      </div>

      <div v-if="feishuStatus !== 'idle'" style="margin-top: 8px; font-size: 13px;"
        :style="{ color: feishuStatus === 'success' ? 'var(--success)' : feishuStatus === 'error' ? 'var(--danger)' : 'var(--text-secondary)' }">
        {{ feishuTesting ? '⏳' : feishuStatus === 'success' ? '✅' : '❌' }} {{ feishuStatusMsg }}
      </div>
    </div>

    <!-- ====== 大模型配置 ====== -->
    <div class="card">
      <div class="card-title">🧠 大模型配置（可选，用于 AI 资讯智能整理）</div>

      <div class="form-group">
        <label class="form-label">服务商</label>
        <select v-model="llmProvider" class="select">
          <option value="none">不使用（仅规则模板）</option>
          <option value="deepseek">DeepSeek</option>
          <option value="siliconflow">硅基流动 (SiliconFlow)</option>
          <option value="lingyi">零一万物</option>
        </select>
      </div>

      <div class="form-group" v-if="llmProvider !== 'none'">
        <label class="form-label">API Key</label>
        <input v-model="llmApiKey" class="input" type="password" :placeholder="`${llmProvider} API Key`" />
      </div>

      <button class="btn btn-primary" @click="saveLLM">💾 保存</button>
    </div>

    <!-- ====== 腾讯文档快捷入口 ====== -->
    <div class="card">
      <div class="card-title">📄 腾讯文档 / 知识库入口</div>
      <p style="font-size: 12px; color: var(--text-muted); margin-bottom: 8px;">
        填写后，在「AI 资讯」点「复制 Markdown」会自动打开此链接，方便一键粘贴归档。
      </p>
      <div class="form-group">
        <label class="form-label">文档链接（可选）</label>
        <input v-model="tencentDocUrl" class="input" placeholder="https://docs.qq.com/..." />
      </div>
      <button class="btn btn-primary" @click="saveTencentDoc">💾 保存</button>
    </div>

    <!-- ====== 资讯源管理 ====== -->
    <div class="card">
      <div class="card-title" style="display: flex; justify-content: space-between; align-items: center;">
        <span>📡 AI 资讯源管理（免费 RSS）</span>
        <button class="btn btn-sm btn-secondary" @click="resetNewsSources">恢复默认</button>
      </div>
      <p style="font-size: 12px; color: var(--text-muted); margin-bottom: 10px;">
        勾选启用的源会在「AI 资讯」一键采集时拉取；无需任何 API Key。
      </p>
      <div v-for="s in newsSources" :key="s.id"
        style="display: flex; align-items: center; gap: 10px; padding: 8px 0; border-bottom: 1px solid var(--border);">
        <label style="display: flex; align-items: center; gap: 8px; flex: 1; min-width: 0;">
          <input type="checkbox" :checked="s.enabled" @change="toggleSource(s.id)"
            style="width: 18px; height: 18px; accent-color: var(--primary); flex-shrink: 0;" />
          <span style="min-width: 0;">
            <span style="font-size: 14px; font-weight: 500;">{{ s.name }}</span>
            <span v-if="!s.builtin" style="font-size: 11px; color: var(--text-muted); margin-left: 6px;">自定义</span>
            <br>
            <span style="font-size: 11px; color: var(--text-muted); word-break: break-all;">{{ s.url }}</span>
          </span>
        </label>
        <button v-if="!s.builtin" class="btn btn-sm" style="color: var(--danger);"
          @click="removeSource(s.id)">✕</button>
      </div>
      <div style="display: flex; gap: 6px; margin-top: 12px; flex-wrap: wrap;">
        <input v-model="customSourceName" class="input" placeholder="源名称" style="flex: 1; min-width: 90px;" />
        <input v-model="customSourceUrl" class="input" placeholder="RSS 链接" style="flex: 2; min-width: 140px;" />
        <button class="btn btn-sm btn-primary" @click="addCustomSource">+ 添加</button>
      </div>
    </div>

    <!-- ====== 数据管理 ====== -->
    <div class="card">
      <div class="card-title">🗄 数据管理</div>
      <div style="display: flex; flex-direction: column; gap: 8px;">
        <button class="btn btn-secondary btn-block" @click="exportAllData">📤 导出全部数据 (JSON)</button>
        <label class="btn btn-secondary btn-block" style="cursor: pointer;">
          📥 导入数据
          <input type="file" accept=".json" @change="importData" style="display: none;" />
        </label>
        <button class="btn btn-danger btn-block" @click="clearAllData">🗑 清除所有本地数据</button>
      </div>
    </div>

    <!-- 配置说明 -->
    <div class="card">
      <div class="card-title">📖 飞书应用配置引导</div>
      <div style="font-size: 13px; color: var(--text-secondary); line-height: 1.6;">
        <p><strong>1.</strong> 打开 <a href="https://open.feishu.cn/app" target="_blank">飞书开放平台</a>，创建企业自建应用。</p>
        <p><strong>2.</strong> 在「权限管理」中添加以下权限：</p>
        <ul style="margin-left: 16px;">
          <li>bitable:app（多维表格）</li>
          <li>读取/写入多维表格记录</li>
        </ul>
        <p><strong>3.</strong> 在「安全设置」中添加当前域名（如 localhost）。</p>
        <p><strong>4.</strong> 发布应用并获取 App ID 和 App Secret。</p>
        <p><strong>5.</strong> 在飞书中创建多维表格，添加以下数据表：</p>
        <ul style="margin-left: 16px;">
          <li><code>ai_news</code>：字段「标题」「链接」「摘要」「分类」「创建时间」</li>
        </ul>
        <p><strong>6.</strong> 将多维表格的 app_token 和各表 ID 填入上方配置。</p>
        <p><strong>7.</strong> 未配置飞书也能用：AI 资讯支持纯本地 RSS 采集（见「资讯源管理」），数据存在浏览器 IndexedDB。</p>
      </div>
    </div>
  </div>
</template>
