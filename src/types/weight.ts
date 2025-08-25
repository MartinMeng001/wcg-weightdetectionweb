// src/types/weight.ts
// 重量配置类型
export interface WeightConfig {
  grade_id: number
  weight_threshold: number
  kick_channel: number
  enabled: boolean
  description?: string
}

// 重量记录类型
export interface WeightRecord {
  id: number
  timestamp: string
  weight: number
  determined_grade: number
  kick_channel: number
  detection_success: boolean
}

// 统计数据类型
export interface WeightStatistics {
  date: string
  grade_id: number
  total_count: number
  weight_sum: number
  weight_avg: number
}

// API响应类型
export interface ApiResponse<T = any> {
  success: boolean
  message: string
  data: T
  timestamp?: string
}

// 实时数据类型
export interface RealtimeData {
  timestamp: string
  latest_records: WeightRecord[]
  today_summary: {
    total_count: number
    by_grade: Record<string, {
      count: number
      avg_weight: number
    }>
  }
  service_status: {
    status: string
    recent_records_count: number
  }
}

// 系统状态类型
export interface SystemStatus {
  status: string
  recent_records_count: number
  last_detection_time: string
  config_info: {
    total_grades: number
    enabled_grades: number
    version: number
    updated_at: string
  }
  performance: {
    detection_count: number
    avg_detection_time: number
    queue_overflow_count: number
    last_detection_time: number
    record_queue_size: number
    statistics_queue_size: number
    recent_records_count: number
    background_threads_running: boolean
  }
}