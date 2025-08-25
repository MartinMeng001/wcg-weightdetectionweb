<template>
  <div class="config-container">
    <el-page-header @back="$router.push('/weight/overview')">
      <template #content>
        <div class="header-content">
          <el-icon class="header-icon"><Setting /></el-icon>
          <span>重量检测配置管理</span>
        </div>
      </template>
      <template #extra>
        <el-space>
          <el-button @click="addNewConfig" type="primary" :icon="Plus">
            添加配置
          </el-button>
          <el-button @click="validateConfigs" :loading="validating">
            验证配置
          </el-button>
          <el-button @click="saveConfigs" type="success" :loading="saving">
            保存配置
          </el-button>
        </el-space>
      </template>
    </el-page-header>

    <!-- 配置信息卡片 -->
    <el-row :gutter="20" style="margin: 20px 0;">
      <el-col :span="8">
        <el-card class="info-card">
          <div class="info-item">
            <span class="info-label">当前版本:</span>
            <el-tag type="primary">v{{ configVersion }}</el-tag>
          </div>
        </el-card>
      </el-col>
      <el-col :span="8">
        <el-card class="info-card">
          <div class="info-item">
            <span class="info-label">配置数量:</span>
            <el-tag type="info">{{ configList.length }} 项</el-tag>
          </div>
        </el-card>
      </el-col>
      <el-col :span="8">
        <el-card class="info-card">
          <div class="info-item">
            <span class="info-label">启用状态:</span>
            <el-tag :type="enabledCount > 0 ? 'success' : 'warning'">
              {{ enabledCount }}/{{ configList.length }} 启用
            </el-tag>
          </div>
        </el-card>
      </el-col>
    </el-row>

    <!-- 配置表格 -->
    <el-card class="config-table-card">
      <template #header>
        <div class="card-header">
          <span>重量分级配置</span>
          <el-space>
            <el-button @click="resetConfigs" :icon="RefreshRight" size="small">
              重置
            </el-button>
            <el-button @click="importConfig" :icon="Upload" size="small">
              导入
            </el-button>
            <el-button @click="exportConfig" :icon="Download" size="small">
              导出
            </el-button>
          </el-space>
        </div>
      </template>

      <el-table
        :data="configList"
        stripe
        border
        style="width: 100%"
        :row-class-name="getRowClassName"
      >
        <el-table-column type="index" label="序号" width="60" align="center" />

        <el-table-column prop="grade_id" label="分级ID" width="100" align="center">
          <template #default="{ row }">
            <el-input-number
              v-model="row.grade_id"
              :min="1"
              :max="10"
              size="small"
              controls-position="right"
              @change="validateSingleConfig(row)"
            />
          </template>
        </el-table-column>

        <el-table-column prop="weight_threshold" label="重量阈值(g)" width="150" align="center">
          <template #default="{ row }">
            <el-input-number
              v-model="row.weight_threshold"
              :min="0"
              :precision="1"
              size="small"
              controls-position="right"
              @change="validateSingleConfig(row)"
            />
          </template>
        </el-table-column>

        <el-table-column prop="kick_channel" label="踢出通道" width="120" align="center">
          <template #default="{ row }">
            <el-input-number
              v-model="row.kick_channel"
              :min="0"
              :max="10"
              size="small"
              controls-position="right"
              @change="validateSingleConfig(row)"
            />
          </template>
        </el-table-column>

        <el-table-column prop="enabled" label="启用状态" width="100" align="center">
          <template #default="{ row }">
            <el-switch
              v-model="row.enabled"
              active-color="#13ce66"
              inactive-color="#ff4949"
              @change="handleStatusChange(row)"
            />
          </template>
        </el-table-column>

        <el-table-column prop="description" label="描述" min-width="200">
          <template #default="{ row }">
            <el-input
              v-model="row.description"
              placeholder="请输入描述"
              size="small"
              clearable
            />
          </template>
        </el-table-column>

        <el-table-column label="操作" width="120" align="center" fixed="right">
          <template #default="{ row, $index }">
            <el-button
              @click="duplicateConfig(row)"
              :icon="CopyDocument"
              size="small"
              type="primary"
              link
              title="复制配置"
            />
            <el-button
              @click="deleteConfig($index)"
              :icon="Delete"
              size="small"
              type="danger"
              link
              title="删除配置"
            />
          </template>
        </el-table-column>
      </el-table>

      <!-- 批量操作 -->
      <div class="batch-operations" v-if="configList.length > 0">
        <el-space>
          <el-button @click="enableAllConfigs" size="small">全部启用</el-button>
          <el-button @click="disableAllConfigs" size="small">全部禁用</el-button>
          <el-button @click="clearAllConfigs" type="danger" size="small">清空配置</el-button>
        </el-space>
      </div>
    </el-card>

    <!-- 配置预览 -->
    <el-card class="preview-card" v-if="configList.length > 0">
      <template #header>
        <span>配置预览</span>
      </template>
      <div class="preview-content">
        <div class="threshold-visualization">
          <div class="threshold-bar">
            <div
              v-for="(config, index) in sortedConfigs"
              :key="config.grade_id"
              :class="['threshold-segment', { disabled: !config.enabled }]"
              :style="getSegmentStyle(config, index)"
            >
              <div class="segment-label">
                {{ config.description || `级别${config.grade_id}` }}
              </div>
              <div class="segment-value">
                {{ formatWeight(config.weight_threshold) }}
              </div>
              <div class="segment-channel">
                通道{{ config.kick_channel }}
              </div>
            </div>
          </div>
        </div>
      </div>
    </el-card>

    <!-- 验证结果 -->
    <el-card class="validation-card" v-if="validationResults.length > 0">
      <template #header>
        <span>配置验证结果</span>
      </template>
      <el-alert
        v-for="(result, index) in validationResults"
        :key="index"
        :title="result.message"
        :type="result.type"
        :closable="false"
        style="margin-bottom: 10px;"
      />
    </el-card>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, watch } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import {
  Setting,
  Plus,
  RefreshRight,
  Upload,
  Download,
  CopyDocument,
  Delete
} from '@element-plus/icons-vue'
import { useWeightStore } from '@/stores/weight'
import { formatWeight } from '@/utils/format'
import type { WeightConfig } from '@/types/weight'

