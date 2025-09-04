<!-- src/views/brix/Overview.vue -->
<template>
  <div class="overview-container">
    <!-- 页面头部 -->
    <el-card class="header-card" shadow="never">
      <div class="header-content">
        <el-icon class="header-icon"><Cherry /></el-icon>
        <span>糖度检测实时监控</span>
        <el-tag
          :type="systemStatusType"
          class="status-tag"
          style="margin-left: auto;"
        >
          {{ systemStatusText }}
        </el-tag>
      </div>
    </el-card>

    <!-- 实时数据卡片 -->
    <el-row :gutter="20" class="metrics-row">
      <el-col :xs="24" :sm="12" :md="6">
        <el-card class="metric-card" shadow="hover">
          <div class="metric-content">
            <div class="metric-icon brix-icon">
              <el-icon><Crop /></el-icon>
            </div>
            <div class="metric-info">
              <div class="metric-value">{{ formatBrix(currentBrix) }}</div>
              <div class="metric-label">当前糖度</div>
            </div>
          </div>
        </el-card>
      </el-col>

      <el-col :xs="24" :sm="12" :md="6">
        <el-card class="metric-card" shadow="hover">
          <div class="metric-content">
            <div class="metric-icon temperature-icon">
              <el-icon><Sunny /></el-icon>
            </div>
            <div class="metric-info">
              <div class="metric-value">{{ formatTemperature(currentTemperature) }}</div>
              <div class="metric-label">环境温度</div>
            </div>
          </div>
        </el-card>
      </el-col>

      <el-col :xs="24" :sm="12" :md="6">
        <el-card class="metric-card" shadow="hover">
          <div class="metric-content">
            <div class="metric-icon count-icon">
              <el-icon><DataLine /></el-icon>
            </div>
            <div class="metric-info">
              <div class="metric-value">{{ todayTotal }}</div>
              <div class="metric-label">今日检测</div>
            </div>
          </div>
        </el-card>
      </el-col>

      <el-col :xs="24" :sm="12" :md="6">
        <el-card class="metric-card" shadow="hover">
          <div class="metric-content">
            <div class="metric-icon rate-icon">
              <el-icon><Odometer /></el-icon>
            </div>
            <div class="metric-info">
              <div class="metric-value">{{ detectionRate.toFixed(1) }}</div>
              <div class="metric-label">检测速率(/分钟)</div>
            </div>
          </div>
        </el-card>
      </el-col>
    </el-row>

    <!-- 通道状态 -->
    <el-card class="channels-card" shadow="never">
      <template #header>
        <div class="card-header">
          <span>通道状态监控</span>
          <el-button
            :loading="realtimeLoading"
            @click="refreshRealtime"
            type="primary"
            size="small"
          >
            <el-icon><Refresh /></el-icon>
            刷新
          </el-button>
        </div>
      </template>

      <el-row :gutter="16">
        <el-col
          v-for="(channel, id) in channels"
          :key="id"
          :xs="24" :sm="12" :md="8" :lg="6"
        >
          <div class="channel-card" :class="{
            'channel-active': channel.status === 'measuring' || channel.status === 'stable',
            'channel-idle': channel.status === 'no_sample'
          }">
            <div class="channel-header">
              <span class="channel-title">通道 {{ id }}</span>
              <el-tag
                :type="getChannelStatusType(channel.status)"
                size="small"
              >
                {{ getChannelStatusText(channel.status) }}
              </el-tag>
            </div>
            <div class="channel-content">
              <div class="channel-brix">
                {{ channel.current_brix ? formatBrix(channel.current_brix) : '--' }}
              </div>
              <div class="channel-temp">
                温度: {{ formatTemperature(channel.temperature) }}
              </div>
              <div class="channel-time" v-if="channel.last_detection">
                {{ formatTime(channel.last_detection) }}
              </div>
            </div>
          </div>
        </el-col>
      </el-row>
    </el-card>

    <!-- 糖度趋势图表 -->
    <el-card class="chart-card" shadow="never">
      <template #header>
        <div class="card-header">
          <span>糖度趋势</span>
          <el-button-group>
            <el-button
              :type="chartTimeRange === '1h' ? 'primary' : ''"
              size="small"
              @click="changeTimeRange('1h')"
            >
              1小时
            </el-button>
            <el-button
              :type="chartTimeRange === '6h' ? 'primary' : ''"
              size="small"
              @click="changeTimeRange('6h')"
            >
              6小时
            </el-button>
            <el-button
              :type="chartTimeRange === '24h' ? 'primary' : ''"
              size="small"
              @click="changeTimeRange('24h')"
            >
              24小时
            </el-button>
          </el-button-group>
        </div>
      </template>

      <div class="chart-container">
        <VChart
          :option="trendChartOption"
          :loading="chartLoading"
          style="height: 300px;"
        />
      </div>
    </el-card>

    <!-- 分级分布图表 -->
    <el-row :gutter="20">
      <el-col :xs="24" :md="12">
        <el-card class="chart-card" shadow="never">
          <template #header>
            <span>糖度分级分布</span>
          </template>
          <VChart
            :option="distributionChartOption"
            style="height: 300px;"
          />
        </el-card>
      </el-col>

      <el-col :xs="24" :md="12">
        <el-card class="records-card" shadow="never">
          <template #header>
            <div class="card-header">
              <span>最新检测记录</span>
              <el-button
                size="small"
                @click="$router.push('/brix/records')"
              >
                查看全部
              </el-button>
            </div>
          </template>

          <el-table
            :data="latestRecords"
            size="small"
            max-height="280"
          >
            <el-table-column prop="timestamp" label="时间" width="120">
              <template #default="{ row }">
                {{ formatTime(row.timestamp) }}
              </template>
            </el-table-column>
            <el-table-column prop="brix_value" label="糖度" width="80">
              <template #default="{ row }">
                <span class="brix-value">{{ formatBrix(row.brix_value) }}</span>
              </template>
            </el-table-column>
            <el-table-column prop="determined_grade" label="分级" width="60">
              <template #default="{ row }">
                <el-tag
                  :color="getGradeColor(row.determined_grade)"
                  size="small"
                >
                  {{ row.determined_grade }}
                </el-tag>
              </template>
            </el-table-column>
            <el-table-column prop="detection_success" label="状态" width="80">
              <template #default="{ row }">
                <el-tag
                  :type="row.detection_success ? 'success' : 'danger'"
                  size="small"
                >
                  {{ row.detection_success ? '成功' : '失败' }}
                </el-tag>
              </template>
            </el-table-column>
          </el-table>
        </el-card>
      </el-col>
    </el-row>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted, onUnmounted, computed } from 'vue'
