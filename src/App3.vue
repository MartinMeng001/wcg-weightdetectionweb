<!-- App.vue - 主应用容器 -->
<template>
  <div class="app-container">
    <!-- 侧边栏组件 -->
    <AppSidebar
      :collapsed="sidebarCollapsed"
      :active-view="activeView"
      :weight-system-online="weightSystemOnline"
      :brix-system-online="brixSystemOnline"
      @toggle-sidebar="toggleSidebar"
      @set-active-view="setActiveView"
    />

    <!-- 主内容区 -->
    <div class="main-container">
      <!-- 头部组件 -->
      <AppHeader
        :current-page-title="currentPageTitle"
        :system-running="systemRunning"
        :refreshing="refreshing"
        @refresh-data="refreshData"
        @user-command="handleUserCommand"
      />

      <!-- 主内容 -->
      <div class="main-content">
        <!-- 多检测器概览页面 -->
        <SystemOverview
          v-show="activeView === 'overview'"
          :weight-data="weightOverviewData"
          :brix-data="brixOverviewData"
          :realtime-data="realtimeData"
          :realtime-loading="realtimeLoading"
          @set-active-view="setActiveView"
          @refresh-realtime="refreshRealtimeData"
        />

        <!-- 其他页面内容 -->
        <router-view v-show="activeView !== 'overview'" />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { ElMessage } from 'element-plus'
import AppSidebar from '@/components/layout/AppSidebar.vue'
import AppHeader from '@/components/layout/AppHeader.vue'
import SystemOverview from '@/components/overview/SystemOverview.vue'
import { useWeightStore } from '@/stores/weight'
import { useBrixStore } from '@/stores/brix'

const router = useRouter()
const route = useRoute()
const weightStore = useWeightStore()
const brixStore = useBrixStore()

// 响应式数据
const sidebarCollapsed = ref(false)
const activeView = ref('overview')
const refreshing = ref(false)
const realtimeLoading = ref(false)

// 模拟实时数据
const currentWeight = ref(75.3)
const currentBrix = ref(12.8)
const weightTodayTotal = ref(2547)
const brixTodayTotal = ref(1892)
const weightSuccessRate = ref(0.985)
const brixSuccessRate = ref(0.962)

// 实时数据表格
const realtimeData = ref([
  {
    id: 1,
    timestamp: new Date().toISOString(),
    detector: '重量检测',
    icon: 'Crop',
    color: '#409eff',
    value: '75.3g',
    result: '中等级',
    action: '通道2输出',
    status: '成功'
  },
  // ... 其他数据
])

// 计算属性
const weightSystemOnline = computed(() => weightStore.isSystemOnline)
const brixSystemOnline = computed(() => brixStore.isSystemOnline)
const systemRunning = computed(() => weightSystemOnline.value || brixSystemOnline.value)

const currentPageTitle = computed(() => {
  const titleMap: Record<string, string> = {
    'overview': '多检测器概览',
    'weight-overview': '重量实时监控',
    'weight-config': '重量配置管理',
    'weight-records': '重量检测记录',
    'brix-overview': '糖度实时监控',
    'brix-config': '糖度配置管理',
    'brix-records': '糖度检测记录',
    'brix-calibration': '传感器校准',
    'brix-alerts': '报警管理'
  }
  return titleMap[activeView.value] || '检测系统'
})

// 为子组件准备的数据
const weightOverviewData = computed(() => ({
  online: weightSystemOnline.value,
  currentWeight: currentWeight.value,
  todayTotal: weightTodayTotal.value,
  successRate: weightSuccessRate.value
}))

const brixOverviewData = computed(() => ({
  online: brixSystemOnline.value,
  currentBrix: currentBrix.value,
  todayTotal: brixTodayTotal.value,
  successRate: brixSuccessRate.value
}))

// 方法
const toggleSidebar = () => {
  sidebarCollapsed.value = !sidebarCollapsed.value
}

