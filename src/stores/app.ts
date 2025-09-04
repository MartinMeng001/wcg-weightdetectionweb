import { defineStore } from 'pinia'
import { ref, computed } from 'vue'

export const useAppStore = defineStore('app', () => {
  // 通知相关
  const notifications = ref([
    {
      id: 1,
      level: 'info',
      message: '系统已启动，所有检测器正常运行',
      timestamp: new Date().toISOString(),
      read: false
    },
    {
      id: 2,
      level: 'warning',
      message: '检测通道2处理速度较慢，请检查设备状态',
      timestamp: new Date(Date.now() - 300000).toISOString(),
      read: false
    }
  ])

  const notificationDrawerVisible = ref(false)
  const aboutDialogVisible = ref(false)

  // 计算属性
  const unreadNotificationCount = computed(() =>
    notifications.value.filter(n => !n.read).length
  )

  // Actions
  const setNotificationDrawerVisible = (visible: boolean) => {
    notificationDrawerVisible.value = visible
  }

  const setAboutDialogVisible = (visible: boolean) => {
    aboutDialogVisible.value = visible
  }

  const markNotificationAsRead = (id: number) => {
    const notification = notifications.value.find(n => n.id === id)
    if (notification) {
      notification.read = true
    }
  }

  const addNotification = (notification: any) => {
    notifications.value.unshift({
      ...notification,
      id: Date.now(),
      timestamp: new Date().toISOString(),
      read: false
    })
  }

  return {
    notifications,
    notificationDrawerVisible,
    aboutDialogVisible,
    unreadNotificationCount,
    setNotificationDrawerVisible,
    setAboutDialogVisible,
    markNotificationAsRead,
    addNotification
  }
})