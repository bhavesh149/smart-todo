"use client"

import { useState, useEffect } from "react"
import { Plus, FileText, MessageCircle, Mail, Lightbulb } from "lucide-react"
import { toast } from "sonner"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { useAppStore } from "@/lib/store"
import { ProcessedInsights } from "@/lib/types"

const contextTypes = [
  { value: 'WhatsApp', label: 'WhatsApp', icon: MessageCircle },
  { value: 'Email', label: 'Email', icon: Mail },
  { value: 'Notes', label: 'Notes', icon: FileText },
]

export default function ContextPage() {
  const [content, setContent] = useState("")
  const [sourceType, setSourceType] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)
  
  const { 
    contextEntries, 
    isLoadingContext, 
    addContextEntry, 
    fetchContextEntries 
  } = useAppStore()

  // Fetch context entries on component mount
  useEffect(() => {
    fetchContextEntries()
  }, [fetchContextEntries])

  // Function to render processed insights in a user-friendly format
  const renderProcessedInsights = (insights: ProcessedInsights | string | unknown) => {
    if (typeof insights === 'string') {
      return insights
    }

    if (typeof insights === 'object' && insights !== null) {
      const insightsObj = insights as ProcessedInsights
      const {
        keywords,
        action_verbs,
        common_themes,
        sentiment_score,
        time_references,
        urgency_indicators,
        ...other
      } = insightsObj

      return (
        <div className="space-y-3">
          {keywords && keywords.length > 0 && (
            <div>
              <span className="font-medium text-xs text-muted-foreground uppercase tracking-wide">Keywords:</span>
              <div className="flex flex-wrap gap-1 mt-1">
                {keywords.map((keyword: string, index: number) => (
                  <Badge key={index} variant="outline" className="text-xs">
                    {keyword}
                  </Badge>
                ))}
              </div>
            </div>
          )}

          {common_themes && common_themes.length > 0 && (
            <div>
              <span className="font-medium text-xs text-muted-foreground uppercase tracking-wide">Common Themes:</span>
              <div className="flex flex-wrap gap-1 mt-1">
                {common_themes.map((theme: string, index: number) => (
                  <Badge key={index} variant="secondary" className="text-xs">
                    {theme}
                  </Badge>
                ))}
              </div>
            </div>
          )}

          {action_verbs && action_verbs.length > 0 && (
            <div>
              <span className="font-medium text-xs text-muted-foreground uppercase tracking-wide">Action Items:</span>
              <div className="flex flex-wrap gap-1 mt-1">
                {action_verbs.map((verb: string, index: number) => (
                  <Badge key={index} variant="default" className="text-xs">
                    {verb}
                  </Badge>
                ))}
              </div>
            </div>
          )}

          {urgency_indicators && urgency_indicators.length > 0 && (
            <div>
              <span className="font-medium text-xs text-muted-foreground uppercase tracking-wide">Urgency:</span>
              <div className="flex flex-wrap gap-1 mt-1">
                {urgency_indicators.map((indicator: string, index: number) => (
                  <Badge key={index} variant="destructive" className="text-xs">
                    {indicator}
                  </Badge>
                ))}
              </div>
            </div>
          )}

          {time_references && time_references.length > 0 && (
            <div>
              <span className="font-medium text-xs text-muted-foreground uppercase tracking-wide">Time References:</span>
              <div className="flex flex-wrap gap-1 mt-1">
                {time_references.map((time: string, index: number) => (
                  <Badge key={index} variant="outline" className="text-xs">
                    {time}
                  </Badge>
                ))}
              </div>
            </div>
          )}

          {sentiment_score !== undefined && (
            <div>
              <span className="font-medium text-xs text-muted-foreground uppercase tracking-wide">Sentiment Score:</span>
              <div className="mt-1">
                <Badge 
                  variant={sentiment_score > 0 ? "default" : sentiment_score < 0 ? "destructive" : "secondary"} 
                  className="text-xs"
                >
                  {sentiment_score > 0 ? "Positive" : sentiment_score < 0 ? "Negative" : "Neutral"} ({sentiment_score})
                </Badge>
              </div>
            </div>
          )}

          {Object.keys(other).length > 0 && (
            <div>
              <span className="font-medium text-xs text-muted-foreground uppercase tracking-wide">Additional Info:</span>
              <pre className="text-xs mt-1 whitespace-pre-wrap">
                {JSON.stringify(other, null, 2)}
              </pre>
            </div>
          )}
        </div>
      )
    }

    return JSON.stringify(insights, null, 2)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!content.trim() || !sourceType) return

    setIsSubmitting(true)
    try {
      await addContextEntry({
        content,
        source_type: sourceType as 'WhatsApp' | 'Email' | 'Notes',
      })
      
      toast.success('Context entry added successfully!')
      setContent("")
      setSourceType("")
    } catch (error) {
      console.error('Failed to add context entry:', error)
      toast.error('Failed to add context entry. Please try again.')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="container mx-auto px-4 py-8 space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold">Context Input</h1>
        <p className="text-muted-foreground">
          Add context from your conversations, emails, or notes to help AI understand your tasks better.
        </p>
      </div>

      {/* Input Form */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Plus className="h-5 w-5" />
            Add New Context
          </CardTitle>
          <CardDescription>
            Paste content from WhatsApp, emails, or your notes to extract meaningful insights.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label htmlFor="source-type" className="block text-sm font-medium mb-2">
                Source Type
              </label>
              <Select value={sourceType} onValueChange={setSourceType}>
                <SelectTrigger>
                  <SelectValue placeholder="Select source type" />
                </SelectTrigger>
                <SelectContent>
                  {contextTypes.map((type) => {
                    const Icon = type.icon
                    return (
                      <SelectItem key={type.value} value={type.value}>
                        <div className="flex items-center gap-2">
                          <Icon className="h-4 w-4" />
                          {type.label}
                        </div>
                      </SelectItem>
                    )
                  })}
                </SelectContent>
              </Select>
            </div>

            <div>
              <label htmlFor="content" className="block text-sm font-medium mb-2">
                Content
              </label>
              <Textarea
                id="content"
                placeholder="Paste your content here... (e.g., WhatsApp messages, email content, meeting notes)"
                value={content}
                onChange={(e) => setContent(e.target.value)}
                rows={8}
                className="resize-none"
              />
            </div>

            <Button
              type="submit"
              disabled={!content.trim() || !sourceType || isSubmitting}
              className="w-full sm:w-auto"
            >
              {isSubmitting ? "Processing..." : "Add Context"}
            </Button>
          </form>
        </CardContent>
      </Card>

      {/* Context Entries */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            Context History
          </CardTitle>
          <CardDescription>
            Previously added context entries and their insights.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {isLoadingContext ? (
            <div className="space-y-4">
              {[...Array(3)].map((_, i) => (
                <div key={`loading-context-${i}`} className="border rounded-lg p-4 space-y-4">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3">
                      <div className="h-4 w-4 bg-muted rounded animate-pulse" />
                      <div className="h-5 w-16 bg-muted rounded animate-pulse" />
                    </div>
                    <div className="h-4 w-20 bg-muted rounded animate-pulse" />
                  </div>
                  <div className="space-y-2">
                    <div className="h-4 w-full bg-muted rounded animate-pulse" />
                    <div className="h-4 w-3/4 bg-muted rounded animate-pulse" />
                    <div className="h-4 w-1/2 bg-muted rounded animate-pulse" />
                  </div>
                </div>
              ))}
            </div>
          ) : contextEntries.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              <Lightbulb className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <h3 className="text-lg font-medium mb-2">No Context Added Yet</h3>
              <p className="text-sm">
                Start by adding your first context entry above to help AI understand your tasks better.
              </p>
            </div>
          ) : (
            <div className="space-y-6">
              {contextEntries.map((entry) => {
                const sourceTypeData = contextTypes.find(t => t.value === entry.source_type)
                const Icon = sourceTypeData?.icon || FileText
                
                return (
                  <div key={`context-entry-${entry.id}`} className="border rounded-lg p-4 space-y-4">
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-3">
                        <div className="flex items-center gap-2">
                          <Icon className="h-4 w-4 text-muted-foreground" />
                          <Badge variant="secondary">
                            {sourceTypeData?.label || entry.source_type}
                          </Badge>
                        </div>
                      </div>
                      <span className="text-xs text-muted-foreground">
                        {new Date(entry.created_at).toLocaleDateString()}
                      </span>
                    </div>

                    <div className="space-y-3">
                      <div>
                        <h4 className="text-sm font-medium mb-2">Original Content:</h4>
                        <div className="bg-muted rounded-md p-3 text-sm">
                          {entry.content.length > 300 
                            ? `${entry.content.substring(0, 300)}...`
                            : entry.content
                          }
                        </div>
                      </div>

                      {entry.processed_insights && (
                        <div>
                          <h4 className="text-sm font-medium mb-2 flex items-center gap-2">
                            <Lightbulb className="h-4 w-4" />
                            AI Insights:
                          </h4>
                          <div className="bg-primary/5 border border-primary/20 rounded-md p-3 text-sm space-y-3">
                            {renderProcessedInsights(entry.processed_insights)}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