const setActiveView = (view: string) => {
  activeView.value = view

  const routeMap: Record<string, string> = {
    'weight-overview': '/weight/overview',
    'weight-config': '/weight/configuration',
    'weight-records': '/weight/records',
    'brix-overview': '/brix/overview',
    'brix-config': '/brix/configuration',
    'brix-records': '/brix/records',
    'brix-calibration': '/brix/calibration',
    'brix-alerts': '/brix/alerts'
  }

  if (routeMap[view]) {
    router.push(routeMap[view])
  }
}

const refreshData = async () => {
  refreshing.value = true
  try {
    await Promise.allSettled([
      weightStore.fetchStatus(),
      brixStore.fetchStatus()
    ])
    updateRandomData()
    ElMessage.success('数据已刷新')
  } catch (error) {
    ElMessage.error('刷新数据失败')
  } finally {
    refreshing.value = false
  }
}

const refreshRealtimeData = async () => {
  realtimeLoading.value = true
  try {
    await new Promise(resolve => setTimeout(resolve, 1000))
    updateRandomData()
  } finally {
    realtimeLoading.value = false
  }
}

const updateRandomData = () => {
  currentWeight.value = Math.random() * 100 + 20
  currentBrix.value = Math.random() * 15 + 5

  const detectors = [
    { name: '重量检测', icon: 'Crop', color: '#409eff' },
    { name: '糖度检测', icon: 'Cherry', color: '#e6a23c' }
  ]

  const detector = detectors[Math.floor(Math.random() * detectors.length)]
  const newRecord = {
    id: Date.now(),
    timestamp: new Date().toISOString(),
    detector: detector.name,
    icon: detector.icon,
    color: detector.color,
    value: detector.name === '重量检测' ?
      `${(Math.random() * 100 + 20).toFixed(1)}g` :
      `${(Math.random() * 15 + 5).toFixed(1)}°Bx`,
    result: ['优质', '中等级', '合格'][Math.floor(Math.random() * 3)],
    action: `通道${Math.floor(Math.random() * 4) + 1}输出`,
    status: Math.random() > 0.1 ? '成功' : '警告'
  }

  realtimeData.value.unshift(newRecord)
  if (realtimeData.value.length > 20) {
    realtimeData.value.pop()
  }
}

const handleUserCommand = (command: string) => {
  switch (command) {
    case 'settings':
      ElMessage.info('系统设置功能开发中...')
      break
    case 'about':
      ElMessage.info('关于系统功能开发中...')
      break
    case 'logout':
      ElMessage.info('退出登录功能开发中...')
      break
  }
}

// 自动更新数据
let dataUpdateTimer: NodeJS.Timeout | null = null

onMounted(() => {
  dataUpdateTimer = setInterval(updateRandomData, 5000)

  // 根据当前路由设置活动视图
  const path = route.path
  if (path.startsWith('/weight')) {
    if (path.includes('configuration')) activeView.value = 'weight-config'
    else if (path.includes('records')) activeView.value = 'weight-records'
    else activeView.value = 'weight-overview'
  } else if (path.startsWith('/brix')) {
    if (path.includes('configuration')) activeView.value = 'brix-config'
    else if (path.includes('records')) activeView.value = 'brix-records'
    else if (path.includes('calibration')) activeView.value = 'brix-calibration'
    else if (path.includes('alerts')) activeView.value = 'brix-alerts'
    else activeView.value = 'brix-overview'
  } else {
    activeView.value = 'overview'
  }
})

// 清理定时器
const cleanup = () => {
  if (dataUpdateTimer) {
    clearInterval(dataUpdateTimer)
    dataUpdateTimer = null
  }
}

window.addEventListener('beforeunload', cleanup)
</script>

<style scoped>
.app-container {
  display: flex;
  height: 100vh;
  background: #f0f2f5;
}

.main-container {
  flex: 1;
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

.main-content {
  flex: 1;
  padding: 20px;
  overflow-y: auto;
}

/* 滚动条样式 */
.main-content::-webkit-scrollbar {
  width: 6px;
}

.main-content::-webkit-scrollbar-track {
  background: transparent;
}

.main-content::-webkit-scrollbar-thumb {
  background: #ddd;
  border-radius: 3px;
}

.main-content::-webkit-scrollbar-thumb:hover {
  background: #999;
}

@media (max-width: 768px) {
  .main-content {
    padding: 15px;
  }
}
</style>