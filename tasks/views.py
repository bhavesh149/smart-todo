from rest_framework import generics, status
from rest_framework.decorators import api_view
from rest_framework.response import Response
from django_filters.rest_framework import DjangoFilterBackend
from rest_framework.filters import SearchFilter, OrderingFilter
from django.utils import timezone

from .models import Task, Category, ContextEntry
from .serializers import (
    TaskSerializer, TaskCreateSerializer, CategorySerializer,
    ContextEntrySerializer, AISuggestionRequestSerializer
)
from .services import TaskService, CategoryService, ContextService, AIService


class TaskListCreateView(generics.ListCreateAPIView):
    """List and create tasks"""
    queryset = Task.objects.all()
    filter_backends = [DjangoFilterBackend, SearchFilter, OrderingFilter]
    filterset_fields = ['status', 'category', 'priority_score']
    search_fields = ['title', 'description']
    ordering_fields = ['created_at', 'updated_at', 'priority_score', 'deadline']
    ordering = ['-priority_score', '-created_at']
    
    def get_serializer_class(self):
        if self.request.method == 'POST':
            return TaskCreateSerializer
        return TaskSerializer
    
    def perform_create(self, serializer):
        """Create task with optional AI enhancement"""
        enhance_with_ai = serializer.validated_data.pop('enhance_with_ai', False)
        task = TaskService.create_task_with_ai(
            serializer.validated_data,
            enhance_with_ai=enhance_with_ai
        )
        # Set the instance for the serializer so it returns the proper response
        serializer.instance = task


class TaskDetailView(generics.RetrieveUpdateDestroyAPIView):
    """Retrieve, update, or delete a task"""
    queryset = Task.objects.all()
    serializer_class = TaskSerializer


class CategoryListCreateView(generics.ListCreateAPIView):
    """List and create categories"""
    queryset = Category.objects.all()
    serializer_class = CategorySerializer
    filter_backends = [OrderingFilter]
    ordering = ['-usage_count', 'name']


class CategoryDetailView(generics.RetrieveUpdateDestroyAPIView):
    """Retrieve, update, or delete a category"""
    queryset = Category.objects.all()
    serializer_class = CategorySerializer


class ContextEntryListCreateView(generics.ListCreateAPIView):
    """List and create context entries"""
    queryset = ContextEntry.objects.all()
    serializer_class = ContextEntrySerializer
    filter_backends = [DjangoFilterBackend, OrderingFilter]
    filterset_fields = ['source_type']
    ordering = ['-created_at']
    
    def perform_create(self, serializer):
        """Create context entry with AI analysis"""
        context_entry = ContextService.create_context_with_analysis(
            content=serializer.validated_data['content'],
            source_type=serializer.validated_data['source_type']
        )
        # Set the instance for the serializer so it returns the proper response
        serializer.instance = context_entry


class ContextEntryDetailView(generics.RetrieveUpdateDestroyAPIView):
    """Retrieve, update, or delete a context entry"""
    queryset = ContextEntry.objects.all()
    serializer_class = ContextEntrySerializer


@api_view(['POST'])
def ai_suggestions(request):
    """
    Get AI-powered suggestions for tasks
    
    Request body:
    {
        "task_ids": [1, 2, 3],  // optional
        "context_entry_ids": [1, 2],  // optional
        "suggestion_type": "prioritization"  // required
    }
    """
    serializer = AISuggestionRequestSerializer(data=request.data)
    if serializer.is_valid():
        suggestions = AIService.get_task_suggestions(
            task_ids=serializer.validated_data.get('task_ids'),
            context_ids=serializer.validated_data.get('context_entry_ids'),
            suggestion_type=serializer.validated_data['suggestion_type']
        )
        return Response(suggestions, status=status.HTTP_200_OK)
    
    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


@api_view(['GET'])
def task_stats(request):
    """Get task statistics"""
    stats = {
        'total_tasks': Task.objects.count(),
        'pending_tasks': Task.objects.filter(status='Pending').count(),
        'in_progress_tasks': Task.objects.filter(status='In Progress').count(),
        'completed_tasks': Task.objects.filter(status='Done').count(),
        'high_priority_tasks': Task.objects.filter(priority_score__gte=7).count(),
        'overdue_tasks': Task.objects.filter(
            deadline__lt=timezone.now(),
            status__in=['Pending', 'In Progress']
        ).count() if Task.objects.filter(deadline__isnull=False).exists() else 0,
        'categories_count': Category.objects.count(),
        'context_entries_count': ContextEntry.objects.count(),
    }
    
    return Response(stats, status=status.HTTP_200_OK)


@api_view(['GET'])
def popular_categories(request):
    """Get popular categories by usage"""
    categories = CategoryService.get_popular_categories(limit=10)
    serializer = CategorySerializer(categories, many=True)
    return Response(serializer.data, status=status.HTTP_200_OK)
