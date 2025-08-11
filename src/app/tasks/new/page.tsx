"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { ArrowLeft, Sparkles } from "lucide-react"
import Link from "next/link"
import { toast } from "sonner"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { useAppStore } from "@/lib/store"
import { CreateTaskDto } from "@/lib/types"

export default function NewTaskPage() {
  const router = useRouter()
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    category: "",
    deadline: "",
  })
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [aiSuggestion, setAiSuggestion] = useState("")
  
  const { categories, fetchCategories, addTask } = useAppStore()

  useEffect(() => {
    fetchCategories()
  }, [fetchCategories])

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }))
    
    // Trigger AI suggestion when title or description changes
    if ((field === 'title' || field === 'description') && value.length > 10) {
      generateAiSuggestion(field === 'title' ? value : formData.title, field === 'description' ? value : formData.description)
    }
  }

  const generateAiSuggestion = async (_title: string, _description: string) => {
    // Mock AI suggestion - replace with actual AI API call
    const suggestions = [
      "Consider breaking this task into smaller sub-tasks for better progress tracking.",
      "This seems like a high-priority task. Consider setting an earlier deadline.",
      "Based on the description, this might take longer than expected. Plan accordingly.",
      "This task could benefit from the 'Work' category and high priority setting.",
      "Consider adding specific deliverables or success criteria to the description.",
    ]
    
    const randomSuggestion = suggestions[Math.floor(Math.random() * suggestions.length)]
    setAiSuggestion(randomSuggestion)
  }

  const calculatePriorityScore = (title: string, description: string, deadline: string) => {
    let score = 5 // Base score
    
    // Increase score for urgent words
    const urgentWords = ['urgent', 'asap', 'important', 'critical', 'deadline']
    const text = (title + ' ' + description).toLowerCase()
    urgentWords.forEach(word => {
      if (text.includes(word)) score += 2
    })
    
    // Increase score for near deadline
    if (deadline) {
      const daysUntilDeadline = Math.ceil((new Date(deadline).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24))
      if (daysUntilDeadline <= 2) score += 3
      else if (daysUntilDeadline <= 7) score += 1
    }
    
    return Math.min(Math.max(score, 1), 10) // Clamp between 1-10
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!formData.title.trim()) return

    setIsSubmitting(true)
    try {
      const priorityScore = calculatePriorityScore(formData.title, formData.description, formData.deadline)
      
      const newTask: CreateTaskDto = {
        title: formData.title,
        description: formData.description,
        category: formData.category ? parseInt(formData.category) : 1, // Default to category 1 if none selected
        priority_score: priorityScore,
        deadline: formData.deadline || undefined,
        status: "Pending" as const,
      }

      await addTask(newTask)
      toast.success('Task created successfully!')
      router.push('/tasks')
    } catch (error) {
      console.error('Failed to create task:', error)
      toast.error('Failed to create task. Please try again.')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="container mx-auto px-4 py-8 space-y-8 max-w-2xl">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button asChild variant="ghost" size="icon">
          <Link href="/">
            <ArrowLeft className="h-5 w-5" />
          </Link>
        </Button>
        <div>
          <h1 className="text-3xl font-bold">Create New Task</h1>
          <p className="text-muted-foreground">
            Add a new task with AI-powered suggestions and smart categorization.
          </p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Basic Task Info */}
        <Card>
          <CardHeader>
            <CardTitle>Task Details</CardTitle>
            <CardDescription>
              Provide the basic information about your task.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <label htmlFor="title" className="block text-sm font-medium mb-2">
                Task Title *
              </label>
              <Input
                id="title"
                placeholder="What needs to be done?"
                value={formData.title}
                onChange={(e) => handleInputChange('title', e.target.value)}
                required
              />
            </div>

            <div>
              <label htmlFor="description" className="block text-sm font-medium mb-2">
                Description
              </label>
              <Textarea
                id="description"
                placeholder="Add more details about this task..."
                rows={3}
                value={formData.description}
                onChange={(e) => handleInputChange('description', e.target.value)}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label htmlFor="category" className="block text-sm font-medium mb-2">
                  Category
                </label>
                <Select value={formData.category} onValueChange={(value) => handleInputChange('category', value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select category" />
                  </SelectTrigger>
                  <SelectContent>
                    {categories.map((category) => (
                      <SelectItem key={category.id} value={category.id.toString()}>
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

              <div>
                <label htmlFor="deadline" className="block text-sm font-medium mb-2">
                  Deadline
                </label>
                <Input
                  id="deadline"
                  type="date"
                  value={formData.deadline}
                  onChange={(e) => handleInputChange('deadline', e.target.value)}
                  min={new Date().toISOString().split('T')[0]}
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* AI Suggestions */}
        {aiSuggestion && (
          <Card className="border-primary/20 bg-primary/5">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-primary">
                <Sparkles className="h-5 w-5" />
                AI Suggestion
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm">{aiSuggestion}</p>
            </CardContent>
          </Card>
        )}

        {/* Priority Preview */}
        {formData.title && (
          <Card>
            <CardHeader>
              <CardTitle className="text-sm">Smart Priority Analysis</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-2">
                <span className="text-sm text-muted-foreground">Calculated Priority:</span>
                <Badge
                  variant={
                    calculatePriorityScore(formData.title, formData.description, formData.deadline) > 7
                      ? "destructive"
                      : calculatePriorityScore(formData.title, formData.description, formData.deadline) > 4
                      ? "default"
                      : "secondary"
                  }
                >
                  {calculatePriorityScore(formData.title, formData.description, formData.deadline) > 7
                    ? "High"
                    : calculatePriorityScore(formData.title, formData.description, formData.deadline) > 4
                    ? "Medium"
                    : "Low"}
                  {" "}({calculatePriorityScore(formData.title, formData.description, formData.deadline)}/10)
                </Badge>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Submit */}
        <div className="flex gap-4">
          <Button asChild variant="outline" className="flex-1">
            <Link href="/">Cancel</Link>
          </Button>
          <Button
            type="submit"
            disabled={!formData.title.trim() || isSubmitting}
            className="flex-1"
          >
            {isSubmitting ? "Creating..." : "Create Task"}
          </Button>
        </div>
      </form>
    </div>
  )
}
