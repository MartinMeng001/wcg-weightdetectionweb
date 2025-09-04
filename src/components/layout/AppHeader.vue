<!-- AppHeader.vue - 应用头部组件 -->
<template>
  <div class="header">
    <!-- 面包屑导航 -->
    <div class="breadcrumb">
      <span>检测系统</span>
      <el-icon class="breadcrumb-separator"><ArrowRight /></el-icon>
      <span class="current">{{ currentPageTitle }}</span>
    </div>

    <!-- 头部操作区 -->
    <div class="header-actions">
      <!-- 系统状态指示器 -->
      <div class="status-indicator">
        <div class="status-dot" :class="{ online: systemRunning }"></div>
        <span>{{ systemRunning ? '系统运行中' : '系统离线' }}</span>
      </div>

      <!-- 刷新按钮 -->
      <el-button
        circle
        @click="$emit('refresh-data')"
        :loading="refreshing"
      >
        <el-icon><Refresh /></el-icon>
      </el-button>

      <!-- 用户菜单 -->
      <el-dropdown @command="handleCommand">
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
</template>

<script setup lang="ts">
import {
  ArrowRight,
  Refresh,
  User,
  Setting,
  InfoFilled,
  SwitchButton
} from '@element-plus/icons-vue'

// Props
interface Props {
  currentPageTitle: string
  systemRunning: boolean
  refreshing: boolean
}

defineProps<Props>()

// Emits
const emit = defineEmits<{
  'refresh-data': []
  'user-command': [command: string]
}>()

// 方法
const handleCommand = (command: string) => {
  emit('user-command', command)
}
</script>

<style scoped>
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
  gap: 20px; /* 增加间距，防止重叠 */
}

.status-indicator {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 12px;
  white-space: nowrap;
  color: #f56c6c; /* 默认离线状态 - 红色 */
  margin-right: 72px; /* 增加右边距，与后续控件保持距离 */
  /* 移除固定的 min-width，让内容自然撑开 */
}

.status-indicator.system-online {
  color: #67c23a; /* 在线状态 - 绿色 */
}

.status-dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: currentColor;
  flex-shrink: 0; /* 确保圆点不被压缩 */
}

.status-text-full,
.status-text-short {
  flex-shrink: 0; /* 防止文字被压缩 */
  overflow: hidden;
  text-overflow: ellipsis;
  background: transparent;
}

.status-text-short {
  display: none;
}

/* 根据系统状态动态设置颜色 */
.status-indicator {
  color: #f56c6c; /* 默认离线状态颜色 */
}

.status-indicator.system-online {
  color: #67c23a; /* 在线状态文字颜色 */
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

/* 响应式设计 */
@media (max-width: 640px) {
  .header {
    padding: 0 10px;
  }

  .header-actions {
    gap: 12px; /* 中等屏幕减少间距但保持足够空间 */
  }

  .status-indicator {
    margin-right: 8px;
  }

  .status-text-full {
    display: none;
  }

  .status-text-short {
    display: block;
  }
}

@media (max-width: 480px) {
  .breadcrumb {
    font-size: 12px;
    flex: 1;
    min-width: 0;
  }

  .breadcrumb span:not(.current) {
    display: none;
  }

  .breadcrumb-separator {
    display: none;
  }

  .header-actions {
    gap: 8px; /* 小屏幕进一步减少间距 */
    flex-shrink: 0;
  }

  .status-indicator {
    margin-right: 4px;
  }

  .status-text-full,
  .status-text-short {
    display: none;
  }
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

:deep(.el-dropdown-menu) {
  border-radius: 8px;
  box-shadow: 0 4px 12px rgba(0,0,0,0.12);
}
</style>