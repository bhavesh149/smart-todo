"use client"

import { useEffect } from "react"
import { Plus, CheckSquare, Clock, AlertCircle, TrendingUp } from "lucide-react"
import Link from "next/link"
import { toast } from "sonner"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { useAppStore } from "@/lib/store"
import { cn } from "@/lib/utils"
import { EditTaskDialog } from "@/components/EditTaskDialog"

export default function Dashboard() {
  const {
    tasks,
    categories,
    isLoadingTasks,
    fetchTasks,
    fetchCategories,
    toggleTask,
    deleteTask
  } = useAppStore()

  useEffect(() => {
    fetchTasks()
    fetchCategories()
  }, [fetchTasks, fetchCategories])

  // Calculate real-time stats from tasks data
  const stats = {
    total: tasks.length,
    completed: tasks.filter(task => task.completed).length,
    pending: tasks.filter(task => !task.completed).length,
    highPriority: tasks.filter(task => task.priority === 'high' && !task.completed).length,
  }

  const recentTasks = tasks.slice(0, 5)
  const urgentTasks = tasks.filter(task => task.priority === 'high' && !task.completed).slice(0, 3)

  const handleToggleTask = async (taskId: number) => {
    try {
      await toggleTask(taskId)
      toast.success('Task status updated!')
    } catch (error) {
      console.error('Failed to toggle task:', error)
      toast.error('Failed to update task status. Please try again.')
    }
  }

  const handleDeleteTask = async (taskId: number) => {
    try {
      await deleteTask(taskId)
      toast.success('Task deleted successfully!')
    } catch (error) {
      console.error('Failed to delete task:', error)
      toast.error('Failed to delete task. Please try again.')
    }
  }

  return (
    <div className="container mx-auto px-4 py-8 space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold">Dashboard</h1>
          <p className="text-muted-foreground">
            Welcome back! Here's your task overview.
          </p>
        </div>
        <Button asChild size="lg">
          <Link href="/tasks/new">
            <Plus className="h-5 w-5 mr-2" />
            Add Task
          </Link>
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Tasks</CardTitle>
            <CheckSquare className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.total}</div>
            <p className="text-xs text-muted-foreground">
              {stats.completed} completed
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pending</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.pending}</div>
            <p className="text-xs text-muted-foreground">
              Tasks to complete
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">High Priority</CardTitle>
            <AlertCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.highPriority}</div>
            <p className="text-xs text-muted-foreground">
              Urgent tasks
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Categories</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{categories.length}</div>
            <p className="text-xs text-muted-foreground">
              Active categories
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-8 lg:grid-cols-2">
        {/* Recent Tasks */}
        <Card>
          <CardHeader>
            <CardTitle>Recent Tasks</CardTitle>
            <CardDescription>
              Your latest tasks and their status
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {isLoadingTasks ? (
              <div className="space-y-3">
                {[...Array(5)].map((_, i) => (
                  <div key={i} className="h-12 bg-muted rounded-md animate-pulse" />
                ))}
              </div>
            ) : recentTasks.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <CheckSquare className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>No tasks yet. Create your first task!</p>
              </div>
            ) : (
              recentTasks.map((task) => (
                <div
                  key={`recent-task-${task.id}`}
                  className="flex items-center justify-between p-3 rounded-lg border hover:bg-muted/50 transition-colors"
                  // onClick={() => handleToggleTask(task.id)}
                >
                  <div className="flex items-center gap-3 flex-1">
                    <Button
                      variant="ghost"
                      size="sm"
                      // onClick={(e) => {
                      //   e.stopPropagation()
                      //   handleToggleTask(task.id)
                      // }}
                      className="p-0 h-auto"
                    >
                      <CheckSquare
                        className={cn(
                          "h-5 w-5",
                          task.completed
                            ? "text-primary fill-current"
                            : "text-muted-foreground"
                        )}
                      />
                    </Button>
                    <div className="flex-1">
                      <p
                        className={cn(
                          "font-medium",
                          task.completed && "line-through text-muted-foreground"
                        )}
                      >
                        {task.title}
                      </p>
                      {task.category_name && (
                        <Badge variant="secondary" className="text-xs">
                          {task.category_name}
                        </Badge>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge
                      variant={
                        task.priority === "high"
                          ? "destructive"
                          : task.priority === "medium"
                          ? "default"
                          : "secondary"
                      }
                      className="text-xs"
                    >
                      {task.priority}
                    </Badge>
                    <div onClick={(e) => e.stopPropagation()}>
                      <EditTaskDialog task={task} />
                    </div>
                  </div>
                </div>
              ))
            )}
            {recentTasks.length > 0 && (
              <Button asChild variant="outline" className="w-full">
                <Link href="/tasks">View All Tasks</Link>
              </Button>
            )}
          </CardContent>
        </Card>

        {/* Urgent Tasks */}
        <Card>
          <CardHeader>
            <CardTitle>Urgent Tasks</CardTitle>
            <CardDescription>
              High priority tasks that need attention
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {urgentTasks.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <AlertCircle className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>No urgent tasks. Great job!</p>
              </div>
            ) : (
              urgentTasks.map((task) => (
                <div
                  key={`urgent-task-${task.id}`}
                  className="flex items-center justify-between p-3 rounded-lg border border-destructive/20 bg-destructive/5 hover:bg-destructive/10 transition-colors"
                  // onClick={() => handleToggleTask(task.id)}
                >
                  <div className="flex items-center gap-3 flex-1">
                    <Button
                      variant="ghost"
                      size="sm"
                      // onClick={(e) => {
                      //   e.stopPropagation()
                      //   handleToggleTask(task.id)
                      // }}
                      className="p-0 h-auto"
                    >
                      <CheckSquare className="h-5 w-5 text-muted-foreground" />
                    </Button>
                    <div className="flex-1">
                      <p className="font-medium">{task.title}</p>
                      {task.dueDate && (
                        <p className="text-xs text-muted-foreground">
                          Due: {new Date(task.dueDate).toLocaleDateString()}
                        </p>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant="destructive" className="text-xs">
                      Urgent
                    </Badge>
                    <div onClick={(e) => e.stopPropagation()}>
                      <EditTaskDialog task={task} />
                    </div>
                  </div>
                </div>
              ))
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
