#!/bin/bash
# PM2 Management Scripts for Smart Todo Backend

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Configuration
APP_NAME="smart-todo-backend"
WORKER_NAME="smart-todo-worker"
APP_DIR="/home/ubuntu/smart-todo-backend"
LOG_DIR="$APP_DIR/logs"

# Ensure we're in the right directory
cd $APP_DIR

# Create logs directory if it doesn't exist
mkdir -p $LOG_DIR

case "$1" in
    "start")
        echo -e "${GREEN}🚀 Starting Smart Todo Backend with PM2...${NC}"
        
        # Activate virtual environment and start with PM2
        source venv/bin/activate
        pm2 start ecosystem.config.js --env production
        
        # Save PM2 configuration
        pm2 save
        
        echo -e "${GREEN}✅ Application started successfully!${NC}"
        pm2 status
        ;;
        
    "stop")
        echo -e "${YELLOW}⏹️  Stopping Smart Todo Backend...${NC}"
        pm2 stop $APP_NAME $WORKER_NAME
        echo -e "${GREEN}✅ Application stopped!${NC}"
        ;;
        
    "restart")
        echo -e "${YELLOW}🔄 Restarting Smart Todo Backend...${NC}"
        pm2 restart $APP_NAME $WORKER_NAME
        echo -e "${GREEN}✅ Application restarted!${NC}"
        pm2 status
        ;;
        
    "reload")
        echo -e "${YELLOW}♻️  Reloading Smart Todo Backend (Zero Downtime)...${NC}"
        pm2 reload $APP_NAME $WORKER_NAME
        echo -e "${GREEN}✅ Application reloaded!${NC}"
        pm2 status
        ;;
        
    "status")
        echo -e "${GREEN}📊 PM2 Status:${NC}"
        pm2 status
        ;;
        
    "logs")
        echo -e "${GREEN}📋 Showing PM2 logs (Ctrl+C to exit):${NC}"
        pm2 logs $APP_NAME --lines 50
        ;;
        
    "logs-worker")
        echo -e "${GREEN}📋 Showing Worker logs (Ctrl+C to exit):${NC}"
        pm2 logs $WORKER_NAME --lines 50
        ;;
        
    "monitor")
        echo -e "${GREEN}📈 Opening PM2 Monitor (Ctrl+C to exit):${NC}"
        pm2 monit
        ;;
        
    "deploy")
        echo -e "${GREEN}🚀 Deploying Smart Todo Backend...${NC}"
        
        # Backup current version
        echo -e "${YELLOW}📦 Creating backup...${NC}"
        BACKUP_DIR="/home/ubuntu/backups"
        mkdir -p $BACKUP_DIR
        DATE=$(date +%Y%m%d_%H%M%S)
        tar -czf $BACKUP_DIR/app_backup_$DATE.tar.gz .
        
        # Pull latest code
        echo -e "${YELLOW}📥 Pulling latest code...${NC}"
        git fetch origin
        git reset --hard origin/main
        
        # Activate virtual environment
        echo -e "${YELLOW}🐍 Activating virtual environment...${NC}"
        source venv/bin/activate
        
        # Install/update dependencies
        echo -e "${YELLOW}📚 Installing dependencies...${NC}"
        pip install -r requirements.txt
        
        # Run migrations
        echo -e "${YELLOW}🗄️ Running database migrations...${NC}"
        python manage.py migrate
        
        # Collect static files
        echo -e "${YELLOW}📁 Collecting static files...${NC}"
        python manage.py collectstatic --noinput
        
        # Reload PM2 processes (zero downtime)
        echo -e "${YELLOW}♻️ Reloading PM2 processes...${NC}"
        pm2 reload ecosystem.config.js --env production
        
        # Health check
        echo -e "${YELLOW}🏥 Running health check...${NC}"
        sleep 5
        response=$(curl -s -o /dev/null -w "%{http_code}" http://localhost:8001/api/tasks/)
        if [ $response -eq 200 ]; then
            echo -e "${GREEN}✅ Deployment successful! API is responding.${NC}"
        else
            echo -e "${RED}❌ Deployment may have failed. API not responding properly.${NC}"
            echo -e "${YELLOW}📋 Check logs for details:${NC}"
            pm2 logs $APP_NAME --lines 20
            exit 1
        fi
        
        echo -e "${GREEN}🎉 Deployment completed successfully!${NC}"
        pm2 status
        ;;
        
    "setup")
        echo -e "${GREEN}🛠️  Setting up Smart Todo Backend for first time...${NC}"
        
        # Create logs directory
        mkdir -p $LOG_DIR
        
        # Install PM2 if not installed
        if ! command -v pm2 &> /dev/null; then
            echo -e "${YELLOW}📦 Installing PM2...${NC}"
            sudo npm install -g pm2
        fi
        
        # Create virtual environment if it doesn't exist
        if [ ! -d "venv" ]; then
            echo -e "${YELLOW}🐍 Creating virtual environment...${NC}"
            python3 -m venv venv
        fi
        
        # Activate virtual environment
        source venv/bin/activate
        
        # Install dependencies
        echo -e "${YELLOW}📚 Installing Python dependencies...${NC}"
        pip install -r requirements.txt
        
        # Copy environment file
        if [ ! -f ".env" ]; then
            echo -e "${YELLOW}📄 Creating environment file...${NC}"
            cp .env.production .env
            echo -e "${RED}⚠️  Please update .env file with your actual configuration values!${NC}"
        fi
        
        # Run migrations
        echo -e "${YELLOW}🗄️ Running database migrations...${NC}"
        python manage.py migrate
        
        # Collect static files
        echo -e "${YELLOW}📁 Collecting static files...${NC}"
        python manage.py collectstatic --noinput
        
        # Start PM2
        echo -e "${YELLOW}🚀 Starting PM2 processes...${NC}"
        pm2 start ecosystem.config.js --env production
        pm2 save
        
        # Setup PM2 startup
        echo -e "${YELLOW}🔧 Setting up PM2 startup...${NC}"
        pm2 startup ubuntu -u ubuntu --hp /home/ubuntu
        echo -e "${GREEN}✅ Please run the command shown above to enable PM2 startup!${NC}"
        
        echo -e "${GREEN}🎉 Setup completed!${NC}"
        pm2 status
        ;;
        
    "backup")
        echo -e "${GREEN}💾 Creating application backup...${NC}"
        BACKUP_DIR="/home/ubuntu/backups"
        mkdir -p $BACKUP_DIR
        DATE=$(date +%Y%m%d_%H%M%S)
        
        # Backup application files
        tar -czf $BACKUP_DIR/app_backup_$DATE.tar.gz --exclude='venv' --exclude='node_modules' --exclude='logs' .
        
        # Backup database (if using local PostgreSQL)
        if [ ! -z "$DB_HOST" ] && [ "$DB_HOST" != "localhost" ]; then
            echo -e "${YELLOW}📊 Database is remote (Neon), backup handled by Neon.${NC}"
        fi
        
        echo -e "${GREEN}✅ Backup created: $BACKUP_DIR/app_backup_$DATE.tar.gz${NC}"
        ;;
        
    "health")
        echo -e "${GREEN}🏥 Health Check:${NC}"
        
        # Check PM2 processes
        echo -e "${YELLOW}PM2 Processes:${NC}"
        pm2 jlist | jq -r '.[] | "\(.name): \(.pm2_env.status) (CPU: \(.monit.cpu)%, Memory: \(.monit.memory/1024/1024 | floor)MB)"'
        
        # Check API endpoint
        echo -e "\n${YELLOW}API Health:${NC}"
        response=$(curl -s -o /dev/null -w "%{http_code}" http://localhost:8001/api/tasks/)
        if [ $response -eq 200 ]; then
            echo -e "${GREEN}✅ API is responding (HTTP $response)${NC}"
        else
            echo -e "${RED}❌ API is not responding properly (HTTP $response)${NC}"
        fi
        
        # Check disk space
        echo -e "\n${YELLOW}Disk Usage:${NC}"
        df -h $APP_DIR
        
        # Check memory usage
        echo -e "\n${YELLOW}Memory Usage:${NC}"
        free -h
        ;;
        
    *)
        echo -e "${GREEN}🔧 PM2 Management Script for Smart Todo Backend${NC}"
        echo ""
        echo "Usage: $0 {command}"
        echo ""
        echo "Available commands:"
        echo "  setup      - First-time setup (install dependencies, create env, etc.)"
        echo "  start      - Start the application with PM2"
        echo "  stop       - Stop all PM2 processes"
        echo "  restart    - Restart all PM2 processes"
        echo "  reload     - Reload processes (zero downtime)"
        echo "  status     - Show PM2 process status"
        echo "  logs       - Show application logs"
        echo "  logs-worker- Show worker logs"
        echo "  monitor    - Open PM2 monitoring interface"
        echo "  deploy     - Pull latest code and deploy"
        echo "  backup     - Create application backup"
        echo "  health     - Show system and application health"
        echo ""
        echo "Examples:"
        echo "  $0 setup       # First time setup"
        echo "  $0 start       # Start application"
        echo "  $0 deploy      # Deploy latest changes"
        echo "  $0 health      # Check application health"
        ;;
esac
