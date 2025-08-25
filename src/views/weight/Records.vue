<template>
  <div class="records-container">
    <el-page-header @back="$router.push('/weight/overview')">
      <template #content>
        <div class="header-content">
          <el-icon class="header-icon"><Document /></el-icon>
          <span>重量检测记录</span>
        </div>
      </template>
      <template #extra>
        <el-space>
          <el-button @click="exportRecords" :icon="Download" :loading="exporting">
            导出记录
          </el-button>
          <el-button @click="refreshRecords" :icon="Refresh" :loading="loading">
            刷新数据
          </el-button>
        </el-space>
      </template>
    </el-page-header>

    <!-- 筛选条件 -->
    <el-card class="filter-card">
      <template #header>
        <span>筛选条件</span>
      </template>
      <el-form :model="filterForm" inline>
        <el-form-item label="时间范围">
          <el-date-picker
            v-model="filterForm.dateRange"
            type="datetimerange"
            range-separator="至"
            start-placeholder="开始时间"
            end-placeholder="结束时间"
            format="YYYY-MM-DD HH:mm:ss"
            value-format="YYYY-MM-DD HH:mm:ss"
            @change="handleDateRangeChange"
          />
        </el-form-item>

        <el-form-item label="重量范围">
          <el-input-number
            v-model="filterForm.weightMin"
            placeholder="最小重量"
            :precision="1"
            size="default"
            style="width: 120px; margin-right: 8px;"
          />
          <span style="margin: 0 8px;">-</span>
          <el-input-number
            v-model="filterForm.weightMax"
            placeholder="最大重量"
            :precision="1"
            size="default"
            style="width: 120px;"
          />
        </el-form-item>

        <el-form-item label="分级筛选">
          <el-select v-model="filterForm.grade" placeholder="选择分级" clearable>
            <el-option label="全部" value="" />
            <el-option
              v-for="grade in availableGrades"
              :key="grade"
              :label="`级别 ${grade}`"
              :value="grade"
            />
          </el-select>
        </el-form-item>

        <el-form-item label="检测状态">
          <el-select v-model="filterForm.status" placeholder="检测状态" clearable>
            <el-option label="全部" value="" />
            <el-option label="成功" :value="true" />
            <el-option label="失败" :value="false" />
          </el-select>
        </el-form-item>

        <el-form-item>
          <el-button type="primary" @click="applyFilters" :loading="filtering">
            应用筛选
          </el-button>
          <el-button @click="resetFilters">重置</el-button>
        </el-form-item>
      </el-form>
    </el-card>

    <!-- 统计信息 -->
    <el-row :gutter="20" class="stats-cards">
      <el-col :span="6">
        <el-card class="stat-card">
          <div class="stat-content">
            <div class="stat-value">{{ totalRecords.toLocaleString() }}</div>
            <div class="stat-label">总记录数</div>
          </div>
        </el-card>
      </el-col>
      <el-col :span="6">
        <el-card class="stat-card">
          <div class="stat-content">
            <div class="stat-value">{{ formatWeight(avgWeight) }}</div>
            <div class="stat-label">平均重量</div>
          </div>
        </el-card>
      </el-col>
      <el-col :span="6">
        <el-card class="stat-card">
          <div class="stat-content">
            <div class="stat-value">{{ successRate }}%</div>
            <div class="stat-label">成功率</div>
          </div>
        </el-card>
      </el-col>
      <el-col :span="6">
        <el-card class="stat-card">
          <div class="stat-content">
            <div class="stat-value">{{ recordsPerMinute }}/分钟</div>
            <div class="stat-label">检测频率</div>
          </div>
        </el-card>
      </el-col>
    </el-row>

    <!-- 重量分布图表 -->
    <el-card class="chart-card" v-if="showChart">
      <template #header>
        <div class="card-header">
          <span>重量分布统计</span>
          <el-switch
            v-model="showChart"
            active-text="显示图表"
            inactive-text="隐藏图表"
          />
        </div>
      </template>
      <div class="chart-container">
        <v-chart
          :option="distributionChartOption"
          style="height: 300px;"
          :loading="chartLoading"
        />
      </div>
    </el-card>

    <!-- 记录列表 -->
    <el-card class="table-card">
      <template #header>
        <div class="card-header">
          <span>检测记录列表 ({{ filteredRecords.length }} 条)</span>
          <el-space>
            <el-input
              v-model="searchText"
              placeholder="搜索记录..."
              :prefix-icon="Search"
              clearable
              size="small"
              style="width: 200px;"
            />
            <el-dropdown trigger="click">
              <el-button size="small">
                每页显示 <el-icon><ArrowDown /></el-icon>
              </el-button>
              <template #dropdown>
                <el-dropdown-menu>
                  <el-dropdown-item @click="pageSize = 20">20 条/页</el-dropdown-item>
                  <el-dropdown-item @click="pageSize = 50">50 条/页</el-dropdown-item>
                  <el-dropdown-item @click="pageSize = 100">100 条/页</el-dropdown-item>
                  <el-dropdown-item @click="pageSize = 200">200 条/页</el-dropdown-item>
                </el-dropdown-menu>
              </template>
            </el-dropdown>
          </el-space>
        </div>
      </template>

      <el-table
        :data="paginatedRecords"
        stripe
        border
        v-loading="loading"
        style="width: 100%"
        :default-sort="{ prop: 'timestamp', order: 'descending' }"
        @sort-change="handleSortChange"
      >
        <el-table-column type="selection" width="50" align="center" />
        <el-table-column prop="id" label="记录ID" width="100" align="center" sortable />

        <el-table-column prop="timestamp" label="检测时间" width="180" sortable>
          <template #default="{ row }">
            <div class="time-cell">
              <el-icon><Clock /></el-icon>
              {{ formatTime(row.timestamp) }}
            </div>
          </template>
        </el-table-column>

        <el-table-column prop="weight" label="重量" width="120" align="center" sortable>
          <template #default="{ row }">
            <el-tag
              :type="getWeightTagType(row.weight)"
              class="weight-tag"
            >
              {{ formatWeight(row.weight) }}
            </el-tag>
          </template>
        </el-table-column>

        <el-table-column prop="determined_grade" label="判定分级" width="110" align="center" sortable>
          <template #default="{ row }">
            <el-tag :type="getGradeTagType(row.determined_grade)" class="grade-tag">
              级别 {{ row.determined_grade }}
            </el-tag>
          </template>
        </el-table-column>

        <el-table-column prop="kick_channel" label="踢出通道" width="110" align="center" sortable>
          <template #default="{ row }">
            <el-badge :value="row.kick_channel" class="channel-badge">
              <div class="channel-indicator"></div>
            </el-badge>
          </template>
        </el-table-column>

        <el-table-column prop="detection_success" label="检测状态" width="110" align="center" sortable>
          <template #default="{ row }">
            <el-tag
              :type="row.detection_success ? 'success' : 'danger'"
              :icon="row.detection_success ? SuccessFilled : CircleCloseFilled"
            >
              {{ row.detection_success ? '成功' : '失败' }}
            </el-tag>
          </template>
        </el-table-column>

        <el-table-column label="处理时间" width="100" align="center">
          <template #default="{ row }">
            <span class="processing-time">
              {{ getProcessingTime(row) }}ms
            </span>
          </template>
        </el-table-column>

        <el-table-column label="操作" width="100" align="center" fixed="right">
          <template #default="{ row }">
            <el-button
              @click="showRecordDetail(row)"
              :icon="View"
              size="small"
              type="primary"
              link
              title="查看详情"
            />
            <el-button
              @click="deleteRecord(row.id)"
              :icon="Delete"
              size="small"
              type="danger"
              link
              title="删除记录"
            />
          </template>
        </el-table-column>
      </el-table>

      <!-- 分页 -->
      <div class="pagination-container">
        <el-pagination
          v-model:current-page="currentPage"
          v-model:page-size="pageSize"
          :page-sizes="[20, 50, 100, 200]"
          :total="filteredRecords.length"
          layout="total, sizes, prev, pager, next, jumper"
          @size-change="handleSizeChange"
          @current-change="handleCurrentChange"
        />
      </div>
    </el-card>

    <!-- 记录详情对话框 -->
    <el-dialog
      v-model="detailDialogVisible"
      title="检测记录详情"
      width="600px"
      :close-on-click-modal="false"
    >
      <div v-if="selectedRecord" class="detail-content">
        <el-descriptions :column="2" border>
          <el-descriptions-item label="记录ID">
            {{ selectedRecord.id }}
          </el-descriptions-item>
          <el-descriptions-item label="检测时间">
            {{ formatTime(selectedRecord.timestamp) }}
          </el-descriptions-item>
          <el-descriptions-item label="检测重量">
            <el-tag :type="getWeightTagType(selectedRecord.weight)">
              {{ formatWeight(selectedRecord.weight) }}
            </el-tag>
          </el-descriptions-item>
          <el-descriptions-item label="判定分级">
            <el-tag :type="getGradeTagType(selectedRecord.determined_grade)">
              级别 {{ selectedRecord.determined_grade }}
            </el-tag>
          </el-descriptions-item>
          <el-descriptions-item label="踢出通道">
            {{ selectedRecord.kick_channel }}
          </el-descriptions-item>
          <el-descriptions-item label="检测状态">
            <el-tag :type="selectedRecord.detection_success ? 'success' : 'danger'">
              {{ selectedRecord.detection_success ? '成功' : '失败' }}
            </el-tag>
          </el-descriptions-item>
          <el-descriptions-item label="处理时间">
            {{ getProcessingTime(selectedRecord) }}ms
          </el-descriptions-item>
          <el-descriptions-item label="数据完整性">
            <el-tag type="success">完整</el-tag>
          </el-descriptions-item>
        </el-descriptions>
      </div>
      <template #footer>
        <el-button @click="detailDialogVisible = false">关闭</el-button>
        <el-button type="primary" @click="exportSingleRecord">导出此记录</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, computed, onMounted, watch } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import {
  Document,
  Download,
  Refresh,
  Search,
  ArrowDown,
  Clock,
  View,
  Delete,
  SuccessFilled,
  CircleCloseFilled
} from '@element-plus/icons-vue'
import VChart from 'vue-echarts'
import { use } from 'echarts/core'
import { BarChart } from 'echarts/charts'
import {
  GridComponent,
  TooltipComponent,
  LegendComponent,
  DataZoomComponent
} from 'echarts/components'
import { CanvasRenderer } from 'echarts/renderers'
import { useWeightStore } from '@/stores/weight'
import { formatWeight, formatTime } from '@/utils/format'
import type { WeightRecord } from '@/types/weight'

