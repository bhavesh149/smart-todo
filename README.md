# � Smart Todo List - Django REST API Backend

A production-ready Django REST Framework backend for an intelligent todo list application with AI-powered features using Groq API.

## 🚀 Features

### Core Backend Features
- **RESTful API**: Complete CRUD operations with filtering, searching, and pagination
- **AI Integration**: Groq API for intelligent task enhancement and context analysis
- **Context Processing**: Multi-source context analysis (WhatsApp, Email, Notes)
- **Smart Categories**: Auto-categorization with usage tracking
- **Task Management**: Priority scoring, deadlines, and status tracking
- **PostgreSQL**: Production-ready database setup with SQLite fallback
- **Admin Interface**: Django admin for comprehensive data management
- **CORS Support**: Configured for frontend integration

## 🛠️ Tech Stack

- **Django 5.0.7** - Web framework
- **Django REST Framework 3.15.2** - API development
- **PostgreSQL** - Primary database
- **Groq SDK 0.9.0** - AI/LLM integration
- **python-dotenv** - Environment variable management
- **django-cors-headers** - CORS handling
- **django-filter** - API filtering

## 📋 Prerequisites

- **Python 3.8+**
- **PostgreSQL** (recommended) or SQLite for development  
- **Groq API Key** (for AI features)

## 🚀 Quick Setup

### 1. Install Dependencies
```bash
pip install -r requirements.txt
```

### 2. Environment Configuration
```bash
cp .env.example .env
```

Edit `.env` with your configuration:
```env
# Database (PostgreSQL recommended)
DB_NAME=smart_todo
DB_USER=your_db_user
DB_PASSWORD=your_db_password
DB_HOST=localhost
DB_PORT=5432

# AI Integration
GROQ_API_KEY=your_groq_api_key_here

# Django Settings
SECRET_KEY=your-super-secret-key-here
DEBUG=True
ALLOWED_HOSTS=localhost,127.0.0.1

# CORS (for frontend integration)
CORS_ALLOWED_ORIGINS=http://localhost:3000,http://localhost:3005
```

### 3. Database Setup
```bash
# Run migrations
python manage.py migrate

# Create superuser (optional)
python manage.py createsuperuser

# Load sample data (optional)
python manage.py loaddata fixtures/sample_data.json
```

### 4. Start Server
```bash
python manage.py runserver 127.0.0.1:8001
```

### 5. Access Points
- **API Root**: http://127.0.0.1:8001/api/
- **Django Admin**: http://127.0.0.1:8001/admin/
- **API Documentation**: See below

---

## 📚 API Documentation

### Base URL
```
http://127.0.0.1:8001/api
```

### Tasks API

#### Get All Tasks
```http
GET /api/tasks/
```
**Response:**
```json
{
  "count": 24,
  "next": null,
  "previous": null,
  "results": [
    {
      "id": 1,
      "title": "Complete project documentation",
      "description": "Write comprehensive docs for the project",
      "category": 5,
      "category_name": "Work",
      "priority_score": 8,
      "deadline": "2025-08-15T10:00:00Z",
      "status": "Pending",
      "created_at": "2025-08-11T08:00:00Z",
      "updated_at": "2025-08-11T08:00:00Z"
    }
  ]
}
```

#### Create Task
```http
POST /api/tasks/
Content-Type: application/json

{
  "title": "New task title",
  "description": "Task description",
  "category": 1,
  "priority_score": 7,
  "deadline": "2025-08-20T15:30:00Z",
  "status": "Pending",
  "enhance_with_ai": true
}
```

#### Update Task
```http
PUT /api/tasks/{id}/
Content-Type: application/json

{
  "title": "Updated task title",
  "status": "In Progress",
  "priority_score": 9
}
```

#### Delete Task
```http
DELETE /api/tasks/{id}/
```

### Categories API

#### Get All Categories
```http
GET /api/categories/
```
**Response:**
```json
{
  "count": 5,
  "results": [
    {
      "id": 1,
      "name": "Work",
      "usage_count": 12,
      "color": "#3b82f6",
      "description": "Work-related tasks"
    }
  ]
}
```

#### Create Category
```http
POST /api/categories/
Content-Type: application/json

{
  "name": "Personal",
  "description": "Personal tasks and activities",
  "color": "#10b981"
}
```

### Context API

#### Get All Context Entries
```http
GET /api/context/
```

