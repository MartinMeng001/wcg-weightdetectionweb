// src/composables/useDetector.ts
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { ElMessage } from 'element-plus'

// 检测器通用组合函数
export function useDetector(apiService: any, refreshInterval = 5000) {
  const loading = ref(false)
  const error = ref<string | null>(null)
  const data = ref<any>(null)
  const lastUpdateTime = ref<Date | null>(null)

  let refreshTimer: NodeJS.Timeout | null = null

  // 计算属性
  const isOnline = computed(() => {
    if (!lastUpdateTime.value) return false
    const now = new Date()
    const timeDiff = now.getTime() - lastUpdateTime.value.getTime()
    return timeDiff < refreshInterval * 2 // 如果超过2个刷新周期没更新，认为离线
  })

  const timeFromLastUpdate = computed(() => {
    if (!lastUpdateTime.value) return '从未更新'
    const now = new Date()
    const diffMs = now.getTime() - lastUpdateTime.value.getTime()
    const diffSeconds = Math.floor(diffMs / 1000)

    if (diffSeconds < 60) return `${diffSeconds}秒前`
    if (diffSeconds < 3600) return `${Math.floor(diffSeconds / 60)}分钟前`
    return `${Math.floor(diffSeconds / 3600)}小时前`
  })

  // 获取数据
  const fetchData = async () => {
    loading.value = true
    error.value = null

    try {
      const response = await apiService.getRealtime()
      if (response.success) {
        data.value = response.data
        lastUpdateTime.value = new Date()
      } else {
        error.value = response.message || '获取数据失败'
      }
    } catch (err) {
      error.value = '网络连接失败'
      console.error('Fetch data error:', err)
    } finally {
      loading.value = false
    }
  }

  // 开始自动刷新
  const startAutoRefresh = () => {
    if (refreshTimer) return

    refreshTimer = setInterval(() => {
      fetchData()
    }, refreshInterval)
  }

  // 停止自动刷新
  const stopAutoRefresh = () => {
    if (refreshTimer) {
      clearInterval(refreshTimer)
      refreshTimer = null
    }
  }

  // 手动刷新
  const refresh = async () => {
    await fetchData()
    ElMessage.success('数据已刷新')
  }

  // 重置状态
  const reset = () => {
    stopAutoRefresh()
    data.value = null
    error.value = null
    lastUpdateTime.value = null
    loading.value = false
  }

  // 组件挂载时开始
  onMounted(() => {
    fetchData()
    startAutoRefresh()
  })

  // 组件卸载时清理
  onUnmounted(() => {
    stopAutoRefresh()
  })

  return {
    loading,
    error,
    data,
    lastUpdateTime,
    isOnline,
    timeFromLastUpdate,
    fetchData,
    startAutoRefresh,
    stopAutoRefresh,
    refresh,
    reset
  }
}