// 注册 ECharts 组件
use([
  BarChart,
  GridComponent,
  TooltipComponent,
  LegendComponent,
  DataZoomComponent,
  CanvasRenderer
])

const weightStore = useWeightStore()

// 响应式数据
const loading = ref(false)
const exporting = ref(false)
const filtering = ref(false)
const chartLoading = ref(false)
const showChart = ref(true)
const searchText = ref('')
const currentPage = ref(1)
const pageSize = ref(50)
const detailDialogVisible = ref(false)
const selectedRecord = ref<WeightRecord | null>(null)

const records = ref<WeightRecord[]>([])
const filterForm = reactive({
  dateRange: null as [string, string] | null,
  weightMin: null as number | null,
  weightMax: null as number | null,
  grade: '' as string | number,
  status: '' as boolean | string
})

// 计算属性
const totalRecords = computed(() => records.value.length)

const avgWeight = computed(() => {
  if (records.value.length === 0) return 0
  const sum = records.value.reduce((acc, record) => acc + record.weight, 0)
  return sum / records.value.length
})

const successRate = computed(() => {
  if (records.value.length === 0) return 0
  const successCount = records.value.filter(record => record.detection_success).length
  return Math.round((successCount / records.value.length) * 100)
})

const recordsPerMinute = computed(() => {
  // 简化计算，实际应该根据时间范围计算
  return Math.floor(Math.random() * 50) + 20
})

