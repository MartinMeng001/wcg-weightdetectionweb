<template>
  <div class="overview-container">
    <el-page-header @back="$router.push('/')">
      <template #content>
        <div class="header-content">
          <el-icon class="header-icon"><Crop /></el-icon>
          <span>重量检测系统 - 实时监控</span>
        </div>
      </template>
      <template #extra>
        <el-tag :type="systemStatusType" size="large">
          {{ systemStatusText }}
        </el-tag>
      </template>
    </el-page-header>

    <!-- 实时数据卡片 -->
    <el-row :gutter="20" class="status-cards">
      <el-col :span="6">
        <el-card class="status-card">
          <div class="card-content">
            <div class="card-icon success">
              <el-icon><Odometer /></el-icon>
            </div>
            <div class="card-info">
              <div class="card-value">{{ formatWeight(currentWeight) }}</div>
              <div class="card-label">当前重量</div>
            </div>
          </div>
        </el-card>
      </el-col>

      <el-col :span="6">
        <el-card class="status-card">
          <div class="card-content">
            <div class="card-icon primary">
              <el-icon><Collection /></el-icon>
            </div>
            <div class="card-info">
              <div class="card-value">{{ currentGrade }}</div>
              <div class="card-label">当前分级</div>
            </div>
          </div>
        </el-card>
      </el-col>

      <el-col :span="6">
        <el-card class="status-card">
          <div class="card-content">
            <div class="card-icon warning">
              <el-icon><DataLine /></el-icon>
            </div>
            <div class="card-info">
              <div class="card-value">{{ todayTotal }}</div>
              <div class="card-label">今日检测</div>
            </div>
          </div>
        </el-card>
      </el-col>

      <el-col :span="6">
        <el-card class="status-card">
          <div class="card-content">
            <div class="card-icon danger">
              <div class="status-dot" :class="{ active: isRunning }"></div>
            </div>
            <div class="card-info">
              <div class="card-value">{{ detectionSpeed }}/分钟</div>
              <div class="card-label">检测速度</div>
            </div>
          </div>
        </el-card>
      </el-col>
    </el-row>

    <!-- 图表和详细信息 -->
    <el-row :gutter="20" class="chart-section">
      <el-col :span="16">
        <el-card class="chart-card">
          <template #header>
            <div class="card-header">
              <span>实时重量趋势</span>
              <el-button @click="refreshData" :loading="loading" size="small">
                刷新数据
              </el-button>
            </div>
          </template>
          <div class="chart-container">
            <v-chart
              ref="trendChart"
              :option="trendChartOption"
              :loading="chartLoading"
              style="height: 350px;"
            />
          </div>
        </el-card>
      </el-col>

      <el-col :span="8">
        <el-card class="info-card">
          <template #header>
            <span>分级分布</span>
          </template>
          <div class="distribution-chart">
            <v-chart
              :option="distributionChartOption"
              style="height: 300px;"
            />
          </div>
        </el-card>
      </el-col>
    </el-row>

    <!-- 最新记录 -->
    <el-row>
      <el-col :span="24">
        <el-card class="records-card">
          <template #header>
            <div class="card-header">
              <span>最新检测记录</span>
              <el-button @click="$router.push('/weight/records')" type="primary" size="small">
                查看全部
              </el-button>
            </div>
          </template>
          <el-table :data="latestRecords" stripe style="width: 100%">
            <el-table-column prop="timestamp" label="检测时间" width="180">
              <template #default="{ row }">
                {{ formatTime(row.timestamp) }}
              </template>
            </el-table-column>
            <el-table-column prop="weight" label="重量" width="120">
              <template #default="{ row }">
                <el-tag type="info">{{ formatWeight(row.weight) }}</el-tag>
              </template>
            </el-table-column>
            <el-table-column prop="determined_grade" label="判定分级" width="100">
              <template #default="{ row }">
                <el-tag :type="getGradeTagType(row.determined_grade)">
                  级别 {{ row.determined_grade }}
                </el-tag>
              </template>
            </el-table-column>
            <el-table-column prop="kick_channel" label="踢出通道" width="100" />
            <el-table-column prop="detection_success" label="检测状态" width="100">
              <template #default="{ row }">
                <el-tag :type="row.detection_success ? 'success' : 'danger'">
                  {{ row.detection_success ? '成功' : '失败' }}
                </el-tag>
              </template>
            </el-table-column>
            <el-table-column prop="id" label="记录ID" />
          </el-table>
        </el-card>
      </el-col>
    </el-row>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted, onUnmounted, computed } from 'vue'
