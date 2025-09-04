<!-- DetectorCard.vue - 检测器卡片组件 -->
<template>
  <div
    class="detector-card"
    :class="`${type}-detector`"
    @click="$emit('click')"
  >
    <!-- 卡片头部 -->
    <div class="detector-header">
      <div class="detector-title">
        <div class="detector-icon">
          <el-icon>
            <component :is="icon" />
          </el-icon>
        </div>
        <div class="detector-name">{{ title }}</div>
      </div>
      <div class="detector-status" :class="online ? 'status-online' : 'status-offline'">
        {{ online ? '运行中' : '离线' }}
      </div>
    </div>

    <!-- 指标数据 -->
    <div class="detector-metrics">
      <div class="metric-item">
        <div class="metric-value">{{ currentValue }}</div>
        <div class="metric-label">{{ currentLabel }}</div>
      </div>
      <div class="metric-item">
        <div class="metric-value">{{ todayTotal }}</div>
        <div class="metric-label">今日检测</div>
      </div>
      <div class="metric-item">
        <div class="metric-value">{{ (successRate * 100).toFixed(1) }}%</div>
        <div class="metric-label">{{ type === 'weight' ? '成功率' : '正常率' }}</div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
// Props
interface Props {
  type: 'weight' | 'brix'
  title: string
  icon: string
  online: boolean
  currentValue: string
  currentLabel: string
  todayTotal: number
  successRate: number
}

defineProps<Props>()

// Emits
defineEmits<{
  click: []
}>()
</script>

<style scoped>
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

/* 响应式设计 */
@media (max-width: 1024px) {
  .detector-metrics {
    grid-template-columns: repeat(2, 1fr);
  }
}

@media (max-width: 480px) {
  .detector-card {
    padding: 16px;
  }

  .detector-name {
    font-size: 16px;
  }

  .metric-value {
    font-size: 20px;
  }

  .detector-metrics {
    grid-template-columns: 1fr;
    gap: 12px;
  }
}
</style>