import { ElMessage } from 'element-plus'
import { Cherry, Crop, Sunny, DataLine, Odometer, Refresh } from '@element-plus/icons-vue'
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
import { useBrixStore } from '@/stores/brix'
import { formatBrix, formatTemperature } from '@/utils/brixValidator'
import { formatTime } from '@/utils/format'

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

const brixStore = useBrixStore()

// 响应式数据
const loading = ref(false)
const realtimeLoading = ref(false)
const chartLoading = ref(false)
const chartTimeRange = ref('1h')
const currentBrix = ref(0)
const currentTemperature = ref(22.0)
const todayTotal = ref(0)
const detectionRate = ref(0)
const isRunning = ref(false)
const channels = ref<Record<string, any>>({})

// 实时数据更新定时器
let realtimeTimer: NodeJS.Timeout | null = null

// 趋势图数据
const trendData = reactive({
  timestamps: [] as string[],
  brixValues: [] as number[]
})

// 分布数据
const distributionData = ref([
  { name: '低糖度', value: 0, color: '#FF6B6B' },
  { name: '中糖度', value: 0, color: '#4ECDC4' },
  { name: '高糖度', value: 0, color: '#45B7D1' },
  { name: '特优', value: 0, color: '#96CEB4' }
])

// 系统状态计算属性
const systemStatusType = computed(() => {
  return isRunning.value ? 'success' : 'danger'
})

const systemStatusText = computed(() => {
  return isRunning.value ? '运行中' : '离线'
})

// 最新记录
const latestRecords = computed(() => brixStore.latestRecords)

