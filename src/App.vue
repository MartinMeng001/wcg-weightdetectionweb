<template>
  <div id="app">
    <el-container class="app-container">
      <!-- 侧边导航栏 -->
      <el-aside width="220px" class="sidebar">
        <div class="logo-section">
          <div class="logo">
            <el-icon class="logo-icon"><Crop /></el-icon>
            <span class="logo-text">玉米分拣系统</span>
          </div>
          <div class="version">v1.0.0</div>
        </div>

        <el-menu
          :default-active="$route.path"
          class="sidebar-menu"
          router
          unique-opened
          background-color="#2c3e50"
          text-color="#ecf0f1"
          active-text-color="#3498db"
        >
          <el-menu-item index="/weight/overview" class="menu-item">
            <el-icon><Monitor /></el-icon>
            <span>实时监控</span>
          </el-menu-item>

          <el-menu-item index="/weight/configuration" class="menu-item">
            <el-icon><Setting /></el-icon>
            <span>配置管理</span>
          </el-menu-item>

          <el-menu-item index="/weight/records" class="menu-item">
            <el-icon><Document /></el-icon>
            <span>检测记录</span>
          </el-menu-item>

          <el-divider class="menu-divider" />

          <div class="menu-group-title">系统管理</div>

          <el-menu-item index="/system/health" class="menu-item" disabled>
            <el-icon><Tools /></el-icon>
            <span>系统状态</span>
            <el-tag size="small" class="coming-soon">开发中</el-tag>
          </el-menu-item>

          <el-menu-item index="/system/logs" class="menu-item" disabled>
            <el-icon><List /></el-icon>
            <span>系统日志</span>
            <el-tag size="small" class="coming-soon">开发中</el-tag>
          </el-menu-item>
        </el-menu>

        <!-- 系统状态指示器 -->
        <div class="system-status">
          <div class="status-item">
            <div class="status-dot" :class="{ active: systemOnline }"></div>
            <span class="status-text">{{ systemOnline ? '系统在线' : '系统离线' }}</span>
          </div>
          <div class="status-time">
            {{ currentTime }}
          </div>
        </div>
      </el-aside>

      <!-- 主内容区域 -->
      <el-container class="main-container">
        <!-- 顶部工具栏 -->
        <el-header height="60px" class="header">
          <div class="header-left">
            <el-breadcrumb separator="/">
              <el-breadcrumb-item v-for="item in breadcrumbItems" :key="item.path">
                {{ item.name }}
              </el-breadcrumb-item>
            </el-breadcrumb>
          </div>

          <div class="header-right">
            <el-space>
              <!-- 实时状态指示 -->
              <el-badge :value="activeConnections" class="connection-badge">
                <el-button :icon="Connection" circle size="small" />
              </el-badge>

              <!-- 通知中心 -->
              <el-badge :value="notificationCount" :hidden="notificationCount === 0">
                <el-button
                  :icon="Bell"
                  circle
                  size="small"
                  @click="showNotifications"
                />
              </el-badge>

              <!-- 全屏切换 -->
              <el-button
                :icon="isFullscreen ? OfficeBuilding : FullScreen"
                circle
                size="small"
                @click="toggleFullscreen"
              />

              <!-- 设置 -->
              <el-dropdown trigger="click">
                <el-button :icon="Setting" circle size="small" />
                <template #dropdown>
                  <el-dropdown-menu>
                    <el-dropdown-item @click="openSettings">
                      <el-icon><Setting /></el-icon>
                      系统设置
                    </el-dropdown-item>
                    <el-dropdown-item @click="showAbout">
                      <el-icon><InfoFilled /></el-icon>
                      关于系统
                    </el-dropdown-item>
                    <el-dropdown-item divided @click="refreshApp">
                      <el-icon><Refresh /></el-icon>
                      刷新应用
                    </el-dropdown-item>
                  </el-dropdown-menu>
                </template>
              </el-dropdown>
            </el-space>
          </div>
        </el-header>

        <!-- 主要内容区 -->
        <el-main class="main-content">
          <router-view v-slot="{ Component }">
            <transition name="fade-slide" mode="out-in">
              <component :is="Component" />
            </transition>
          </router-view>
        </el-main>
      </el-container>
    </el-container>

    <!-- 通知抽屉 -->
    <el-drawer
      v-model="notificationDrawerVisible"
      title="系统通知"
      direction="rtl"
      size="400px"
    >
      <div class="notification-list">
        <el-empty v-if="notifications.length === 0" description="暂无通知" />
        <div v-else>
          <div
            v-for="notification in notifications"
            :key="notification.id"
            class="notification-item"
            :class="{ unread: !notification.read }"
          >
            <div class="notification-header">
              <el-tag :type="getNotificationType(notification.level)" size="small">
                {{ notification.level }}
              </el-tag>
              <span class="notification-time">{{ formatTime(notification.timestamp) }}</span>
            </div>
            <div class="notification-content">{{ notification.message }}</div>
            <div class="notification-actions" v-if="!notification.read">
              <el-button size="small" @click="markAsRead(notification.id)">
                标记已读
              </el-button>
            </div>
          </div>
        </div>
      </div>
    </el-drawer>

    <!-- 关于对话框 -->
    <el-dialog v-model="aboutDialogVisible" title="关于系统" width="500px">
      <div class="about-content">
        <div class="about-logo">
          <el-icon class="about-icon"><Crop /></el-icon>
          <h3>重量检测系统</h3>
        </div>
        <el-descriptions :column="1" border>
          <el-descriptions-item label="版本">v1.0.0</el-descriptions-item>
          <el-descriptions-item label="构建时间">{{ buildTime }}</el-descriptions-item>
          <el-descriptions-item label="技术栈">Vue 3 + TypeScript + Element Plus</el-descriptions-item>
          <el-descriptions-item label="开发者">Weight Detection Team</el-descriptions-item>
          <el-descriptions-item label="许可证">MIT License</el-descriptions-item>
        </el-descriptions>
        <div class="about-footer">
          <p>专业的工业级重量检测解决方案</p>
        </div>
      </div>
      <template #footer>
        <el-button @click="aboutDialogVisible = false">关闭</el-button>
        <el-button type="primary" @click="checkUpdate">检查更新</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { useRoute } from 'vue-router'
