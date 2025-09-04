// src/types/brix.ts
// 糖度配置类型
export interface BrixConfig {
  grade_id: number
  brix_min: number
  brix_max: number
  kick_channel: number
  enabled: boolean
  description?: string
  color_code?: string
  target_weight_ratio?: number
}

// 糖度记录类型
export interface BrixRecord {
  id: number
  timestamp: string
  brix_value: number
  temperature: number
  determined_grade: number
  kick_channel: number
  detection_success: boolean
  detection_time: number
  quality_score: number
  channel: number
}

// 糖度统计数据类型
export interface BrixStatistics {
  grade_id: number
  grade_name: string
  total_count: number
  brix_sum: number
  brix_avg: number
  brix_min: number
  brix_max: number
  success_rate: number
  weight_ratio: number
  target_ratio: number
}

// 实时糖度数据类型
export interface BrixRealtimeData {
  timestamp: string
  channels: Record<string, {
    current_brix: number | null
    temperature: number
    status: 'measuring' | 'stable' | 'no_sample'
    last_detection: string | null
    raw_data?: {
      refraction_index: number
      light_intensity: number
      calibration_factor: number
    }
  }>
  system_status: {
    active_channels: number
    detection_rate: number
    average_brix: number
    temperature_stable: boolean
  }
}

// 糖度系统状态类型
export interface BrixSystemStatus {
  status: string
  uptime_seconds: number
  sensor_info: {
    model: string
    serial_number: string
    last_calibration: string
    calibration_due: string
    measurement_range: string
    accuracy: string
  }
  performance: {
    detection_count_today: number
    avg_detection_time: number
    success_rate: number
    temperature_stability: string
    light_source_intensity: number
  }
  alerts: Array<{
    level: 'info' | 'warning' | 'error' | 'critical'
    message: string
    timestamp: string
    alert_id: string
  }>
}

// 校准请求类型
export interface BrixCalibrationRequest {
  calibration_type: 'standard' | 'quick' | 'full'
  standard_brix: number
  reference_temperature: number
  notes?: string
}

// 校准响应类型
export interface BrixCalibrationResponse {
  calibration_id: string
  calibration_time: string
  before_accuracy: string
  after_accuracy: string
  calibration_factor: number
  next_calibration_due: string
}

// 报警类型
export interface BrixAlert {
  id: string
  level: 'info' | 'warning' | 'error' | 'critical'
  category: string
  message: string
  timestamp: string
  status: 'active' | 'resolved'
  auto_resolve: boolean
  suggested_action: string
}

// 导出任务类型
export interface BrixExportTask {
  task_id: string
  status: 'processing' | 'completed' | 'failed'
  progress: number
  file_url?: string
  file_size?: number
  records_count: number
  created_at: string
  completed_at?: string
}

// 导出请求类型
export interface BrixExportRequest {
  format: 'excel' | 'csv' | 'json'
  date_range: {
    start: string
    end: string
  }
  include_fields: string[]
  filters?: {
    min_brix?: number
    max_brix?: number
    success_only?: boolean
  }
}