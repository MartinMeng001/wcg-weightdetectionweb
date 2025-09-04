<!-- src/components/common/BaseCard.vue - 基础卡片组件 -->
<template>
  <el-card
    class="base-card"
    :class="cardClass"
    :shadow="shadow"
  >
    <template #header v-if="title || $slots.header">
      <div class="card-header">
        <slot name="header">
          <span class="card-title">{{ title }}</span>
        </slot>
        <slot name="extra"></slot>
      </div>
    </template>

    <div class="card-body" :class="bodyClass">
      <slot />
    </div>

    <template #default v-if="$slots.footer">
      <div class="card-footer">
        <slot name="footer" />
      </div>
    </template>
  </el-card>
</template>

<script setup lang="ts">
interface Props {
  title?: string
  shadow?: 'always' | 'hover' | 'never'
  bodyClass?: string
  cardClass?: string
}

withDefaults(defineProps<Props>(), {
  shadow: 'hover'
})
</script>

<style scoped>
.base-card {
  margin-bottom: 20px;
  border: none;
  transition: all 0.3s ease;
}

.base-card:hover {
  transform: translateY(-2px);
}

.card-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.card-title {
  font-size: 16px;
  font-weight: 600;
  color: #303133;
}

.card-body {
  padding: 0;
}

.card-footer {
  padding-top: 16px;
  border-top: 1px solid #f0f0f0;
  margin-top: 16px;
}
</style>