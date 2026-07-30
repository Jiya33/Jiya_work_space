<script setup lang="ts">
import { ref, computed, onMounted, watch } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { SettingsDB } from './services/db'

const router = useRouter()
const route = useRoute()
const sidebarOpen = ref(false)
const theme = ref<'auto' | 'light' | 'dark'>('auto')

const navItems = [
  { path: '/', label: '今日看板', icon: '📋' },
  { path: '/learning-health', label: '学习与健康', icon: '📚' },
  { path: '/finance', label: '财务管理', icon: '💰' },
  { path: '/ai-news', label: 'AI 产品经理资讯', icon: '🤖' },
  { path: '/shop-side', label: '探店副业', icon: '🏪' },
  { path: '/focus-mode', label: '专注模式', icon: '🎯' },
  { path: '/history', label: '历史归档', icon: '📦' },
  { path: '/settings', label: '设置', icon: '⚙️' }
]

const resolvedTheme = computed(() => {
  if (theme.value === 'auto') {
    return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'
  }
  return theme.value
})

function applyTheme(t: string) {
  document.documentElement.setAttribute('data-theme', t)
}

watch(resolvedTheme, applyTheme, { immediate: true })

function navigateTo(path: string) {
  router.push(path)
  sidebarOpen.value = false
}

function toggleSidebar() {
  sidebarOpen.value = !sidebarOpen.value
}

function cycleTheme() {
  const themes: ('auto' | 'light' | 'dark')[] = ['auto', 'light', 'dark']
  const idx = themes.indexOf(theme.value)
  theme.value = themes[(idx + 1) % themes.length]
  SettingsDB.set('theme', theme.value)
}

const themeLabels: Record<string, string> = { auto: '🌓 跟随系统', light: '☀️ 浅色', dark: '🌙 深色' }
const pageTitle = computed(() => {
  const meta = route.meta?.title
  return typeof meta === 'string' ? meta : '今日看板'
})

onMounted(async () => {
  const settings = await SettingsDB.get()
  if (settings.theme) theme.value = settings.theme
})
</script>

<template>
  <div class="app-layout">
    <!-- 侧边栏遮罩 -->
    <div
      class="sidebar-overlay"
      :class="{ open: sidebarOpen }"
      @click="sidebarOpen = false"
    />

    <!-- 侧边栏 -->
    <aside class="sidebar" :class="{ open: sidebarOpen }">
      <div class="sidebar-header">
        <h1>Jiya 智能工作台</h1>
        <p>高效生活 · 智慧管理</p>
      </div>

      <nav class="sidebar-nav">
        <button
          v-for="item in navItems"
          :key="item.path"
          class="nav-item"
          :class="{ active: route.path === item.path }"
          @click="navigateTo(item.path)"
        >
          <span class="icon">{{ item.icon }}</span>
          {{ item.label }}
        </button>
      </nav>

      <div class="sidebar-footer">
        <button class="theme-toggle" @click="cycleTheme">
          <span>{{ themeLabels[theme] }}</span>
        </button>
      </div>
    </aside>

    <!-- 主内容区 -->
    <div class="main-content">
      <header class="page-header">
        <button class="hamburger" @click="toggleSidebar">
          <span /><span /><span />
        </button>
        <h2>{{ pageTitle }}</h2>
      </header>

      <div class="page-body">
        <router-view />
      </div>
    </div>
  </div>
</template>
