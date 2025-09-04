<!-- src/views/brix/Calibration.vue -->
<template>
  <div class="calibration-container">
    <!-- 页面头部 -->
    <el-card class="header-card" shadow="never">
      <div class="header-content">
        <el-icon class="header-icon"><Tools /></el-icon>
        <span>传感器校准管理</span>
      </div>
    </el-card>

    <el-row :gutter="20">
      <!-- 传感器状态 -->
      <el-col :xs="24" :lg="12">
        <el-card class="sensor-status-card" shadow="never">
          <template #header>
            <div class="card-header">
              <span>传感器状态</span>
              <el-button
                :loading="statusLoading"
                @click="refreshStatus"
                size="small"
              >
                <el-icon><Refresh /></el-icon>
                刷新
              </el-button>
            </div>
          </template>

          <el-descriptions :column="1" border v-if="sensorInfo">
            <el-descriptions-item label="型号">
              {{ sensorInfo.model }}
            </el-descriptions-item>
            <el-descriptions-item label="序列号">
              {{ sensorInfo.serial_number }}
            </el-descriptions-item>
            <el-descriptions-item label="测量范围">
              {{ sensorInfo.measurement_range }}
            </el-descriptions-item>
            <el-descriptions-item label="精度">
              {{ sensorInfo.accuracy }}
            </el-descriptions-item>
            <el-descriptions-item label="上次校准">
              <div style="display: flex; align-items: center; gap: 8px;">
                {{ formatTime(sensorInfo.last_calibration) }}
                <el-tag :type="calibrationStatusType" size="small">
                  {{ calibrationStatusText }}
                </el-tag>
              </div>
            </el-descriptions-item>
            <el-descriptions-item label="下次校准">
              {{ formatTime(sensorInfo.calibration_due) }}
            </el-descriptions-item>
          </el-descriptions>

          <div class="sensor-actions" style="margin-top: 20px;">
            <el-button
              type="warning"
              @click="showResetDialog"
              :loading="resetting"
            >
              <el-icon><RefreshLeft /></el-icon>
              重置传感器
            </el-button>
          </div>
        </el-card>
      </el-col>

      <!-- 校准操作 -->
      <el-col :xs="24" :lg="12">
        <el-card class="calibration-card" shadow="never">
          <template #header>
            <span>校准操作</span>
          </template>

          <el-form
            :model="calibrationForm"
            :rules="calibrationRules"
            ref="calibrationFormRef"
            label-width="120px"
          >
            <el-form-item label="校准类型" prop="calibration_type">
              <el-radio-group v-model="calibrationForm.calibration_type">
                <el-radio value="quick">快速校准</el-radio>
                <el-radio value="standard">标准校准</el-radio>
                <el-radio value="full">完整校准</el-radio>
              </el-radio-group>
            </el-form-item>

            <el-form-item label="标准糖度值" prop="standard_brix">
              <el-input-number
                v-model="calibrationForm.standard_brix"
                :min="0"
                :max="30"
                :step="0.1"
                :precision="1"
                controls-position="right"
                style="width: 100%;"
              >
                <template #append>°Bx</template>
              </el-input-number>
            </el-form-item>

            <el-form-item label="参考温度" prop="reference_temperature">
              <el-input-number
                v-model="calibrationForm.reference_temperature"
                :min="15"
                :max="30"
                :step="0.1"
                :precision="1"
                controls-position="right"
                style="width: 100%;"
              >
                <template #append>°C</template>
              </el-input-number>
            </el-form-item>

            <el-form-item label="备注" prop="notes">
              <el-input
                v-model="calibrationForm.notes"
                type="textarea"
                :rows="3"
                placeholder="请输入校准备注..."
              />
            </el-form-item>

            <el-form-item>
              <el-button
                type="primary"
                @click="startCalibration"
                :loading="calibrating"
                style="width: 100%;"
              >
                <el-icon><Tools /></el-icon>
                开始校准
              </el-button>
            </el-form-item>
          </el-form>

          <!-- 校准说明 -->
          <el-alert
            title="校准说明"
            type="info"
            :closable="false"
          >
            <template #default>
              <ul style="margin: 0; padding-left: 20px;">
                <li><strong>快速校准</strong>: 使用单点标准液快速校准 (~2分钟)</li>
                <li><strong>标准校准</strong>: 使用多点标准液进行校准 (~5分钟)</li>
                <li><strong>完整校准</strong>: 全范围多点校准，最高精度 (~10分钟)</li>
              </ul>
            </template>
          </el-alert>
        </el-card>
      </el-col>
    </el-row>

    <!-- 校准历史 -->
    <el-card class="history-card" shadow="never">
      <template #header>
        <div class="card-header">
          <span>校准历史记录</span>
          <el-button size="small" @click="loadCalibrationHistory">
            <el-icon><Refresh /></el-icon>
            刷新
          </el-button>
        </div>
      </template>

      <el-table
        :data="calibrationHistory"
        :loading="historyLoading"
        stripe
      >
        <el-table-column prop="calibration_id" label="校准ID" width="160" />
        <el-table-column prop="calibration_time" label="校准时间" width="160">
          <template #default="{ row }">
            {{ formatTime(row.calibration_time) }}
          </template>
        </el-table-column>
        <el-table-column prop="calibration_type" label="类型" width="100">
          <template #default="{ row }">
            <el-tag :type="getCalibrationTypeTag(row.calibration_type)">
              {{ getCalibrationTypeText(row.calibration_type) }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="before_accuracy" label="校准前精度" width="120" />
        <el-table-column prop="after_accuracy" label="校准后精度" width="120" />
        <el-table-column prop="calibration_factor" label="校准因子" width="100">
          <template #default="{ row }">
            {{ row.calibration_factor?.toFixed(3) }}
          </template>
        </el-table-column>
        <el-table-column prop="notes" label="备注" min-width="150" />
      </el-table>
    </el-card>

    <!-- 重置传感器对话框 -->
    <el-dialog
      v-model="resetDialogVisible"
      title="重置传感器"
      width="400px"
    >
      <el-form :model="resetForm" label-width="100px">
        <el-form-item label="重置类型">
          <el-radio-group v-model="resetForm.reset_type">
            <el-radio value="soft">软重置</el-radio>
            <el-radio value="hard">硬重置</el-radio>
          </el-radio-group>
        </el-form-item>
        <el-form-item label="重置原因">
          <el-input
            v-model="resetForm.reason"
            type="textarea"
            :rows="3"
            placeholder="请输入重置原因..."
          />
        </el-form-item>
      </el-form>

      <template #footer>
        <el-button @click="resetDialogVisible = false">取消</el-button>
        <el-button
          type="warning"
          @click="confirmReset"
          :loading="resetting"
        >
          确认重置
        </el-button>
      </template>
    </el-dialog>

    <!-- 校准进度对话框 -->
    <el-dialog
      v-model="calibrationProgressVisible"
      title="校准进行中"
      width="400px"
      :close-on-click-modal="false"
      :close-on-press-escape="false"
    >
      <div class="calibration-progress">
        <el-progress
          :percentage="calibrationProgress"
          :status="calibrationProgress === 100 ? 'success' : ''"
        />
        <p style="text-align: center; margin-top: 10px;">
          {{ calibrationStatusMessage }}
        </p>
      </div>

      <template #footer>
        <el-button
          @click="calibrationProgressVisible = false"
          :disabled="calibrationProgress < 100"
        >
          关闭
        </el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, computed, onMounted } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import type { FormInstance, FormRules } from 'element-plus'
