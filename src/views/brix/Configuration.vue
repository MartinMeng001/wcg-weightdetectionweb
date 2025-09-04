<!-- src/views/brix/Configuration.vue -->
<template>
  <div class="config-container">
    <!-- 页面头部 -->
    <el-card class="header-card" shadow="never">
      <div class="header-content">
        <el-icon class="header-icon"><Setting /></el-icon>
        <span>糖度分级配置管理</span>
      </div>
    </el-card>

    <!-- 配置信息卡片 -->
    <el-row :gutter="20">
      <el-col :xs="24" :sm="8">
        <el-card class="info-card" shadow="hover">
          <div class="info-item">
            <span class="info-label">配置版本</span>
            <el-tag type="primary">v{{ configVersion }}</el-tag>
          </div>
        </el-card>
      </el-col>
      <el-col :xs="24" :sm="8">
        <el-card class="info-card" shadow="hover">
          <div class="info-item">
            <span class="info-label">启用分级</span>
            <el-tag type="success">{{ enabledCount }}/{{ configList.length }}</el-tag>
          </div>
        </el-card>
      </el-col>
      <el-col :xs="24" :sm="8">
        <el-card class="info-card" shadow="hover">
          <div class="info-item">
            <span class="info-label">覆盖范围</span>
            <el-tag :type="coverageType">{{ coverageText }}</el-tag>
          </div>
        </el-card>
      </el-col>
    </el-row>

    <!-- 配置表格 -->
    <el-card class="config-table-card" shadow="never">
      <template #header>
        <div class="card-header">
          <span>糖度分级配置</span>
          <div>
            <el-button
              type="primary"
              @click="addConfig"
              :disabled="configList.length >= 10"
            >
              <el-icon><Plus /></el-icon>
              添加分级
            </el-button>
            <el-button
              @click="validateConfigs"
              :loading="validating"
            >
              <el-icon><Check /></el-icon>
              验证配置
            </el-button>
            <el-button
              type="success"
              @click="saveConfigs"
              :loading="saving"
              :disabled="!hasChanges"
            >
              <el-icon><Upload /></el-icon>
              保存配置
            </el-button>
          </div>
        </div>
      </template>

      <el-table
        :data="configList"
        row-key="grade_id"
        :row-class-name="getRowClassName"
        border
      >
        <el-table-column prop="enabled" label="启用" width="80" align="center">
          <template #default="{ row, $index }">
            <el-switch
              v-model="row.enabled"
              @change="onConfigChange"
            />
          </template>
        </el-table-column>

        <el-table-column prop="grade_id" label="分级ID" width="100" align="center">
          <template #default="{ row, $index }">
            <el-input-number
              v-model="row.grade_id"
              :min="1"
              :max="10"
              :step="1"
              controls-position="right"
              @change="onConfigChange"
            />
          </template>
        </el-table-column>

        <el-table-column label="糖度范围(°Bx)" width="200" align="center">
          <template #default="{ row, $index }">
            <div style="display: flex; align-items: center; gap: 8px;">
              <el-input-number
                v-model="row.brix_min"
                :min="0"
                :max="30"
                :step="0.1"
                :precision="1"
                controls-position="right"
                placeholder="最小值"
                style="width: 90px;"
                @change="onConfigChange"
              />
              <span>~</span>
              <el-input-number
                v-model="row.brix_max"
                :min="0"
                :max="30"
                :step="0.1"
                :precision="1"
                controls-position="right"
                placeholder="最大值"
                style="width: 90px;"
                @change="onConfigChange"
              />
            </div>
          </template>
        </el-table-column>

        <el-table-column prop="kick_channel" label="踢出通道" width="120" align="center">
          <template #default="{ row, $index }">
            <el-input-number
              v-model="row.kick_channel"
              :min="1"
              :max="20"
              :step="1"
              controls-position="right"
              @change="onConfigChange"
            />
          </template>
        </el-table-column>

        <el-table-column prop="target_weight_ratio" label="目标比例" width="120" align="center">
          <template #default="{ row, $index }">
            <el-input-number
              v-model="row.target_weight_ratio"
              :min="0"
              :max="1"
              :step="0.01"
              :precision="2"
              controls-position="right"
              @change="onConfigChange"
            />
          </template>
        </el-table-column>

        <el-table-column prop="color_code" label="显示颜色" width="100" align="center">
          <template #default="{ row, $index }">
            <el-color-picker
              v-model="row.color_code"
              size="small"
              @change="onConfigChange"
            />
          </template>
        </el-table-column>

        <el-table-column prop="description" label="描述" min-width="150">
          <template #default="{ row, $index }">
            <el-input
              v-model="row.description"
              placeholder="请输入描述"
              clearable
              @input="onConfigChange"
            />
          </template>
        </el-table-column>

        <el-table-column label="操作" width="100" align="center">
          <template #default="{ row, $index }">
            <el-button
              type="danger"
              size="small"
              @click="removeConfig($index)"
              :disabled="configList.length <= 1"
            >
              <el-icon><Delete /></el-icon>
            </el-button>
          </template>
        </el-table-column>
      </el-table>

      <div class="batch-operations">
        <el-button @click="resetToDefault">重置为默认</el-button>
        <el-button @click="clearAll" :disabled="configList.length === 0">清空配置</el-button>
        <el-button @click="importConfig">导入配置</el-button>
        <el-button @click="exportConfig">导出配置</el-button>
      </div>
    </el-card>

    <!-- 配置预览 -->
    <el-card class="preview-card" shadow="never">
      <template #header>
        <span>糖度范围预览</span>
      </template>
      <div class="preview-content">
        <div class="range-visualization">
          <div class="range-bar">
            <div
              v-for="config in enabledConfigs"
              :key="config.grade_id"
              class="range-segment"
              :style="getRangeSegmentStyle(config)"
            >
              <div class="segment-label">分级{{ config.grade_id }}</div>
              <div class="segment-value">{{ formatBrix(config.brix_min) }} ~ {{ formatBrix(config.brix_max) }}</div>
              <div class="segment-channel">通道{{ config.kick_channel }}</div>
            </div>
          </div>
        </div>
      </div>
    </el-card>

    <!-- 验证结果 -->
    <el-card
      v-if="validationResults.length > 0"
      class="validation-card"
      shadow="never"
    >
      <template #header>
        <span>配置验证结果</span>
      </template>
      <div v-for="result in validationResults" :key="result.type">
        <el-alert
          :title="result.message"
          :type="result.type"
          :closable="false"
          show-icon
        />
      </div>
    </el-card>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, computed, onMounted, watch } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import {
  Setting,
  Plus,
  Check,
  Upload,
  Delete,
  Download,
  DocumentAdd
} from '@element-plus/icons-vue'
import { useBrixStore } from '@/stores/brix'
import { validateBrixConfigs, formatBrix, calculateBrixCoverage } from '@/utils/brixValidator'
import type { BrixConfig } from '@/types/brix'

