// src/router/index.ts
import { createRouter, createWebHistory } from 'vue-router'

const router = createRouter({
  history: createWebHistory(),
  routes: [
    {
      path: '/',
      redirect: '/weight/overview'
    },
    // 重量检测器路由
    {
      path: '/weight',
      children: [
        {
          path: 'overview',
          name: 'WeightOverview',
          component: () => import('@/views/weight/Overview.vue'),
          meta: { title: '重量监控', icon: 'Crop' }
        },
        {
          path: 'configuration',
          name: 'WeightConfiguration',
          component: () => import('@/views/weight/Configuration.vue'),
          meta: { title: '重量配置', icon: 'Setting' }
        },
        {
          path: 'records',
          name: 'WeightRecords',
          component: () => import('@/views/weight/Records.vue'),
          meta: { title: '重量记录', icon: 'Document' }
        }
      ]
    },
    // 糖度检测器路由
    {
      path: '/brix',
      children: [
        {
          path: 'overview',
          name: 'BrixOverview',
          component: () => import('@/views/brix/Overview.vue'),
          meta: { title: '糖度监控', icon: 'Cherry' }
        },
        {
          path: 'configuration',
          name: 'BrixConfiguration',
          component: () => import('@/views/brix/Configuration.vue'),
          meta: { title: '糖度配置', icon: 'Setting' }
        },
        // {
        //   path: 'records',
        //   name: 'BrixRecords',
        //   component: () => import('@/views/brix/Records.vue'),
        //   meta: { title: '糖度记录', icon: 'Document' }
        // },
        {
          path: 'calibration',
          name: 'BrixCalibration',
          component: () => import('@/views/brix/Calibration.vue'),
          meta: { title: '传感器校准', icon: 'Tools' }
        }
        // {
        //   path: 'alerts',
        //   name: 'BrixAlerts',
        //   component: () => import('@/views/brix/Alerts.vue'),
        //   meta: { title: '报警管理', icon: 'Bell' }
        // }
      ]
    }
  ]
})
router.beforeEach((to, _from, next) => {
  // 设置页面标题
  if (to.meta?.title) {
    document.title = `${to.meta.title} - 检测系统`
  }
  next()
})

export default router