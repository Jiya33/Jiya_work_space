<script setup lang="ts">
import { ref, onMounted, computed } from 'vue'
import { ShopMaterialsAPI, fetchAllRecords, verifyFeishuConfig, DailyBriefsAPI } from '../services/feishu'
import { generateTrendingNotes, generateRuleBasedReport } from '../services/llm'
import { copyToClipboard, formatDate } from '../utils/format'
import type { FeishuRecordItem } from '../types'

const toast = ref({ show: false, msg: '', type: 'success' })
function showToast(msg: string, type = 'success') {
  toast.value = { show: true, msg, type }
  setTimeout(() => { toast.value.show = false }, 2000)
}

const feishuReady = ref(false)
const loading = ref(false)
const records = ref<FeishuRecordItem[]>([])
const searchQuery = ref('')

const filteredRecords = computed(() => {
  if (!searchQuery.value) return records.value
  const q = searchQuery.value.toLowerCase()
  return records.value.filter(r => {
    const title = String(r.fields['标题'] || '').toLowerCase()
    const tags = (r.fields['标签'] as string[] || []).join(',').toLowerCase()
    const content = String(r.fields['正文内容'] || '').toLowerCase()
    return title.includes(q) || tags.includes(q) || content.includes(q)
  })
})

// 手动录入
const showForm = ref(false)
const formTitle = ref('')
const formTags = ref('')
const formCategory = ref('')
const formContent = ref('')
const formSourceLink = ref('')

async function submitMaterial() {
  if (!formTitle.value.trim()) { showToast('请输入标题', 'error'); return }
  const tags = formTags.value.split(/[,，]/).map(t => t.trim()).filter(Boolean)
  loading.value = true
  try {
    await ShopMaterialsAPI.create({
      title: formTitle.value.trim(),
      tags,
      category: formCategory.value.trim() || '探店',
      content: formContent.value.trim(),
      sourceLink: formSourceLink.value.trim()
    })
    showToast('添加成功！')
    showForm.value = false
    formTitle.value = ''; formTags.value = ''; formCategory.value = ''; formContent.value = ''; formSourceLink.value = ''
    await loadRecords()
  } catch (e: any) { showToast(e.message, 'error') } finally { loading.value = false }
}

async function deleteMaterial(recordId: string) {
  if (!confirm('确定删除？')) return
  try { await ShopMaterialsAPI.delete(recordId); showToast('已删除'); await loadRecords() }
  catch (e: any) { showToast(e.message, 'error') }
}

// 爆款笔记生成
const generating = ref(false)
const reportContent = ref('')
const reportTitle = ref('')
const showReport = ref(false)

async function generateReport() {
  generating.value = true
  reportContent.value = ''
  try {
    // 拉取最近 7 天的素材和资讯
    const sevenDaysAgo = new Date()
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7)
    const cutoff = sevenDaysAgo.getTime()

    const materials = await fetchAllRecords('feishuShopMaterialsTableId')
    const newsRecords = await fetchAllRecords('feishuAiNewsTableId')

    const recentMaterials = materials.filter(r => {
      const ts = Number(r.fields['创建时间'] || 0)
      return ts > cutoff
    })
    const recentNews = newsRecords.filter(r => {
      const ts = Number(r.fields['创建时间'] || 0)
      return ts > cutoff
    })

    const materialData = recentMaterials.map(r => ({
      title: String(r.fields['标题'] || ''),
      tags: (r.fields['标签'] as string[]) || [],
      content: String(r.fields['正文内容'] || '')
    }))
    const newsData = recentNews.map(r => ({
      title: String(r.fields['标题'] || ''),
      summary: String(r.fields['摘要'] || ''),
      category: String(r.fields['分类'] || '')
    }))

    // 尝试调用大模型
    const llmResult = await generateTrendingNotes(materialData, newsData)
    if (llmResult) {
      reportContent.value = llmResult
    } else {
      reportContent.value = generateRuleBasedReport(materialData, newsData)
    }

    reportTitle.value = `📊 爆款笔记资讯 ${new Date().toLocaleDateString('zh-CN')}`
    showReport.value = true

    // 保存简报到飞书
    try {
      await DailyBriefsAPI.create({
        title: reportTitle.value,
        content: reportContent.value,
        newsCount: newsData.length,
        materialCount: materialData.length
      })
      showToast('简报已同步到飞书')
    } catch { /* 忽略简报保存失败 */ }
  } catch (e: any) {
    showToast(e.message, 'error')
  } finally {
    generating.value = false
  }
}