import { ElMessage } from 'element-plus'
import { Crop, Odometer, Collection, DataLine } from '@element-plus/icons-vue'
import VChart from 'vue-echarts'
import { use } from 'echarts/core'
import { LineChart, PieChart } from 'echarts/charts'
import {
  GridComponent,
  TooltipComponent,
  LegendComponent,
  TitleComponent
} from 'echarts/components'
import { CanvasRenderer } from 'echarts/renderers'
import { useWeightStore } from '@/stores/weight'
import { formatWeight, formatTime } from '@/utils/format'

// 注册 ECharts 组件
use([
  LineChart,
  PieChart,
  GridComponent,
  TooltipComponent,
  LegendComponent,
  TitleComponent,
  CanvasRenderer
])

const weightStore = useWeightStore()

// 响应式数据
const loading = ref(false)
const chartLoading = ref(false)
const currentWeight = ref(0)
const currentGrade = ref(0)
const todayTotal = ref(0)
const detectionSpeed = ref(0)
const isRunning = ref(false)
const latestRecords = ref([])

// 实时数据更新定时器
let realtimeTimer: NodeJS.Timeout | null = null

// 趋势图数据
const trendData = reactive({
  timestamps: [] as string[],
  weights: [] as number[]
})

// 分布数据
const distributionData = ref([
  { name: '轻量级', value: 0 },
  { name: '中量级', value: 0 },
  { name: '重量级', value: 0 }
])

// 系统状态计算属性
const systemStatusType = computed(() => {
  return isRunning.value ? 'success' : 'danger'
})

const systemStatusText = computed(() => {
  return isRunning.value ? '运行中' : '已停止'
})

// 趋势图配置
const trendChartOption = computed(() => ({
  title: {
    text: '重量检测趋势',
    left: 'center',
    textStyle: {
      fontSize: 16
    }
  },
  tooltip: {
    trigger: 'axis',
    formatter: (params: any) => {
      const point = params[0]
      return `时间: ${point.name}<br/>重量: ${formatWeight(point.value)}`
    }
  },
  grid: {
    left: 50,
    right: 30,
    top: 50,
    bottom: 50
  },
  xAxis: {
    type: 'category',
    data: trendData.timestamps,
    axisLabel: {
      formatter: (value: string) => {
        return new Date(value).toLocaleTimeString()
      }
    }
  },
  yAxis: {
    type: 'value',
    name: '重量(g)',
    axisLabel: {
      formatter: '{value}g'
    }
  },
  series: [{
    name: '重量',
    type: 'line',
    smooth: true,
    data: trendData.weights,
    lineStyle: {
      color: '#409EFF'
    },
    areaStyle: {
      color: {
        type: 'linear',
        x: 0,
        y: 0,
        x2: 0,
        y2: 1,
        colorStops: [{
          offset: 0,
          color: 'rgba(64, 158, 255, 0.3)'
        }, {
          offset: 1,
          color: 'rgba(64, 158, 255, 0.1)'
        }]
      }
    }
  }]
}))

// 分布图配置
const distributionChartOption = computed(() => ({
  title: {
    text: '分级分布',
    left: 'center',
    textStyle: {
      fontSize: 14
    }
  },
  tooltip: {
    trigger: 'item',
    formatter: '{a} <br/>{b}: {c} ({d}%)'
  },
  legend: {
    orient: 'vertical',
    left: 'left',
    bottom: 20
  },
  series: [{
    name: '分级分布',
    type: 'pie',
    radius: ['40%', '70%'],
    center: ['50%', '60%'],
    avoidLabelOverlap: false,
    label: {
      show: false,
      position: 'center'
    },
    emphasis: {
      label: {
        show: true,
        fontSize: '18',
        fontWeight: 'bold'
      }
    },
    labelLine: {
      show: false
    },
    data: distributionData.value,
    color: ['#5cb87a', '#409eff', '#e6a23c']
  }]
}))

// 获取分级标签类型
const getGradeTagType = (grade: number) => {
  const types = ['', 'success', 'primary', 'warning', 'danger']
  return types[grade] || 'info'
}

// 刷新数据
const refreshData = async () => {
  loading.value = true
  try {
    await Promise.all([
      fetchRealtimeData(),
      fetchLatestRecords()
    ])
    ElMessage.success('数据刷新成功')
  } catch (error) {
    ElMessage.error('数据刷新失败')
    console.error('Refresh data error:', error)
  } finally {
    loading.value = false
  }
}

