# 重量检测系统 - Web前端

基于 Vue 3 + TypeScript + Element Plus 开发的重量检测系统前端界面。

## 功能特性

- 🔍 **实时监控概览** - 实时重量数据监控和状态展示
- ⚙️ **配置管理** - 重量分级配置和参数设置
- 📊 **检测记录** - 历史检测数据查询和统计

## 技术栈

- Vue 3 + TypeScript
- Element Plus UI组件库
- Pinia 状态管理
- Vue Router 路由管理
- ECharts 图表展示
- Axios HTTP客户端
- Vite 构建工具

## 快速开始

### 安装依赖
```bash
npm install
```

### 开发环境运行
```bash
npm run dev
```

### 构建生产版本
```bash
npm run build
```

### 代码检查
```bash
npm run lint
```

## 项目结构

```
src/
├── api/           # API接口层
├── components/    # 通用组件
├── views/         # 页面组件
│   └── weight/    # 重量检测器页面
├── stores/        # Pinia状态管理
├── types/         # TypeScript类型定义
├── utils/         # 工具函数
└── router/        # 路由配置
```

## 开发说明

1. 确保后端API服务运行在 `http://localhost:5000`
2. 前端开发服务器默认端口 `3000`
3. 支持热重载和自动导入

## 扩展支持

项目架构支持未来添加其他类型的检测器（温度、尺寸等），只需按照现有模式扩展即可。