const brixStore = useBrixStore()

// 响应式数据
const configList = ref<BrixConfig[]>([])
const configVersion = ref(1)
const validating = ref(false)
const saving = ref(false)
const hasChanges = ref(false)
const validationResults = ref<Array<{
  type: 'success' | 'warning' | 'error'
  message: string
}>>([])

// 计算属性
const enabledCount = computed(() =>
  configList.value.filter(c => c.enabled).length
)

const enabledConfigs = computed(() =>
  configList.value.filter(c => c.enabled).sort((a, b) => a.brix_min - b.brix_min)
)

const coverage = computed(() => calculateBrixCoverage(configList.value))

const coverageType = computed(() => {
  const percent = coverage.value.coveragePercent
  if (percent >= 0.95) return 'success'
  if (percent >= 0.8) return 'warning'
  return 'danger'
})

const coverageText = computed(() => {
  const percent = (coverage.value.coveragePercent * 100).toFixed(1)
  return `${percent}%`
})

// 方法
const onConfigChange = () => {
  hasChanges.value = true
  validationResults.value = []
}

const getRowClassName = ({ row }: { row: BrixConfig }) => {
  return row.enabled ? '' : 'disabled-row'
}

const addConfig = () => {
  const newGradeId = Math.max(...configList.value.map(c => c.grade_id), 0) + 1
  const newConfig: BrixConfig = {
    grade_id: newGradeId,
    brix_min: 0,
    brix_max: 5,
    kick_channel: newGradeId,
    enabled: true,
    description: `分级${newGradeId}`,
    color_code: '#409EFF',
    target_weight_ratio: 0.25
  }

  configList.value.push(newConfig)
  onConfigChange()
}

