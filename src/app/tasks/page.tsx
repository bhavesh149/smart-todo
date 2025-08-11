"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { Plus, Search, Filter, CheckSquare, Clock, AlertCircle } from "lucide-react"
import { toast } from "sonner"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { useAppStore } from "@/lib/store"
import { cn } from "@/lib/utils"
import { EditTaskDialog } from "@/components/EditTaskDialog"

export default function TasksPage() {
  const [searchQuery, setSearchQuery] = useState("")
  const [filterStatus, setFilterStatus] = useState("all")
  const [filterCategory, setFilterCategory] = useState("all")
  
  const {
    tasks,
    categories,
    isLoadingTasks,
    fetchTasks,
    fetchCategories,
    toggleTask,
    deleteTask,
  } = useAppStore()

  useEffect(() => {
    fetchTasks()
    fetchCategories()
  }, [fetchTasks, fetchCategories])

  // Filter tasks based on search and filters
  const filteredTasks = tasks.filter(task => {
    const matchesSearch = task.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         task.description.toLowerCase().includes(searchQuery.toLowerCase())
    
    const matchesStatus = filterStatus === "all" || 
                         (filterStatus === "completed" && task.completed) ||
                         (filterStatus === "pending" && !task.completed)
    
    const matchesCategory = filterCategory === "all" || 
                           task.category?.toString() === filterCategory

    return matchesSearch && matchesStatus && matchesCategory
  })

  const handleDeleteTask = async (taskId: number) => {
    try {
      await deleteTask(taskId)
      toast.success('Task deleted successfully!')
    } catch (error) {
      console.error('Failed to delete task:', error)
      toast.error('Failed to delete task. Please try again.')
    }
  }

  const handleToggleTask = async (taskId: number) => {
    try {
      await toggleTask(taskId)
      toast.success('Task status updated!')
    } catch (error) {
      console.error('Failed to update task:', error)
      toast.error('Failed to update task status. Please try again.')
    }
  }

  const getStatusIcon = (status: string, completed: boolean) => {
    if (completed) return <CheckSquare className="h-4 w-4 text-green-500" />
    if (status === "In Progress") return <Clock className="h-4 w-4 text-blue-500" />
    return <AlertCircle className="h-4 w-4 text-gray-400" />
  }

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'destructive'
      case 'medium': return 'default'
      case 'low': return 'secondary'
      default: return 'secondary'
    }
  }

  return (
    <div className="container mx-auto px-4 py-8 space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold">Tasks</h1>
          <p className="text-muted-foreground">
            Manage and track all your tasks in one place.
          </p>
        </div>
        <Button asChild size="lg">
          <Link href="/tasks/new">
            <Plus className="h-5 w-5 mr-2" />
            Add Task
          </Link>
        </Button>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Filter className="h-5 w-5" />
            Filter & Search
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4 md:grid-cols-4">
            <div className="md:col-span-2">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                <Input
                  placeholder="Search tasks..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>

            <Select value={filterStatus} onValueChange={setFilterStatus}>
              <SelectTrigger>
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="pending">Pending</SelectItem>
                <SelectItem value="completed">Completed</SelectItem>
              </SelectContent>
            </Select>

            <Select value={filterCategory} onValueChange={setFilterCategory}>
              <SelectTrigger>
                <SelectValue placeholder="Category" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Categories</SelectItem>
                {categories.map((category) => (
                  <SelectItem key={`category-${category.id}`} value={category.id.toString()}>
                    <div className="flex items-center gap-2">
                      <div
                        className="w-3 h-3 rounded-full"
                        style={{ backgroundColor: category.color || '#6b7280' }}
                      />
                      {category.name}
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Task List */}
      {isLoadingTasks ? (
        <div className="space-y-4">
          {[...Array(5)].map((_, i) => (
            <Card key={`loading-${i}`}>
              <CardContent className="p-6">
                <div className="space-y-3">
                  <div className="h-4 bg-muted rounded animate-pulse" />
                  <div className="h-3 bg-muted rounded animate-pulse w-3/4" />
                  <div className="flex gap-2">
                    <div className="h-5 w-16 bg-muted rounded animate-pulse" />
                    <div className="h-5 w-20 bg-muted rounded animate-pulse" />
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : filteredTasks.length === 0 ? (
        <Card>
          <CardContent className="text-center py-12">
            <CheckSquare className="h-12 w-12 mx-auto mb-4 text-muted-foreground opacity-50" />
            <h3 className="text-lg font-medium mb-2">
              {searchQuery || filterStatus !== "all" || filterCategory !== "all" 
                ? "No tasks match your filters"
                : "No tasks yet"
              }
            </h3>
            <p className="text-muted-foreground mb-6">
              {searchQuery || filterStatus !== "all" || filterCategory !== "all"
                ? "Try adjusting your search or filters to find what you're looking for."
                : "Get started by creating your first task."
              }
            </p>
            {!(searchQuery || filterStatus !== "all" || filterCategory !== "all") && (
              <Button asChild>
                <Link href="/tasks/new">
                  <Plus className="h-4 w-4 mr-2" />
                  Create First Task
                </Link>
              </Button>
            )}
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {filteredTasks.map((task) => (
            <Card 
              key={`task-${task.id}`}
              className={cn(
                "transition-all duration-200 hover:shadow-md cursor-pointer",
                task.completed && "opacity-75"
              )}
              onClick={() => handleToggleTask(task.id)}
            >
              <CardContent className="p-6">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex items-start gap-4 flex-1">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={(e) => {
                        e.stopPropagation()
                        handleToggleTask(task.id)
                      }}
                      className="p-0 h-auto mt-1"
                    >
                      {getStatusIcon(task.status, task.completed)}
                    </Button>
                    
                    <div className="flex-1 space-y-2">
                      <div className="flex items-start justify-between">
                        <h3 className={cn(
                          "font-semibold text-lg",
                          task.completed && "line-through text-muted-foreground"
                        )}>
                          {task.title}
                        </h3>
                      </div>
                      
                      {task.description && (
                        <p className={cn(
                          "text-muted-foreground",
                          task.completed && "line-through"
                        )}>
                          {task.description}
                        </p>
                      )}
                      
                      <div className="flex flex-wrap gap-2 items-center">
                        {task.category_name && (
                          <Badge variant="outline" className="text-xs">
                            {task.category_name}
                          </Badge>
                        )}
                        
                        <Badge variant={getPriorityColor(task.priority)} className="text-xs">
                          {task.priority} priority
                        </Badge>
                        
                        <Badge variant="outline" className="text-xs">
                          {task.status}
                        </Badge>
                        
                        {task.dueDate && (
                          <Badge 
                            variant={new Date(task.dueDate) < new Date() ? "destructive" : "secondary"} 
                            className="text-xs"
                          >
                            Due: {new Date(task.dueDate).toLocaleDateString()}
                          </Badge>
                        )}
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex gap-2" onClick={(e) => e.stopPropagation()}>
                    <EditTaskDialog task={task} />
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      onClick={() => handleDeleteTask(task.id)}
                      className="text-destructive hover:text-destructive"
                    >
                      Delete
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Summary */}
      {filteredTasks.length > 0 && (
        <Card>
          <CardContent className="p-4">
            <div className="flex flex-wrap gap-4 text-sm text-muted-foreground">
              <span>Total: {filteredTasks.length} tasks</span>
              <span>Completed: {filteredTasks.filter(t => t.completed).length}</span>
              <span>Pending: {filteredTasks.filter(t => !t.completed).length}</span>
              <span>High Priority: {filteredTasks.filter(t => t.priority === 'high' && !t.completed).length}</span>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
