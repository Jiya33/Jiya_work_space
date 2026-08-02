<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { NewsDB, SettingsDB } from '../services/db'
import {
  BUILTIN_SOURCES, fetchAllSources, toMarkdown
} from '../services/news'
import { AiNewsAPI, verifyFeishuConfig } from '../services/feishu'
import { copyToClipboard, formatDate } from '../utils/format'
import type { NewsItem, NewsSource } from '../types'

const toast = ref({ show: false, msg: '', type: 'success' })
function showToast(msg: string, type = 'success') {
  toast.value = { show: true, msg, type }
  setTimeout(() => { toast.value.show = false }, 2200)
}

// 分类 Tab
const categories = ['新技术', '新产品', '新开源', '新点子']
const tabs = ['全部', ...categories, '收藏']
const activeTab = ref('全部')

// 数据
const items = ref<NewsItem[]>([])
const loading = ref(false)
const fetchNote = ref('')
const progress = ref({ done: 0, total: 0, name: '' })
const searchQuery = ref('')
const sources = ref<NewsSource[]>([])
const showSources = ref(false)

// 飞书 / 腾讯文档 入口
const feishuReady = ref(false)
const tencentDocUrl = ref('')

// 手动添加
const showForm = ref(false)
const formTitle = ref('')
const formLink = ref('')
const formSummary = ref('')
const formCategory = ref('新技术')

const filteredItems = computed(() => {
  let result = items.value
  if (activeTab.value === '收藏') result = result.filter(i => i.isFavorite)
  else if (activeTab.value !== '全部') result = result.filter(i => i.category === activeTab.value)
  if (searchQuery.value) {
    const q = searchQuery.value.toLowerCase()
    result = result.filter(i =>
      i.title.toLowerCase().includes(q) ||
      i.summary.toLowerCase().includes(q) ||
      i.source.toLowerCase().includes(q)
    )
  }
  return result
    .slice()
    .sort((a, b) => new Date(b.pubDate).getTime() - new Date(a.pubDate).getTime())
})

const categoryCounts = computed(() => {
  const map: Record<string, number> = {}
  items.value.forEach(i => { map[i.category] = (map[i.category] || 0) + 1 })
  return map
})
const unreadCount = computed(() => items.value.filter(i => !i.isRead).length)

async function loadItems() {
  items.value = await NewsDB.getAll()
}

async function loadSources() {
  const settings = await SettingsDB.get()
  let s = settings.newsSources as NewsSource[] | undefined
  if (!s || s.length === 0) {
    // 首次使用：以内置源初始化并保存
    s = BUILTIN_SOURCES.map(x => ({ ...x }))
    await SettingsDB.set('newsSources', s)
  }
  sources.value = s
}

async function saveSources() {
  await SettingsDB.set('newsSources', sources.value.map(x => ({ ...x })))
}

async function toggleSource(id: string) {
  const src = sources.value.find(s => s.id === id)
  if (!src) return
  src.enabled = !src.enabled
  await saveSources()
}

// 自动采集
async function fetchNews() {
  if (loading.value) return
  loading.value = true
  fetchNote.value = ''
  progress.value = { done: 0, total: sources.value.filter(s => s.enabled).length, name: '' }
  try {
    const { items: newItems, results } = await fetchAllSources(
      sources.value,
      (done, total, name) => { progress.value = { done, total, name } }
    )
    const added = await NewsDB.addMany(newItems)
    await NewsDB.prune(30)
    await SettingsDB.set('newsLastFetch', new Date().toISOString())
    const okCount = results.filter(r => r.ok).length
    const failCount = results.length - okCount
    fetchNote.value = `已更新 ${added} 条新资讯（${okCount} 个源成功${failCount ? `，${failCount} 个源失败` : ''}）`
    await loadItems()
    if (added > 0) showToast(`采集到 ${added} 条新资讯`)
    else showToast('暂无新内容', 'success')
  } catch (e: any) {
    fetchNote.value = '采集失败：' + (e?.message || '未知错误')
    showToast('采集失败', 'error')
  } finally {
    loading.value = false
  }
}