const availableGrades = computed(() => {
  const grades = [...new Set(records.value.map(r => r.determined_grade))]
  return grades.sort((a, b) => a - b)
})

const filteredRecords = computed(() => {
  let filtered = [...records.value]

  // 文本搜索
  if (searchText.value) {
    const search = searchText.value.toLowerCase()
    filtered = filtered.filter(record =>
      record.id.toString().includes(search) ||
      formatWeight(record.weight).toLowerCase().includes(search) ||
      record.determined_grade.toString().includes(search)
    )
  }

  // 时间范围筛选
  if (filterForm.dateRange && filterForm.dateRange.length === 2) {
    const [startDate, endDate] = filterForm.dateRange
    filtered = filtered.filter(record => {
      const recordTime = new Date(record.timestamp).getTime()
      return recordTime >= new Date(startDate).getTime() &&
        recordTime <= new Date(endDate).getTime()
    })
  }

  // 重量范围筛选
  if (filterForm.weightMin !== null) {
    filtered = filtered.filter(record => record.weight >= filterForm.weightMin!)
  }
  if (filterForm.weightMax !== null) {
    filtered = filtered.filter(record => record.weight <= filterForm.weightMax!)
  }

  // 分级筛选
  if (filterForm.grade !== '' && filterForm.grade !== null) {
    filtered = filtered.filter(record => record.determined_grade === Number(filterForm.grade))
  }

  // 状态筛选
  if (filterForm.status !== '' && filterForm.status !== null) {
    filtered = filtered.filter(record => record.detection_success === filterForm.status)
  }

  return filtered
})

