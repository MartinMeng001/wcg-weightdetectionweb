<!-- src/components/common/StatusDot.vue - 状态指示器组件 -->
<template>
  <div class="status-container">
    <div
      class="status-dot"
      :class="[`status-${type}`, { pulse: animated }]"
    ></div>
    <span v-if="text" class="status-text">{{ text }}</span>
  </div>
</template>

<script setup lang="ts">
interface Props {
  type: 'success' | 'warning' | 'danger' | 'info'
  text?: string
  animated?: boolean
}

defineProps<Props>()
</script>

<style scoped>
.status-container {
  display: inline-flex;
  align-items: center;
  gap: 6px;
}

.status-dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  transition: all 0.3s ease;
}

.status-success {
  background: #67c23a;
}

.status-warning {
  background: #e6a23c;
}

.status-danger {
  background: #f56c6c;
}

.status-info {
  background: #909399;
}

.pulse {
  animation: pulse 2s infinite;
}

@keyframes pulse {
  0%, 100% {
    opacity: 1;
    transform: scale(1);
  }
  50% {
    opacity: 0.7;
    transform: scale(1.1);
  }
}

.status-text {
  font-size: 12px;
  color: #606266;
}
</style>