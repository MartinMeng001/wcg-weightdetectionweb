<!-- AppSidebar.vue - 应用侧边栏组件 -->
<template>
  <div class="sidebar" :class="{ collapsed: collapsed }">
    <!-- Logo区域 -->
    <div class="logo-section">
      <div class="logo">
        <el-icon class="logo-icon"><TrendCharts /></el-icon>
        <span class="logo-text" v-show="!collapsed">工业检测系统</span>
      </div>
      <div class="version" v-show="!collapsed">v2.0.0</div>
    </div>

    <!-- 菜单容器 -->
    <div class="menu-container">
      <!-- 系统概览 -->
      <div class="menu-group">
        <div class="menu-title" v-show="!collapsed">系统概览</div>
        <div
          class="menu-item"
          :class="{ active: activeView === 'overview' }"
          @click="$emit('set-active-view', 'overview')"
        >
          <el-icon><DataAnalysis /></el-icon>
          <span v-show="!collapsed">多检测器概览</span>
        </div>
      </div>

      <!-- 重量检测器 -->
      <MenuGroup
        title="重量检测器"
        :collapsed="collapsed"
        :expanded="weightMenuExpanded"
        @toggle="toggleWeightMenu"
      >
        <MenuItem
          icon="Crop"
          text="实时监控"
          view="weight-overview"
          :active="activeView === 'weight-overview'"
          :collapsed="collapsed"
          :badge="weightSystemOnline ? '运行中' : null"
          @click="$emit('set-active-view', 'weight-overview')"
        />
        <MenuItem
          icon="Setting"
          text="配置管理"
          view="weight-config"
          :active="activeView === 'weight-config'"
          :collapsed="collapsed"
          @click="$emit('set-active-view', 'weight-config')"
        />
        <MenuItem
          icon="Document"
          text="检测记录"
          view="weight-records"
          :active="activeView === 'weight-records'"
          :collapsed="collapsed"
          @click="$emit('set-active-view', 'weight-records')"
        />
      </MenuGroup>

      <!-- 糖度检测器 -->
      <MenuGroup
        title="糖度检测器"
        :collapsed="collapsed"
        :expanded="brixMenuExpanded"
        @toggle="toggleBrixMenu"
      >
        <MenuItem
          icon="Cherry"
          text="糖度监控"
          view="brix-overview"
          :active="activeView === 'brix-overview'"
          :collapsed="collapsed"
          :badge="brixSystemOnline ? '运行中' : null"
          @click="$emit('set-active-view', 'brix-overview')"
        />
        <MenuItem
          icon="Setting"
          text="糖度配置"
          view="brix-config"
          :active="activeView === 'brix-config'"
          :collapsed="collapsed"
          @click="$emit('set-active-view', 'brix-config')"
        />
        <MenuItem
          icon="Tickets"
          text="糖度记录"
          view="brix-records"
          :active="activeView === 'brix-records'"
          :collapsed="collapsed"
          @click="$emit('set-active-view', 'brix-records')"
        />
        <MenuItem
          icon="Tools"
          text="传感器校准"
          view="brix-calibration"
          :active="activeView === 'brix-calibration'"
          :collapsed="collapsed"
          @click="$emit('set-active-view', 'brix-calibration')"
        />
        <MenuItem
          icon="Bell"
          text="报警管理"
          view="brix-alerts"
          :active="activeView === 'brix-alerts'"
          :collapsed="collapsed"
          @click="$emit('set-active-view', 'brix-alerts')"
        />
      </MenuGroup>
    </div>

    <!-- 折叠按钮 -->
    <div class="sidebar-toggle" @click="$emit('toggle-sidebar')">
      <el-icon>
        <component :is="collapsed ? 'Expand' : 'Fold'" />
      </el-icon>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import {
  TrendCharts,
  DataAnalysis,
  Expand,
  Fold
} from '@element-plus/icons-vue'
import MenuGroup from './MenuGroup.vue'
import MenuItem from './MenuItem.vue'

// Props
interface Props {
  collapsed: boolean
  activeView: string
  weightSystemOnline: boolean
  brixSystemOnline: boolean
}

defineProps<Props>()

// Emits
defineEmits<{
  'toggle-sidebar': []
  'set-active-view': [view: string]
}>()

// 菜单展开状态
const weightMenuExpanded = ref(true)
const brixMenuExpanded = ref(true)

// 方法
const toggleWeightMenu = () => {
  weightMenuExpanded.value = !weightMenuExpanded.value
}

const toggleBrixMenu = () => {
  brixMenuExpanded.value = !brixMenuExpanded.value
}
</script>

<style scoped>
.sidebar {
  width: 260px;
  background: #2c3e50;
  color: #ecf0f1;
  display: flex;
  flex-direction: column;
  box-shadow: 2px 0 8px rgba(0,0,0,0.1);
  transition: width 0.3s ease;
  position: relative;
}

.sidebar.collapsed {
  width: 64px;
}

.logo-section {
  padding: 25px 20px;
  text-align: center;
  border-bottom: 1px solid #34495e;
}

.logo {
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 10px;
}

.logo-icon {
  font-size: 32px;
  color: #3498db;
  margin-right: 12px;
}

.sidebar.collapsed .logo-icon {
  margin-right: 0;
}

.logo-text {
  font-size: 22px;
  font-weight: 700;
}

.version {
  font-size: 12px;
  color: #95a5a6;
}

.menu-container {
  flex: 1;
  padding: 20px 0;
  overflow-y: auto;
}

.menu-group {
  margin-bottom: 25px;
}

.menu-title {
  padding: 0 20px 10px;
  font-size: 12px;
  color: #95a5a6;
  text-transform: uppercase;
  letter-spacing: 1px;
  font-weight: 600;
}

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

.sidebar.collapsed .menu-item {
  padding: 12px 22px;
  justify-content: center;
}

.sidebar.collapsed .menu-item .el-icon {
  margin-right: 0;
}

.sidebar-toggle {
  position: absolute;
  bottom: 20px;
  left: 50%;
  transform: translateX(-50%);
  width: 32px;
  height: 32px;
  background: #34495e;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.3s ease;
}

.sidebar-toggle:hover {
  background: #3498db;
}

/* 滚动条样式 */
.menu-container::-webkit-scrollbar {
  width: 6px;
}

.menu-container::-webkit-scrollbar-track {
  background: transparent;
}

.menu-container::-webkit-scrollbar-thumb {
  background: #34495e;
  border-radius: 3px;
}

.menu-container::-webkit-scrollbar-thumb:hover {
  background: #999;
}

/* 响应式设计 */
@media (max-width: 1024px) {
  .sidebar:not(.collapsed) {
    width: 200px;
  }
}

@media (max-width: 768px) {
  .sidebar {
    width: 64px;
  }

  .sidebar .menu-title,
  .sidebar .logo-text,
  .sidebar .version {
    display: none;
  }

  .sidebar .menu-item {
    padding: 12px 22px;
    justify-content: center;
  }

  .sidebar .menu-item .el-icon {
    margin-right: 0;
  }
}
</style>