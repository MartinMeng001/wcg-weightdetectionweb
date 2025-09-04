// src/stores/brix.ts
import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { brixAPI } from '@/api/brix'
import type {
  BrixConfig,
  BrixRecord,
  BrixStatistics,
  BrixRealtimeData,
  BrixSystemStatus,
  BrixAlert
} from '@/types/brix'
import type {
  ApiResponse
} from '@/types/weight'

export const useBrixStore = defineStore('brix', () => {
  // 状态
  const config = ref<BrixConfig[]>([])
  const configVersion = ref<number>(1)
  const configLoading = ref<boolean>(false)

  const records = ref<BrixRecord[]>([])
  const recordsLoading = ref<boolean>(false)
  const recordsTotal = ref<number>(0)

  const realtimeData = ref<BrixRealtimeData | null>(null)
  const realtimeLoading = ref<boolean>(false)

  const statistics = ref<BrixStatistics[]>([])
  const statisticsLoading = ref<boolean>(false)

  const systemStatus = ref<BrixSystemStatus | null>(null)
  const statusLoading = ref<boolean>(false)

  const alerts = ref<BrixAlert[]>([])
  const alertsLoading = ref<boolean>(false)

  // Getters
  const enabledConfigs = computed(() =>
    config.value.filter(c => c.enabled)
  )

  const sortedConfigs = computed(() =>
    [...config.value].sort((a, b) => a.brix_min - b.brix_min)
  )

  const latestRecords = computed(() =>
    records.value.slice(0, 10)
  )

  const totalDetectionCount = computed(() =>
    statistics.value.reduce((sum, stat) => sum + stat.total_count, 0)
  )

  const averageBrix = computed(() => {
    if (statistics.value.length === 0) return 0
    const totalBrix = statistics.value.reduce((sum, stat) => sum + stat.brix_sum, 0)
    const totalCount = statistics.value.reduce((sum, stat) => sum + stat.total_count, 0)
    return totalCount > 0 ? totalBrix / totalCount : 0
  })

  const isSystemOnline = computed(() =>
    systemStatus.value?.status === 'active'
  )

  const activeAlerts = computed(() =>
    alerts.value.filter(alert => alert.status === 'active')
  )

  const criticalAlerts = computed(() =>
    activeAlerts.value.filter(alert => alert.level === 'critical' || alert.level === 'error')
  )

  // Actions - 配置管理
  const fetchConfig = async (): Promise<ApiResponse> => {
    configLoading.value = true
    try {
      const response = await brixAPI.getConfig()
      if (response.success && response.data) {
        config.value = response.data.configs || []
        configVersion.value = response.data.version || 1
      }
      return response
    } catch (error) {
      console.error('获取糖度配置失败:', error)
      throw error
    } finally {
      configLoading.value = false
    }
  }

  const updateConfig = async (newConfigs: BrixConfig[]): Promise<ApiResponse> => {
    configLoading.value = true
    try {
      const response = await brixAPI.updateConfig(newConfigs)
      if (response.success) {
        config.value = newConfigs
        configVersion.value = response.data?.version || configVersion.value + 1
      }
      return response
    } catch (error) {
      console.error('更新糖度配置失败:', error)
      throw error
    } finally {
      configLoading.value = false
    }
  }

  const validateConfig = async (configs: BrixConfig[]): Promise<ApiResponse> => {
    try {
      return await brixAPI.validateConfig(configs)
    } catch (error) {
      console.error('验证糖度配置失败:', error)
      throw error
    }
  }

  // Actions - 实时数据
  const fetchRealtime = async (params?: any): Promise<ApiResponse> => {
    realtimeLoading.value = true
    try {
      const response = await brixAPI.getRealtime(params)
      if (response.success && response.data) {
        realtimeData.value = response.data
      }
      return response
    } catch (error) {
      console.error('获取实时糖度数据失败:', error)
      throw error
    } finally {
      realtimeLoading.value = false
    }
  }

  const fetchStatus = async (): Promise<ApiResponse> => {
    statusLoading.value = true
    try {
      const response = await brixAPI.getStatus()
      if (response.success && response.data) {
        systemStatus.value = response.data
      }
      return response
    } catch (error) {
      console.error('获取糖度系统状态失败:', error)
      throw error
    } finally {
      statusLoading.value = false
    }
  }

  // Actions - 历史记录
  const fetchRecords = async (params?: any): Promise<ApiResponse> => {
    recordsLoading.value = true
    try {
      const response = await brixAPI.getRecords(params)
      if (response.success && response.data) {
        records.value = response.data.records || []
        recordsTotal.value = response.data.total || records.value.length
      }
      return response
    } catch (error) {
      console.error('获取糖度记录失败:', error)
      throw error
    } finally {
      recordsLoading.value = false
    }
  }

  // Actions - 统计数据
  const fetchStatistics = async (params?: any): Promise<ApiResponse> => {
    statisticsLoading.value = true
    try {
      const response = await brixAPI.getStatistics(params)
      if (response.success && response.data) {
        statistics.value = response.data.statistics || []
      }
      return response
    } catch (error) {
      console.error('获取糖度统计失败:', error)
      throw error
    } finally {
      statisticsLoading.value = false
    }
  }

  // Actions - 报警管理
  const fetchAlerts = async (params?: any): Promise<ApiResponse> => {
    alertsLoading.value = true
    try {
      const response = await brixAPI.getAlerts(params)
      if (response.success && response.data) {
        alerts.value = response.data.alerts || []
      }
      return response
    } catch (error) {
      console.error('获取糖度报警失败:', error)
      throw error
    } finally {
      alertsLoading.value = false
    }
  }

  const resolveAlert = async (alertId: string, resolution: {
    resolution: string
    resolved_by: string
  }): Promise<ApiResponse> => {
    try {
      const response = await brixAPI.resolveAlert(alertId, resolution)
      if (response.success) {
        // 更新本地状态
        const alertIndex = alerts.value.findIndex(alert => alert.id === alertId)
        if (alertIndex !== -1) {
          alerts.value[alertIndex].status = 'resolved'
        }
      }
      return response
    } catch (error) {
      console.error('解决糖度报警失败:', error)
      throw error
    }
  }

  // Actions - 设备控制
  const calibrateSensor = async (data: any): Promise<ApiResponse> => {
    try {
      const response = await brixAPI.calibrateSensor(data)
      if (response.success) {
        // 重新获取系统状态
        await fetchStatus()
      }
      return response
    } catch (error) {
      console.error('糖度传感器校准失败:', error)
      throw error
    }
  }

  const resetSensor = async (data: any): Promise<ApiResponse> => {
    try {
      const response = await brixAPI.resetSensor(data)
      if (response.success) {
        // 重新获取系统状态
        await fetchStatus()
      }
      return response
    } catch (error) {
      console.error('糖度传感器重置失败:', error)
      throw error
    }
  }

  // 重置所有状态
  const resetState = () => {
    config.value = []
    configVersion.value = 1
    records.value = []
    recordsTotal.value = 0
    realtimeData.value = null
    statistics.value = []
    systemStatus.value = null
    alerts.value = []
  }

  return {
    // 状态
    config,
    configVersion,
    configLoading,
    records,
    recordsLoading,
    recordsTotal,
    realtimeData,
    realtimeLoading,
    statistics,
    statisticsLoading,
    systemStatus,
    statusLoading,
    alerts,
    alertsLoading,

    // 计算属性
    enabledConfigs,
    sortedConfigs,
    latestRecords,
    totalDetectionCount,
    averageBrix,
    isSystemOnline,
    activeAlerts,
    criticalAlerts,

    // 方法
    fetchConfig,
    updateConfig,
    validateConfig,
    fetchRealtime,
    fetchStatus,
    fetchRecords,
    fetchStatistics,
    fetchAlerts,
    resolveAlert,
    calibrateSensor,
    resetSensor,
    resetState
  }
})