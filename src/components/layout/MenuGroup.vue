<!-- MenuGroup.vue - 菜单组组件 -->
<template>
  <div class="menu-group">
    <div
      class="menu-title expandable"
      v-show="!collapsed"
      @click="$emit('toggle')"
    >
      {{ title }}
      <el-icon class="expand-icon" :class="{ expanded: expanded }">
        <ArrowRight />
      </el-icon>
    </div>
    <div class="menu-items" :class="{ collapsed: !expanded }">
      <slot />
    </div>
  </div>
</template>

<script setup lang="ts">
import { ArrowRight } from '@element-plus/icons-vue'

// Props
interface Props {
  title: string
  collapsed: boolean
  expanded: boolean
}

defineProps<Props>()

// Emits
defineEmits<{
  toggle: []
}>()
</script>

<style scoped>
.menu-group {
  margin-bottom: 25px;
}

.menu-title.expandable {
  display: flex;
  align-items: center;
  justify-content: space-between;
  cursor: pointer;
  padding: 8px 20px;
  margin-bottom: 0;
  border-radius: 6px;
  transition: all 0.3s ease;
  font-size: 12px;
  color: #95a5a6;
  text-transform: uppercase;
  letter-spacing: 1px;
  font-weight: 600;
}

.menu-title.expandable:hover {
  background: rgba(255, 255, 255, 0.1);
  color: #ecf0f1;
}

.expand-icon {
  font-size: 14px;
  transition: transform 0.3s ease;
}

.expand-icon.expanded {
  transform: rotate(90deg);
}

.menu-items {
  overflow: hidden;
  transition: all 0.4s ease;
  max-height: 1000px;
  opacity: 1;
}

.menu-items.collapsed {
  max-height: 0;
  opacity: 0;
  margin-bottom: 0;
}

/* 侧边栏折叠时的特殊处理 */
:deep(.sidebar.collapsed) .menu-items {
  max-height: 1000px;
  opacity: 1;
}

:deep(.sidebar.collapsed) .menu-title.expandable {
  display: none;
}
</style>