// src/router/index.ts
import { createRouter, createWebHistory } from 'vue-router'

const router = createRouter({
  history: createWebHistory(),
  routes: [
    {
      path: '/',
      redirect: '/weight/overview'
    },
    {
      path: '/weight',
      children: [
        {
          path: 'overview',
          name: 'WeightOverview',
          component: () => import('@/views/weight/Overview.vue'),
          meta: { title: '实时监控' }
        },
        {
          path: 'configuration',
          name: 'WeightConfiguration',
          component: () => import('@/views/weight/Configuration.vue'),
          meta: { title: '配置管理' }
        },
        {
          path: 'records',
          name: 'WeightRecords',
          component: () => import('@/views/weight/Records.vue'),
          meta: { title: '检测记录' }
        }
      ]
    }
  ]
})

export default router