#### Create Context Entry
```http
POST /api/context/
Content-Type: application/json

{
  "content": "Hey, can you help me prepare the presentation for tomorrow's client meeting?",
  "source_type": "WhatsApp"
}
```
**Response:**
```json
{
  "id": 1,
  "content": "Hey, can you help me prepare the presentation...",
  "source_type": "WhatsApp",
  "processed_insights": {
    "keywords": ["presentation", "client", "meeting"],
    "action_verbs": ["prepare", "help"],
    "urgency_indicators": ["tomorrow"],
    "sentiment_score": 0
  },
  "created_at": "2025-08-11T10:30:00Z"
}
```

### AI Suggestions API

#### Get AI Suggestions
```http
POST /api/ai/suggestions/
Content-Type: application/json

{
  "task_description": "Prepare quarterly business review presentation",
  "context": "Meeting with stakeholders next week",
  "suggestion_type": "enhancement"
}
```

### Statistics API

#### Get Task Statistics
```http
GET /api/stats/
```
**Response:**
```json
{
  "total_tasks": 24,
  "pending_tasks": 8,
  "in_progress_tasks": 6,
  "completed_tasks": 10,
  "high_priority_tasks": 5,
  "overdue_tasks": 2,
  "categories_count": 6,
  "context_entries_count": 3
}
```

---

## 🤖 Sample Tasks and AI Suggestions

### Sample Tasks Created

#### 1. Marketing Campaign Task
```json
{
  "title": "Launch Q4 Marketing Campaign",
  "description": "Design and execute comprehensive marketing strategy for Q4 product launches including social media, email campaigns, and landing page optimization",
  "category": "Marketing",
  "priority_score": 9,
  "status": "Pending",
  "ai_enhanced": true
}
```

#### 2. Development Task
```json
{
  "title": "Implement User Authentication System",
  "description": "Develop secure JWT-based authentication with role-based access control, password reset functionality, and session management",
  "category": "Development",
  "priority_score": 8,
  "status": "In Progress",
  "ai_enhanced": true
}
```

#### 3. Meeting Preparation Task
```json
{
  "title": "Prepare Client Presentation for Q3 Results",
  "description": "Create comprehensive presentation covering Q3 performance metrics, growth analysis, and strategic recommendations for stakeholder meeting",
  "category": "Business",
  "priority_score": 10,
  "deadline": "2025-08-15T14:00:00Z",
  "status": "Pending",
  "ai_enhanced": true
}
```

### AI-Powered Context Analysis Examples

#### WhatsApp Context Analysis
**Input:**
```
"Hey, can you help me prepare the presentation for tomorrow's client meeting? We need to cover the Q3 results and the new product roadmap. The meeting is at 2 PM sharp."
```

**AI Analysis Output:**
```json
{
  "keywords": ["presentation", "client", "meeting", "Q3", "results", "product", "roadmap"],
  "action_verbs": ["prepare", "cover"],
  "common_themes": ["Business Meeting", "Quarterly Review", "Product Strategy"],
  "sentiment_score": 0,
  "time_references": ["tomorrow", "2 PM"],
  "urgency_indicators": ["tomorrow", "2 PM sharp"],
  "suggested_tasks": [
    {
      "title": "Prepare Q3 Results Presentation",
      "priority_score": 9,
      "category": "Business",
      "deadline": "tomorrow 2 PM"
    }
  ]
}
```

#### Email Context Analysis
**Input:**
```
"Subject: Weekend Team Building Event

Hi everyone, We're organizing a team building event for next weekend. Please confirm your availability by Friday. We're planning activities from 10 AM to 4 PM at the riverside park."
```

**AI Analysis Output:**
```json
{
  "keywords": ["team building", "event", "weekend", "availability", "riverside", "park"],
  "action_verbs": ["organize", "confirm", "planning"],
  "common_themes": ["Team Building", "Event Planning", "Workplace Activities"],
  "sentiment_score": 1,
  "time_references": ["next weekend", "Friday", "10 AM to 4 PM"],
  "urgency_indicators": ["confirm by Friday"],
  "suggested_tasks": [
    {
      "title": "Confirm Availability for Team Building Event",
      "priority_score": 6,
      "category": "Personal",
      "deadline": "Friday"
    }
  ]
}
```