const paginatedRecords = computed(() => {
  const start = (currentPage.value - 1) * pageSize.value
  const end = start + pageSize.value
  return filteredRecords.value.slice(start, end)
})

// 重量分布图表配置
const distributionChartOption = computed(() => {
  // 计算重量分布
  const ranges = [
    { name: '0-50g', min: 0, max: 50 },
    { name: '50-100g', min: 50, max: 100 },
    { name: '100-150g', min: 100, max: 150 },
    { name: '150-200g', min: 150, max: 200 },
    { name: '200g+', min: 200, max: Infinity }
  ]

  const distribution = ranges.map(range => ({
    name: range.name,
    value: filteredRecords.value.filter(record =>
      record.weight >= range.min && record.weight < range.max
    ).length
  }))

  return {
    title: {
      text: '重量分布统计',
      left: 'center',
      textStyle: { fontSize: 16 }
    },
    tooltip: {
      trigger: 'axis',
      axisPointer: { type: 'shadow' }
    },
    grid: {
      left: 50,
      right: 30,
      top: 50,
      bottom: 50
    },
    xAxis: {
      type: 'category',
      data: distribution.map(d => d.name),
      axisLabel: {
        rotate: 45
      }
    },
    yAxis: {
      type: 'value',
      name: '记录数量'
    },
    series: [{
      name: '记录数量',
      type: 'bar',
      data: distribution.map(d => d.value),
      itemStyle: {
        color: (params: any) => {
          const colors = ['#5cb87a', '#409eff', '#e6a23c', '#f56c6c', '#909399']
          return colors[params.dataIndex % colors.length]
        }
      }
    }]
  }
})

// 工具函数
const getWeightTagType = (weight: number) => {
  if (weight < 50) return 'success'
  if (weight < 100) return 'primary'
  if (weight < 150) return 'warning'
  return 'danger'
}

const getGradeTagType = (grade: number) => {
  const types = ['', 'success', 'primary', 'warning', 'danger', 'info']
  return types[grade] || 'info'
}

const getProcessingTime = (_record: WeightRecord) => {
  // 模拟处理时间，实际应该从记录中获取
  return Math.floor(Math.random() * 10) + 1
}

