import axios from 'axios'
import type { Task, Category, ContextEntry } from './store'

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://127.0.0.1:8001/api'

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
})

// Request interceptor for debugging
api.interceptors.request.use((config) => {
  console.log(`API Request: ${config.method?.toUpperCase()} ${config.url}`)
  return config
})

// Response interceptor for error handling
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response) {
      // Server responded with error status
      console.error('API Error - Status:', error.response.status)
      console.error('API Error - Data:', error.response.data)
      console.error('API Error - URL:', error.config?.url)
      console.error('API Error - Method:', error.config?.method)
    } else if (error.request) {
      // Request was made but no response received
      console.error('API Error - No response received:', error.message)
    } else {
      // Something else happened
      console.error('API Error - Request setup:', error.message)
    }
    throw error
  }
)

export interface CreateTaskData {
  title: string
  description: string
  category?: number
  priority_score: number
  deadline?: string
  status?: string
  enhance_with_ai?: boolean
}

export interface CreateCategoryData {
  name: string
  description?: string
  color?: string
}

export interface CreateContextData {
  content: string
  source_type: 'WhatsApp' | 'Email' | 'Notes'
}

export interface AIRequest {
  task_description: string
  context?: string
  suggestion_type: 'prioritization' | 'categorization' | 'deadline' | 'enhancement'
}

export interface AIResponse {
  enhanced_description?: string
  suggested_category?: string
  suggested_deadline?: string
  suggested_priority?: number
  suggestions?: string[]
}

export interface TasksResponse {
  count: number
  next: string | null
  previous: string | null
  results: Task[]
}

export interface CategoriesResponse {
  count: number
  next: string | null
  previous: string | null
  results: Category[]
}

export interface ContextResponse {
  count: number
  next: string | null
  previous: string | null
  results: ContextEntry[]
}

export interface Stats {
  total_tasks: number
  pending_tasks: number
  in_progress_tasks: number
  completed_tasks: number
  high_priority_tasks: number
  overdue_tasks: number
  categories_count: number
  context_entries_count: number
}

// Task API
export const tasksApi = {
  getAll: () => api.get<TasksResponse>('/tasks/'),
  getById: (id: number) => api.get<Task>(`/tasks/${id}/`),
  create: (data: CreateTaskData) => api.post<Task>('/tasks/', data),
  update: (id: number, data: Partial<CreateTaskData>) => api.put<Task>(`/tasks/${id}/`, data),
  delete: (id: number) => api.delete(`/tasks/${id}/`),
}

// Category API
export const categoriesApi = {
  getAll: () => api.get<CategoriesResponse>('/categories/'),
  create: (data: CreateCategoryData) => api.post<Category>('/categories/', data),
}

// Context API
export const contextApi = {
  getAll: () => api.get<ContextResponse>('/context/'),
  create: (data: CreateContextData) => api.post<ContextEntry>('/context/', data),
}

// AI API
export const aiApi = {
  getSuggestions: (data: AIRequest) => api.post<AIResponse>('/ai/suggestions/', data),
}

// Stats API
export const statsApi = {
  get: () => api.get<Stats>('/stats/'),
}

export default api