async function copyReport() {
  await copyToClipboard(reportContent.value)
  showToast('已复制到剪贴板')
}

// HTML 解析辅助
const showHtmlParser = ref(false)
const htmlInput = ref('')
const parsedResult = ref<{ title: string; text: string }[]>([])

function parseHtml() {
  const parser = new DOMParser()
  const doc = parser.parseFromString(htmlInput.value, 'text/html')
  const articles: { title: string; text: string }[] = []

  // 尝试提取文章标题和内容
  const titles = doc.querySelectorAll('h1, h2, h3, [class*="title"], [class*="header"]')
  const paragraphs = doc.querySelectorAll('p, [class*="content"], [class*="article"]')

  titles.forEach(t => {
    const text = t.textContent?.trim()
    if (text && text.length > 2) articles.push({ title: text, text: '' })
  })

  paragraphs.forEach((p, i) => {
    const text = p.textContent?.trim()
    if (text && text.length > 10) {
      if (articles[i]) articles[i].text = text
      else articles.push({ title: '', text })
    }
  })

  parsedResult.value = articles.slice(0, 20)
}

async function loadRecords() {
  if (!feishuReady.value) return
  loading.value = true
  try { records.value = await fetchAllRecords('feishuShopMaterialsTableId') }
  catch (e: any) { showToast(e.message, 'error') } finally { loading.value = false }
}

onMounted(async () => {
  feishuReady.value = await verifyFeishuConfig().catch(() => false)
  if (feishuReady.value) await loadRecords()
})
</script>

