from django.urls import path
from . import views

urlpatterns = [
    # Task endpoints
    path('tasks/', views.TaskListCreateView.as_view(), name='task-list-create'),
    path('tasks/<int:pk>/', views.TaskDetailView.as_view(), name='task-detail'),
    
    # Category endpoints
    path('categories/', views.CategoryListCreateView.as_view(), name='category-list-create'),
    path('categories/<int:pk>/', views.CategoryDetailView.as_view(), name='category-detail'),
    path('categories/popular/', views.popular_categories, name='popular-categories'),
    
    # Context endpoints
    path('context/', views.ContextEntryListCreateView.as_view(), name='context-list-create'),
    path('context/<int:pk>/', views.ContextEntryDetailView.as_view(), name='context-detail'),
    
    # AI endpoints
    path('ai/suggestions/', views.ai_suggestions, name='ai-suggestions'),
    
    # Stats endpoint
    path('stats/', views.task_stats, name='task-stats'),
]