// 趋势图表配置
const trendChartOption = computed(() => ({
  title: {
    show: false
  },
  tooltip: {
    trigger: 'axis',
    formatter: (params: any) => {
      const data = params[0]
      return `时间: ${data.name}<br/>糖度: ${formatBrix(data.value)}`
    }
  },
  xAxis: {
    type: 'category',
    data: trendData.timestamps,
    axisLabel: {
      formatter: (value: string) => {
        const date = new Date(value)
        return `${date.getHours().toString().padStart(2, '0')}:${date.getMinutes().toString().padStart(2, '0')}`
      }
    }
  },
  yAxis: {
    type: 'value',
    name: '糖度(°Bx)',
    axisLabel: {
      formatter: (value: number) => `${value}°Bx`
    }
  },
  series: [{
    name: '糖度',
    type: 'line',
    data: trendData.brixValues,
    smooth: true,
    lineStyle: {
      color: '#409EFF',
      width: 2
    },
    areaStyle: {
      color: {
        type: 'linear',
        x: 0,
        y: 0,
        x2: 0,
        y2: 1,
        colorStops: [
          { offset: 0, color: 'rgba(64, 158, 255, 0.3)' },
          { offset: 1, color: 'rgba(64, 158, 255, 0.05)' }
        ]
      }
    }
  }]
}))

// 分布图表配置
const distributionChartOption = computed(() => ({
  tooltip: {
    trigger: 'item',
    formatter: '{b}: {c} ({d}%)'
  },
  legend: {
    bottom: '0%',
    left: 'center'
  },
  series: [{
    type: 'pie',
    radius: ['40%', '70%'],
    center: ['50%', '45%'],
    data: distributionData.value.map(item => ({
      name: item.name,
      value: item.value,
      itemStyle: { color: item.color }
    })),
    emphasis: {
      itemStyle: {
        shadowBlur: 10,
        shadowOffsetX: 0,
        shadowColor: 'rgba(0, 0, 0, 0.5)'
      }
    }
  }]
}))

// 工具方法
const getChannelStatusType = (status: string) => {
  switch (status) {
    case 'measuring': return 'warning'
    case 'stable': return 'success'
    case 'no_sample': return 'info'
    default: return 'danger'
  }
}

const getChannelStatusText = (status: string) => {
  switch (status) {
    case 'measuring': return '检测中'
    case 'stable': return '稳定'
    case 'no_sample': return '无样品'
    default: return '异常'
  }
}

const getGradeColor = (grade: number) => {
  const colors = ['#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4', '#FECA57']
  return colors[grade - 1] || '#909399'
}

// 刷新实时数据
const refreshRealtime = async () => {
  try {
    await brixStore.fetchRealtime()
    const realtimeData = brixStore.realtimeData

    if (realtimeData) {
      channels.value = realtimeData.channels
      currentBrix.value = realtimeData.system_status.average_brix || 0
      detectionRate.value = realtimeData.system_status.detection_rate || 0
      isRunning.value = realtimeData.system_status.active_channels > 0
    }
  } catch (error) {
    console.error('刷新实时数据失败:', error)
  }
}

// 改变时间范围
const changeTimeRange = (range: string) => {
  chartTimeRange.value = range
  loadTrendData()
}

// 加载趋势数据
const loadTrendData = () => {
  chartLoading.value = true

  // 模拟趋势数据
  const now = new Date()
  const timePoints = 60 // 60个时间点
  const interval = chartTimeRange.value === '1h' ? 1 :
    chartTimeRange.value === '6h' ? 6 : 24 // 分钟间隔

  trendData.timestamps = []
  trendData.brixValues = []

  for (let i = timePoints - 1; i >= 0; i--) {
    const time = new Date(now.getTime() - i * interval * 60000)
    trendData.timestamps.push(time.toISOString())
    trendData.brixValues.push(Math.random() * 15 + 5) // 5-20°Bx随机值
  }

  setTimeout(() => {
    chartLoading.value = false
  }, 500)
}

// 开始自动刷新
const startAutoRefresh = () => {
  realtimeTimer = setInterval(() => {
    refreshRealtime()
  }, 5000) // 每5秒刷新一次
}

