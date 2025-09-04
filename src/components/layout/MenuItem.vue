<!-- MenuItem.vue - 菜单项组件 -->
<template>
  <div
    class="menu-item"
    :class="{ active: active }"
    @click="$emit('click')"
  >
    <el-icon>
      <component :is="icon" />
    </el-icon>
    <span v-show="!collapsed">{{ text }}</span>
    <span
      v-if="badge && !collapsed"
      class="detector-badge"
    >
      {{ badge }}
    </span>
  </div>
</template>

<script setup lang="ts">
// Props
interface Props {
  icon: string
  text: string
  view: string
  active: boolean
  collapsed: boolean
  badge?: string | null
}

defineProps<Props>()

// Emits
defineEmits<{
  click: []
}>()
</script>

<style scoped>
.menu-item {
  display: flex;
  align-items: center;
  padding: 12px 20px;
  color: #bdc3c7;
  cursor: pointer;
  transition: all 0.3s ease;
  position: relative;
}

.menu-item:hover {
  background: #34495e;
  color: #ecf0f1;
}

.menu-item.active {
  background: #3498db;
  color: white;
}

.menu-item.active::after {
  content: '';
  position: absolute;
  right: 0;
  top: 0;
  bottom: 0;
  width: 4px;
  background: #2980b9;
}

.menu-item .el-icon {
  width: 20px;
  margin-right: 12px;
  font-size: 16px;
}

.detector-badge {
  margin-left: auto;
  font-size: 10px;
  padding: 2px 8px;
  border-radius: 10px;
  background: rgba(46, 204, 113, 0.2);
  color: #2ecc71;
}

/* 折叠状态样式 */
.sidebar.collapsed .menu-item {
  padding: 12px 22px;
  justify-content: center;
}

.sidebar.collapsed .menu-item .el-icon {
  margin-right: 0;
}
</style>