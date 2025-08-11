from typing import List, Dict, Any, Optional
from datetime import datetime
from django.db.models import QuerySet
from .models import Task, Category, ContextEntry
from .ai_module import ai_service


class TaskService:
    """Service layer for Task operations"""
    
    @staticmethod
    def create_task_with_ai(task_data: Dict, enhance_with_ai: bool = False) -> Task:
        """
        Create a task with optional AI enhancement
        
        Args:
            task_data: Task data dictionary
            enhance_with_ai: Whether to enhance with AI
            
        Returns:
            Created Task instance
        """
        # Create basic task
        task = Task.objects.create(**task_data)
        
        if enhance_with_ai:
            # Get recent context for enhancement
            recent_context = ContextEntry.objects.all()[:10]
            context_data = [
                {
                    'content': entry.content,
                    'source_type': entry.source_type
                }
                for entry in recent_context
            ]
            
            # Analyze context
            context_analysis = ai_service.analyze_context(context_data)
            
            # Enhance task
            task_dict = {
                'title': task.title,
                'description': task.description,
                'priority_score': task.priority_score
            }
            
            # Update priority
            enhanced_tasks = ai_service.prioritize_tasks([task_dict], context_analysis)
            if enhanced_tasks:
                task.priority_score = enhanced_tasks[0]['priority_score']
            
            # Enhance description if empty or brief
            if len(task.description) < 20:
                enhanced_desc = ai_service.enhance_task_description(task_dict, context_analysis)
                if enhanced_desc and enhanced_desc != task.description:
                    task.description = enhanced_desc
            
            # Suggest category if none
            if not task.category:
                suggested_category = ai_service.categorize_task(task_dict)
                category, created = Category.objects.get_or_create(name=suggested_category)
                task.category = category
            
            # Suggest deadline if none
            if not task.deadline:
                current_load = Task.objects.filter(status__in=['Pending', 'In Progress']).count()
                deadline_iso = ai_service.suggest_deadline(task_dict, current_load)
                task.deadline = datetime.fromisoformat(deadline_iso.replace('Z', '+00:00'))
            
            task.save()
        
        return task
    
    @staticmethod
    def get_prioritized_tasks(limit: Optional[int] = None) -> QuerySet:
        """Get tasks ordered by priority and creation date"""
        queryset = Task.objects.select_related('category').order_by('-priority_score', '-created_at')
        if limit:
            queryset = queryset[:limit]
        return queryset
    
    @staticmethod
    def get_tasks_by_status(status: str) -> QuerySet:
        """Get tasks filtered by status"""
        return Task.objects.filter(status=status).select_related('category')
    
    @staticmethod
    def update_task_status(task_id: int, status: str) -> Optional[Task]:
        """Update task status"""
        try:
            task = Task.objects.get(id=task_id)
            task.status = status
            task.save()
            return task
        except Task.DoesNotExist:
            return None


class CategoryService:
    """Service layer for Category operations"""
    
    @staticmethod
    def get_popular_categories(limit: int = 10) -> QuerySet:
        """Get categories ordered by usage count"""
        return Category.objects.order_by('-usage_count', 'name')[:limit]
    
    @staticmethod
    def create_or_get_category(name: str) -> Category:
        """Create or get existing category by name"""
        category, created = Category.objects.get_or_create(name=name)
        return category


class ContextService:
    """Service layer for ContextEntry operations"""
    
    @staticmethod
    def create_context_with_analysis(content: str, source_type: str) -> ContextEntry:
        """
        Create context entry and analyze with AI
        
        Args:
            content: Context content
            source_type: Source type
            
        Returns:
            Created ContextEntry with analysis
        """
        context_entry = ContextEntry.objects.create(
            content=content,
            source_type=source_type
        )
        
        # Analyze with AI
        try:
            analysis = ai_service.analyze_context([{
                'content': content,
                'source_type': source_type
            }])
            context_entry.processed_insights = analysis
            context_entry.save()
        except Exception as e:
            print(f"Error analyzing context: {e}")
        
        return context_entry
    
    @staticmethod
    def get_recent_context(limit: int = 20) -> QuerySet:
        """Get recent context entries"""
        return ContextEntry.objects.order_by('-created_at')[:limit]


class AIService:
    """Service layer for AI operations"""
    
    @staticmethod
    def get_task_suggestions(task_ids: Optional[List[int]] = None, 
                           context_ids: Optional[List[int]] = None,
                           suggestion_type: str = 'prioritization') -> Dict[str, Any]:
        """
        Get AI suggestions for tasks
        
        Args:
            task_ids: List of task IDs to analyze
            context_ids: List of context entry IDs to analyze
            suggestion_type: Type of suggestion needed
            
        Returns:
            Dictionary with suggestions
        """
        # Get tasks
        tasks = []
        if task_ids:
            task_objects = Task.objects.filter(id__in=task_ids)
            tasks = [
                {
                    'id': task.id,
                    'title': task.title,
                    'description': task.description,
                    'priority_score': task.priority_score,
                    'status': task.status
                }
                for task in task_objects
            ]
        
        # Get context
        context_entries = []
        if context_ids:
            context_objects = ContextEntry.objects.filter(id__in=context_ids)
            context_entries = [
                {
                    'content': entry.content,
                    'source_type': entry.source_type
                }
                for entry in context_objects
            ]
        
        # If no specific context provided, use recent context
        if not context_entries:
            recent_context = ContextEntry.objects.all()[:10]
            context_entries = [
                {
                    'content': entry.content,
                    'source_type': entry.source_type
                }
                for entry in recent_context
            ]
        
        # Analyze context
        context_analysis = ai_service.analyze_context(context_entries)
        
        suggestions = {
            'context_analysis': context_analysis,
            'suggestion_type': suggestion_type,
            'timestamp': str(datetime.now())
        }
        
        if suggestion_type == 'prioritization' and tasks:
            prioritized_tasks = ai_service.prioritize_tasks(tasks, context_analysis)
            suggestions['prioritized_tasks'] = prioritized_tasks
        
        elif suggestion_type == 'categorization' and tasks:
            categorized_tasks = []
            for task in tasks:
                suggested_category = ai_service.categorize_task(task)
                categorized_tasks.append({
                    'task_id': task['id'],
                    'suggested_category': suggested_category
                })
            suggestions['categorized_tasks'] = categorized_tasks
        
        elif suggestion_type == 'deadline' and tasks:
            current_load = Task.objects.filter(status__in=['Pending', 'In Progress']).count()
            deadline_suggestions = []
            for task in tasks:
                suggested_deadline = ai_service.suggest_deadline(task, current_load)
                deadline_suggestions.append({
                    'task_id': task['id'],
                    'suggested_deadline': suggested_deadline
                })
            suggestions['deadline_suggestions'] = deadline_suggestions
        
        elif suggestion_type == 'enhancement' and tasks:
            enhanced_tasks = []
            for task in tasks:
                enhanced_description = ai_service.enhance_task_description(task, context_analysis)
                enhanced_tasks.append({
                    'task_id': task['id'],
                    'enhanced_description': enhanced_description
                })
            suggestions['enhanced_tasks'] = enhanced_tasks
        
        return suggestions
