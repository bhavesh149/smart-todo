from django.core.management.base import BaseCommand
from tasks.models import Task, ContextEntry
from tasks.ai_module import ai_service


class Command(BaseCommand):
    help = 'Test AI functionality with sample data'

    def handle(self, *args, **options):
        self.stdout.write(self.style.SUCCESS('Testing AI functionality...'))
        
        # Check if AI is enabled
        if not ai_service.enabled:
            self.stdout.write(
                self.style.WARNING(
                    'AI is not enabled. Please set GROQ_API_KEY in your .env file.\n'
                    'Get your API key from: https://console.groq.com/'
                )
            )
            return
        
        # Test context analysis
        self.stdout.write('\n1. Testing context analysis...')
        context_entries = ContextEntry.objects.all()[:3]
        if context_entries:
            context_data = [
                {
                    'content': entry.content,
                    'source_type': entry.source_type
                }
                for entry in context_entries
            ]
            
            analysis = ai_service.analyze_context(context_data)
            self.stdout.write(f'Keywords found: {", ".join(analysis.get("keywords", []))}')
            self.stdout.write(f'Urgency indicators: {", ".join(analysis.get("urgency_indicators", []))}')
            self.stdout.write(f'Sentiment score: {analysis.get("sentiment_score", 0)}')
        
        # Test task prioritization
        self.stdout.write('\n2. Testing task prioritization...')
        tasks = Task.objects.filter(status='Pending')[:3]
        if tasks:
            task_data = [
                {
                    'id': task.id,
                    'title': task.title,
                    'description': task.description,
                    'priority_score': task.priority_score
                }
                for task in tasks
            ]
            
            prioritized = ai_service.prioritize_tasks(task_data, analysis if 'analysis' in locals() else {})
            for task in prioritized:
                self.stdout.write(f'Task: {task["title"]} - Priority: {task["priority_score"]}')
        
        # Test categorization
        self.stdout.write('\n3. Testing task categorization...')
        if tasks:
            for task in tasks[:2]:
                task_dict = {'title': task.title, 'description': task.description}
                category = ai_service.categorize_task(task_dict)
                self.stdout.write(f'Task: {task.title} - Suggested category: {category}')
        
        # Test deadline suggestion
        self.stdout.write('\n4. Testing deadline suggestions...')
        if tasks:
            for task in tasks[:2]:
                task_dict = {'title': task.title, 'description': task.description}
                deadline = ai_service.suggest_deadline(task_dict, 5)
                self.stdout.write(f'Task: {task.title} - Suggested deadline: {deadline}')
        
        self.stdout.write(self.style.SUCCESS('\nAI testing completed!'))