const removeConfig = async (index: number) => {
  try {
    await ElMessageBox.confirm(
      '确定要删除这个配置项吗？此操作不可撤销。',
      '确认删除',
      {
        confirmButtonText: '删除',
        cancelButtonText: '取消',
        type: 'warning'
      }
    )

    configList.value.splice(index, 1)
    onConfigChange()
    ElMessage.success('配置项已删除')
  } catch {
    // 用户取消删除
  }
}

const validateConfigs = async () => {
  validating.value = true
  validationResults.value = []

  try {
    const localValidation = validateBrixConfigs(configList.value)

    // 添加本地验证结果
    localValidation.errors.forEach(error => {
      validationResults.value.push({ type: 'error', message: error })
    })

    localValidation.warnings.forEach(warning => {
      validationResults.value.push({ type: 'warning', message: warning })
    })

    // 远程验证
    const response = await brixStore.validateConfig(configList.value)
    if (response.success) {
      if (localValidation.valid) {
        validationResults.value.push({ type: 'success', message: '配置验证通过' })
      }
    } else {
      validationResults.value.push({ type: 'error', message: response.message })
    }
  } catch (error) {
    validationResults.value.push({ type: 'error', message: '验证请求失败' })
  } finally {
    validating.value = false
  }
}

const saveConfigs = async () => {
  // 先验证配置
  const validation = validateBrixConfigs(configList.value)
  if (!validation.valid) {
    ElMessage.error('配置验证失败，请检查错误信息')
    validationResults.value = validation.errors.map(error => ({ type: 'error', message: error }))
    return
  }

  saving.value = true
  try {
    const response = await brixStore.updateConfig(configList.value)
    if (response.success) {
      hasChanges.value = false
      configVersion.value = response.data?.version || configVersion.value + 1
      ElMessage.success('糖度配置保存成功')
      validationResults.value = [{ type: 'success', message: '配置已保存并生效' }]
    } else {
      ElMessage.error(response.message || '保存配置失败')
    }
  } catch (error) {
    ElMessage.error('保存配置失败')
    console.error('Save config error:', error)
  } finally {
    saving.value = false
  }
}

const resetToDefault = async () => {
  try {
    await ElMessageBox.confirm(
      '确定要重置为默认配置吗？当前的修改将丢失。',
      '确认重置',
      {
        confirmButtonText: '重置',
        cancelButtonText: '取消',
        type: 'warning'
      }
    )

    configList.value = getDefaultConfigs()
    onConfigChange()
    ElMessage.success('已重置为默认配置')
  } catch {
    // 用户取消重置
  }
}

const clearAll = async () => {
  try {
    await ElMessageBox.confirm(
      '确定要清空所有配置吗？此操作不可撤销。',
      '确认清空',
      {
        confirmButtonText: '清空',
        cancelButtonText: '取消',
        type: 'warning'
      }
    )

    configList.value = []
    onConfigChange()
    ElMessage.success('配置已清空')
  } catch {
    // 用户取消清空
  }
}

const importConfig = () => {
  // 创建文件输入元素
  const input = document.createElement('input')
  input.type = 'file'
  input.accept = '.json'
  input.onchange = (e) => {
    const file = (e.target as HTMLInputElement).files?.[0]
    if (!file) return

    const reader = new FileReader()
    reader.onload = (e) => {
      try {
        const importedConfigs = JSON.parse(e.target?.result as string)
        if (Array.isArray(importedConfigs)) {
          configList.value = importedConfigs
          onConfigChange()
          ElMessage.success('配置导入成功')
        } else {
          ElMessage.error('配置文件格式错误')
        }
      } catch (error) {
        ElMessage.error('配置文件解析失败')
      }
    }
    reader.readAsText(file)
  }
  input.click()
}

const exportConfig = () => {
  const dataStr = JSON.stringify(configList.value, null, 2)
  const blob = new Blob([dataStr], { type: 'application/json' })
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = `brix-config-v${configVersion.value}.json`
  link.click()
  URL.revokeObjectURL(url)
  ElMessage.success('配置已导出')
}

