import { create } from 'zustand'
import { persist, createJSONStorage } from 'zustand/middleware'
import { tasksApi, categoriesApi, contextApi } from './api'
import { Task, Category, ContextEntry, CreateTaskDto } from './types'

// Additional computed properties for tasks
interface TaskWithComputed extends Task {
  completed: boolean
  priority: 'high' | 'medium' | 'low'
  dueDate?: string
}

export interface Stats {
  total: number
  completed: number
  pending: number
  highPriority: number
}

interface AppState {
  // Tasks
  tasks: TaskWithComputed[]
  isLoadingTasks: boolean
  setTasks: (tasks: TaskWithComputed[]) => void
  addTask: (taskData: CreateTaskDto) => Promise<TaskWithComputed>
  updateTask: (id: number, task: Partial<Task>) => Promise<TaskWithComputed>
  deleteTask: (id: number) => Promise<void>
  setLoadingTasks: (loading: boolean) => void
  fetchTasks: () => Promise<void>
  toggleTask: (id: number) => Promise<void>

  // Categories
  categories: Category[]
  isLoadingCategories: boolean
  setCategories: (categories: Category[]) => void
  addCategory: (category: Category) => void
  setLoadingCategories: (loading: boolean) => void
  fetchCategories: () => Promise<void>

  // Context entries
  contextEntries: ContextEntry[]
  isLoadingContext: boolean
  setContextEntries: (entries: ContextEntry[]) => void
  addContextEntry: (entry: Omit<ContextEntry, 'id' | 'created_at'>) => Promise<ContextEntry>
  setLoadingContext: (loading: boolean) => void
  fetchContextEntries: () => Promise<void>

  // Filters
  statusFilter: string
  categoryFilter: string
  priorityFilter: string
  setStatusFilter: (filter: string) => void
  setCategoryFilter: (filter: string) => void
  setPriorityFilter: (filter: string) => void

  // UI State
  sidebarOpen: boolean
  setSidebarOpen: (open: boolean) => void
  loading: boolean
  
  // Stats
  stats: Stats
}

// Helper function to transform API task to our Task interface
const transformTask = (apiTask: Task): TaskWithComputed => ({
  ...apiTask,
  completed: apiTask.status === 'Completed',
  priority: apiTask.priority_score > 7 ? 'high' : apiTask.priority_score > 4 ? 'medium' : 'low',
  dueDate: apiTask.deadline || undefined
})