import {
  Tools,
  Refresh,
  RefreshLeft,
  Warning
} from '@element-plus/icons-vue'
import { useBrixStore } from '@/stores/brix'
import { formatBrix, formatTemperature } from '@/utils/brixValidator'
import { formatTime } from '@/utils/format'
import type { BrixCalibrationRequest } from '@/types/brix'

const brixStore = useBrixStore()

// 响应式数据
const statusLoading = ref(false)
const calibrating = ref(false)
const resetting = ref(false)
const historyLoading = ref(false)
const resetDialogVisible = ref(false)
const calibrationProgressVisible = ref(false)
const calibrationProgress = ref(0)
const calibrationStatusMessage = ref('')

const calibrationFormRef = ref<FormInstance>()
const calibrationForm = reactive<BrixCalibrationRequest>({
  calibration_type: 'standard',
  standard_brix: [
    { required: true, message: '请输入标准糖度值', trigger: 'blur' },
    { type: 'number', min: 0, max: 30, message: '标准糖度值必须在0-30°Bx之间', trigger: 'blur' }
  ],
  reference_temperature: [
    { required: true, message: '请输入参考温度', trigger: 'blur' },
    { type: 'number', min: 15, max: 30, message: '参考温度必须在15-30°C之间', trigger: 'blur' }
  ]
}

// 方法
const refreshStatus = async () => {
  statusLoading.value = true
  try {
    await brixStore.fetchStatus()
  } catch (error) {
    ElMessage.error('获取传感器状态失败')
  } finally {
    statusLoading.value = false
  }
}

const startCalibration = async () => {
  if (!calibrationFormRef.value) return

  try {
    await calibrationFormRef.value.validate()
  } catch {
    return
  }

  try {
    await ElMessageBox.confirm(
      '确定要开始传感器校准吗？校准过程中请不要断电或移动设备。',
      '确认校准',
      {
        confirmButtonText: '开始校准',
        cancelButtonText: '取消',
        type: 'warning'
      }
    )
  } catch {
    return
  }

  calibrating.value = true
  calibrationProgressVisible.value = true
  calibrationProgress.value = 0
  calibrationStatusMessage.value = '准备校准...'

  try {
    // 模拟校准进度
    const progressSteps = [
      { progress: 10, message: '初始化传感器...' },
      { progress: 25, message: '检测标准液...' },
      { progress: 50, message: '进行校准测量...' },
      { progress: 75, message: '计算校准参数...' },
      { progress: 90, message: '应用校准设置...' },
      { progress: 100, message: '校准完成！' }
    ]

    for (const step of progressSteps) {
      await new Promise(resolve => setTimeout(resolve, 1000))
      calibrationProgress.value = step.progress
      calibrationStatusMessage.value = step.message
    }

    const response = await brixStore.calibrateSensor(calibrationForm)

    if (response.success) {
      ElMessage.success('传感器校准成功')
      calibrationForm.notes = ''
      await refreshStatus()
      await loadCalibrationHistory()
    } else {
      throw new Error(response.message)
    }
  } catch (error) {
    ElMessage.error('传感器校准失败')
    calibrationProgress.value = 0
    calibrationStatusMessage.value = '校准失败'
    console.error('Calibration error:', error)
  } finally {
    calibrating.value = false
  }
}

const showResetDialog = () => {
  resetForm.reset_type = 'soft'
  resetForm.reason = ''
  resetDialogVisible.value = true
}

const confirmReset = async () => {
  if (!resetForm.reason.trim()) {
    ElMessage.warning('请输入重置原因')
    return
  }

  resetting.value = true
  try {
    const response = await brixStore.resetSensor(resetForm)

    if (response.success) {
      ElMessage.success('传感器重置成功')
      resetDialogVisible.value = false
      await refreshStatus()
    } else {
      throw new Error(response.message)
    }
  } catch (error) {
    ElMessage.error('传感器重置失败')
    console.error('Reset error:', error)
  } finally {
    resetting.value = false
  }
}

const loadCalibrationHistory = async () => {
  historyLoading.value = true
  try {
    // 这里应该调用获取校准历史的API
    // 暂时使用模拟数据
    calibrationHistory.value = [
      {
        calibration_id: 'CAL_20240115_001',
        calibration_time: new Date().toISOString(),
        calibration_type: 'standard',
        before_accuracy: '±0.15°Bx',
        after_accuracy: '±0.08°Bx',
        calibration_factor: 1.03,
        notes: '定期校准'
      },
      {
        calibration_id: 'CAL_20240108_001',
        calibration_time: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
        calibration_type: 'full',
        before_accuracy: '±0.12°Bx',
        after_accuracy: '±0.06°Bx',
        calibration_factor: 1.01,
        notes: '月度完整校准'
      }
    ]
  } catch (error) {
    ElMessage.error('获取校准历史失败')
  } finally {
    historyLoading.value = false
  }
}

const getCalibrationTypeTag = (type: string) => {
  switch (type) {
    case 'quick': return 'info'
    case 'standard': return 'success'
    case 'full': return 'warning'
    default: return ''
  }
}

const getCalibrationTypeText = (type: string) => {
  switch (type) {
    case 'quick': return '快速'
    case 'standard': return '标准'
    case 'full': return '完整'
    default: return type
  }
}

// 组件挂载时加载数据
onMounted(() => {
  refreshStatus()
  loadCalibrationHistory()
})
</script>

<style scoped>
.calibration-container {
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

.sensor-status-card,
.calibration-card,
.history-card {
  margin-bottom: 20px;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.sensor-actions {
  text-align: center;
}

.calibration-progress {
  padding: 20px 0;
}

:deep(.el-card__header) {
  background: #fafafa;
  border-bottom: 1px solid #f0f0f0;
}

:deep(.el-descriptions-item__label) {
  width: 120px;
}

:deep(.el-form-item__label) {
  font-weight: 600;
}

:deep(.el-progress-bar__outer) {
  background-color: #ebeef5;
}

:deep(.el-alert__content) {
  margin: 0;
}

.el-radio-group {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.el-radio {
  margin-right: 0;
}

@media (max-width: 768px) {
  .calibration-container {
    padding: 10px;
  }

  .el-radio-group {
    flex-direction: row;
    gap: 16px;
  }
}
</style>