// 交互：已读 / 收藏 / 删除
async function toggleRead(i: NewsItem) {
  i.isRead = !i.isRead
  await NewsDB.update(i)
}
async function toggleFavorite(i: NewsItem) {
  i.isFavorite = !i.isFavorite
  await NewsDB.update(i)
}
async function deleteItem(i: NewsItem) {
  if (!confirm('确定删除这条资讯？')) return
  if (i.id != null) await NewsDB.delete(i.id)
  await loadItems()
}

// 手动添加
async function addManual() {
  if (!formTitle.value.trim()) { showToast('请输入标题', 'error'); return }
  await NewsDB.add({
    title: formTitle.value.trim(),
    link: formLink.value.trim(),
    summary: formSummary.value.trim(),
    source: '手动添加',
    category: formCategory.value,
    pubDate: new Date().toISOString(),
    isRead: false,
    isFavorite: false,
    createdAt: new Date().toISOString()
  })
  showForm.value = false
  formTitle.value = ''
  formLink.value = ''
  formSummary.value = ''
  await loadItems()
  showToast('已添加')
}

// 转存飞书
async function syncToFeishu(i: NewsItem) {
  if (!feishuReady.value) {
    showToast('请先在「设置」配置飞书多维表格', 'error')
    return
  }
  try {
    await AiNewsAPI.create({
      title: i.title,
      link: i.link,
      summary: i.summary,
      category: i.category
    })
    i.syncedToFeishu = true
    if (i.id != null) await NewsDB.update(i)
    showToast('已转存飞书 ✅')
  } catch (e: any) {
    showToast(e.message || '转存失败', 'error')
  }
}

async function syncAllToFeishu() {
  if (!feishuReady.value) { showToast('请先在「设置」配置飞书', 'error'); return }
  const list = items.value.filter(i => i.isFavorite && !i.syncedToFeishu)
  if (list.length === 0) { showToast('没有待转存的收藏'); return }
  loading.value = true
  let ok = 0
  for (const i of list) {
    try {
      await AiNewsAPI.create({ title: i.title, link: i.link, summary: i.summary, category: i.category })
      i.syncedToFeishu = true
      if (i.id != null) await NewsDB.update(i)
      ok++
    } catch { /* continue */ }
  }
  loading.value = false
  showToast(`已转存 ${ok} 条到飞书`)
}

// 复制 Markdown 到腾讯文档 / 其他知识库
async function copyMarkdownItems(list: NewsItem[]) {
  if (list.length === 0) { showToast('没有可导出的内容', 'error'); return }
  const md = toMarkdown(list)
  try {
    await copyToClipboard(md)
    showToast('Markdown 已复制，可直接粘贴到腾讯文档/Notion')
    if (tencentDocUrl.value) window.open(tencentDocUrl.value, '_blank')
  } catch {
    showToast('复制失败，请手动选择', 'error')
  }
}

async function copyMarkdown() {
  const list = items.value.filter(i => i.isFavorite)
  const source = (list.length > 0 ? list : filteredItems.value) as NewsItem[]
  await copyMarkdownItems(source)
}

// 转存知识库（飞书 / 腾讯文档 / 复制 Markdown 可选）
const showKbMenu = ref(false)
const kbItem = ref<NewsItem | null>(null) // null = 批量模式

const availableKBs = computed(() => [
  { key: 'feishu', label: '飞书多维表格', icon: '🪶', available: feishuReady.value, hint: '请在设置配置飞书' },
  { key: 'tencent', label: '腾讯文档', icon: '📄', available: !!tencentDocUrl.value, hint: '请在设置填写腾讯文档链接' },
  { key: 'md', label: '复制 Markdown', icon: '📋', available: true, hint: '' }
])

function openKbMenu(item: NewsItem | null) {
  kbItem.value = item
  showKbMenu.value = true
}

async function doSyncKb(kb: { key: string }) {
  showKbMenu.value = false
  if (kb.key === 'feishu') {
    if (kbItem.value) await syncToFeishu(kbItem.value)
    else await syncAllToFeishu()
  } else if (kb.key === 'tencent') {
    if (!tencentDocUrl.value) { showToast('请先在「设置」填写腾讯文档链接', 'error'); return }
    if (kbItem.value) await copyMarkdownItems([kbItem.value])
    else await copyMarkdown()
  } else {
    if (kbItem.value) await copyMarkdownItems([kbItem.value])
    else await copyMarkdown()
  }
}