const weightStore = useWeightStore()

// 响应式数据
const configList = ref<WeightConfig[]>([])
const configVersion = ref(1)
const saving = ref(false)
const validating = ref(false)
const validationResults = ref<Array<{type: string, message: string}>>([])

// 计算属性
const enabledCount = computed(() => {
  return configList.value.filter(config => config.enabled).length
})

const sortedConfigs = computed(() => {
  return [...configList.value].sort((a, b) => a.weight_threshold - b.weight_threshold)
})

// 获取行样式
const getRowClassName = ({ row }: { row: WeightConfig }) => {
  if (!row.enabled) return 'disabled-row'
  return ''
}

const handleStatusChange = (row: WeightConfig) => {
  // Logic to handle the status change
  if (row.enabled) {
    // A config was enabled
    ElMessage.success(`配置 '${row.description}' 已启用`)
  } else {
    // A config was disabled
    ElMessage.info(`配置 '${row.description}' 已禁用`)
  }

  // The 'enabledCount' computed property will automatically update
  // You might want to run a quick validation check here
  // validateConfigs(); // Uncomment this line if you want to auto-validate
};

// 在现有的 reactive 数据和计算属性之后添加

// 启用所有配置
const enableAllConfigs = () => {
  configList.value.forEach(config => {
    config.enabled = true
  })
  ElMessage.success('已启用所有配置')
}

// 禁用所有配置
const disableAllConfigs = () => {
  configList.value.forEach(config => {
    config.enabled = false
  })
  ElMessage.warning('已禁用所有配置')
}

// 在现有的方法之后添加

// 清空所有配置
const clearAllConfigs = async () => {
  try {
    await ElMessageBox.confirm('确定要清空所有配置吗？此操作不可逆！', '警告', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning'
    })
    configList.value = []
    ElMessage.success('所有配置已清空')
    // 清空验证结果，因为没有可验证的配置了
    validationResults.value = []
  } catch {
    // 用户取消了操作
    ElMessage.info('已取消清空操作')
  }
}

// 添加新配置
const addNewConfig = () => {
  const newId = Math.max(...configList.value.map(c => c.grade_id), 0) + 1
  const lastThreshold = Math.max(...configList.value.map(c => c.weight_threshold), 0)

  configList.value.push({
    grade_id: newId,
    weight_threshold: lastThreshold + 50,
    kick_channel: newId,
    enabled: true,
    description: `级别${newId}`
  })

  ElMessage.success('已添加新配置')
}

// 复制配置
const duplicateConfig = (config: WeightConfig) => {
  const newId = Math.max(...configList.value.map(c => c.grade_id), 0) + 1
  const duplicated = {
    ...config,
    grade_id: newId,
    weight_threshold: config.weight_threshold + 10,
    description: `${config.description} (复制)`
  }

  configList.value.push(duplicated)
  ElMessage.success('配置已复制')
}

// 删除配置
const deleteConfig = async (index: number) => {
  try {
    await ElMessageBox.confirm('确定要删除这个配置吗？', '确认删除', {
      type: 'warning'
    })
    configList.value.splice(index, 1)
    ElMessage.success('配置已清空')
  } catch {
    // 用户取消操作
  }
}

// 验证单个配置
const validateSingleConfig = (config: WeightConfig) => {
  // 实时验证逻辑可在这里添加
  console.log('Validating config:', config)
}

