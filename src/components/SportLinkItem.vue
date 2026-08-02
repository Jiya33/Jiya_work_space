<script setup lang="ts">
import { inject } from 'vue'
import type { SportLink } from '../types'
import { PLATFORM_ICON } from '../utils/platform'

const props = defineProps<{ link: SportLink }>()
const emit = defineEmits<{
  (e: 'delete', id: number): void
  (e: 'edit', link: SportLink): void
}>()

// 复制 / 跳转 提示由父级提供（复用 Sport.vue 的 toast）
const showToast = inject<(msg: string, type?: 'success' | 'error') => void>('showToast', () => {})

// 打开链接：兼容手机端独立 PWA 模式（会拦截 target=_blank）
function openLink(url: string) {
  const nav = window.navigator as any
  const isStandalone = nav.standalone === true ||
    window.matchMedia('(display-mode: standalone)').matches ||
    window.matchMedia('(display-mode: fullscreen)').matches
  if (isStandalone) {
    window.location.href = url
    return
  }
  const w = window.open(url, '_blank', 'noopener')
  if (!w) window.location.href = url
}

// 复制链接到剪贴板（用于「复制打开抖音」类分享文案场景）
async function copyLink(url: string) {
  try {
    if (navigator.clipboard && navigator.clipboard.writeText) {
      await navigator.clipboard.writeText(url)
    } else {
      const ta = document.createElement('textarea')
      ta.value = url
      ta.style.position = 'fixed'
      ta.style.opacity = '0'
      document.body.appendChild(ta)
      ta.select()
      document.execCommand('copy')
      document.body.removeChild(ta)
    }
    showToast('已复制链接')
  } catch {
    showToast('复制失败，请手动复制', 'error')
  }
}
</script>

<template>
  <div class="link-chip">
    <span class="link-ic">{{ PLATFORM_ICON[link.platform] }}</span>
    <button class="link-main" @click="openLink(link.url)" :title="`打开${link.platform}`">
      <span class="link-txt">
        <b>{{ link.platform }}</b>
        <i v-if="link.note">{{ link.note }}</i>
        <i v-else>{{ link.url }}</i>
      </span>
    </button>
    <div class="link-acts">
      <button class="link-act" title="复制链接" @click.stop="copyLink(link.url)">📋</button>
      <button class="link-act" title="编辑" @click.stop="emit('edit', link)">✏️</button>
      <button class="link-act link-del-act" title="删除" @click.stop="emit('delete', link.id!)">✕</button>
    </div>
  </div>
</template>
