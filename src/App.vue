<!-- App.vue - 更新后包含糖度检测器 -->
<template>
  <div id="app">
    <el-container class="app-container">
      <!-- 顶部导航栏 -->
      <el-header class="app-header">
        <div class="header-left">
          <el-icon class="logo-icon"><Crop /></el-icon>
          <h1 class="app-title">玉米分拣系统</h1>
        </div>

        <div class="header-center">
          <!-- 检测器切换 -->
          <el-segmented
            v-model="activeDetector"
            :options="detectorOptions"
            @change="onDetectorChange"
          />
        </div>

        <div class="header-right">
          <el-badge :value="unreadNotifications" :hidden="!unreadNotifications">
            <el-button
              circle
              @click="notificationDrawerVisible = true"
              :type="unreadNotifications > 0 ? 'warning' : 'info'"
            >
              <el-icon><Bell /></el-icon>
            </el-button>
          </el-badge>

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
      </el-header>

      <el-container>
        <!-- 侧边栏导航 -->
        <el-aside class="app-aside" :width="asideCollapsed ? '64px' : '220px'">
          <div class="aside-header">
            <el-button
              @click="toggleAside"
              circle
              size="small"
              class="collapse-btn"
            >
              <el-icon>
                <component :is="asideCollapsed ? 'Expand' : 'Fold'" />
              </el-icon>
            </el-button>
          </div>

          <el-menu
            :default-active="activeMenu"
            :collapse="asideCollapsed"
            :router="true"
            class="app-menu"
          >
            <!-- 重量检测器菜单 -->
            <el-sub-menu
              index="weight"
              v-if="activeDetector === 'weight'"
            >
              <template #title>
                <el-icon><Crop /></el-icon>
                <span>重量检测</span>
              </template>
              <el-menu-item index="/weight/overview">
                <el-icon><Odometer /></el-icon>
                <span>实时监控</span>
              </el-menu-item>
              <el-menu-item index="/weight/configuration">
                <el-icon><Setting /></el-icon>
                <span>配置管理</span>
              </el-menu-item>
              <el-menu-item index="/weight/records">
                <el-icon><Document /></el-icon>
                <span>检测记录</span>
              </el-menu-item>
            </el-sub-menu>

            <!-- 糖度检测器菜单 -->
            <el-sub-menu
              index="brix"
              v-if="activeDetector === 'brix'"
            >
              <template #title>
                <el-icon><Cherry /></el-icon>
                <span>糖度检测</span>
              </template>
              <el-menu-item index="/brix/overview">
                <el-icon><Odometer /></el-icon>
                <span>实时监控</span>
              </el-menu-item>
              <el-menu-item index="/brix/configuration">
                <el-icon><Setting /></el-icon>
                <span>配置管理</span>
              </el-menu-item>
              <el-menu-item index="/brix/records">
                <el-icon><Document /></el-icon>
                <span>检测记录</span>
              </el-menu-item>
              <el-menu-item index="/brix/calibration">
                <el-icon><Tools /></el-icon>
                <span>传感器校准</span>
              </el-menu-item>
              <el-menu-item index="/brix/alerts">
                <el-icon><Bell /></el-icon>
                <span>报警管理</span>
              </el-menu-item>
            </el-sub-menu>
          </el-menu>
        </el-aside>

        <!-- 主内容区域 -->
        <el-main class="app-main">
          <router-view v-slot="{ Component }">
            <transition name="fade" mode="out-in">
              <component :is="Component" :key="route.fullPath" />
            </transition>
          </router-view>
        </el-main>
      </el-container>

      <!-- 状态栏 -->
      <el-footer class="app-footer" height="40px">
        <div class="footer-content">
          <div class="system-status">
            <span class="status-item">
              <el-icon class="status-icon" :class="{ online: weightSystemOnline }">
                <Crop />
              </el-icon>
              <span>重量检测: {{ weightSystemOnline ? '在线' : '离线' }}</span>
            </span>
            <span class="status-item">
              <el-icon class="status-icon" :class="{ online: brixSystemOnline }">
                <Cherry />
              </el-icon>
              <span>糖度检测: {{ brixSystemOnline ? '在线' : '离线' }}</span>
            </span>
          </div>
          <div class="footer-info">
            <span>© 2024 工业检测系统 v1.0.0</span>
          </div>
        </div>
      </el-footer>
    </el-container>

    <!-- 通知抽屉 -->
    <el-drawer
      v-model="notificationDrawerVisible"
      title="系统通知"
      size="400px"
      direction="rtl"
    >
      <div class="notification-list">
        <div class="notification-header">
          <el-button
            size="small"
            @click="markAllRead"
            :disabled="unreadNotifications === 0"
          >
            全部标记已读
          </el-button>
        </div>

        <div class="notifications-content">
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
            <div class="notification-source">{{ notification.source }}</div>
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
          <h3>工业检测系统</h3>
        </div>
        <el-descriptions :column="1" border>
          <el-descriptions-item label="版本">v1.0.0</el-descriptions-item>
          <el-descriptions-item label="构建时间">{{ buildTime }}</el-descriptions-item>
          <el-descriptions-item label="支持检测器">重量检测、糖度检测</el-descriptions-item>
          <el-descriptions-item label="技术栈">Vue 3 + TypeScript + Element Plus</el-descriptions-item>
          <el-descriptions-item label="开发者">Detection System Team</el-descriptions-item>
          <el-descriptions-item label="许可证">MIT License</el-descriptions-item>
        </el-descriptions>
        <div class="about-footer">
          <p>专业的工业级多功能检测解决方案</p>
        </div>
      </div>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import {
  Crop,
  Cherry,
  Bell,
  User,
  Setting,
  InfoFilled,
  SwitchButton,
  //Expand,
  //Fold,
  Odometer,
  Document,
  Tools
} from '@element-plus/icons-vue'
import { useWeightStore } from '@/stores/weight'
import { useBrixStore } from '@/stores/brix'
import { formatTime } from '@/utils/format'