#### Meeting Notes Context Analysis
**Input:**
```
"Meeting notes from product sync:
- Need to review user feedback from last release
- Update documentation for API v2
- Schedule testing for new authentication flow
- Follow up with design team on mobile UI improvements"
```

**AI Analysis Output:**
```json
{
  "keywords": ["meeting", "notes", "user feedback", "documentation", "API", "testing", "authentication", "design", "mobile", "UI"],
  "action_verbs": ["review", "update", "schedule", "follow up"],
  "common_themes": ["Product Development", "Documentation", "Testing", "Design Review"],
  "sentiment_score": 0,
  "urgency_indicators": ["need to review", "schedule testing"],
  "suggested_tasks": [
    {
      "title": "Review User Feedback from Last Release",
      "priority_score": 8,
      "category": "Product",
      "deadline": null
    },
    {
      "title": "Update API v2 Documentation",
      "priority_score": 7,
      "category": "Development",
      "deadline": null
    },
    {
      "title": "Schedule Authentication Flow Testing",
      "priority_score": 8,
      "category": "QA",
      "deadline": null
    }
  ]
}
```

### AI Task Enhancement Examples

#### Basic Task Input:
```
"Write blog post"
```

#### AI-Enhanced Task Output:
```json
{
  "title": "Write Comprehensive Blog Post",
  "description": "Create engaging blog content with SEO optimization, including research, writing, editing, and publishing with appropriate images and meta descriptions",
  "suggested_category": "Content Marketing",
  "priority_score": 6,
  "estimated_duration": 180,
  "suggested_deadline": "2025-08-20T17:00:00Z",
  "ai_suggestions": [
    "Consider target audience and tone",
    "Research trending keywords",
    "Include call-to-action",
    "Add relevant images and graphics"
  ]
}
```

---

## 🏗️ Architecture

### Frontend Stack
- **Next.js 15** - React framework with App Router
- **TypeScript** - Type safety and developer experience
- **Tailwind CSS** - Utility-first styling
- **shadcn/ui** - Modern component library
- **Zustand** - State management with persistence
- **Axios** - HTTP client for API communication
- **Sonner** - Toast notifications
- **Lucide Icons** - Icon system

### Backend Stack
- **Django 5.0.7** - Web framework
- **Django REST Framework** - API development
- **PostgreSQL** - Primary database
- **Groq SDK** - AI/LLM integration
- **CORS handling** - Cross-origin resource sharing
- **Environment management** - Secure configuration

### Key Features Implemented
- ✅ **Real-time Data Sync** - Frontend updates instantly with backend changes
- ✅ **Complete CRUD Operations** - Create, Read, Update, Delete for all entities
- ✅ **AI-Powered Insights** - Intelligent task enhancement and context analysis
- ✅ **Responsive Design** - Mobile-first UI with dark/light themes
- ✅ **Error Handling** - Comprehensive error management and user feedback
- ✅ **Type Safety** - Full TypeScript implementation
- ✅ **State Management** - Efficient state handling with persistence
- ✅ **Loading States** - Smooth user experience with loading indicators

---

## 🧪 Testing

### Backend Testing
```bash
# Run Django tests
python manage.py test

# Test API endpoints
python test_api.py

# Load sample data
python manage.py loaddata fixtures/sample_data.json
```

---

## 🧪 Testing & Validation

### Quick API Test
```bash
# Test basic API connectivity
python simple_test.py

# Run comprehensive tests
python comprehensive_test.py

# Test specific endpoints
python test_api.py
```

### Sample API Responses
```bash
# Get all tasks
curl http://127.0.0.1:8001/api/tasks/

# Create a new task
curl -X POST http://127.0.0.1:8001/api/tasks/ \
  -H "Content-Type: application/json" \
  -d '{"title": "Test Task", "description": "Testing API"}'
```

---

## 🚀 Deployment

### Environment Variables for Production
```env
DEBUG=False
ALLOWED_HOSTS=your-domain.com,api.your-domain.com
DATABASE_URL=postgresql://user:password@host:port/dbname
GROQ_API_KEY=your_production_groq_api_key
CORS_ALLOWED_ORIGINS=https://your-frontend-domain.com
```

### Production Checklist
- [ ] Set `DEBUG=False`
- [ ] Configure production database
- [ ] Set secure `SECRET_KEY`
- [ ] Configure CORS for your frontend domain
- [ ] Set up HTTPS
- [ ] Configure static file serving
- [ ] Set up monitoring and logging

---

## 🏗️ Project Structure

