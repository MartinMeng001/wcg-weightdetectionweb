// src/stores/weight.ts
import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { weightAPI } from '@/api/weight'
import type { WeightConfig, WeightRecord, WeightStatistics, ApiResponse } from '@/types/weight'

export const useWeightStore = defineStore('weight', () => {
  // 状态
  const config = ref<WeightConfig[]>([])
  const configVersion = ref<number>(1)
  const configLoading = ref<boolean>(false)

  const records = ref<WeightRecord[]>([])
  const recordsLoading = ref<boolean>(false)
  const recordsTotal = ref<number>(0)

  const realtimeData = ref<any>(null)
  const realtimeLoading = ref<boolean>(false)

  const statistics = ref<WeightStatistics[]>([])
  const statisticsLoading = ref<boolean>(false)

  const systemStatus = ref<any>(null)
  const statusLoading = ref<boolean>(false)

  // Getters
  const enabledConfigs = computed(() =>
    config.value.filter(c => c.enabled)
  )

  const sortedConfigs = computed(() =>
    [...config.value].sort((a, b) => a.weight_threshold - b.weight_threshold)
  )

  const latestRecords = computed(() =>
    records.value.slice(0, 10)
  )

  const totalDetectionCount = computed(() =>
    statistics.value.reduce((sum, stat) => sum + stat.total_count, 0)
  )

  const averageWeight = computed(() => {
    if (statistics.value.length === 0) return 0
    const totalWeight = statistics.value.reduce((sum, stat) => sum + stat.weight_sum, 0)
    const totalCount = statistics.value.reduce((sum, stat) => sum + stat.total_count, 0)
    return totalCount > 0 ? totalWeight / totalCount : 0
  })

  const isSystemOnline = computed(() =>
    systemStatus.value?.status === 'active'
  )

  // Actions - 配置管理
  const fetchConfig = async (): Promise<ApiResponse> => {
    configLoading.value = true
    try {
      const response = await weightAPI.getConfig()
      if (response.success && response.data) {
        config.value = response.data.configs || []
        configVersion.value = response.data.version || 1
      }
      return response
    } catch (error) {
      console.error('获取配置失败:', error)
      throw error
    } finally {
      configLoading.value = false
    }
  }

  const updateConfig = async (newConfigs: WeightConfig[]): Promise<ApiResponse> => {
    configLoading.value = true
    try {
      const response = await weightAPI.updateConfig(newConfigs)
      if (response.success) {
        config.value = newConfigs
        configVersion.value = response.data?.version || configVersion.value + 1
      }
      return response
    } catch (error) {
      console.error('更新配置失败:', error)
      throw error
    } finally {
      configLoading.value = false
    }
  }

  const validateConfig = async (configs: WeightConfig[]): Promise<ApiResponse> => {
    try {
      const response = await weightAPI.validateConfig(configs)
      return response
    } catch (error) {
      console.error('验证配置失败:', error)
      throw error
    }
  }

  // Actions - 记录管理
  const fetchRecords = async (limit = 100): Promise<ApiResponse> => {
    recordsLoading.value = true
    try {
      const response = await weightAPI.getRecords(limit)
      if (response.success && response.data) {
        records.value = response.data.records || []
        recordsTotal.value = response.data.total || records.value.length
      }
      return response
    } catch (error) {
      console.error('获取记录失败:', error)
      throw error
    } finally {
      recordsLoading.value = false
    }
  }

  const addRecord = (record: WeightRecord) => {
    records.value.unshift(record)
    recordsTotal.value += 1

    // 保持记录数量限制
    if (records.value.length > 1000) {
      records.value = records.value.slice(0, 1000)
    }
  }

  const deleteRecord = (recordId: number) => {
    const index = records.value.findIndex(r => r.id === recordId)
    if (index > -1) {
      records.value.splice(index, 1)
      recordsTotal.value -= 1
    }
  }

  const clearRecords = () => {
    records.value = []
    recordsTotal.value = 0
  }

  // Actions - 实时数据
  const fetchRealtime = async (): Promise<ApiResponse> => {
    realtimeLoading.value = true
    try {
      const response = await weightAPI.getRealtime()
      if (response.success) {
        realtimeData.value = response.data

        // 更新最新记录
        if (response.data?.latest_records) {
          const latestFromApi = response.data.latest_records
          if (latestFromApi.length > 0) {
            // 合并新数据到现有记录中
            const existingIds = new Set(records.value.map(r => r.id))
            const newRecords = latestFromApi.filter((r: any) => !existingIds.has(r.id))

            if (newRecords.length > 0) {
              records.value = [...newRecords, ...records.value].slice(0, 1000)
            }
          }
        }
      }
      return response
    } catch (error) {
      console.error('获取实时数据失败:', error)
      throw error
    } finally {
      realtimeLoading.value = false
    }
  }

  const updateRealtimeData = (data: any) => {
    realtimeData.value = { ...realtimeData.value, ...data }
  }

  // Actions - 统计数据
  const fetchStatistics = async (date?: string): Promise<ApiResponse> => {
    statisticsLoading.value = true
    try {
      const response = await weightAPI.getStatistics(date)
      if (response.success && response.data) {
        statistics.value = response.data.statistics || []
      }
      return response
    } catch (error) {
      console.error('获取统计数据失败:', error)
      throw error
    } finally {
      statisticsLoading.value = false
    }
  }

  const updateStatistics = (newStats: WeightStatistics[]) => {
    statistics.value = newStats
  }

  // Actions - 系统状态
  const fetchStatus = async (): Promise<ApiResponse> => {
    statusLoading.value = true
    try {
      const response = await weightAPI.getStatus()
      if (response.success) {
        systemStatus.value = response.data
      }
      return response
    } catch (error) {
      console.error('获取系统状态失败:', error)
      throw error
    } finally {
      statusLoading.value = false
    }
  }

  const updateSystemStatus = (status: any) => {
    systemStatus.value = { ...systemStatus.value, ...status }
  }

  // Actions - 批量操作
  const refreshAllData = async () => {
    const promises = [
      fetchConfig(),
      fetchRecords(),
      fetchRealtime(),
      fetchStatistics(),
      fetchStatus()
    ]

    try {
      await Promise.allSettled(promises)
    } catch (error) {
      console.error('批量刷新数据失败:', error)
    }
  }

  const resetStore = () => {
    config.value = []
    configVersion.value = 1
    records.value = []
    recordsTotal.value = 0
    realtimeData.value = null
    statistics.value = []
    systemStatus.value = null
  }

  // Actions - 数据导出
  const exportData = (type: 'config' | 'records' | 'statistics', data?: any) => {
    let exportData: any
    let filename: string

    switch (type) {
      case 'config':
        exportData = data || config.value
        filename = `weight-config-${new Date().toISOString().split('T')[0]}.json`
        break
      case 'records':
        exportData = data || records.value
        filename = `weight-records-${new Date().toISOString().split('T')[0]}.json`
        break
      case 'statistics':
        exportData = data || statistics.value
        filename = `weight-statistics-${new Date().toISOString().split('T')[0]}.json`
        break
      default:
        throw new Error('不支持的导出类型')
    }

    const dataStr = JSON.stringify(exportData, null, 2)
    const dataBlob = new Blob([dataStr], { type: 'application/json' })
    const url = URL.createObjectURL(dataBlob)
    const link = document.createElement('a')
    link.href = url
    link.download = filename
    link.click()
    URL.revokeObjectURL(url)
  }

  // Actions - 数据处理工具
  const determineGrade = (weight: number): number => {
    const sortedEnabled = enabledConfigs.value.sort((a, b) => a.weight_threshold - b.weight_threshold)

    for (let i = 0; i < sortedEnabled.length; i++) {
      if (weight < sortedEnabled[i].weight_threshold) {
        return sortedEnabled[i].grade_id
      }
    }

    // 如果超过所有阈值，返回最高级别
    return sortedEnabled.length > 0 ? sortedEnabled[sortedEnabled.length - 1].grade_id : 1
  }

  const getConfigByGrade = (gradeId: number): WeightConfig | undefined => {
    return config.value.find(c => c.grade_id === gradeId)
  }

  const getRecordsByDateRange = (startDate: Date, endDate: Date): WeightRecord[] => {
    return records.value.filter(record => {
      const recordDate = new Date(record.timestamp)
      return recordDate >= startDate && recordDate <= endDate
    })
  }

  const getRecordsByGrade = (gradeId: number): WeightRecord[] => {
    return records.value.filter(record => record.determined_grade === gradeId)
  }

  const getSuccessRate = (): number => {
    if (records.value.length === 0) return 0
    const successCount = records.value.filter(record => record.detection_success).length
    return (successCount / records.value.length) * 100
  }

  const getDetectionFrequency = (timeRangeMinutes = 60): number => {
    const now = new Date()
    const timeRangeStart = new Date(now.getTime() - timeRangeMinutes * 60000)

    const recentRecords = records.value.filter(record =>
      new Date(record.timestamp) >= timeRangeStart
    )

    return recentRecords.length / (timeRangeMinutes / 60) // 每小时频率
  }

  // 返回 store
  return {
    // State
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

    // Getters
    enabledConfigs,
    sortedConfigs,
    latestRecords,
    totalDetectionCount,
    averageWeight,
    isSystemOnline,

    // Actions - 配置
    fetchConfig,
    updateConfig,
    validateConfig,

    // Actions - 记录
    fetchRecords,
    addRecord,
    deleteRecord,
    clearRecords,

    // Actions - 实时数据
    fetchRealtime,
    updateRealtimeData,

    // Actions - 统计
    fetchStatistics,
    updateStatistics,

    // Actions - 系统状态
    fetchStatus,
    updateSystemStatus,

    // Actions - 批量操作
    refreshAllData,
    resetStore,

    // Actions - 工具函数
    exportData,
    determineGrade,
    getConfigByGrade,
    getRecordsByDateRange,
    getRecordsByGrade,
    getSuccessRate,
    getDetectionFrequency
  }
})