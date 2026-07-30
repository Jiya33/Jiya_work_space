import { createRouter, createWebHashHistory } from 'vue-router'

const router = createRouter({
  history: createWebHashHistory(),
  routes: [
    {
      path: '/',
      name: 'dashboard',
      component: () => import('../views/Dashboard.vue'),
      meta: { title: '今日看板' }
    },
    {
      path: '/learning-health',
      name: 'learning-health',
      component: () => import('../views/LearningHealth.vue'),
      meta: { title: '学习与健康' }
    },
    {
      path: '/finance',
      name: 'finance',
      component: () => import('../views/Finance.vue'),
      meta: { title: '财务管理' }
    },
    {
      path: '/ai-news',
      name: 'ai-news',
      component: () => import('../views/AiNews.vue'),
      meta: { title: 'AI 产品经理资讯' }
    },
    {
      path: '/shop-side',
      name: 'shop-side',
      component: () => import('../views/ShopSide.vue'),
      meta: { title: '探店副业' }
    },
    {
      path: '/focus-mode',
      name: 'focus-mode',
      component: () => import('../views/FocusMode.vue'),
      meta: { title: '专注模式' }
    },
    {
      path: '/history',
      name: 'history',
      component: () => import('../views/HistoryArchive.vue'),
      meta: { title: '历史归档' }
    },
    {
      path: '/settings',
      name: 'settings',
      component: () => import('../views/Settings.vue'),
      meta: { title: '设置' }
    }
  ]
})

export default router
