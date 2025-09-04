<!-- App.vue - 现代化多检测器系统布局 -->
<template>
  <div class="app-container">
    <!-- 侧边栏 -->
    <div class="sidebar" :class="{ collapsed: sidebarCollapsed }">
      <div class="logo-section">
        <div class="logo">
          <el-icon class="logo-icon"><TrendCharts /></el-icon>
          <span class="logo-text" v-show="!sidebarCollapsed">工业检测系统</span>
        </div>
        <div class="version" v-show="!sidebarCollapsed">v2.0.0</div>
      </div>

      <div class="menu-container">
        <!-- 系统概览 -->
        <div class="menu-group">
          <div class="menu-title" v-show="!sidebarCollapsed">系统概览</div>
          <div
            class="menu-item"
            :class="{ active: activeView === 'overview' }"
            @click="setActiveView('overview')"
          >
            <el-icon><DataAnalysis /></el-icon>
            <span v-show="!sidebarCollapsed">多检测器概览</span>
          </div>
        </div>

        <!-- 重量检测器 -->
        <div class="menu-group">
          <div
            class="menu-title expandable"
            v-show="!sidebarCollapsed"
            @click="toggleWeightMenu"
          >
            重量检测器
            <el-icon class="expand-icon" :class="{ expanded: weightMenuExpanded }">
              <ArrowRight />
            </el-icon>
          </div>
          <div class="menu-items" :class="{ collapsed: !weightMenuExpanded }">
            <div
              class="menu-item"
              :class="{ active: activeView === 'weight-overview' }"
              @click="setActiveView('weight-overview')"
            >
              <el-icon><Crop /></el-icon>
              <span v-show="!sidebarCollapsed">实时监控</span>
              <span class="detector-badge" v-show="!sidebarCollapsed && weightSystemOnline">运行中</span>
            </div>
            <div
              class="menu-item"
              :class="{ active: activeView === 'weight-config' }"
              @click="setActiveView('weight-config')"
            >
              <el-icon><Setting /></el-icon>
              <span v-show="!sidebarCollapsed">配置管理</span>
            </div>
            <div
              class="menu-item"
              :class="{ active: activeView === 'weight-records' }"
              @click="setActiveView('weight-records')"
            >
              <el-icon><Document /></el-icon>
              <span v-show="!sidebarCollapsed">检测记录</span>
            </div>
          </div>
        </div>

        <!-- 糖度检测器 -->
        <div class="menu-group">
          <div
            class="menu-title expandable"
            v-show="!sidebarCollapsed"
            @click="toggleBrixMenu"
          >
            糖度检测器
            <el-icon class="expand-icon" :class="{ expanded: brixMenuExpanded }">
              <ArrowRight />
            </el-icon>
          </div>
          <div class="menu-items" :class="{ collapsed: !brixMenuExpanded }">
            <div
              class="menu-item"
              :class="{ active: activeView === 'brix-overview' }"
              @click="setActiveView('brix-overview')"
            >
              <el-icon><Cherry /></el-icon>
              <span v-show="!sidebarCollapsed">糖度监控</span>
              <span class="detector-badge" v-show="!sidebarCollapsed && brixSystemOnline">运行中</span>
            </div>
            <div
              class="menu-item"
              :class="{ active: activeView === 'brix-config' }"
              @click="setActiveView('brix-config')"
            >
              <el-icon><Setting /></el-icon>
              <span v-show="!sidebarCollapsed">糖度配置</span>
            </div>
            <div
              class="menu-item"
              :class="{ active: activeView === 'brix-records' }"
              @click="setActiveView('brix-records')"
            >
              <el-icon><Tickets /></el-icon>
              <span v-show="!sidebarCollapsed">糖度记录</span>
            </div>
            <div
              class="menu-item"
              :class="{ active: activeView === 'brix-calibration' }"
              @click="setActiveView('brix-calibration')"
            >
              <el-icon><Tools /></el-icon>
              <span v-show="!sidebarCollapsed">传感器校准</span>
            </div>
            <div
              class="menu-item"
              :class="{ active: activeView === 'brix-alerts' }"
              @click="setActiveView('brix-alerts')"
            >
              <el-icon><Bell /></el-icon>
              <span v-show="!sidebarCollapsed">报警管理</span>
            </div>
          </div>
        </div>
      </div>

      <!-- 折叠按钮 -->
      <div class="sidebar-toggle" @click="toggleSidebar">
        <el-icon>
          <component :is="sidebarCollapsed ? 'Expand' : 'Fold'" />
        </el-icon>
      </div>
    </div>

    <!-- 主内容区 -->
    <div class="main-container">
      <!-- 顶部头部 -->
      <div class="header">
        <div class="breadcrumb">
          <span>检测系统</span>
          <el-icon class="breadcrumb-separator"><ArrowRight /></el-icon>
          <span class="current">{{ currentPageTitle }}</span>
        </div>
        <div class="header-actions">
          <div class="status-indicator">
            <div class="status-dot" :class="{ online: systemRunning }"></div>
            <span>{{ systemRunning ? '系统运行中' : '系统离线' }}</span>
          </div>
          <el-button
            circle
            @click="refreshData"
            :loading="refreshing"
          >
            <el-icon><Refresh /></el-icon>
          </el-button>
          <el-dropdown @command="handleUserCommand">
            <el-button circle>
              <el-icon><User /></el-icon>
            </el-button>
            <template #dropdown>
              <el-dropdown-menu>
                <el-dropdown-item command="settings">
                  <el-icon><Setting /></el-icon>
                  系统设置
                </el-dropdown-item>
                <el-dropdown-item command="about">
                  <el-icon><InfoFilled /></el-icon>
                  关于系统
                </el-dropdown-item>
                <el-dropdown-item divided command="logout">
                  <el-icon><SwitchButton /></el-icon>
                  退出登录
                </el-dropdown-item>
              </el-dropdown-menu>
            </template>
          </el-dropdown>
        </div>
      </div>

      <!-- 主内容 -->
      <div class="main-content">
        <!-- 多检测器概览页面 -->
        <div v-show="activeView === 'overview'" class="overview-content">
          <div class="detectors-grid">
            <!-- 重量检测器卡片 -->
            <div class="detector-card weight-detector" @click="setActiveView('weight-overview')">
              <div class="detector-header">
                <div class="detector-title">
                  <div class="detector-icon">
                    <el-icon><Crop /></el-icon>
                  </div>
                  <div class="detector-name">重量检测器</div>
                </div>
                <div class="detector-status" :class="weightSystemOnline ? 'status-online' : 'status-offline'">
                  {{ weightSystemOnline ? '运行中' : '离线' }}
                </div>
              </div>
              <div class="detector-metrics">
                <div class="metric-item">
                  <div class="metric-value">{{ currentWeight.toFixed(1) }}g</div>
                  <div class="metric-label">当前重量</div>
                </div>
                <div class="metric-item">
                  <div class="metric-value">{{ weightTodayTotal }}</div>
                  <div class="metric-label">今日检测</div>
                </div>
                <div class="metric-item">
                  <div class="metric-value">{{ (weightSuccessRate * 100).toFixed(1) }}%</div>
                  <div class="metric-label">成功率</div>
                </div>
              </div>
            </div>

            <!-- 糖度检测器卡片 -->
            <div class="detector-card brix-detector" @click="setActiveView('brix-overview')">
              <div class="detector-header">
                <div class="detector-title">
                  <div class="detector-icon">
                    <el-icon><Cherry /></el-icon>
                  </div>
                  <div class="detector-name">糖度检测器</div>
                </div>
                <div class="detector-status" :class="brixSystemOnline ? 'status-online' : 'status-offline'">
                  {{ brixSystemOnline ? '运行中' : '离线' }}
                </div>
              </div>
              <div class="detector-metrics">
                <div class="metric-item">
                  <div class="metric-value">{{ currentBrix.toFixed(1) }}°Bx</div>
                  <div class="metric-label">当前糖度</div>
                </div>
                <div class="metric-item">
                  <div class="metric-value">{{ brixTodayTotal }}</div>
                  <div class="metric-label">今日检测</div>
                </div>
                <div class="metric-item">
                  <div class="metric-value">{{ (brixSuccessRate * 100).toFixed(1) }}%</div>
                  <div class="metric-label">正常率</div>
                </div>
              </div>
            </div>
          </div>

          <!-- 实时数据区域 -->
          <div class="realtime-section">
            <div class="section-header">
              <div class="section-title">实时检测数据</div>
              <el-button @click="refreshRealtimeData" :loading="realtimeLoading">
                <el-icon><Refresh /></el-icon>
                实时刷新
              </el-button>
            </div>

            <div class="data-tabs">
              <div
                class="data-tab"
                :class="{ active: activeDataTab === 'all' }"
                @click="activeDataTab = 'all'"
              >
                全部检测器
              </div>
              <div
                class="data-tab"
                :class="{ active: activeDataTab === 'weight' }"
                @click="activeDataTab = 'weight'"
              >
                重量检测
              </div>
              <div
                class="data-tab"
                :class="{ active: activeDataTab === 'brix' }"
                @click="activeDataTab = 'brix'"
              >
                糖度检测
              </div>
            </div>

            <el-table
              :data="filteredRealtimeData"
              class="realtime-table"
              stripe
            >
              <el-table-column prop="timestamp" label="时间" width="120">
                <template #default="{ row }">
                  {{ formatTime(row.timestamp) }}
                </template>
              </el-table-column>
              <el-table-column prop="detector" label="检测器" width="120">
                <template #default="{ row }">
                  <div class="detector-cell">
                    <el-icon :style="{ color: row.color }">
                      <component :is="row.icon" />
                    </el-icon>
                    <span>{{ row.detector }}</span>
                  </div>
                </template>
              </el-table-column>
              <el-table-column prop="value" label="检测值" width="120" />
              <el-table-column prop="result" label="判定结果" width="120" />
              <el-table-column prop="action" label="处理动作" width="140" />
              <el-table-column prop="status" label="状态" width="100">
                <template #default="{ row }">
                  <el-tag :type="getStatusType(row.status)">
                    {{ row.status }}
                  </el-tag>
                </template>
              </el-table-column>
            </el-table>
          </div>
        </div>

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
import {
  TrendCharts,
  DataAnalysis,
  Crop,
  Cherry,
  Setting,
  Document,
  Tickets,
  Tools,
  Bell,
  //Expand,
  //Fold,
  ArrowRight,
  Refresh,
  User,
  InfoFilled,
  SwitchButton
} from '@element-plus/icons-vue'
import { useWeightStore } from '@/stores/weight'
import { useBrixStore } from '@/stores/brix'
import { formatTime } from '@/utils/format'