const route = useRoute()
const router = useRouter()
const weightStore = useWeightStore()
const brixStore = useBrixStore()

// 响应式数据
const activeDetector = ref('weight')
const asideCollapsed = ref(false)
const notificationDrawerVisible = ref(false)
const aboutDialogVisible = ref(false)
const buildTime = ref('2024-01-15 10:30:00')

// 检测器选项
const detectorOptions = [
  { label: '重量检测', value: 'weight', icon: 'Crop' },
  { label: '糖度检测', value: 'brix', icon: 'Cherry' }
]

// 通知数据
const notifications = ref([
  {
    id: 1,
    level: 'warning',
    message: '糖度传感器校准将于7天后到期',
    source: '糖度检测系统',
    timestamp: new Date().toISOString(),
    read: false
  },
  {
    id: 2,
    level: 'info',
    message: '重量检测今日已完成1250次测量',
    source: '重量检测系统',
    timestamp: new Date(Date.now() - 3600000).toISOString(),
    read: false
  },
  {
    id: 3,
    level: 'success',
    message: '系统备份已成功完成',
    source: '系统管理',
    timestamp: new Date(Date.now() - 7200000).toISOString(),
    read: true
  }
])

// 计算属性
const activeMenu = computed(() => route.path)

const unreadNotifications = computed(() =>
  notifications.value.filter(n => !n.read).length
)

const weightSystemOnline = computed(() => weightStore.isSystemOnline)

const brixSystemOnline = computed(() => brixStore.isSystemOnline)

// 方法
const onDetectorChange = (detector: string) => {
  const currentPath = route.path
  if (detector === 'weight' && !currentPath.startsWith('/weight')) {
    router.push('/weight/overview')
  } else if (detector === 'brix' && !currentPath.startsWith('/brix')) {
    router.push('/brix/overview')
  }
}

const toggleAside = () => {
  asideCollapsed.value = !asideCollapsed.value
}

const handleUserCommand = (command: string) => {
  switch (command) {
    case 'settings':
      ElMessage.info('系统设置功能开发中...')
      break
    case 'about':
      aboutDialogVisible.value = true
      break
    case 'logout':
      ElMessage.info('退出登录功能开发中...')
      break
  }
}

const markAsRead = (notificationId: number) => {
  const notification = notifications.value.find(n => n.id === notificationId)
  if (notification) {
    notification.read = true
  }
}

const markAllRead = () => {
  notifications.value.forEach(notification => {
    notification.read = true
  })
}

