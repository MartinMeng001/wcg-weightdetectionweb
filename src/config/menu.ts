export interface MenuItem {
  path: string
  name: string
  icon: string
  children?: MenuItem[]
  badge?: string
  disabled?: boolean
}

export const menuConfig: MenuItem[] = [
  {
    path: '/weight/overview',
    name: '实时监控',
    icon: 'Monitor'
  },
  {
    path: '/weight/configuration',
    name: '配置管理',
    icon: 'Setting'
  },
  {
    path: '/weight/records',
    name: '检测记录',
    icon: 'Document'
  }
]

export const systemMenuConfig: MenuItem[] = [
  {
    path: '/system/health',
    name: '系统状态',
    icon: 'Tools',
    badge: '开发中',
    disabled: true
  },
  {
    path: '/system/logs',
    name: '系统日志',
    icon: 'List',
    badge: '开发中',
    disabled: true
  }
]