```
todo-smart/
├── smarttodo/          # Django project settings
├── tasks/              # Main app with models, views, serializers
├── fixtures/           # Sample data fixtures
├── requirements.txt    # Python dependencies
├── manage.py          # Django management script
├── .env.example       # Environment template
└── README.md          # This file
```

---

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature-name`
3. Make your changes and commit: `git commit -m 'Add feature'`
4. Push to the branch: `git push origin feature-name`
5. Submit a pull request

---

## 📄 License

This project is licensed under the MIT License.

---

## 🆘 Support

For issues and questions:
- Check the API documentation above
- Test with provided sample scripts
- Review environment configuration
- Ensure database connectivity

**Built with ❤️ using Django REST Framework**
```env
# Database Configuration
DB_NAME=your_database_name
DB_USER=your_database_user
DB_PASSWORD=your_database_password
DB_HOST=your_database_host
DB_PORT=5432

# Groq API Configuration
GROQ_API_KEY=your_groq_api_key_here

# Django Secret Key
SECRET_KEY=your_very_secret_key_here

# Debug Mode (set to False in production)
DEBUG=True

# Allowed Hosts (comma separated)
ALLOWED_HOSTS=localhost,127.0.0.1
```

### 4. Database Setup
```bash
# Create and run migrations
python manage.py makemigrations
python manage.py migrate

# Load sample data (optional)
python manage.py loaddata fixtures/sample_data.json

# Create superuser (optional)
python manage.py createsuperuser
```

### 5. Run Development Server
```bash
python manage.py runserver
```

The API will be available at `http://localhost:8000/api/`

## 📚 API Documentation

### Base URL: `http://localhost:8000/api/`

### Tasks Endpoints

#### List/Create Tasks
- **GET** `/api/tasks/` - List all tasks
  - Query params: `status`, `category`, `priority_score`, `search`, `ordering`
  - Example: `/api/tasks/?status=Pending&ordering=-priority_score`

- **POST** `/api/tasks/` - Create a new task
  ```json
  {
    "title": "Complete project documentation",
    "description": "Write comprehensive API documentation",
    "category": 1,
    "priority_score": 8,
    "deadline": "2025-08-15T17:00:00Z",
    "status": "Pending",
    "enhance_with_ai": true
  }
  ```

#### Task Details
- **GET** `/api/tasks/{id}/` - Get specific task
- **PUT** `/api/tasks/{id}/` - Update task
- **PATCH** `/api/tasks/{id}/` - Partial update
- **DELETE** `/api/tasks/{id}/` - Delete task

### Categories Endpoints

#### List/Create Categories
- **GET** `/api/categories/` - List all categories
- **POST** `/api/categories/` - Create category

#### Popular Categories
- **GET** `/api/categories/popular/` - Get most used categories

#### Category Details
- **GET** `/api/categories/{id}/` - Get specific category
- **PUT** `/api/categories/{id}/` - Update category
- **DELETE** `/api/categories/{id}/` - Delete category

### Context Endpoints

#### List/Create Context Entries
- **GET** `/api/context/` - List context entries
  - Query params: `source_type`, `ordering`

- **POST** `/api/context/` - Add context entry (triggers AI analysis)
  ```json
  {
    "content": "Remember to call the client about the project deadline tomorrow",
    "source_type": "WhatsApp"
  }
  ```

#### Context Details
- **GET** `/api/context/{id}/` - Get specific context entry
- **PUT** `/api/context/{id}/` - Update context entry
- **DELETE** `/api/context/{id}/` - Delete context entry

### AI Endpoints

#### AI Suggestions
- **POST** `/api/ai/suggestions/` - Get AI-powered suggestions
  ```json
  {
    "task_ids": [1, 2, 3],
    "context_entry_ids": [1, 2],
    "suggestion_type": "prioritization"
  }
  ```

  **Suggestion Types:**
  - `prioritization` - AI-based task prioritization
  - `categorization` - Suggest categories for tasks
  - `deadline` - Suggest deadlines based on complexity
  - `enhancement` - Enhance task descriptions

### Statistics
- **GET** `/api/stats/` - Get task statistics

## 🤖 AI Features

### 1. Context Analysis
Analyzes text from various sources to extract:
- Keywords and themes
- Urgency indicators
- Sentiment analysis
- Time references
- Action verbs