import { ElMessage } from 'element-plus'
import {
  Crop,
  Monitor,
  Setting,
  Document,
  Tools,
  List,
  Connection,
  Bell,
  FullScreen,
  OfficeBuilding,
  InfoFilled,
  Refresh
} from '@element-plus/icons-vue'
import { formatTime } from '@/utils/format'

const route = useRoute()

// 响应式数据
const systemOnline = ref(true)
const currentTime = ref('')
const activeConnections = ref(3)
const notificationCount = ref(2)
const isFullscreen = ref(false)
const notificationDrawerVisible = ref(false)
const aboutDialogVisible = ref(false)
const buildTime = ref('2024-01-15 10:00:00')

// 通知数据
const notifications = ref([
  {
    id: 1,
    level: 'info',
    message: '系统已启动，所有检测器正常运行',
    timestamp: new Date().toISOString(),
    read: false
  },
  {
    id: 2,
    level: 'warning',
    message: '检测通道2处理速度较慢，请检查设备状态',
    timestamp: new Date(Date.now() - 300000).toISOString(),
    read: false
  }
])

// 计算属性
const breadcrumbItems = computed(() => {
  const routeMap: Record<string, string> = {
    '/weight/overview': '实时监控',
    '/weight/configuration': '配置管理',
    '/weight/records': '检测记录'
  }

  const items = [{ name: '重量检测', path: '/weight' }]

  if (routeMap[route.path]) {
    items.push({ name: routeMap[route.path], path: route.path })
  }

  return items
})

// 定时器
let timeTimer: NodeJS.Timeout | null = null
let statusTimer: NodeJS.Timeout | null = null

