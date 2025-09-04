import { ref, onMounted, onUnmounted } from 'vue'

export function useLayout() {
  const sidebarCollapsed = ref(false)
  const isMobile = ref(false)

  const checkMobile = () => {
    isMobile.value = window.innerWidth < 768
    if (isMobile.value) {
      sidebarCollapsed.value = true
    }
  }

  const toggleSidebar = () => {
    sidebarCollapsed.value = !sidebarCollapsed.value
  }

  onMounted(() => {
    checkMobile()
    window.addEventListener('resize', checkMobile)
  })

  onUnmounted(() => {
    window.removeEventListener('resize', checkMobile)
  })

  return {
    sidebarCollapsed,
    isMobile,
    toggleSidebar
  }
}