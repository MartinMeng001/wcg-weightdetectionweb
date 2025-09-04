<!-- src/components/layout/notification/NotificationItem.vue - 通知项组件 -->
<template>
  <div
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
      <el-button size="small" @click="$emit('markRead', notification.id)">
        标记已读
      </el-button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { formatTime } from '@/utils/format'

interface Props {
  notification: {
    id: number
    level: string
    message: string
    timestamp: string
    read: boolean
  }
}

defineProps<Props>()
defineEmits(['markRead'])

const getNotificationType = (level: string) => {
  const typeMap: Record<string, string> = {
    'info': 'info',
    'warning': 'warning',
    'error': 'danger',
    'success': 'success'
  }
  return typeMap[level] || 'info'
}
</script>

<style scoped>
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
</style>