const router = useRouter()
const route = useRoute()
const weightStore = useWeightStore()
const brixStore = useBrixStore()

// 响应式数据
const sidebarCollapsed = ref(false)
const activeView = ref('overview')
const activeDataTab = ref('all')
const refreshing = ref(false)
const realtimeLoading = ref(false)
const weightMenuExpanded = ref(true)
const brixMenuExpanded = ref(true)

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
  {
    id: 2,
    timestamp: new Date(Date.now() - 1000).toISOString(),
    detector: '糖度检测',
    icon: 'Cherry',
    color: '#e6a23c',
    value: '12.8°Bx',
    result: '优质果',
    action: '通道3输出',
    status: '成功'
  },
  {
    id: 3,
    timestamp: new Date(Date.now() - 2000).toISOString(),
    detector: '重量检测',
    icon: 'Crop',
    color: '#409eff',
    value: '125.7g',
    result: '重等级',
    action: '通道4输出',
    status: '成功'
  },
  {
    id: 4,
    timestamp: new Date(Date.now() - 3000).toISOString(),
    detector: '糖度检测',
    icon: 'Cherry',
    color: '#e6a23c',
    value: '8.5°Bx',
    result: '中等果',
    action: '通道2输出',
    status: '成功'
  },
  {
    id: 5,
    timestamp: new Date(Date.now() - 4000).toISOString(),
    detector: '糖度检测',
    icon: 'Cherry',
    color: '#e6a23c',
    value: '15.2°Bx',
    result: '优质果',
    action: '通道3输出',
    status: '警告'
  }
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