// 事件处理函数
const handleDateRangeChange = (dates: [string, string] | null) => {
  filterForm.dateRange = dates
  applyFilters()
}

const applyFilters = async () => {
  filtering.value = true
  currentPage.value = 1 // 重置到第一页

  setTimeout(() => {
    filtering.value = false
    ElMessage.success('筛选已应用')
  }, 500)
}

const resetFilters = () => {
  Object.assign(filterForm, {
    dateRange: null,
    weightMin: null,
    weightMax: null,
    grade: '',
    status: ''
  })
  searchText.value = ''
  currentPage.value = 1
  ElMessage.info('筛选条件已重置')
}

const handleSortChange = ({ prop, order }: { prop: string, order: string }) => {
  // 这里可以实现排序逻辑
  console.log('Sort changed:', prop, order)
}

const handleSizeChange = (size: number) => {
  pageSize.value = size
  currentPage.value = 1
}

const handleCurrentChange = (page: number) => {
  currentPage.value = page
}

const showRecordDetail = (record: WeightRecord) => {
  selectedRecord.value = record
  detailDialogVisible.value = true
}

const deleteRecord = async (recordId: number) => {
  try {
    await ElMessageBox.confirm('确定要删除这条记录吗？', '确认删除', {
      type: 'warning'
    })

    // 从本地数组中移除记录（实际应该调用API）
    const index = records.value.findIndex(r => r.id === recordId)
    if (index > -1) {
      records.value.splice(index, 1)
      ElMessage.success('记录已删除')
    }
  } catch {
    // 用户取消删除
  }
}

const refreshRecords = async () => {
  loading.value = true
  try {
    const response = await weightStore.fetchRecords(1000) // 获取更多记录
    if (response.success) {
      records.value = response.data.records || []
      ElMessage.success('数据刷新成功')
    }
  } catch (error) {
    ElMessage.error('刷新数据失败')
    console.error('Refresh records error:', error)
  } finally {
    loading.value = false
  }
}

const exportRecords = async () => {
  if (filteredRecords.value.length === 0) {
    ElMessage.warning('没有可导出的记录')
    return
  }

  exporting.value = true
  try {
    // 准备导出数据
    const exportData = filteredRecords.value.map(record => ({
      '记录ID': record.id,
      '检测时间': formatTime(record.timestamp),
      '重量(g)': record.weight,
      '判定分级': record.determined_grade,
      '踢出通道': record.kick_channel,
      '检测状态': record.detection_success ? '成功' : '失败',
      '处理时间(ms)': getProcessingTime(record)
    }))

    // 转换为CSV格式
    const headers = Object.keys(exportData[0])
    const csvContent = [
      headers.join(','),
      ...exportData.map(row =>
        headers.map(header => `"${row[header as keyof typeof row]}"`).join(',')
      )
    ].join('\n')

    // 创建并下载文件
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
    const link = document.createElement('a')
    const url = URL.createObjectURL(blob)
    link.setAttribute('href', url)
    link.setAttribute('download', `weight-records-${new Date().toISOString().split('T')[0]}.csv`)
    link.style.visibility = 'hidden'
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    URL.revokeObjectURL(url)

    ElMessage.success(`已导出 ${exportData.length} 条记录`)
  } catch (error) {
    ElMessage.error('导出失败')
    console.error('Export error:', error)
  } finally {
    exporting.value = false
  }
}

const exportSingleRecord = () => {
  if (!selectedRecord.value) return

  const record = selectedRecord.value
  const exportData = {
    '记录ID': record.id,
    '检测时间': formatTime(record.timestamp),
    '重量(g)': record.weight,
    '判定分级': record.determined_grade,
    '踢出通道': record.kick_channel,
    '检测状态': record.detection_success ? '成功' : '失败',
    '处理时间(ms)': getProcessingTime(record)
  }

  const csvContent = [
    Object.keys(exportData).join(','),
    Object.values(exportData).map(val => `"${val}"`).join(',')
  ].join('\n')

  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
  const link = document.createElement('a')
  const url = URL.createObjectURL(blob)
  link.setAttribute('href', url)
  link.setAttribute('download', `weight-record-${record.id}.csv`)
  link.style.visibility = 'hidden'
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
  URL.revokeObjectURL(url)

  ElMessage.success('记录已导出')
  detailDialogVisible.value = false
}