// 验证所有配置
const validateConfigs = async () => {
  validating.value = true
  validationResults.value = []

  try {
    // 基础验证
    const errors: Array<{type: string, message: string}> = []

    // 检查重量阈值是否递增
    const sortedByThreshold = [...configList.value].sort((a, b) => a.weight_threshold - b.weight_threshold)
    for (let i = 1; i < sortedByThreshold.length; i++) {
      if (sortedByThreshold[i].weight_threshold <= sortedByThreshold[i-1].weight_threshold) {
        errors.push({
          type: 'error',
          message: `重量阈值必须严格递增: ${formatWeight(sortedByThreshold[i-1].weight_threshold)} >= ${formatWeight(sortedByThreshold[i].weight_threshold)}`
        })
      }
    }

    // 检查通道冲突
    const enabledConfigs = configList.value.filter(c => c.enabled)
    const channelGroups = enabledConfigs.reduce((groups, config) => {
      if (!groups[config.kick_channel]) {
        groups[config.kick_channel] = []
      }
      groups[config.kick_channel].push(config.grade_id)
      return groups
    }, {} as Record<number, number[]>)

    Object.entries(channelGroups).forEach(([channel, gradeIds]) => {
      if (gradeIds.length > 1) {
        errors.push({
          type: 'warning',
          message: `通道 ${channel} 被多个分级使用: ${gradeIds.join(', ')}`
        })
      }
    })

    // 检查分级ID重复
    const gradeIds = configList.value.map(c => c.grade_id)
    const duplicateIds = gradeIds.filter((id, index) => gradeIds.indexOf(id) !== index)
    if (duplicateIds.length > 0) {
      errors.push({
        type: 'error',
        message: `分级ID重复: ${[...new Set(duplicateIds)].join(', ')}`
      })
    }

    if (errors.length === 0) {
      // 调用API验证
      const response = await weightStore.validateConfig(configList.value)
      if (response.success) {
        validationResults.value = [{ type: 'success', message: '配置验证通过' }]
      } else {
        validationResults.value = [{ type: 'error', message: response.message }]
      }
    } else {
      validationResults.value = errors
    }

  } catch (error) {
    validationResults.value = [{ type: 'error', message: '验证过程出现错误' }]
    console.error('Validation error:', error)
  } finally {
    validating.value = false
  }
}

// 保存配置
const saveConfigs = async () => {
  if (configList.value.length === 0) {
    ElMessage.warning('没有可保存的配置')
    return
  }

  saving.value = true
  try {
    const response = await weightStore.updateConfig(configList.value)
    if (response.success) {
      configVersion.value = response.data?.version || configVersion.value + 1
      ElMessage.success('配置保存成功')
      validationResults.value = [{ type: 'success', message: '配置已成功保存到系统' }]
    } else {
      ElMessage.error(`保存失败: ${response.message}`)
    }
  } catch (error) {
    ElMessage.error('保存配置时发生错误')
    console.error('Save config error:', error)
  } finally {
    saving.value = false
  }
}

// 重置配置
const resetConfigs = async () => {
  try {
    await ElMessageBox.confirm('确定要重置为默认配置吗？', '确认重置', {
      type: 'warning'
    })

    configList.value = [
      {
        grade_id: 1,
        weight_threshold: 50.0,
        kick_channel: 1,
        enabled: true,
        description: '轻量级果子'
      },
      {
        grade_id: 2,
        weight_threshold: 100.0,
        kick_channel: 2,
        enabled: true,
        description: '中量级果子'
      },
      {
        grade_id: 3,
        weight_threshold: 150.0,
        kick_channel: 3,
        enabled: true,
        description: '重量级果子'
      }
    ]

    ElMessage.success('已重置为默认配置')
  } catch {
    // 用户取消重置
  }
}

// 导入配置
const importConfig = () => {
  ElMessage.info('导入功能开发中...')
}

// 导出配置
const exportConfig = () => {
  const dataStr = JSON.stringify(configList.value, null, 2)
  const dataBlob = new Blob([dataStr], { type: 'application/json' })
  const url = URL.createObjectURL(dataBlob)
  const link = document.createElement('a')
  link.href = url
  link.download = `weight-config-${new Date().toISOString().split('T')[0]}.json`
  link.click()
  URL.revokeObjectURL(url)
  ElMessage.success('配置已导出')
}

// 获取分段样式
const getSegmentStyle = (config: WeightConfig, index: number) => {
  const colors = ['#5cb87a', '#409eff', '#e6a23c', '#f56c6c', '#909399']
  const color = colors[index % colors.length]

  return {
    backgroundColor: config.enabled ? color : '#ddd',
    opacity: config.enabled ? 1 : 0.5
  }
}

// 加载配置数据
const loadConfigs = async () => {
  try {
    const response = await weightStore.fetchConfig()
    if (response.success && response.data.configs) {
      configList.value = response.data.configs
      configVersion.value = response.data.version || 1
    }
  } catch (error) {
    ElMessage.error('加载配置失败')
    console.error('Load config error:', error)
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
  color: #409eff;
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

.threshold-visualization {
  position: relative;
}

.threshold-bar {
  display: flex;
  height: 80px;
  border-radius: 8px;
  overflow: hidden;
  box-shadow: 0 2px 8px rgba(0,0,0,0.1);
}

.threshold-segment {
  flex: 1;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  color: white;
  text-shadow: 0 1px 2px rgba(0,0,0,0.3);
  transition: all 0.3s ease;
  border-right: 2px solid white;
}

.threshold-segment:last-child {
  border-right: none;
}

.threshold-segment.disabled {
  color: #999;
}

.segment-label {
  font-size: 12px;
  font-weight: 600;
  margin-bottom: 4px;
}

.segment-value {
  font-size: 16px;
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