const filteredRealtimeData = computed(() => {
  if (activeDataTab.value === 'all') return realtimeData.value
  if (activeDataTab.value === 'weight') {
    return realtimeData.value.filter(item => item.detector === '重量检测')
  }
  if (activeDataTab.value === 'brix') {
    return realtimeData.value.filter(item => item.detector === '糖度检测')
  }
  return realtimeData.value
})

// 方法
const toggleSidebar = () => {
  sidebarCollapsed.value = !sidebarCollapsed.value
}

const toggleWeightMenu = () => {
  if (!sidebarCollapsed.value) {
    weightMenuExpanded.value = !weightMenuExpanded.value
  }
}

const toggleBrixMenu = () => {
  if (!sidebarCollapsed.value) {
    brixMenuExpanded.value = !brixMenuExpanded.value
  }
}

const setActiveView = (view: string) => {
  activeView.value = view

  // 根据视图导航到对应路由
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
    // 模拟实时数据更新
    await new Promise(resolve => setTimeout(resolve, 1000))
    updateRandomData()
  } finally {
    realtimeLoading.value = false
  }
}

const updateRandomData = () => {
  // 更新随机数据
  currentWeight.value = Math.random() * 100 + 20
  currentBrix.value = Math.random() * 15 + 5

  // 添加新的实时数据记录
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

const getStatusType = (status: string) => {
  switch (status) {
    case '成功': return 'success'
    case '警告': return 'warning'
    case '失败': return 'danger'
    default: return 'info'
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
  // 定期更新数据
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

// 监听路由离开
window.addEventListener('beforeunload', cleanup)
</script>

<style scoped>
.app-container {
  display: flex;
  height: 100vh;
  background: #f0f2f5;
}

/* 侧边栏 */
.sidebar {
  width: 260px;
  background: #2c3e50;
  color: #ecf0f1;
  display: flex;
  flex-direction: column;
  box-shadow: 2px 0 8px rgba(0,0,0,0.1);
  transition: width 0.3s ease;
  position: relative;
}

.sidebar.collapsed {
  width: 64px;
}

.logo-section {
  padding: 25px 20px;
  text-align: center;
  border-bottom: 1px solid #34495e;
}

.logo {
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 10px;
}

.logo-icon {
  font-size: 32px;
  color: #3498db;
  margin-right: 12px;
}

.sidebar.collapsed .logo-icon {
  margin-right: 0;
}

.logo-text {
  font-size: 22px;
  font-weight: 700;
}

.version {
  font-size: 12px;
  color: #95a5a6;
}

.menu-container {
  flex: 1;
  padding: 20px 0;
  overflow-y: auto;
}

.menu-group {
  margin-bottom: 25px;
}

.menu-title {
  padding: 0 20px 10px;
  font-size: 12px;
  color: #95a5a6;
  text-transform: uppercase;
  letter-spacing: 1px;
  font-weight: 600;
}

.menu-title.expandable {
  display: flex;
  align-items: center;
  justify-content: space-between;
  cursor: pointer;
  padding: 8px 20px;
  margin-bottom: 0;
  border-radius: 6px;
  transition: all 0.3s ease;
}

.menu-title.expandable:hover {
  background: rgba(255, 255, 255, 0.1);
  color: #ecf0f1;
}

.expand-icon {
  font-size: 14px;
  transition: transform 0.3s ease;
}

.expand-icon.expanded {
  transform: rotate(90deg);
}

.menu-items {
  overflow: hidden;
  transition: all 0.4s ease;
  max-height: 1000px;
  opacity: 1;
}

.menu-items.collapsed {
  max-height: 0;
  opacity: 0;
  margin-bottom: 0;
}

.menu-item {
  display: flex;
  align-items: center;
  padding: 12px 20px;
  color: #bdc3c7;
  cursor: pointer;
  transition: all 0.3s ease;
  position: relative;
}

.menu-item:hover {
  background: #34495e;
  color: #ecf0f1;
}

.menu-item.active {
  background: #3498db;
  color: white;
}

.menu-item.active::after {
  content: '';
  position: absolute;
  right: 0;
  top: 0;
  bottom: 0;
  width: 4px;
  background: #2980b9;
}

.menu-item .el-icon {
  width: 20px;
  margin-right: 12px;
  font-size: 16px;
}

.sidebar.collapsed .menu-item {
  padding: 12px 22px;
  justify-content: center;
}

.sidebar.collapsed .menu-item .el-icon {
  margin-right: 0;
}

.detector-badge {
  margin-left: auto;
  font-size: 10px;
  padding: 2px 8px;
  border-radius: 10px;
  background: rgba(46, 204, 113, 0.2);
  color: #2ecc71;
}

.sidebar-toggle {
  position: absolute;
  bottom: 20px;
  left: 50%;
  transform: translateX(-50%);
  width: 32px;
  height: 32px;
  background: #34495e;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.3s ease;
}

.sidebar-toggle:hover {
  background: #3498db;
}

/* 主内容区 */
.main-container {
  flex: 1;
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

.header {
  height: 60px;
  background: white;
  box-shadow: 0 2px 8px rgba(0,0,0,0.08);
  display: flex;
  align-items: center;
  padding: 0 20px;
  justify-content: space-between;
}

.breadcrumb {
  display: flex;
  align-items: center;
  color: #606266;
  font-size: 14px;
  gap: 8px;
}

.breadcrumb-separator {
  color: #c0c4cc;
  font-size: 12px;
}

.breadcrumb .current {
  color: #409eff;
  font-weight: 600;
}

.header-actions {
  display: flex;
  align-items: center;
  gap: 15px;
}

.status-indicator {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 12px;
  color: #67c23a;
}

.status-dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: #f56c6c;
  transition: all 0.3s ease;
}

.status-dot.online {
  background: #67c23a;
  animation: pulse 2s infinite;
}

@keyframes pulse {
  0%, 100% { opacity: 1; }
  50% { opacity: 0.6; }
}

.main-content {
  flex: 1;
  padding: 20px;
  overflow-y: auto;
}

/* 概览页面 */
.overview-content {
  height: 100%;
  display: flex;
  flex-direction: column;
}

.detectors-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(320px, 1fr));
  gap: 20px;
  margin-bottom: 30px;
}

.detector-card {
  background: white;
  border-radius: 12px;
  padding: 24px;
  box-shadow: 0 4px 12px rgba(0,0,0,0.08);
  transition: all 0.3s ease;
  position: relative;
  overflow: hidden;
  cursor: pointer;
}

.detector-card::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  width: 4px;
  height: 100%;
  background: var(--detector-color, #409eff);
}

.detector-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 8px 24px rgba(0,0,0,0.12);
}