// 方法
const updateCurrentTime = () => {
  currentTime.value = new Date().toLocaleString('zh-CN')
}

const updateSystemStatus = () => {
  // 模拟系统状态变化
  systemOnline.value = Math.random() > 0.1 // 90%在线率
  activeConnections.value = Math.floor(Math.random() * 10) + 1
}

const getNotificationType = (level: string) => {
  const typeMap: Record<string, string> = {
    'info': 'info',
    'warning': 'warning',
    'error': 'danger',
    'success': 'success'
  }
  return typeMap[level] || 'info'
}

const showNotifications = () => {
  notificationDrawerVisible.value = true
}

const markAsRead = (notificationId: number) => {
  const notification = notifications.value.find(n => n.id === notificationId)
  if (notification) {
    notification.read = true
    notificationCount.value = notifications.value.filter(n => !n.read).length
  }
}

const toggleFullscreen = () => {
  if (!document.fullscreenElement) {
    document.documentElement.requestFullscreen()
    isFullscreen.value = true
  } else {
    document.exitFullscreen()
    isFullscreen.value = false
  }
}

const openSettings = () => {
  ElMessage.info('系统设置功能开发中...')
}

const showAbout = () => {
  aboutDialogVisible.value = true
}

const refreshApp = () => {
  ElMessage.success('应用已刷新')
  window.location.reload()
}

const checkUpdate = () => {
  ElMessage.info('当前已是最新版本')
}

// 生命周期
onMounted(() => {
  updateCurrentTime()
  updateSystemStatus()

  // 启动定时器
  timeTimer = setInterval(updateCurrentTime, 1000)
  statusTimer = setInterval(updateSystemStatus, 30000) // 30秒更新一次状态

  // 监听全屏状态变化
  document.addEventListener('fullscreenchange', () => {
    isFullscreen.value = !!document.fullscreenElement
  })
})

onUnmounted(() => {
  if (timeTimer) clearInterval(timeTimer)
  if (statusTimer) clearInterval(statusTimer)
})
</script>

<style scoped>
#app {
  height: 100vh;
  font-family: 'Microsoft YaHei', Arial, sans-serif;
}

.app-container {
  height: 100vh;
}

/* 侧边栏样式 */
.sidebar {
  background: #2c3e50;
  color: #ecf0f1;
  display: flex;
  flex-direction: column;
}

.logo-section {
  padding: 20px;
  text-align: center;
  border-bottom: 1px solid #34495e;
}

.logo {
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 8px;
}

.logo-icon {
  font-size: 32px;
  color: #3498db;
  margin-right: 10px;
}

.logo-text {
  font-size: 20px;
  font-weight: 700;
  color: #ecf0f1;
}

.version {
  font-size: 12px;
  color: #95a5a6;
}

.sidebar-menu {
  flex: 1;
  border: none;
}

.menu-item {
  margin: 4px 12px;
  border-radius: 6px;
  transition: all 0.3s ease;
}

.menu-item:hover {
  background: #34495e !important;
}

.menu-divider {
  border-color: #34495e;
  margin: 20px 0;
}

.menu-group-title {
  padding: 10px 20px;
  font-size: 12px;
  color: #95a5a6;
  font-weight: 600;
  text-transform: uppercase;
}

.coming-soon {
  margin-left: 10px;
  background: #e67e22;
  border: none;
  color: white;
}

.system-status {
  padding: 20px;
  border-top: 1px solid #34495e;
  margin-top: auto;
}

.status-item {
  display: flex;
  align-items: center;
  margin-bottom: 10px;
}

.status-dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: #e74c3c;
  margin-right: 8px;
  transition: all 0.3s ease;
}

.status-dot.active {
  background: #27ae60;
  box-shadow: 0 0 10px rgba(39, 174, 96, 0.5);
}

.status-text {
  font-size: 12px;
  color: #bdc3c7;
}

.status-time {
  font-size: 11px;
  color: #95a5a6;
  text-align: center;
}