export const useAppStore = create<AppState>()(
  persist(
    (set, get) => ({
      // Tasks
      tasks: [],
      isLoadingTasks: false,
      setTasks: (tasks) => set({ tasks: tasks.map(transformTask) }),
      addTask: async (taskData) => {
        try {
          const response = await tasksApi.create({
            title: taskData.title,
            description: taskData.description,
            category: taskData.category,
            priority_score: taskData.priority_score,
            deadline: taskData.deadline,
            status: taskData.status,
            enhance_with_ai: true
          })
          const newTask = transformTask(response.data)
          set((state) => ({ tasks: [newTask, ...state.tasks] }))
          return newTask
        } catch (error) {
          console.error('Failed to create task:', error)
          throw error
        }
      },
      updateTask: async (id, updatedData) => {
        try {
          // Transform the data to match CreateTaskDto format
          const updatePayload: Partial<CreateTaskDto> = {
            ...updatedData,
            deadline: updatedData.deadline || undefined, // Convert null to undefined
          }
          
          const response = await tasksApi.update(id, updatePayload)
          const updatedTask = transformTask(response.data)
          set((state) => ({
            tasks: state.tasks.map((task) =>
              task.id === id ? { ...task, ...updatedTask } : task
            ),
          }))
          return updatedTask
        } catch (error) {
          console.error('Failed to update task:', error)
          // Fallback to local update if API fails
          set((state) => ({
            tasks: state.tasks.map((task) =>
              task.id === id ? { ...task, ...updatedData } : task
            ),
          }))
          throw error
        }
      },
      deleteTask: async (id) => {
        try {
          await tasksApi.delete(id)
          set((state) => ({
            tasks: state.tasks.filter((task) => task.id !== id),
          }))
        } catch (error) {
          console.error('Failed to delete task:', error)
          throw error
        }
      },
      setLoadingTasks: (loading) => set({ isLoadingTasks: loading }),
      
      fetchTasks: async () => {
        set({ isLoadingTasks: true })
        try {
          const response = await tasksApi.getAll()
          set({ tasks: response.data.results.map(transformTask) })
        } catch (error) {
          console.error('Failed to fetch tasks:', error)
          // Fallback to empty array on error
          set({ tasks: [] })
        } finally {
          set({ isLoadingTasks: false })
        }
      },

      toggleTask: async (id) => {
        const task = get().tasks.find(t => t.id === id)
        if (task) {
          const newStatus = task.status === 'Completed' ? 'Pending' : 'Completed'
          try {
            await tasksApi.update(id, { status: newStatus })
            get().updateTask(id, { 
              status: newStatus,
            })
          } catch (error) {
            console.error('Failed to toggle task:', error)
          }
        }
      },

      // Categories
      categories: [],
      isLoadingCategories: false,
      setCategories: (categories) => set({ categories }),
      addCategory: (category) =>
        set((state) => ({ categories: [...state.categories, category] })),
      setLoadingCategories: (loading) => set({ isLoadingCategories: loading }),
      
      fetchCategories: async () => {
        set({ isLoadingCategories: true })
        try {
          const response = await categoriesApi.getAll()
          set({ categories: response.data.results })
        } catch (error) {
          console.error('Failed to fetch categories:', error)
          set({ categories: [] })
        } finally {
          set({ isLoadingCategories: false })
        }
      },

      // Context entries
      contextEntries: [],
      isLoadingContext: false,
      setContextEntries: (entries) => set({ contextEntries: entries }),
      addContextEntry: async (entryData) => {
        try {
          const response = await contextApi.create({
            content: entryData.content,
            source_type: entryData.source_type
          })
          const newEntry = response.data
          set((state) => ({ contextEntries: [newEntry, ...state.contextEntries] }))
          return newEntry
        } catch (error) {
          console.error('Failed to create context entry:', error)
          throw error
        }
      },
      setLoadingContext: (loading) => set({ isLoadingContext: loading }),
      
      fetchContextEntries: async () => {
        set({ isLoadingContext: true })
        try {
          const response = await contextApi.getAll()
          set({ contextEntries: response.data.results })
        } catch (error) {
          console.error('Failed to fetch context entries:', error)
          set({ contextEntries: [] })
        } finally {
          set({ isLoadingContext: false })
        }
      },

      // Filters
      statusFilter: 'all',
      categoryFilter: 'all',
      priorityFilter: 'all',
      setStatusFilter: (filter) => set({ statusFilter: filter }),
      setCategoryFilter: (filter) => set({ categoryFilter: filter }),
      setPriorityFilter: (filter) => set({ priorityFilter: filter }),

      // UI State
      sidebarOpen: false,
      setSidebarOpen: (open) => set({ sidebarOpen: open }),
      loading: false,
      
      // Stats - computed from current tasks
      get stats() {
        const tasks = get().tasks
        return {
          total: tasks.length,
          completed: tasks.filter(t => t.completed).length,
          pending: tasks.filter(t => !t.completed).length,
          highPriority: tasks.filter(t => t.priority === 'high' && !t.completed).length
        }
      }
    }),
    {
      name: 'smart-todo-storage',
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({
        statusFilter: state.statusFilter,
        categoryFilter: state.categoryFilter,
        priorityFilter: state.priorityFilter,
        sidebarOpen: state.sidebarOpen,
      }),
    }
  )
)
