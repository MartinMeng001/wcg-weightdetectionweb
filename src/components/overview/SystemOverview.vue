<!-- SystemOverview.vue - 系统概览组件 -->
<template>
  <div class="overview-content">
    <!-- 检测器卡片网格 -->
    <div class="detectors-grid">
      <!-- 重量检测器卡片 -->
      <DetectorCard
        type="weight"
        title="重量检测器"
        icon="Crop"
        :online="weightData.online"
        :current-value="`${weightData.currentWeight.toFixed(1)}g`"
        current-label="当前重量"
        :today-total="weightData.todayTotal"
        :success-rate="weightData.successRate"
        @click="$emit('set-active-view', 'weight-overview')"
      />

      <!-- 糖度检测器卡片 -->
      <DetectorCard
        type="brix"
        title="糖度检测器"
        icon="Cherry"
        :online="brixData.online"
        :current-value="`${brixData.currentBrix.toFixed(1)}°Bx`"
        current-label="当前糖度"
        :today-total="brixData.todayTotal"
        :success-rate="brixData.successRate"
        @click="$emit('set-active-view', 'brix-overview')"
      />
    </div>

    <!-- 实时数据区域 -->
    <RealtimeDataSection
      :data="realtimeData"
      :loading="realtimeLoading"
      @refresh="$emit('refresh-realtime')"
    />
  </div>
</template>

<script setup lang="ts">
import DetectorCard from './DetectorCard.vue'
import RealtimeDataSection from './RealtimeDataSection.vue'

// Props
interface WeightData {
  online: boolean
  currentWeight: number
  todayTotal: number
  successRate: number
}

interface BrixData {
  online: boolean
  currentBrix: number
  todayTotal: number
  successRate: number
}

interface RealtimeRecord {
  id: number
  timestamp: string
  detector: string
  icon: string
  color: string
  value: string
  result: string
  action: string
  status: string
}

interface Props {
  weightData: WeightData
  brixData: BrixData
  realtimeData: RealtimeRecord[]
  realtimeLoading: boolean
}

defineProps<Props>()

// Emits
defineEmits<{
  'set-active-view': [view: string]
  'refresh-realtime': []
}>()
</script>

<style scoped>
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

/* 响应式设计 */
@media (max-width: 1024px) {
  .detectors-grid {
    grid-template-columns: 1fr;
  }
}
</style>