### 2. Task Prioritization
AI considers:
- Context urgency indicators
- Deadlines and time sensitivity
- Task complexity
- Current workload

### 3. Smart Categorization
Automatically suggests categories based on:
- Task content analysis
- Historical categorization patterns
- Common category usage

### 4. Deadline Suggestions
Recommends deadlines considering:
- Task complexity assessment
- Current workload
- Typical completion patterns

### 5. Description Enhancement
Improves task descriptions by:
- Adding contextual details
- Making tasks more actionable
- Including relevant keywords

## 📋 Example API Responses

### Task List Response
```json
{
  "count": 6,
  "next": null,
  "previous": null,
  "results": [
    {
      "id": 1,
      "title": "Complete project proposal",
      "description": "Finish the Q1 project proposal document with budget estimates and timeline",
      "category": 1,
      "category_name": "Work",
      "priority_score": 9,
      "deadline": "2025-08-15T17:00:00Z",
      "status": "In Progress",
      "created_at": "2025-08-10T10:00:00Z",
      "updated_at": "2025-08-10T10:00:00Z"
    }
  ]
}
```

### AI Suggestions Response
```json
{
  "context_analysis": {
    "keywords": ["client", "meeting", "deadline", "project"],
    "urgency_indicators": ["tomorrow", "urgent", "asap"],
    "sentiment_score": 0.7,
    "common_themes": ["work", "deadlines"],
    "time_references": ["tomorrow", "next week"],
    "action_verbs": ["complete", "call", "schedule"]
  },
  "suggestion_type": "prioritization",
  "prioritized_tasks": [
    {
      "id": 1,
      "title": "Complete project proposal",
      "priority_score": 9
    }
  ],
  "timestamp": "2025-08-10T12:00:00.123456"
}
```

### Task Statistics Response
```json
{
  "total_tasks": 6,
  "pending_tasks": 4,
  "in_progress_tasks": 1,
  "completed_tasks": 1,
  "high_priority_tasks": 3,
  "overdue_tasks": 0,
  "categories_count": 5,
  "context_entries_count": 3
}
```

## 🗃️ Database Schema

### Task Model
- `id` - Primary Key
- `title` - CharField(255)
- `description` - TextField
- `category` - ForeignKey(Category, nullable)
- `priority_score` - IntegerField(0-10)
- `deadline` - DateTimeField(nullable)
- `status` - CharField(choices: Pending/In Progress/Done)
- `created_at` - DateTimeField(auto_now_add)
- `updated_at` - DateTimeField(auto_now)

### Category Model
- `id` - Primary Key
- `name` - CharField(100, unique)
- `usage_count` - IntegerField(default=0)

### ContextEntry Model
- `id` - Primary Key
- `content` - TextField
- `source_type` - CharField(choices: WhatsApp/Email/Notes)
- `processed_insights` - JSONField(nullable)
- `created_at` - DateTimeField(auto_now_add)

## 🚀 Deployment

### Environment Variables for Production
```env
DEBUG=False
ALLOWED_HOSTS=yourdomain.com,api.yourdomain.com
SECRET_KEY=very-secure-secret-key
```

### Database Setup (NeonDB Example)
1. Create a NeonDB database
2. Update `.env` with connection details:
```env
DB_NAME=neondb_name
DB_USER=neondb_user
DB_PASSWORD=neondb_password
DB_HOST=your-neondb-host.neon.tech
DB_PORT=5432
```

### Groq API Setup
1. Sign up at [Groq Console](https://console.groq.com/)
2. Create an API key
3. Add to `.env`: `GROQ_API_KEY=your_groq_api_key`

## 🔍 Testing

### Load Sample Data
```bash
python manage.py loaddata fixtures/sample_data.json
```

### Test AI Features
```bash
# Test context analysis
curl -X POST http://localhost:8000/api/context/ \
  -H "Content-Type: application/json" \
  -d '{"content": "Urgent: Client meeting tomorrow at 3 PM", "source_type": "WhatsApp"}'

# Test AI suggestions
curl -X POST http://localhost:8000/api/ai/suggestions/ \
  -H "Content-Type: application/json" \
  -d '{"suggestion_type": "prioritization", "task_ids": [1, 2, 3]}'
```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request


## 🆘 Support

For issues and questions:
1. Check the API documentation above
2. Review the sample data in `fixtures/sample_data.json`
3. Test with the provided examples
4. Ensure all environment variables are properly set