/* 主容器样式 */
.main-container {
  background: #f8f9fa;
}

/* 头部样式 */
.header {
  background: white;
  box-shadow: 0 1px 4px rgba(0,0,0,0.08);
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 20px;
  position: relative;
  z-index: 100;
}

.header-left {
  flex: 1;
}

.header-right {
  display: flex;
  align-items: center;
}

.connection-badge {
  margin-right: 10px;
}

/* 主内容区样式 */
.main-content {
  padding: 0;
  overflow-y: auto;
}

/* 过渡动画 */
.fade-slide-enter-active,
.fade-slide-leave-active {
  transition: all 0.3s ease;
}

.fade-slide-enter-from {
  opacity: 0;
  transform: translateX(20px);
}

.fade-slide-leave-to {
  opacity: 0;
  transform: translateX(-20px);
}

/* 通知相关样式 */
.notification-list {
  padding: 20px;
}

.notification-item {
  padding: 15px;
  margin-bottom: 15px;
  background: #f8f9fa;
  border-radius: 8px;
  border-left: 4px solid #e9ecef;
  transition: all 0.3s ease;
}

.notification-item.unread {
  background: #e3f2fd;
  border-left-color: #2196f3;
}

.notification-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 8px;
}

.notification-time {
  font-size: 12px;
  color: #6c757d;
}

.notification-content {
  font-size: 14px;
  color: #495057;
  line-height: 1.5;
  margin-bottom: 10px;
}

.notification-actions {
  text-align: right;
}

/* 关于对话框样式 */
.about-content {
  text-align: center;
}

.about-logo {
  margin-bottom: 20px;
}

.about-icon {
  font-size: 48px;
  color: #3498db;
  margin-bottom: 10px;
}

.about-footer {
  margin-top: 20px;
  padding-top: 20px;
  border-top: 1px solid #eee;
}

.about-footer p {
  color: #666;
  font-style: italic;
  margin: 0;
}

/* 面包屑导航样式 */
:deep(.el-breadcrumb) {
  font-size: 14px;
}

:deep(.el-breadcrumb__item:last-child .el-breadcrumb__inner) {
  color: #409eff;
  font-weight: 600;
}

/* 菜单样式覆盖 */
:deep(.el-menu-item.is-active) {
  background: #3498db !important;
  color: white !important;
}

:deep(.el-menu-item [class*="el-icon"]) {
  margin-right: 8px;
}

/* 抽屉样式覆盖 */
:deep(.el-drawer__header) {
  padding: 20px;
  margin-bottom: 0;
  border-bottom: 1px solid #eee;
}

:deep(.el-drawer__body) {
  padding: 0;
}

/* 响应式设计 */
@media (max-width: 768px) {
  .sidebar {
    width: 180px !important;
  }

  .logo-text {
    font-size: 16px;
  }

  .header {
    padding: 0 10px;
  }

  .header-left {
    display: none;
  }

  .main-content {
    padding: 0;
  }
}

@media (max-width: 480px) {
  .sidebar {
    width: 60px !important;
  }

  .logo-section {
    padding: 10px;
  }

  .logo-text {
    display: none;
  }

  .menu-group-title {
    display: none;
  }

  :deep(.el-menu-item span) {
    display: none;
  }

  .system-status {
    display: none;
  }
}

/* 滚动条样式 */
.main-content::-webkit-scrollbar {
  width: 6px;
}

.main-content::-webkit-scrollbar-track {
  background: #f1f1f1;
}

.main-content::-webkit-scrollbar-thumb {
  background: #c1c1c1;
  border-radius: 3px;
}

.main-content::-webkit-scrollbar-thumb:hover {
  background: #a8a8a8;
}

/* 暗色主题支持（预留） */
@media (prefers-color-scheme: dark) {
  .main-container {
    background: #1a1a1a;
  }

  .header {
    background: #2d2d2d;
    color: #ffffff;
  }
}
</style>