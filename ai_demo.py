#!/usr/bin/env python
"""
Quick AI Demo for Smart Todo API
"""

import requests
import json

BASE_URL = "http://127.0.0.1:8001/api"

def demo_ai_features():
    print("🤖 Smart Todo AI Demo")
    print("=" * 50)
    
    # Test 1: AI Suggestions
    print("\n1. 🧠 Testing AI Prioritization...")
    try:
        response = requests.post(f"{BASE_URL}/ai/suggestions/", json={
            "suggestion_type": "prioritization"
        })
        
        if response.status_code == 200:
            data = response.json()
            print("✅ AI Analysis Results:")
            
            if 'context_analysis' in data:
                analysis = data['context_analysis']
                print(f"   🔍 Keywords found: {', '.join(analysis.get('keywords', [])[:8])}")
                print(f"   🚨 Urgency signals: {', '.join(analysis.get('urgency_indicators', [])[:5])}")
                print(f"   📊 Sentiment: {analysis.get('sentiment_score', 0)}")
            
            print(f"\n   📋 AI suggests these task priorities:")
            if 'prioritized_tasks' in data:
                for i, task in enumerate(data['prioritized_tasks'][:5]):
                    print(f"   {i+1}. Task {task.get('id')}: Priority {task.get('priority_score')}/10")
        else:
            print(f"❌ Error: {response.status_code}")
            
    except Exception as e:
        print(f"❌ Error: {e}")
    
    # Test 2: Create AI-Enhanced Task
    print("\n2. ✨ Creating AI-Enhanced Task...")
    try:
        response = requests.post(f"{BASE_URL}/tasks/", json={
            "title": "Prepare for important client presentation",
            "description": "Need to create slides and demo",
            "priority_score": 5,
            "enhance_with_ai": True
        })
        
        if response.status_code == 201:
            task = response.json()
            print("✅ AI-Enhanced Task Created:")
            print(f"   📝 Title: {task['title']}")
            print(f"   📄 Description: {task['description']}")
            print(f"   🏷️ Category: {task.get('category_name', 'Not assigned')}")
            print(f"   ⭐ Priority: {task['priority_score']}/10")
        else:
            print(f"❌ Task creation failed: {response.status_code}")
            
    except Exception as e:
        print(f"❌ Error: {e}")
    
    # Test 3: Add Context and Get AI Analysis
    print("\n3. 📝 Adding Context for AI Analysis...")
    try:
        response = requests.post(f"{BASE_URL}/context/", json={
            "content": "URGENT: The quarterly board meeting has been moved to this Friday. We need the financial reports and presentation ready by Thursday EOD.",
            "source_type": "Email"
        })
        
        if response.status_code == 201:
            context = response.json()
            print("✅ Context Added and Analyzed:")
            
            if 'processed_insights' in context and context['processed_insights']:
                insights = context['processed_insights']
                print(f"   🔍 AI Keywords: {', '.join(insights.get('keywords', [])[:6])}")
                print(f"   🚨 Urgency detected: {', '.join(insights.get('urgency_indicators', [])[:4])}")
                print(f"   📊 Themes: {', '.join(insights.get('common_themes', [])[:3])}")
        else:
            print(f"❌ Context creation failed: {response.status_code}")
            
    except Exception as e:
        print(f"❌ Error: {e}")
    
    # Test 4: Get Updated Statistics
    print("\n4. 📊 Current System Statistics...")
    try:
        response = requests.get(f"{BASE_URL}/stats/")
        if response.status_code == 200:
            stats = response.json()
            print("✅ System Stats:")
            print(f"   📋 Total Tasks: {stats['total_tasks']}")
            print(f"   ⏳ Pending: {stats['pending_tasks']}")
            print(f"   🔥 High Priority: {stats['high_priority_tasks']}")
            print(f"   🏷️ Categories: {stats['categories_count']}")
            print(f"   📝 Context Entries: {stats['context_entries_count']}")
        else:
            print(f"❌ Stats failed: {response.status_code}")
            
    except Exception as e:
        print(f"❌ Error: {e}")
    
    print("\n🎉 AI Demo Complete!")
    print("\n🔗 Available Endpoints:")
    print(f"   📋 Tasks: {BASE_URL}/tasks/")
    print(f"   🏷️ Categories: {BASE_URL}/categories/")
    print(f"   📝 Context: {BASE_URL}/context/")
    print(f"   🤖 AI Suggestions: {BASE_URL}/ai/suggestions/")
    print(f"   📊 Statistics: {BASE_URL}/stats/")

if __name__ == "__main__":
    demo_ai_features()
