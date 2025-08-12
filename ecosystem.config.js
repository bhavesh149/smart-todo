module.exports = {
  apps: [
    {
      name: 'smart-todo-backend',
      script: './venv/bin/gunicorn',
      args: '--bind 0.0.0.0:8001 --workers 3 --worker-class gevent --worker-connections 1000 --timeout 120 --max-requests 1000 --max-requests-jitter 50 smarttodo.wsgi:application',
      cwd: '/home/ubuntu/smart-todo-backend',
      interpreter: 'none',
      
      // Environment variables for production
      env: {
        NODE_ENV: 'production',
        DJANGO_SETTINGS_MODULE: 'smarttodo.settings',
        PYTHONPATH: '/home/ubuntu/smart-todo-backend',
        PYTHONUNBUFFERED: '1',
        
        // Django Configuration
        DEBUG: 'False',
        SECRET_KEY: 'your-production-secret-key-minimum-50-characters-long-replace-this-434y34y34234y2343',
        ALLOWED_HOSTS: 'your-domain.com,your-ec2-public-ip,localhost,127.0.0.1,https://smart-todo-2zjg.vercel.app/',
        
        // Neon Database Configuration
        DB_NAME: 'neondb',
        DB_USER: 'neondb_owner',
        DB_PASSWORD: 'npg_F17HnJDqNUYf',
        DB_HOST: 'your-neon-database-host.neon.tech',
        DB_PORT: '5432',
        
        // AI Integration
        GROQ_API_KEY: 'your_production_groq_api_key_here',
        
        // CORS Configuration for frontend
        CORS_ALLOWED_ORIGINS: 'https://your-frontend-domain.com,http://localhost:3000,http://localhost:3005',
        
        // Security Settings
        SECURE_SSL_REDIRECT: 'False',
        SECURE_HSTS_SECONDS: '0',
        SECURE_HSTS_INCLUDE_SUBDOMAINS: 'False',
        SECURE_HSTS_PRELOAD: 'False',
        SECURE_CONTENT_TYPE_NOSNIFF: 'True',
        SECURE_BROWSER_XSS_FILTER: 'True',
        X_FRAME_OPTIONS: 'DENY',
        
        // Static Files
        STATIC_ROOT: '/home/ubuntu/smart-todo-backend/staticfiles',
        USE_S3: 'False'
      },
      
      // PM2 Process Management
      instances: 1,
      exec_mode: 'fork',
      watch: false,
      
      // Memory and CPU Management
      max_memory_restart: '512M',
      min_uptime: '10s',
      max_restarts: 10,
      restart_delay: 4000,
      autorestart: true,
      
      // Logging Configuration
      error_file: '/home/ubuntu/smart-todo-backend/logs/pm2-error.log',
      out_file: '/home/ubuntu/smart-todo-backend/logs/pm2-out.log',
      log_file: '/home/ubuntu/smart-todo-backend/logs/pm2-combined.log',
      time: true,
      log_date_format: 'YYYY-MM-DD HH:mm:ss Z',
      merge_logs: true,
      
      // Health Monitoring
      health_check_url: 'http://localhost:8001/api/tasks/',
      health_check_grace_period: 3000,
      
      // Process Behavior
      kill_timeout: 5000,
      listen_timeout: 3000,
      
      // Environment specific overrides
      env_production: {
        NODE_ENV: 'production',
        DEBUG: 'False',
        SECURE_SSL_REDIRECT: 'True',
        SECURE_HSTS_SECONDS: '31536000',
        SECURE_HSTS_INCLUDE_SUBDOMAINS: 'True',
        SECURE_HSTS_PRELOAD: 'True'
      },
      
      env_staging: {
        NODE_ENV: 'staging',
        DEBUG: 'False',
        DB_NAME: 'neondb_staging',
        ALLOWED_HOSTS: 'staging-your-domain.com,staging-ec2-ip'
      }
    },
    
    // Background Worker Process (if you have async tasks)
    {
      name: 'smart-todo-worker',
      script: './venv/bin/python',
      args: 'manage.py process_tasks',
      cwd: '/home/ubuntu/smart-todo-backend',
      interpreter: 'none',
      
      // Same environment as main app
      env: {
        NODE_ENV: 'production',
        DJANGO_SETTINGS_MODULE: 'smarttodo.settings',
        PYTHONPATH: '/home/ubuntu/smart-todo-backend',
        PYTHONUNBUFFERED: '1',
        
        // Database Configuration (same as main app)
        DEBUG: 'False',
        SECRET_KEY: 'your-production-secret-key-minimum-50-characters-long-replace-this',
        
        // Neon Database Configuration
        DB_NAME: 'neondb',
        DB_USER: 'neondb_owner',
        DB_PASSWORD: 'npg_F17HnJDqNUYf',
        DB_HOST: 'your-neon-database-host.neon.tech',
        DB_PORT: '5432',
        
        // AI Integration
        GROQ_API_KEY: 'your_production_groq_api_key_here'
      },
      
      // Worker specific settings
      instances: 1,
      exec_mode: 'fork',
      watch: false,
      autorestart: true,
      max_restarts: 5,
      restart_delay: 5000,
      min_uptime: '5s',
      max_memory_restart: '256M',
      
      // Worker logging
      error_file: '/home/ubuntu/smart-todo-backend/logs/worker-error.log',
      out_file: '/home/ubuntu/smart-todo-backend/logs/worker-out.log',
      log_file: '/home/ubuntu/smart-todo-backend/logs/worker-combined.log',
      time: true,
      merge_logs: true
    }
  ],
  
  // PM2 Deploy Configuration (optional)
  deploy: {
    production: {
      user: 'ubuntu',
      host: ['your-ec2-public-ip'],
      ref: 'origin/main',
      repo: 'git@github.com:your-username/smart-todo-backend.git',
      path: '/home/ubuntu/smart-todo-backend',
      'pre-deploy-local': '',
      'post-deploy': 'source venv/bin/activate && pip install -r requirements.txt && python manage.py migrate && python manage.py collectstatic --noinput && pm2 reload ecosystem.config.js --env production',
      'pre-setup': 'python3 -m venv venv && source venv/bin/activate && pip install -r requirements.txt'
    },
    
    staging: {
      user: 'ubuntu',
      host: ['your-staging-ec2-ip'],
      ref: 'origin/develop',
      repo: 'git@github.com:your-username/smart-todo-backend.git',
      path: '/home/ubuntu/smart-todo-backend-staging',
      'post-deploy': 'source venv/bin/activate && pip install -r requirements.txt && python manage.py migrate && python manage.py collectstatic --noinput && pm2 reload ecosystem.config.js --env staging'
    }
  }
};
