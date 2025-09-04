<!-- src/components/layout/AboutDialog.vue - 关于对话框 -->
<template>
  <el-dialog v-model="visible" title="关于系统" width="500px">
    <div class="about-content">
      <div class="about-logo">
        <el-icon class="about-icon"><ScaleToOriginal /></el-icon>
        <h3>重量检测系统</h3>
      </div>
      <el-descriptions :column="1" border>
        <el-descriptions-item label="版本">v1.0.0</el-descriptions-item>
        <el-descriptions-item label="构建时间">{{ buildTime }}</el-descriptions-item>
        <el-descriptions-item label="技术栈">Vue 3 + TypeScript + Element Plus</el-descriptions-item>
        <el-descriptions-item label="开发者">Weight Detection Team</el-descriptions-item>
        <el-descriptions-item label="许可证">MIT License</el-descriptions-item>
      </el-descriptions>
      <div class="about-footer">
        <p>专业的工业级重量检测解决方案</p>
      </div>
    </div>
    <template #footer>
      <el-button @click="visible = false">关闭</el-button>
      <el-button type="primary" @click="checkUpdate">检查更新</el-button>
    </template>
  </el-dialog>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { ElMessage } from 'element-plus'
import { ScaleToOriginal } from '@element-plus/icons-vue'
import { useAppStore } from '@/stores/app'

const appStore = useAppStore()
const buildTime = ref('2024-01-15 10:00:00')

const visible = computed({
  get: () => appStore.aboutDialogVisible,
  set: (value) => appStore.setAboutDialogVisible(value)
})

const checkUpdate = () => {
  ElMessage.info('当前已是最新版本')
}
</script>

<style scoped>
.about-content {
  text-align: center;
}

.about-logo {
  margin-bottom: 20px;
}

.about-icon {
  font-size: 48px;
  color: #3498db;
  margin-bottom: 10px;
}

.about-footer {
  margin-top: 20px;
  padding-top: 20px;
  border-top: 1px solid #eee;
}

.about-footer p {
  color: #666;
  font-style: italic;
  margin: 0;
}
</style>