.weight-detector {
  --detector-color: #409eff;
}

.brix-detector {
  --detector-color: #e6a23c;
}

.detector-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 20px;
}

.detector-title {
  display: flex;
  align-items: center;
  gap: 12px;
}

.detector-icon {
  width: 48px;
  height: 48px;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 24px;
  color: white;
  background: var(--detector-color, #409eff);
}

.detector-name {
  font-size: 18px;
  font-weight: 600;
  color: #303133;
}

.detector-status {
  padding: 4px 12px;
  border-radius: 20px;
  font-size: 12px;
  font-weight: 500;
}

.status-online {
  background: #f0f9ff;
  color: #67c23a;
}

.status-offline {
  background: #fef0f0;
  color: #f56c6c;
}

.detector-metrics {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 16px;
}

.metric-item {
  text-align: center;
}

.metric-value {
  font-size: 24px;
  font-weight: 700;
  color: var(--detector-color, #409eff);
  margin-bottom: 4px;
}

.metric-label {
  font-size: 12px;
  color: #909399;
  text-transform: uppercase;
}

/* 实时数据区域 */
.realtime-section {
  flex: 1;
  background: white;
  border-radius: 12px;
  padding: 24px;
  box-shadow: 0 4px 12px rgba(0,0,0,0.08);
  display: flex;
  flex-direction: column;
}

.section-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 24px;
  padding-bottom: 16px;
  border-bottom: 1px solid #f0f0f0;
}

.section-title {
  font-size: 18px;
  font-weight: 600;
  color: #303133;
}

.data-tabs {
  display: flex;
  border-bottom: 2px solid #f0f0f0;
  margin-bottom: 20px;
}

.data-tab {
  padding: 12px 24px;
  cursor: pointer;
  transition: all 0.3s ease;
  border-bottom: 2px solid transparent;
  color: #909399;
  font-weight: 500;
}

.data-tab.active {
  color: #409eff;
  border-bottom-color: #409eff;
}

.data-tab:hover:not(.active) {
  color: #606266;
}

.realtime-table {
  flex: 1;
}

.detector-cell {
  display: flex;
  align-items: center;
  gap: 8px;
}

/* 侧边栏折叠时的特殊处理 */
.sidebar.collapsed .menu-items {
  max-height: 1000px;
  opacity: 1;
}

.sidebar.collapsed .menu-title.expandable {
  display: none;
}
@media (max-width: 1024px) {
  .sidebar:not(.collapsed) {
    width: 200px;
  }

  .detectors-grid {
    grid-template-columns: 1fr;
  }

  .detector-metrics {
    grid-template-columns: repeat(2, 1fr);
  }
}

@media (max-width: 768px) {
  .sidebar {
    width: 64px;
  }

  .sidebar .menu-title,
  .sidebar .logo-text,
  .sidebar .version,
  .sidebar .detector-badge {
    display: none;
  }

  .sidebar .menu-item {
    padding: 12px 22px;
    justify-content: center;
  }

  .sidebar .menu-item .el-icon {
    margin-right: 0;
  }

  .header {
    padding: 0 15px;
  }

  .main-content {
    padding: 15px;
  }

  .detector-metrics {
    grid-template-columns: 1fr;
    gap: 12px;
  }

  .data-tabs {
    flex-wrap: wrap;
    gap: 8px;
  }

  .data-tab {
    padding: 8px 16px;
    font-size: 14px;
  }
}

@media (max-width: 480px) {
  .breadcrumb {
    font-size: 12px;
  }

  .breadcrumb span:not(.current) {
    display: none;
  }

  .breadcrumb-separator {
    display: none;
  }

  .header-actions {
    gap: 10px;
  }

  .status-indicator span {
    display: none;
  }

  .detector-card {
    padding: 16px;
  }

  .detector-name {
    font-size: 16px;
  }

  .metric-value {
    font-size: 20px;
  }
}

/* 表格样式优化 */
:deep(.el-table) {
  border-radius: 8px;
  overflow: hidden;
}

:deep(.el-table__header) {
  background: #f8f9fa;
}

:deep(.el-table__row:hover) {
  background: #f0f9ff;
}

:deep(.el-table td) {
  border-bottom: 1px solid #f5f7fa;
}

:deep(.el-dropdown-menu) {
  border-radius: 8px;
  box-shadow: 0 4px 12px rgba(0,0,0,0.12);
}

/* 按钮样式优化 */
:deep(.el-button.is-circle) {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  border: 1px solid #dcdfe6;
  background: white;
  transition: all 0.3s ease;
}

:deep(.el-button.is-circle:hover) {
  background: #409eff;
  border-color: #409eff;
  color: white;
}

/* 标签样式优化 */
:deep(.el-tag) {
  border-radius: 6px;
  font-weight: 500;
}

/* 滚动条样式 */
.menu-container::-webkit-scrollbar,
.main-content::-webkit-scrollbar {
  width: 6px;
}

.menu-container::-webkit-scrollbar-track,
.main-content::-webkit-scrollbar-track {
  background: transparent;
}

.menu-container::-webkit-scrollbar-thumb {
  background: #34495e;
  border-radius: 3px;
}

.main-content::-webkit-scrollbar-thumb {
  background: #ddd;
  border-radius: 3px;
}

.menu-container::-webkit-scrollbar-thumb:hover,
.main-content::-webkit-scrollbar-thumb:hover {
  background: #999;
}
</style>