// 获取实时数据
const fetchRealtimeData = async () => {
  try {
    const response = await weightStore.fetchRealtime()
    if (response.success) {
      const data = response.data

      // 更新实时状态
      isRunning.value = data.service_status?.status === 'active'
      todayTotal.value = data.today_summary?.total_count || 0

      // 更新最新重量
      if (data.latest_records && data.latest_records.length > 0) {
        const latest = data.latest_records[0]
        currentWeight.value = latest.weight
        currentGrade.value = latest.grade
      }

      // 更新趋势图数据
      if (data.latest_records) {
        const records = data.latest_records.slice(0, 20).reverse()
        trendData.timestamps = records.map((r: any) => r.timestamp)
        trendData.weights = records.map((r: any) => r.weight)
      }

      // 更新分布数据
      if (data.today_summary?.by_grade) {
        const byGrade = data.today_summary.by_grade
        distributionData.value = [
          { name: '轻量级', value: byGrade['2']?.count || 0 },
          { name: '中量级', value: byGrade['3']?.count || 0 },
          { name: '重量级', value: byGrade['4']?.count || 0 }
        ]
      }

      // --- 新增的逻辑：计算最近60秒内的检测速度 ---
      let count = 0
      const now = Date.now()

      // 遍历最新记录，计算最近60秒内的数量
      for (const record of data.latest_records.value) {
        // 将记录的时间戳字符串转换为毫秒
        const recordTime = new Date(record.timestamp).getTime()
        // 检查记录是否在最近60秒内
        if (now - recordTime <= 60000) {
          count++
        } else {
          // 如果记录已经超出60秒，因为记录是按时间倒序排列的，后续的记录也会超出，可以提前结束循环
          break
        }
      }

      detectionSpeed.value = count
    }
  } catch (error) {
    console.error('Fetch realtime data error:', error)
  }
}

// 获取最新记录
const fetchLatestRecords = async () => {
  try {
    const response = await weightStore.fetchRecords(10)
    if (response.success) {
      latestRecords.value = response.data.records || []
    }
  } catch (error) {
    console.error('Fetch latest records error:', error)
  }
}

// 启动实时更新
const startRealtimeUpdate = () => {
  realtimeTimer = setInterval(() => {
    fetchRealtimeData()
  }, 2000) // 每2秒更新一次
}

// 停止实时更新
const stopRealtimeUpdate = () => {
  if (realtimeTimer) {
    clearInterval(realtimeTimer)
    realtimeTimer = null
  }
}

// 组件挂载
onMounted(() => {
  refreshData()
  startRealtimeUpdate()
})

// 组件卸载
onUnmounted(() => {
  stopRealtimeUpdate()
})
</script>

<style scoped>
.overview-container {
  padding: 20px;
  background: #f0f2f5;
  min-height: 100vh;
}

.header-content {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 18px;
  font-weight: 600;
}

.header-icon {
  font-size: 24px;
  color: #409eff;
}

.status-cards {
  margin: 20px 0;
}

.status-card {
  height: 120px;
}

.card-content {
  display: flex;
  align-items: center;
  height: 100%;
}

.card-icon {
  width: 60px;
  height: 60px;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-right: 16px;
  font-size: 24px;
  color: white;
}

.card-icon.success {
  background: linear-gradient(135deg, #67c23a, #85ce61);
}

.card-icon.primary {
  background: linear-gradient(135deg, #409eff, #66b1ff);
}

.card-icon.warning {
  background: linear-gradient(135deg, #e6a23c, #ebb563);
}

.card-icon.danger {
  background: linear-gradient(135deg, #f56c6c, #f78989);
}

.card-info {
  flex: 1;
}

.card-value {
  font-size: 28px;
  font-weight: 700;
  color: #303133;
  line-height: 1;
  margin-bottom: 4px;
}

.card-label {
  font-size: 14px;
  color: #909399;
}

.status-dot {
  width: 24px;
  height: 24px;
  border-radius: 50%;
  background: #dcdfe6;
  position: relative;
}

.status-dot.active {
  background: #67c23a;
  animation: pulse 2s infinite;
}

@keyframes pulse {
  0% {
    transform: scale(0.95);
    box-shadow: 0 0 0 0 rgba(103, 194, 58, 0.7);
  }

  70% {
    transform: scale(1);
    box-shadow: 0 0 0 10px rgba(103, 194, 58, 0);
  }

  100% {
    transform: scale(0.95);
    box-shadow: 0 0 0 0 rgba(103, 194, 58, 0);
  }
}

.chart-section {
  margin: 20px 0;
}

.chart-card,
.info-card,
.records-card {
  margin-bottom: 20px;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.chart-container {
  padding: 10px;
}

.distribution-chart {
  padding: 10px;
}

:deep(.el-card__header) {
  background: #fafafa;
  border-bottom: 1px solid #f0f0f0;
}

:deep(.el-table) {
  font-size: 13px;
}

:deep(.el-tag) {
  font-weight: 500;
}
</style>