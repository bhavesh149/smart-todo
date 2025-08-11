// Type definitions for the Smart Todo application

export interface Task {
  id: number
  title: string
  description: string
  priority_score: number
  deadline: string | null
  status: 'Pending' | 'In Progress' | 'Completed'
  category: number
  category_name?: string
  created_at: string
  updated_at: string
}

export interface Category {
  id: number
  name: string
  usage_count: number
  color: string
  description: string
}

export interface ProcessedInsights {
  keywords?: string[]
  action_verbs?: string[]
  common_themes?: string[]
  sentiment_score?: number
  time_references?: string[]
  urgency_indicators?: string[]
  suggested_tasks?: Array<{
    title: string
    priority_score: number
    category: string
    deadline?: string
  }>
  [key: string]: unknown
}

export interface ContextEntry {
  id: number
  content: string
  source_type: 'WhatsApp' | 'Email' | 'Notes'
  processed_insights?: ProcessedInsights | string
  created_at: string
}

export interface CreateTaskDto {
  title: string
  description: string
  category: number
  priority_score: number
  deadline?: string
  status: 'Pending' | 'In Progress' | 'Completed'
  enhance_with_ai?: boolean
}

export interface PaginatedResponse<T> {
  count: number
  next: string | null
  previous: string | null
  results: T[]
}

export interface ApiError {
  message: string
  status: number
  details?: Record<string, string[]>
}
