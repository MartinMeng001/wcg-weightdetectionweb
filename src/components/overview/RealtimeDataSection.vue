<!-- RealtimeDataSection.vue - 实时数据区域组件 -->
<template>
  <div class="realtime-section">
    <!-- 区域头部 -->
    <div class="section-header">
      <div class="section-title">实时检测数据</div>
      <el-button @click="$emit('refresh')" :loading="loading">
        <el-icon><Refresh /></el-icon>
        实时刷新
      </el-button>
    </div>

    <!-- 数据过滤标签 -->
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

    <!-- 实时数据表格 -->
    <el-table
      :data="filteredData"
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
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { Refresh } from '@element-plus/icons-vue'
import { formatTime } from '@/utils/format'

// Props
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
  data: RealtimeRecord[]
  loading: boolean
}

const props = defineProps<Props>()

// Emits
defineEmits<{
  refresh: []
}>()

// 响应式数据
const activeDataTab = ref('all')

// 计算属性
const filteredData = computed(() => {
  if (activeDataTab.value === 'all') return props.data
  if (activeDataTab.value === 'weight') {
    return props.data.filter(item => item.detector === '重量检测')
  }
  if (activeDataTab.value === 'brix') {
    return props.data.filter(item => item.detector === '糖度检测')
  }
  return props.data
})

// 方法
const getStatusType = (status: string) => {
  switch (status) {
    case '成功': return 'success'
    case '警告': return 'warning'
    case '失败': return 'danger'
    default: return 'info'
  }
}
</script>

<style scoped>
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

/* 响应式设计 */
@media (max-width: 768px) {
  .data-tabs {
    flex-wrap: wrap;
    gap: 8px;
  }

  .data-tab {
    padding: 8px 16px;
    font-size: 14px;
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

/* 标签样式优化 */
:deep(.el-tag) {
  border-radius: 6px;
  font-weight: 500;
}
</style>