onMounted(async () => {
  const settings = await SettingsDB.get()
  tencentDocUrl.value = (settings.tencentDocUrl as string) || ''
  feishuReady.value = await verifyFeishuConfig().catch(() => false)
  await loadSources()
  await loadItems()
  // 首次或长时间未采集则自动拉取
  const last = settings.newsLastFetch as string
  const needFetch = items.value.length === 0 || !last || (Date.now() - new Date(last).getTime() > 6 * 3600 * 1000)
  if (needFetch) await fetchNews()
})
</script>

<template>
  <div>
    <div v-if="toast.show" class="toast" :class="toast.type">{{ toast.msg }}</div>

    <!-- 顶部操作 -->
    <div style="display: flex; gap: 8px; margin-bottom: 12px; flex-wrap: wrap;">
      <button class="btn btn-sm btn-primary" @click="fetchNews" :disabled="loading">
        {{ loading ? `采集中 ${progress.done}/${progress.total}` : '🔄 一键采集' }}
      </button>
      <button class="btn btn-sm btn-secondary" @click="showForm = true">+ 手动添加</button>
      <button class="btn btn-sm btn-secondary" @click="copyMarkdown">📋 复制 Markdown</button>
      <button class="btn btn-sm btn-secondary" @click="openKbMenu(null)" :disabled="loading">📚 批量转存知识库</button>
      <button class="btn btn-sm btn-secondary" @click="showSources = !showSources">
        📡 资讯源({{ sources.filter(s => s.enabled).length }})
      </button>
    </div>

    <!-- 资讯源快速开关 -->
    <div v-if="showSources" class="card" style="padding: 10px 12px;">
      <div style="font-size: 12px; color: var(--text-muted); margin-bottom: 8px;">
        点击开关即时生效，完整管理（添加自定义源）请到「设置 → 资讯源管理」
      </div>
      <div style="display: flex; flex-wrap: wrap; gap: 6px;">
        <button v-for="s in sources" :key="s.id" class="btn btn-sm"
          :class="s.enabled ? 'btn-primary' : 'btn-secondary'"
          @click="toggleSource(s.id)">
          {{ s.enabled ? '✓ ' : '' }}{{ s.name }}
        </button>
      </div>
    </div>

    <div v-if="loading" style="font-size: 12px; color: var(--text-muted); margin-bottom: 8px;">
      正在采集：{{ progress.name || '准备中…' }}
    </div>
    <div v-if="fetchNote" style="font-size: 12px; color: var(--text-secondary); margin-bottom: 8px;">
      {{ fetchNote }}
    </div>

    <!-- Tab -->
    <div class="tabs">
      <button v-for="tab in tabs" :key="tab" class="tab-item"
        :class="{ active: activeTab === tab }" @click="activeTab = tab">
        {{ tab }}<span v-if="tab === '收藏'" style="margin-left:2px;">({{ items.filter(i=>i.isFavorite).length }})</span>
        <span v-else-if="tab !== '全部' && categoryCounts[tab]" style="margin-left:2px;opacity:.7;">({{ categoryCounts[tab] }})</span>
      </button>
    </div>

    <!-- 搜索 -->
    <input v-model="searchQuery" class="input" placeholder="搜索标题 / 摘要 / 来源..." style="margin-bottom: 12px;" />

    <div v-if="unreadCount && activeTab === '全部'" style="font-size: 12px; color: var(--text-muted); margin-bottom: 8px;">
      有 {{ unreadCount }} 条未读
    </div>

    <!-- 列表 -->
    <div v-if="filteredItems.length === 0" class="empty-state">
      <div style="font-size: 40px;">📭</div>
      <div>暂无资讯，点「一键采集」试试</div>
      <div style="font-size: 12px; color: var(--text-muted); margin-top: 4px;">
        采集源可在「设置 → 资讯源管理」中配置
      </div>
    </div>

    <div v-for="i in filteredItems" :key="i.id" class="card" :style="{ opacity: i.isRead ? 0.62 : 1 }">
      <div style="display: flex; justify-content: space-between; align-items: flex-start; gap: 8px;">
        <h3 style="font-size: 15px; font-weight: 600; flex: 1; margin-right: 8px; line-height: 1.4;">
          <a v-if="i.link" :href="i.link" target="_blank" rel="noopener"
            @click="i.isRead = true; NewsDB.update(i)" style="color: var(--primary);">
            {{ i.title }}
          </a>
          <span v-else>{{ i.title }}</span>
        </h3>
        <button class="btn btn-sm" :style="{ color: i.isFavorite ? 'var(--warning)' : 'var(--text-muted)' }"
          @click="toggleFavorite(i)" title="收藏">★</button>
      </div>

      <p v-if="i.summary" style="font-size: 13px; color: var(--text-secondary); margin-top: 6px; line-height: 1.5;">
        {{ i.summary }}
      </p>

      <div style="display: flex; gap: 8px; margin-top: 8px; font-size: 12px; color: var(--text-muted); flex-wrap: wrap; align-items: center;">
        <span class="tag tag-primary">{{ i.category }}</span>
        <span>📰 {{ i.source }}</span>
        <span v-if="i.pubDate">· {{ formatDate(i.pubDate) }}</span>
        <span v-if="i.syncedToFeishu" style="color: var(--success);">✓ 已存飞书</span>
      </div>

      <div style="display: flex; gap: 6px; margin-top: 10px; flex-wrap: wrap;">
        <button class="btn btn-sm btn-secondary" @click="toggleRead(i)">
          {{ i.isRead ? '标为未读' : '标为已读' }}
        </button>
        <button class="btn btn-sm btn-secondary" @click="openKbMenu(i)">📚 转存知识库</button>
        <button class="btn btn-sm" style="color: var(--danger);" @click="deleteItem(i)">删除</button>
      </div>
    </div>

    <!-- 转存知识库弹窗 -->
    <div v-if="showKbMenu" class="modal-overlay" @click.self="showKbMenu = false">
      <div class="modal" style="max-width: 360px;">
        <div class="modal-header">
          <h3>📚 转存到知识库</h3>
          <button class="modal-close" @click="showKbMenu = false">✕</button>
        </div>
        <p style="font-size: 12px; color: var(--text-muted); margin-bottom: 10px; line-height: 1.6;">
          {{ kbItem ? '将这条资讯转存到选中的知识库' : '将收藏夹中尚未转存的资讯批量转存' }}
        </p>
        <button v-for="kb in availableKBs" :key="kb.key"
          class="kb-opt" :class="{ disabled: !kb.available }" @click="doSyncKb(kb)">
          <span class="kb-ic">{{ kb.icon }}</span>
          <span class="kb-lbl">{{ kb.label }}</span>
          <span v-if="!kb.available" class="kb-hint">{{ kb.hint }}</span>
          <span v-else-if="kb.key === 'feishu' && kbItem?.syncedToFeishu" class="kb-hint">已存</span>
        </button>
      </div>
    </div>

    <!-- 手动添加弹窗 -->
    <div v-if="showForm" class="modal-overlay" @click.self="showForm = false">
      <div class="modal">
        <div class="modal-header">
          <h3>📝 添加资讯</h3>
          <button class="modal-close" @click="showForm = false">✕</button>
        </div>
        <div class="form-group">
          <label class="form-label">分类</label>
          <div style="display: flex; gap: 6px; flex-wrap: wrap;">
            <button v-for="c in categories" :key="c" class="btn btn-sm"
              :class="formCategory === c ? 'btn-primary' : 'btn-secondary'" @click="formCategory = c">{{ c }}</button>
          </div>
        </div>
        <div class="form-group">
          <label class="form-label">标题 *</label>
          <input v-model="formTitle" class="input" placeholder="资讯标题" />
        </div>
        <div class="form-group">
          <label class="form-label">链接</label>
          <input v-model="formLink" class="input" placeholder="https://..." />
        </div>
        <div class="form-group">
          <label class="form-label">摘要</label>
          <textarea v-model="formSummary" class="textarea" placeholder="内容摘要..." rows="3" />
        </div>
        <button class="btn btn-primary btn-block" @click="addManual">✓ 保存到本地</button>
      </div>
    </div>
  </div>
</template>
