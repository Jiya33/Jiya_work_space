<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { AiNewsAPI, fetchAllRecords, verifyFeishuConfig } from '../services/feishu'
import { formatDate } from '../utils/format'
import type { FeishuRecordItem } from '../types'

const toast = ref({ show: false, msg: '', type: 'success' })
function showToast(msg: string, type = 'success') {
  toast.value = { show: true, msg, type }
  setTimeout(() => { toast.value.show = false }, 2000)
}

const activeTab = ref('新技术')
const tabs = ['新技术', '新产品', '新开源', '新点子']

const records = ref<FeishuRecordItem[]>([])
const loading = ref(false)
const feishuReady = ref(false)

// 搜索
const searchQuery = ref('')

const filteredRecords = computed(() => {
  let result = records.value.filter(r => {
    const cat = String(r.fields['分类'] || '')
    return cat === activeTab.value
  })
  if (searchQuery.value) {
    const q = searchQuery.value.toLowerCase()
    result = result.filter(r => {
      const title = String(r.fields['标题'] || '').toLowerCase()
      const summary = String(r.fields['摘要'] || '').toLowerCase()
      return title.includes(q) || summary.includes(q)
    })
  }
  return result
})

// 录入表单
const showForm = ref(false)
const formTitle = ref('')
const formLink = ref('')
const formSummary = ref('')
const formCategory = ref('新技术')

async function submitNews() {
  if (!formTitle.value.trim()) { showToast('请输入标题', 'error'); return }
  loading.value = true
  try {
    await AiNewsAPI.create({
      title: formTitle.value.trim(),
      link: formLink.value.trim(),
      summary: formSummary.value.trim(),
      category: formCategory.value
    })
    showToast('添加成功！')
    showForm.value = false
    formTitle.value = ''
    formLink.value = ''
    formSummary.value = ''
    await loadRecords()
  } catch (e: any) {
    showToast(e.message, 'error')
  } finally {
    loading.value = false
  }
}

async function deleteNews(recordId: string) {
  if (!confirm('确定删除？')) return
  try {
    await AiNewsAPI.delete(recordId)
    showToast('已删除')
    await loadRecords()
  } catch (e: any) {
    showToast(e.message, 'error')
  }
}

async function loadRecords() {
  if (!feishuReady.value) return
  loading.value = true
  try {
    records.value = await fetchAllRecords('feishuAiNewsTableId')
  } catch (e: any) {
    showToast(e.message, 'error')
  } finally {
    loading.value = false
  }
}

// 自动填入当前 Tab
function openForm(cat?: string) {
  formCategory.value = cat || activeTab.value
  showForm.value = true
}

import { computed } from 'vue'

onMounted(async () => {
  feishuReady.value = await verifyFeishuConfig().catch(() => false)
  if (feishuReady.value) await loadRecords()
})
</script>

<template>
  <div>
    <div v-if="toast.show" class="toast" :class="toast.type">{{ toast.msg }}</div>

    <!-- Tab -->
    <div class="tabs">
      <button v-for="tab in tabs" :key="tab" class="tab-item"
        :class="{ active: activeTab === tab }" @click="activeTab = tab">
        {{ tab }}
      </button>
    </div>

    <!-- 搜索 -->
    <input v-model="searchQuery" class="input" placeholder="搜索标题或摘要..." style="margin-bottom: 12px;" />

    <!-- 非飞书模式 -->
    <div v-if="!feishuReady" class="card">
      <div class="empty-state">
        <div style="font-size: 40px;">🔌</div>
        <div>未连接飞书知识库</div>
        <div style="font-size: 12px; color: var(--text-muted); margin-top: 4px;">请在设置页面配置飞书应用</div>
        <button class="btn btn-primary btn-sm" style="margin-top: 12px;" @click="$router.push('/settings')">前往设置</button>
      </div>
    </div>

    <!-- 内容区 -->
    <div v-else>
      <div style="display: flex; gap: 8px; margin-bottom: 12px;">
        <button class="btn btn-primary btn-sm" @click="openForm()">+ 添加资讯</button>
        <button class="btn btn-sm btn-secondary" @click="loadRecords" :disabled="loading">
          {{ loading ? '加载中...' : '🔄 刷新' }}
        </button>
      </div>

      <div v-if="loading && records.length === 0" class="loading">
        <div class="spinner" />
      </div>

      <div v-else-if="filteredRecords.length === 0" class="empty-state">
        <div style="font-size: 40px;">📭</div>
        <div>暂无{{ activeTab }}相关资讯</div>
      </div>

      <div v-for="r in filteredRecords" :key="r.record_id" class="card">
        <div style="display: flex; justify-content: space-between; align-items: flex-start;">
          <h3 style="font-size: 15px; font-weight: 600; flex: 1; margin-right: 8px;">
            <a v-if="r.fields['链接']" :href="(r.fields['链接'] as any)?.link || r.fields['链接']" target="_blank" style="color: var(--primary);">
              {{ r.fields['标题'] }}
            </a>
            <span v-else>{{ r.fields['标题'] }}</span>
          </h3>
          <button class="btn btn-sm" style="color: var(--danger);" @click="deleteNews(r.record_id)">删除</button>
        </div>
        <p style="font-size: 13px; color: var(--text-secondary); margin-top: 6px; line-height: 1.5;">
          {{ r.fields['摘要'] }}
        </p>
        <div style="display: flex; gap: 8px; margin-top: 8px; font-size: 12px; color: var(--text-muted);">
          <span class="tag tag-primary">{{ r.fields['分类'] }}</span>
          <span>{{ formatDate(String(r.fields['创建时间'] || '')) }}</span>
        </div>
      </div>
    </div>

    <!-- 录入弹窗 -->
    <div v-if="showForm" class="modal-overlay" @click.self="showForm = false">
      <div class="modal">
        <div class="modal-header">
          <h3>📝 添加AI资讯</h3>
          <button class="modal-close" @click="showForm = false">✕</button>
        </div>
        <div class="form-group">
          <label class="form-label">分类</label>
          <div style="display: flex; gap: 6px; flex-wrap: wrap;">
            <button v-for="t in tabs" :key="t" class="btn btn-sm"
              :class="formCategory===t?'btn-primary':'btn-secondary'" @click="formCategory = t">{{ t }}</button>
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
        <button class="btn btn-primary btn-block" @click="submitNews" :disabled="loading">
          {{ loading ? '保存中...' : '✓ 保存到飞书' }}
        </button>
      </div>
    </div>
  </div>
</template>
