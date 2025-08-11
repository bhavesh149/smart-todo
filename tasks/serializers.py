from rest_framework import serializers
from .models import Task, Category, ContextEntry


class CategorySerializer(serializers.ModelSerializer):
    """Serializer for Category model"""
    
    class Meta:
        model = Category
        fields = ['id', 'name', 'usage_count']
        read_only_fields = ['usage_count']


class TaskSerializer(serializers.ModelSerializer):
    """Serializer for Task model"""
    category_name = serializers.CharField(source='category.name', read_only=True)
    
    class Meta:
        model = Task
        fields = [
            'id', 'title', 'description', 'category', 'category_name',
            'priority_score', 'deadline', 'status', 'created_at', 'updated_at'
        ]
        read_only_fields = ['created_at', 'updated_at']
    
    def validate_priority_score(self, value):
        """Validate priority score is within range"""
        if not 0 <= value <= 10:
            raise serializers.ValidationError("Priority score must be between 0 and 10")
        return value


class TaskCreateSerializer(serializers.ModelSerializer):
    """Serializer for creating tasks with AI enhancement option"""
    enhance_with_ai = serializers.BooleanField(default=False, write_only=True)
    category_name = serializers.CharField(write_only=True, required=False)
    
    class Meta:
        model = Task
        fields = [
            'title', 'description', 'category', 'category_name', 'priority_score',
            'deadline', 'status', 'enhance_with_ai'
        ]
    
    def create(self, validated_data):
        """Create task with optional category name and AI enhancement"""
        enhance_with_ai = validated_data.pop('enhance_with_ai', False)
        category_name = validated_data.pop('category_name', None)
        
        # Handle category by name
        if category_name and not validated_data.get('category'):
            category, created = Category.objects.get_or_create(name=category_name)
            validated_data['category'] = category
        
        task = Task.objects.create(**validated_data)
        
        # AI enhancement will be handled in the view layer
        return task


class ContextEntrySerializer(serializers.ModelSerializer):
    """Serializer for ContextEntry model"""
    
    class Meta:
        model = ContextEntry
        fields = ['id', 'content', 'source_type', 'processed_insights', 'created_at']
        read_only_fields = ['processed_insights', 'created_at']


class AIInsightsSerializer(serializers.Serializer):
    """Serializer for AI insights and suggestions"""
    keywords = serializers.ListField(child=serializers.CharField(), read_only=True)
    sentiment_score = serializers.FloatField(read_only=True)
    urgency_indicators = serializers.ListField(child=serializers.CharField(), read_only=True)
    suggested_category = serializers.CharField(read_only=True)
    complexity_score = serializers.IntegerField(read_only=True)


class AISuggestionRequestSerializer(serializers.Serializer):
    """Serializer for AI suggestion requests"""
    task_ids = serializers.ListField(
        child=serializers.IntegerField(),
        required=False,
        help_text="List of task IDs to analyze"
    )
    context_entry_ids = serializers.ListField(
        child=serializers.IntegerField(),
        required=False,
        help_text="List of context entry IDs to analyze"
    )
    suggestion_type = serializers.ChoiceField(
        choices=['prioritization', 'categorization', 'deadline', 'enhancement'],
        required=True
    )