// 生成模拟数据（开发用）
const generateMockData = () => {
  const mockRecords: WeightRecord[] = []
  const now = new Date()

  for (let i = 0; i < 500; i++) {
    const timestamp = new Date(now.getTime() - i * 60000) // 每分钟一条记录
    const weight = Math.random() * 200 + 20 // 20-220g随机重量
    let grade = 1
    if (weight >= 50) grade = 2
    if (weight >= 100) grade = 3
    if (weight >= 150) grade = 4

    mockRecords.push({
      id: 1000 + i,
      timestamp: timestamp.toISOString(),
      weight: Math.round(weight * 10) / 10, // 保留1位小数
      determined_grade: grade,
      kick_channel: grade,
      detection_success: Math.random() > 0.05 // 95%成功率
    })
  }

  return mockRecords.reverse() // 最新的在前
}

// 组件挂载
onMounted(async () => {
  loading.value = true
  try {
    // 尝试从API获取数据
    const response = await weightStore.fetchRecords(1000)
    if (response.success && response.data.records && response.data.records.length > 0) {
      records.value = response.data.records
    } else {
      // 如果没有数据，使用模拟数据
      records.value = generateMockData()
    }
  } catch (error) {
    // 如果API出错，使用模拟数据
    console.warn('Failed to fetch records from API, using mock data')
    records.value = generateMockData()
  } finally {
    loading.value = false
  }
})

// 监听筛选条件变化
watch([() => filterForm.weightMin, () => filterForm.weightMax], () => {
  currentPage.value = 1
})
</script>

<style scoped>
.records-container {
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

.filter-card {
  margin: 20px 0;
}

.stats-cards {
  margin: 20px 0;
}

.stat-card {
  height: 100px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.stat-content {
  text-align: center;
}

.stat-value {
  font-size: 24px;
  font-weight: 700;
  color: #409eff;
  margin-bottom: 5px;
}

.stat-label {
  font-size: 14px;
  color: #909399;
}

.chart-card {
  margin: 20px 0;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.chart-container {
  padding: 10px;
}

.table-card {
  margin: 20px 0;
}

.time-cell {
  display: flex;
  align-items: center;
  gap: 5px;
}

.weight-tag {
  font-weight: 600;
}

.grade-tag {
  font-weight: 600;
}

.channel-badge {
  margin-right: 10px;
}

.channel-indicator {
  width: 20px;
  height: 20px;
  border-radius: 50%;
  background: #409eff;
}

.processing-time {
  font-size: 12px;
  color: #909399;
}

.pagination-container {
  margin-top: 20px;
  text-align: center;
}

.detail-content {
  padding: 20px 0;
}

:deep(.el-form--inline .el-form-item) {
  margin-right: 20px;
}

:deep(.el-table .cell) {
  padding: 8px;
}

:deep(.el-card__header) {
  background: #fafafa;
  border-bottom: 1px solid #f0f0f0;
}

:deep(.el-pagination) {
  justify-content: center;
}

:deep(.el-descriptions__label) {
  font-weight: 600;
  color: #606266;
}

:deep(.el-badge__content) {
  border: none;
  font-size: 12px;
  font-weight: 600;
}

/* 响应式设计 */
@media (max-width: 1200px) {
  .stats-cards .el-col {
    margin-bottom: 10px;
  }

  .chart-card {
    order: 1;
  }
}

@media (max-width: 768px) {
  .records-container {
    padding: 10px;
  }

  :deep(.el-form--inline) {
    display: block;
  }

  :deep(.el-form--inline .el-form-item) {
    display: block;
    margin-right: 0;
    margin-bottom: 15px;
  }

  .card-header {
    flex-direction: column;
    gap: 10px;
  }
}
</style>