const getNotificationType = (level: string) => {
  switch (level) {
    case 'success': return 'success'
    case 'warning': return 'warning'
    case 'error': return 'danger'
    case 'info': return 'info'
    default: return 'info'
  }
}

// 监听路由变化，自动切换检测器
watch(route, (newRoute) => {
  if (newRoute.path.startsWith('/weight')) {
    activeDetector.value = 'weight'
  } else if (newRoute.path.startsWith('/brix')) {
    activeDetector.value = 'brix'
  }
}, { immediate: true })

// 组件挂载时初始化
onMounted(() => {
  // 定期检查系统状态
  setInterval(async () => {
    try {
      await Promise.allSettled([
        weightStore.fetchStatus(),
        brixStore.fetchStatus()
      ])
    } catch (error) {
      console.warn('Failed to refresh system status:', error)
    }
  }, 30000) // 每30秒检查一次
})
</script>

<style scoped>
#app {
  height: 100vh;
  overflow: hidden;
}

.app-container {
  height: 100%;
}

.app-header {
  background: white;
  border-bottom: 1px solid #e4e7ed;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 20px;
}

.header-left {
  display: flex;
  align-items: center;
  gap: 12px;
}

.logo-icon {
  font-size: 32px;
  color: #409EFF;
}

.app-title {
  margin: 0;
  font-size: 20px;
  font-weight: 600;
  color: #303133;
}

.header-center {
  flex: 1;
  display: flex;
  justify-content: center;
}

.header-right {
  display: flex;
  align-items: center;
  gap: 12px;
}

.app-aside {
  background: #f8f9fa;
  border-right: 1px solid #e4e7ed;
  transition: width 0.3s ease;
}

.aside-header {
  height: 50px;
  display: flex;
  align-items: center;
  justify-content: flex-end;
  padding: 0 16px;
  border-bottom: 1px solid #e4e7ed;
}

.collapse-btn {
  border: none;
  background: transparent;
}

.app-menu {
  border: none;
  height: calc(100vh - 130px);
}

.app-main {
  background: #f0f2f5;
  padding: 0;
  overflow-y: auto;
}

.app-footer {
  background: white;
  border-top: 1px solid #e4e7ed;
  padding: 0 20px;
}

.footer-content {
  display: flex;
  align-items: center;
  justify-content: space-between;
  height: 100%;
}

.system-status {
  display: flex;
  gap: 20px;
}

.status-item {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 12px;
  color: #606266;
}

.status-icon {
  font-size: 14px;
  color: #f56c6c;
}

.status-icon.online {
  color: #67c23a;
}

.footer-info {
  font-size: 12px;
  color: #909399;
}

.notification-list {
  height: 100%;
  display: flex;
  flex-direction: column;
}

.notification-header {
  padding: 16px;
  border-bottom: 1px solid #ebeef5;
}

.notifications-content {
  flex: 1;
  overflow-y: auto;
}

.notification-item {
  padding: 16px;
  border-bottom: 1px solid #f5f7fa;
}

.notification-item.unread {
  background: #f0f9ff;
}

.notification-item .notification-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0 0 8px 0;
  border: none;
}

.notification-time {
  font-size: 12px;
  color: #909399;
}

.notification-content {
  font-size: 14px;
  color: #303133;
  margin-bottom: 4px;
}

.notification-source {
  font-size: 12px;
  color: #909399;
  margin-bottom: 8px;
}

.notification-actions {
  text-align: right;
}

.about-content {
  text-align: center;
}

.about-logo {
  margin-bottom: 20px;
}

.about-icon {
  font-size: 48px;
  color: #409EFF;
  margin-bottom: 10px;
}

.about-footer {
  margin-top: 20px;
  color: #909399;
  font-size: 14px;
}

.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.3s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}

:deep(.el-segmented) {
  background: #f0f2f5;
}

:deep(.el-menu--collapse) {
  width: 64px;
}

:deep(.el-sub-menu__title) {
  height: 56px;
}

:deep(.el-menu-item) {
  height: 48px;
}

@media (max-width: 768px) {
  .app-header {
    padding: 0 10px;
  }

  .header-center {
    display: none;
  }

  .app-title {
    font-size: 16px;
  }

  .system-status {
    gap: 10px;
  }

  .status-item span {
    display: none;
  }
}
</style>