<template>
  <div>
    <div v-if="toast.show" class="toast" :class="toast.type">{{ toast.msg }}</div>

    <!-- 非飞书模式 -->
    <div v-if="!feishuReady" class="card">
      <div class="empty-state">
        <div style="font-size: 40px;">🔌</div>
        <div>未连接飞书知识库</div>
        <button class="btn btn-primary btn-sm" style="margin-top: 12px;" @click="$router.push('/settings')">前往设置</button>
      </div>
    </div>

    <div v-else>
      <!-- 爆款笔记生成按钮 -->
      <button class="btn btn-primary btn-block" style="margin-bottom: 16px; font-size: 15px;"
        @click="generateReport" :disabled="generating">
        <span style="font-size: 18px;">✨</span>
        {{ generating ? '生成中...' : '生成今日爆款笔记资讯' }}
      </button>

      <!-- 操作栏 -->
      <div style="display: flex; gap: 8px; margin-bottom: 12px;">
        <input v-model="searchQuery" class="input" placeholder="搜索素材..." style="flex: 1;" />
        <button class="btn btn-primary btn-sm" @click="showForm = true">+ 添加</button>
        <button class="btn btn-sm btn-secondary" @click="showHtmlParser = true">🔧 解析HTML</button>
        <button class="btn btn-sm btn-secondary" @click="loadRecords" :disabled="loading">🔄</button>
      </div>

      <!-- 素材列表 -->
      <div v-if="loading && records.length === 0" class="loading"><div class="spinner" /></div>

      <div v-else-if="filteredRecords.length === 0" class="empty-state">
        <div style="font-size: 40px;">📭</div>
        <div>暂无探店素材</div>
      </div>

      <div v-for="r in filteredRecords" :key="r.record_id" class="card">
        <div style="display: flex; justify-content: space-between; align-items: flex-start;">
          <h3 style="font-size: 15px; font-weight: 600; flex: 1;">{{ r.fields['标题'] }}</h3>
          <button class="btn btn-sm" style="color: var(--danger);" @click="deleteMaterial(r.record_id)">删除</button>
        </div>
        <div style="margin-top: 6px;">
          <span v-for="tag in (r.fields['标签'] as string[] || [])" :key="tag" class="tag tag-primary">{{ tag }}</span>
        </div>
        <div v-if="r.fields['正文内容']" style="font-size: 13px; color: var(--text-secondary); margin-top: 8px; line-height: 1.5;">
          {{ String(r.fields['正文内容']).slice(0, 150) }}{{ String(r.fields['正文内容']).length > 150 ? '...' : '' }}
        </div>
        <div style="display: flex; gap: 8px; margin-top: 6px; font-size: 12px; color: var(--text-muted);">
          <span v-if="r.fields['探店分类']">📂 {{ r.fields['探店分类'] }}</span>
          <span>{{ formatDate(String(r.fields['创建时间'] || '')) }}</span>
        </div>
      </div>
    </div>

    <!-- 爆款笔记报告 -->
    <div v-if="showReport" class="card" style="margin-top: 16px;">
      <div class="card-title" style="display: flex; justify-content: space-between; align-items: center;">
        <span>{{ reportTitle }}</span>
        <div style="display: flex; gap: 8px;">
          <button class="btn btn-sm btn-primary" @click="copyReport">📋 一键复制</button>
          <button class="btn btn-sm btn-secondary" @click="showReport = false">收起</button>
        </div>
      </div>
      <div style="white-space: pre-wrap; font-size: 13px; line-height: 1.6; background: var(--bg); padding: 12px; border-radius: 8px; max-height: 500px; overflow-y: auto;">
        {{ reportContent }}
      </div>
    </div>

    <!-- 录入弹窗 -->
    <div v-if="showForm" class="modal-overlay" @click.self="showForm = false">
      <div class="modal">
        <div class="modal-header">
          <h3>📝 添加探店素材</h3>
          <button class="modal-close" @click="showForm = false">✕</button>
        </div>
        <div class="form-group">
          <label class="form-label">标题 *</label>
          <input v-model="formTitle" class="input" placeholder="素材标题" />
        </div>
        <div class="form-group">
          <label class="form-label">标签（逗号分隔）</label>
          <input v-model="formTags" class="input" placeholder="美食, 打卡, 网红店" />
        </div>
        <div class="form-group">
          <label class="form-label">探店分类</label>
          <input v-model="formCategory" class="input" placeholder="如：餐厅、咖啡馆、景点" />
        </div>
        <div class="form-group">
          <label class="form-label">来源链接</label>
          <input v-model="formSourceLink" class="input" placeholder="https://..." />
        </div>
        <div class="form-group">
          <label class="form-label">正文内容</label>
          <textarea v-model="formContent" class="textarea" placeholder="素材正文内容..." rows="5" />
        </div>
        <button class="btn btn-primary btn-block" @click="submitMaterial" :disabled="loading">
          ✓ 保存到飞书
        </button>
      </div>
    </div>

    <!-- HTML 解析弹窗 -->
    <div v-if="showHtmlParser" class="modal-overlay" @click.self="showHtmlParser = false">
      <div class="modal">
        <div class="modal-header">
          <h3>🔧 HTML 内容解析</h3>
          <button class="modal-close" @click="showHtmlParser = false">✕</button>
        </div>
        <p style="font-size: 12px; color: var(--text-muted); margin-bottom: 8px;">
          粘贴网页 HTML 源码，自动提取标题和文本内容
        </p>
        <textarea v-model="htmlInput" class="textarea" placeholder="粘贴 HTML..." rows="6" style="font-size: 12px;" />
        <button class="btn btn-primary btn-block" style="margin-top: 8px;" @click="parseHtml">解析</button>
        <div v-if="parsedResult.length > 0" style="margin-top: 12px; max-height: 300px; overflow-y: auto;">
          <div v-for="(item, i) in parsedResult" :key="i"
            style="padding: 8px; border-bottom: 1px solid var(--border); font-size: 13px;">
            <strong>{{ item.title }}</strong>
            <p style="color: var(--text-secondary);">{{ item.text.slice(0, 100) }}</p>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
