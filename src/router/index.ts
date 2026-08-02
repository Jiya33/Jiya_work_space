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
      path: '/english',
      name: 'english',
      component: () => import('../views/English.vue'),
      meta: { title: '英语学习' }
    },
    {
      path: '/sport',
      name: 'sport',
      component: () => import('../views/Sport.vue'),
      meta: { title: '运动计划' }
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
      meta: { title: 'AI 资讯' }
    },
    {
      path: '/focus-mode',
      name: 'focus-mode',
      component: () => import('../views/FocusMode.vue'),
      meta: { title: '专注模式' }
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
