from django.db import models
from django.core.validators import MinValueValidator, MaxValueValidator


class Category(models.Model):
    """Category model for organizing tasks"""
    name = models.CharField(max_length=100, unique=True)
    usage_count = models.IntegerField(default=0)
    
    class Meta:
        verbose_name_plural = "Categories"
        ordering = ['-usage_count', 'name']
    
    def __str__(self):
        return self.name
    
    def increment_usage(self):
        """Increment usage count when category is used"""
        self.usage_count += 1
        self.save(update_fields=['usage_count'])


class Task(models.Model):
    """Main Task model"""
    
    STATUS_CHOICES = [
        ('Pending', 'Pending'),
        ('In Progress', 'In Progress'),
        ('Done', 'Done'),
    ]
    
    title = models.CharField(max_length=255)
    description = models.TextField(blank=True)
    category = models.ForeignKey(
        Category, 
        on_delete=models.SET_NULL, 
        null=True, 
        blank=True,
        related_name='tasks'
    )
    priority_score = models.IntegerField(
        default=0,
        validators=[MinValueValidator(0), MaxValueValidator(10)],
        help_text="Priority score from 0-10, where 10 is highest priority"
    )
    deadline = models.DateTimeField(null=True, blank=True)
    status = models.CharField(
        max_length=20, 
        choices=STATUS_CHOICES, 
        default='Pending'
    )
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        ordering = ['-priority_score', '-created_at']
    
    def __str__(self):
        return f"{self.title} ({self.status})"
    
    def save(self, *args, **kwargs):
        """Override save to increment category usage"""
        is_new = self.pk is None
        super().save(*args, **kwargs)
        
        if is_new and self.category:
            self.category.increment_usage()


class ContextEntry(models.Model):
    """Context entries from various sources for AI analysis"""
    
    SOURCE_CHOICES = [
        ('WhatsApp', 'WhatsApp'),
        ('Email', 'Email'),
        ('Notes', 'Notes'),
    ]
    
    content = models.TextField()
    source_type = models.CharField(max_length=20, choices=SOURCE_CHOICES)
    processed_insights = models.JSONField(null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        verbose_name_plural = "Context Entries"
        ordering = ['-created_at']
    
    def __str__(self):
        return f"{self.source_type}: {self.content[:50]}..."