const getRangeSegmentStyle = (config: BrixConfig) => {
  const totalRange = coverage.value.totalRange[1] - coverage.value.totalRange[0]
  const segmentRange = config.brix_max - config.brix_min
  const width = totalRange > 0 ? (segmentRange / totalRange) * 100 : 0

  return {
    width: `${Math.max(width, 5)}%`,
    background: config.color_code || '#409EFF',
    opacity: config.enabled ? 1 : 0.5
  }
}

const getDefaultConfigs = (): BrixConfig[] => [
  {
    grade_id: 1,
    brix_min: 0.0,
    brix_max: 8.0,
    kick_channel: 1,
    enabled: true,
    description: '低糖度果子（0-8°Bx）',
    color_code: '#FF6B6B',
    target_weight_ratio: 0.15
  },
  {
    grade_id: 2,
    brix_min: 8.1,
    brix_max: 12.0,
    kick_channel: 2,
    enabled: true,
    description: '中糖度果子（8.1-12°Bx）',
    color_code: '#4ECDC4',
    target_weight_ratio: 0.35
  },
  {
    grade_id: 3,
    brix_min: 12.1,
    brix_max: 16.0,
    kick_channel: 3,
    enabled: true,
    description: '高糖度果子（12.1-16°Bx）',
    color_code: '#45B7D1',
    target_weight_ratio: 0.35
  },
  {
    grade_id: 4,
    brix_min: 16.1,
    brix_max: 25.0,
    kick_channel: 4,
    enabled: true,
    description: '特优果子（16.1+°Bx）',
    color_code: '#96CEB4',
    target_weight_ratio: 0.15
  }
]

// 加载配置数据
const loadConfigs = async () => {
  try {
    const response = await brixStore.fetchConfig()
    if (response.success && response.data.configs) {
      configList.value = response.data.configs
      configVersion.value = response.data.version || 1
    } else {
      // 如果没有配置，使用默认配置
      configList.value = getDefaultConfigs()
    }
  } catch (error) {
    ElMessage.error('加载糖度配置失败')
    console.error('Load brix config error:', error)
    // 加载失败时使用默认配置
    configList.value = getDefaultConfigs()
  }
}

// 组件挂载时加载数据
onMounted(() => {
  loadConfigs()
})

// 监听配置变化，自动验证
watch(configList, () => {
  validationResults.value = []
}, { deep: true })
</script>

<style scoped>
.config-container {
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
  color: #e6a23c;
}

.info-card {
  height: 80px;
  display: flex;
  align-items: center;
}

.info-item {
  display: flex;
  align-items: center;
  justify-content: space-between;
  width: 100%;
}

.info-label {
  font-size: 14px;
  color: #606266;
}

.config-table-card {
  margin: 20px 0;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.batch-operations {
  margin-top: 16px;
  padding-top: 16px;
  border-top: 1px solid #ebeef5;
  text-align: center;
}

.preview-card {
  margin: 20px 0;
}

.preview-content {
  padding: 20px 0;
}

.range-visualization {
  position: relative;
}

.range-bar {
  display: flex;
  height: 80px;
  border-radius: 8px;
  overflow: hidden;
  box-shadow: 0 2px 8px rgba(0,0,0,0.1);
}

.range-segment {
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  color: white;
  text-shadow: 0 1px 2px rgba(0,0,0,0.3);
  transition: all 0.3s ease;
  border-right: 2px solid white;
  min-width: 80px;
}

.range-segment:last-child {
  border-right: none;
}

.segment-label {
  font-size: 12px;
  font-weight: 600;
  margin-bottom: 4px;
}

.segment-value {
  font-size: 14px;
  font-weight: 700;
}

.segment-channel {
  font-size: 11px;
  margin-top: 4px;
  opacity: 0.9;
}

.validation-card {
  margin: 20px 0;
}

:deep(.disabled-row) {
  background-color: #f5f7fa !important;
  opacity: 0.6;
}

:deep(.el-input-number) {
  width: 100%;
}

:deep(.el-input-number .el-input__inner) {
  text-align: center;
}

:deep(.el-table .cell) {
  padding: 8px;
}

:deep(.el-card__header) {
  background: #fafafa;
  border-bottom: 1px solid #f0f0f0;
}

:deep(.el-alert) {
  margin-bottom: 8px;
}

:deep(.el-alert:last-child) {
  margin-bottom: 0;
}
</style>