// 停止自动刷新
const stopAutoRefresh = () => {
  if (realtimeTimer) {
    clearInterval(realtimeTimer)
    realtimeTimer = null
  }
}

// 初始化数据
const initData = async () => {
  loading.value = true
  try {
    await Promise.all([
      brixStore.fetchRealtime(),
      brixStore.fetchRecords({ limit: 10 }),
      brixStore.fetchStatistics()
    ])

    // 更新统计数据
    const statistics = brixStore.statistics
    todayTotal.value = statistics.reduce((sum, stat) => sum + stat.total_count, 0)

    // 更新分布数据
    if (statistics.length > 0) {
      distributionData.value = [
        { name: '低糖度', value: statistics[0]?.total_count || 0, color: '#FF6B6B' },
        { name: '中糖度', value: statistics[1]?.total_count || 0, color: '#4ECDC4' },
        { name: '高糖度', value: statistics[2]?.total_count || 0, color: '#45B7D1' },
        { name: '特优', value: statistics[3]?.total_count || 0, color: '#96CEB4' }
      ]
    }

    await refreshRealtime()
    loadTrendData()
  } catch (error) {
    ElMessage.error('加载数据失败')
    console.error('Init data error:', error)
  } finally {
    loading.value = false
  }
}

// 组件生命周期
onMounted(() => {
  initData()
  startAutoRefresh()
})

onUnmounted(() => {
  stopAutoRefresh()
})
</script>

<style scoped>
.overview-container {
  padding: 20px;
  background: #f0f2f5;
  min-height: 100vh;
}

.header-card {
  margin-bottom: 20px;
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
  color: #e6a23c;
}

.status-tag {
  margin-left: auto;
}

.metrics-row {
  margin-bottom: 20px;
}

.metric-card {
  height: 100px;
}

.metric-content {
  display: flex;
  align-items: center;
  height: 100%;
}

.metric-icon {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 50px;
  height: 50px;
  border-radius: 50%;
  margin-right: 15px;
  font-size: 24px;
  color: white;
}

.brix-icon {
  background: linear-gradient(135deg, #e6a23c, #f7ba2a);
}

.temperature-icon {
  background: linear-gradient(135deg, #f56c6c, #ff8a80);
}

.count-icon {
  background: linear-gradient(135deg, #409eff, #66b3ff);
}

.rate-icon {
  background: linear-gradient(135deg, #67c23a, #85ce61);
}

.metric-info {
  flex: 1;
}

.metric-value {
  font-size: 24px;
  font-weight: 700;
  color: #303133;
  line-height: 1;
  margin-bottom: 5px;
}

.metric-label {
  font-size: 13px;
  color: #909399;
}

.channels-card {
  margin-bottom: 20px;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.channel-card {
  background: white;
  border-radius: 8px;
  padding: 16px;
  border: 2px solid #ebeef5;
  transition: all 0.3s ease;
  margin-bottom: 16px;
}

.channel-card.channel-active {
  border-color: #67c23a;
  box-shadow: 0 2px 8px rgba(103, 194, 58, 0.2);
}

.channel-card.channel-idle {
  border-color: #e4e7ed;
  opacity: 0.7;
}

.channel-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 10px;
}

.channel-title {
  font-weight: 600;
  color: #303133;
}

.channel-content {
  text-align: center;
}

.channel-brix {
  font-size: 20px;
  font-weight: 700;
  color: #e6a23c;
  margin-bottom: 5px;
}

.channel-temp {
  font-size: 12px;
  color: #909399;
  margin-bottom: 3px;
}

.channel-time {
  font-size: 11px;
  color: #c0c4cc;
}

.chart-card,
.records-card {
  margin-bottom: 20px;
}

.chart-container {
  height: 300px;
}

.brix-value {
  font-family: 'Courier New', monospace;
  font-weight: 600;
  color: #e6a23c;
}

:deep(.el-card__header) {
  background: #fafafa;
  border-bottom: 1px solid #f0f0f0;
}

:deep(.el-table--small .el-table__cell) {
  padding: 8px 0;
}
</style>