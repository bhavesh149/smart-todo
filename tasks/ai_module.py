import os
import json
import re
from typing import Dict, List, Any
from datetime import datetime, timedelta
from groq import Groq
from django.conf import settings


class AIService:
    """AI Service for Smart Todo List using Groq API"""
    
    def __init__(self):
        api_key = getattr(settings, 'GROQ_API_KEY', '')
        if api_key and api_key != 'replace_with_your_groq_api_key':
            try:
                # Simple initialization without extra parameters
                self.client = Groq(api_key=api_key)
                self.model = "llama-3.1-8b-instant"  # Updated to current supported model
                self.enabled = True
                print("✅ Groq AI client initialized successfully")
            except Exception as e:
                print(f"❌ Warning: Groq client initialization failed: {e}")
                print("💡 Tip: Make sure your API key is valid and you have internet connection")
                self.client = None
                self.enabled = False
        else:
            print("⚠️  Warning: GROQ_API_KEY not set or is placeholder, AI features disabled")
            self.client = None
            self.enabled = False
    
    def analyze_context(self, context_entries: List[Dict]) -> Dict[str, Any]:
        """
        Analyze context entries to extract insights
        
        Args:
            context_entries: List of context entry dictionaries
            
        Returns:
            Dict containing analysis results
        """
        if not self.enabled or not context_entries:
            return {
                "keywords": [],
                "urgency_indicators": [],
                "sentiment_score": 0.0,
                "common_themes": [],
                "time_references": [],
                "action_verbs": []
            }
        
        # Prepare context for analysis
        context_text = "\n".join([
            f"Source: {entry.get('source_type', 'Unknown')}\n"
            f"Content: {entry.get('content', '')}\n"
            for entry in context_entries
        ])
        
        prompt = f"""
        Analyze the following context entries and extract insights for task management:
        
        {context_text}
        
        Please provide a JSON response with the following structure:
        {{
            "keywords": ["list", "of", "relevant", "keywords"],
            "urgency_indicators": ["list", "of", "urgency", "signals"],
            "sentiment_score": 0.0,
            "common_themes": ["list", "of", "themes"],
            "time_references": ["list", "of", "time", "mentions"],
            "action_verbs": ["list", "of", "action", "words"]
        }}
        
        Focus on extracting actionable insights that can help with task prioritization and categorization.
        """
        
        try:
            response = self.client.chat.completions.create(
                messages=[
                    {"role": "system", "content": "You are an AI assistant specialized in analyzing text for task management insights. Always respond with valid JSON."},
                    {"role": "user", "content": prompt}
                ],
                model=self.model,
                temperature=0.3,
                max_tokens=1000
            )
            
            result = json.loads(response.choices[0].message.content)
            return result
            
        except Exception as e:
            print(f"Error analyzing context: {e}")
            return {
                "keywords": [],
                "urgency_indicators": [],
                "sentiment_score": 0.0,
                "common_themes": [],
                "time_references": [],
                "action_verbs": []
            }
    
    def prioritize_tasks(self, tasks: List[Dict], context_analysis: Dict) -> List[Dict]:
        """
        Prioritize tasks based on content and context analysis
        
        Args:
            tasks: List of task dictionaries
            context_analysis: Results from context analysis
            
        Returns:
            List of tasks with updated priority scores
        """
        if not self.enabled or not tasks:
            return tasks
        
        # Prepare tasks for analysis
        tasks_text = "\n".join([
            f"Task {i+1}: {task.get('title', '')} - {task.get('description', '')}"
            for i, task in enumerate(tasks)
        ])
        
        urgency_context = ", ".join(context_analysis.get('urgency_indicators', []))
        keywords_context = ", ".join(context_analysis.get('keywords', []))
        
        prompt = f"""
        Based on the following tasks and context analysis, assign priority scores (0-10):
        
        Tasks:
        {tasks_text}
        
        Context Keywords: {keywords_context}
        Urgency Indicators: {urgency_context}
        
        Consider:
        1. Urgency indicators from context
        2. Deadlines if mentioned
        3. Impact and importance
        4. Dependencies
        
        Respond with JSON array of priority scores:
        [8, 5, 9, 3, 7, ...]
        """
        
        try:
            response = self.client.chat.completions.create(
                messages=[
                    {"role": "system", "content": "You are an AI assistant specialized in task prioritization. Respond only with a JSON array of numbers."},
                    {"role": "user", "content": prompt}
                ],
                model=self.model,
                temperature=0.2,
                max_tokens=200
            )
            
            priority_scores = json.loads(response.choices[0].message.content)
            
            # Update tasks with new priority scores
            for i, task in enumerate(tasks):
                if i < len(priority_scores):
                    task['priority_score'] = min(10, max(0, int(priority_scores[i])))
            
            return tasks
            
        except Exception as e:
            print(f"Error prioritizing tasks: {e}")
            return tasks
    
    def suggest_deadline(self, task: Dict, current_load: int = 5) -> str:
        """
        Suggest deadline for a task based on complexity and current workload
        
        Args:
            task: Task dictionary
            current_load: Current number of pending tasks
            
        Returns:
            Suggested deadline as ISO string
        """
        if not self.enabled:
            # Default to 7 days when AI is disabled
            deadline = datetime.now() + timedelta(days=7)
            return deadline.isoformat()
        task_info = f"Title: {task.get('title', '')}\nDescription: {task.get('description', '')}"
        
        prompt = f"""
        Based on this task information and current workload, suggest a realistic deadline:
        
        {task_info}
        
        Current pending tasks: {current_load}
        
        Consider:
        1. Task complexity
        2. Current workload
        3. Typical completion times
        
        Respond with only the number of days from now (1-30):
        """
        
        try:
            response = self.client.chat.completions.create(
                messages=[
                    {"role": "system", "content": "You are an AI assistant for deadline estimation. Respond with only a number."},
                    {"role": "user", "content": prompt}
                ],
                model=self.model,
                temperature=0.2,
                max_tokens=50
            )
            
            days = int(re.findall(r'\d+', response.choices[0].message.content)[0])
            days = min(30, max(1, days))  # Clamp between 1-30 days
            
            deadline = datetime.now() + timedelta(days=days)
            return deadline.isoformat()
            
        except Exception as e:
            print(f"Error suggesting deadline: {e}")
            # Default to 7 days
            deadline = datetime.now() + timedelta(days=7)
            return deadline.isoformat()
    
    def categorize_task(self, task: Dict) -> str:
        """
        Suggest category for a task based on its content
        
        Args:
            task: Task dictionary
            
        Returns:
            Suggested category name
        """
        if not self.enabled:
            return "General"
        task_info = f"Title: {task.get('title', '')}\nDescription: {task.get('description', '')}"
        
        prompt = f"""
        Categorize this task into one of these common categories or suggest a new one:
        
        Common categories: Work, Personal, Health, Finance, Learning, Shopping, Home, Travel
        
        Task:
        {task_info}
        
        Respond with only the category name:
        """
        
        try:
            response = self.client.chat.completions.create(
                messages=[
                    {"role": "system", "content": "You are an AI assistant for task categorization. Respond with only a category name."},
                    {"role": "user", "content": prompt}
                ],
                model=self.model,
                temperature=0.3,
                max_tokens=20
            )
            
            category = response.choices[0].message.content.strip()
            return category if category else "General"
            
        except Exception as e:
            print(f"Error categorizing task: {e}")
            return "General"
    
    def enhance_task_description(self, task: Dict, context_analysis: Dict) -> str:
        """
        Enhance task description with contextual details
        
        Args:
            task: Task dictionary
            context_analysis: Results from context analysis
            
        Returns:
            Enhanced description string
        """
        original_description = task.get('description', '')
        
        if not self.enabled:
            return original_description
        title = task.get('title', '')
        
        relevant_keywords = ", ".join(context_analysis.get('keywords', [])[:5])
        themes = ", ".join(context_analysis.get('common_themes', [])[:3])
        
        prompt = f"""
        Enhance this task description with relevant contextual information:
        
        Title: {title}
        Current Description: {original_description}
        
        Relevant Context:
        - Keywords: {relevant_keywords}
        - Themes: {themes}
        
        Rules:
        1. Keep the original meaning intact
        2. Add helpful contextual details
        3. Make it more actionable
        4. Keep it concise (under 200 words)
        
        Enhanced description:
        """
        
        try:
            response = self.client.chat.completions.create(
                messages=[
                    {"role": "system", "content": "You are an AI assistant that enhances task descriptions with contextual information."},
                    {"role": "user", "content": prompt}
                ],
                model=self.model,
                temperature=0.4,
                max_tokens=250
            )
            
            enhanced_description = response.choices[0].message.content.strip()
            return enhanced_description if enhanced_description else original_description
            
        except Exception as e:
            print(f"Error enhancing task description: {e}")
            return original_description


# Global instance
ai_service = AIService()
