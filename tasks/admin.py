from django.contrib import admin
from .models import Task, Category, ContextEntry


@admin.register(Category)
class CategoryAdmin(admin.ModelAdmin):
    list_display = ['name', 'usage_count']
    list_filter = ['usage_count']
    search_fields = ['name']
    readonly_fields = ['usage_count']


@admin.register(Task)
class TaskAdmin(admin.ModelAdmin):
    list_display = ['title', 'category', 'status', 'priority_score', 'deadline', 'created_at']
    list_filter = ['status', 'category', 'priority_score', 'created_at']
    search_fields = ['title', 'description']
    list_editable = ['status', 'priority_score']
    date_hierarchy = 'created_at'
    ordering = ['-priority_score', '-created_at']
    
    fieldsets = (
        (None, {
            'fields': ('title', 'description', 'category')
        }),
        ('Priority & Deadline', {
            'fields': ('priority_score', 'deadline', 'status')
        }),
        ('Timestamps', {
            'fields': ('created_at', 'updated_at'),
            'classes': ('collapse',)
        }),
    )
    
    readonly_fields = ['created_at', 'updated_at']


@admin.register(ContextEntry)
class ContextEntryAdmin(admin.ModelAdmin):
    list_display = ['source_type', 'content_preview', 'created_at']
    list_filter = ['source_type', 'created_at']
    search_fields = ['content']
    readonly_fields = ['created_at', 'processed_insights']
    
    def content_preview(self, obj):
        """Show preview of content"""
        return obj.content[:50] + "..." if len(obj.content) > 50 else obj.content
    
    content_preview.short_description = 'Content Preview'
