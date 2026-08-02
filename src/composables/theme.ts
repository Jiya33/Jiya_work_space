// ====== 共享主题状态（App 与设置页联动）======
import { ref } from 'vue'

export type ThemeMode = 'auto' | 'light' | 'dark'

// 模块级单例 ref，App.vue 与 Settings.vue 共用，保证主题切换全局一致
export const theme = ref<ThemeMode>('auto')
