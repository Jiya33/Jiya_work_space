<script setup lang="ts">
import { ref, onMounted, computed } from 'vue'
import { TodoDB } from '../services/db'
import { formatDate, formatDateTime } from '../utils/format'
import type { TodoItem } from '../types'

const todos = ref<TodoItem[]>([])
const searchQuery = ref('')
const groupBy = ref<'date' | 'source'>('date')

const archivedTodos = computed(() => {
  let result = todos.value.filter(t => t.completed)
  if (searchQuery.value) {
    const q = searchQuery.value.toLowerCase()
    result = result.filter(t => t.content.toLowerCase().includes(q))
  }
  return result.sort((a, b) => new Date(b.completedAt || b.date).getTime() - new Date(a.completedAt || a.date).getTime())
})

const groupedTodos = computed(() => {
  const groups: Record<string, TodoItem[]> = {}
  for (const t of archivedTodos.value) {
    const key = groupBy.value === 'date'
      ? (t.completedAt || t.date).slice(0, 7)
      : (t.sourceModule || '手动添加')
    if (!groups[key]) groups[key] = []
    groups[key].push(t)
  }
  return Object.entries(groups).sort((a, b) => b[0].localeCompare(a[0]))
})

async function clearAll() {
  if (!confirm('确定清空所有已归档任务？此操作不可撤销！')) return
  for (const t of todos.value) {
    if (t.completed && t.id) await TodoDB.delete(t.id)
  }
  todos.value = []
}

async function deleteTodo(id: number) {
  await TodoDB.delete(id)
  todos.value = todos.value.filter(t => t.id !== id)
}

async function loadData() {
  const all = await TodoDB.getAll()
  todos.value = all.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
}

onMounted(loadData)
</script>

<template>
  <div>
    <!-- 搜索和分组 -->
    <div style="display: flex; gap: 8px; margin-bottom: 12px;">
      <input v-model="searchQuery" class="input" placeholder="搜索已完成任务..." style="flex: 1;" />
      <select v-model="groupBy" class="select" style="width: 100px;">
        <option value="date">按月</option>
        <option value="source">按来源</option>
      </select>
    </div>

    <div v-if="archivedTodos.length === 0" class="empty-state">
      <div style="font-size: 40px;">📦</div>
      <div>暂无已归档任务</div>
    </div>

    <div v-else>
      <!-- 统计 -->
      <div class="card">
        <div style="display: flex; gap: 20px; text-align: center;">
          <div style="flex: 1;">
            <div style="font-size: 24px; font-weight: 700; color: var(--success);">{{ archivedTodos.length }}</div>
            <div style="font-size: 12px; color: var(--text-muted);">已完成任务</div>
          </div>
          <div style="flex: 1;">
            <div style="font-size: 24px; font-weight: 700; color: var(--primary);">{{ groupedTodos.length }}</div>
            <div style="font-size: 12px; color: var(--text-muted);">{{ groupBy === 'date' ? '月份' : '来源' }}</div>
          </div>
        </div>
      </div>

      <!-- 分组列表 -->
      <div v-for="[key, items] in groupedTodos" :key="key" style="margin-bottom: 16px;">
        <h3 style="font-size: 14px; font-weight: 600; color: var(--text-secondary); margin-bottom: 8px; padding-left: 4px;">
          {{ groupBy === 'date' ? `${key.slice(0,4)}年${key.slice(5)}月` : key }}
          <span style="font-weight: 400; color: var(--text-muted); font-size: 12px;">({{ items.length }})</span>
        </h3>
        <div v-for="t in items" :key="t.id" class="card" style="padding: 12px;">
          <div style="display: flex; gap: 8px; align-items: flex-start;">
            <span style="color: var(--success); font-size: 16px;">✅</span>
            <div style="flex: 1;">
              <div style="font-size: 14px; text-decoration: line-through; color: var(--text-muted);">{{ t.content }}</div>
              <div style="display: flex; gap: 8px; margin-top: 6px; font-size: 12px; color: var(--text-muted);">
                <span>📅 {{ formatDate(t.date) }}</span>
                <span v-if="t.completedAt">✅ {{ formatDateTime(t.completedAt) }}</span>
                <span v-if="t.sourceModule" class="tag tag-primary">{{ t.sourceModule }}</span>
              </div>
            </div>
            <button class="btn btn-sm" style="color: var(--danger);" @click="deleteTodo(t.id!)">删除</button>
          </div>
        </div>
      </div>

      <button class="btn btn-danger btn-block" style="margin-top: 16px;" @click="clearAll">
        🗑 清空所有归档
      </button>
    </div>
  </div>
</template>
