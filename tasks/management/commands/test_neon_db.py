from django.core.management.base import BaseCommand
from django.db import connection
from django.conf import settings
import os
import psycopg2
from psycopg2 import OperationalError

class Command(BaseCommand):
    help = 'Test Neon database connection and display configuration'

    def add_arguments(self, parser):
        parser.add_argument(
            '--show-config',
            action='store_true',
            help='Show database configuration (without password)',
        )

    def handle(self, *args, **options):
        self.stdout.write('🔍 Testing Neon Database Connection...\n')
        
        if options['show_config']:
            self.show_database_config()
        
        # Test Django database connection
        self.test_django_connection()
        
        # Test direct psycopg2 connection
        self.test_direct_connection()
        
        # Test database operations
        self.test_database_operations()

    def show_database_config(self):
        """Display current database configuration"""
        self.stdout.write('📋 Current Database Configuration:')
        db_config = settings.DATABASES['default']
        
        config_items = [
            ('Engine', db_config.get('ENGINE', 'Not set')),
            ('Name', db_config.get('NAME', 'Not set')),
            ('User', db_config.get('USER', 'Not set')),
            ('Host', db_config.get('HOST', 'Not set')),
            ('Port', db_config.get('PORT', 'Not set')),
            ('Password', '***' if db_config.get('PASSWORD') else 'Not set'),
        ]
        
        for key, value in config_items:
            self.stdout.write(f'  {key}: {value}')
        
        # Show SSL settings if present
        options = db_config.get('OPTIONS', {})
        if options:
            self.stdout.write('  Options:')
            for key, value in options.items():
                self.stdout.write(f'    {key}: {value}')
        
        self.stdout.write('')

    def test_django_connection(self):
        """Test Django's database connection"""
        self.stdout.write('🔗 Testing Django database connection...')
        
        try:
            with connection.cursor() as cursor:
                cursor.execute('SELECT version();')
                result = cursor.fetchone()
                self.stdout.write(
                    self.style.SUCCESS(f'✅ Django connection successful!')
                )
                self.stdout.write(f'   PostgreSQL version: {result[0]}\n')
        except Exception as e:
            self.stdout.write(
                self.style.ERROR(f'❌ Django connection failed: {str(e)}\n')
            )

    def test_direct_connection(self):
        """Test direct psycopg2 connection"""
        self.stdout.write('🔧 Testing direct psycopg2 connection...')
        
        # Get database config from Django settings
        db_config = settings.DATABASES['default']
        
        connection_params = {
            'host': db_config['HOST'],
            'database': db_config['NAME'],
            'user': db_config['USER'],
            'password': db_config['PASSWORD'],
            'port': db_config['PORT'],
        }
        
        # Add SSL mode for Neon
        connection_params['sslmode'] = 'require'
        
        try:
            conn = psycopg2.connect(**connection_params)
            cursor = conn.cursor()
            
            # Test query
            cursor.execute('SELECT current_database(), current_user, inet_server_addr(), inet_server_port();')
            result = cursor.fetchone()
            
            self.stdout.write(
                self.style.SUCCESS('✅ Direct connection successful!')
            )
            self.stdout.write(f'   Database: {result[0]}')
            self.stdout.write(f'   User: {result[1]}')
            self.stdout.write(f'   Server IP: {result[2] or "Not available"}')
            self.stdout.write(f'   Server Port: {result[3] or "Not available"}\n')
            
            cursor.close()
            conn.close()
            
        except OperationalError as e:
            self.stdout.write(
                self.style.ERROR(f'❌ Direct connection failed: {str(e)}\n')
            )

    def test_database_operations(self):
        """Test basic database operations"""
        self.stdout.write('🧪 Testing database operations...')
        
        try:
            with connection.cursor() as cursor:
                # Test table listing
                cursor.execute("""
                    SELECT table_name 
                    FROM information_schema.tables 
                    WHERE table_schema = 'public' 
                    AND table_type = 'BASE TABLE'
                    ORDER BY table_name;
                """)
                tables = cursor.fetchall()
                
                self.stdout.write(f'📊 Found {len(tables)} tables in database:')
                for table in tables:
                    cursor.execute(f"SELECT COUNT(*) FROM {table[0]};")
                    count = cursor.fetchone()[0]
                    self.stdout.write(f'   {table[0]}: {count} records')
                
                # Test connection info
                cursor.execute('SELECT current_setting(\'server_version\');')
                version = cursor.fetchone()[0]
                
                cursor.execute('SELECT current_setting(\'ssl\');')
                ssl_status = cursor.fetchone()[0]
                
                self.stdout.write(f'\n🔒 Connection Security:')
                self.stdout.write(f'   PostgreSQL version: {version}')
                self.stdout.write(f'   SSL enabled: {ssl_status}')
                
                self.stdout.write(
                    self.style.SUCCESS('\n✅ All database operations successful!')
                )
                
        except Exception as e:
            self.stdout.write(
                self.style.ERROR(f'❌ Database operations failed: {str(e)}\n')
            )

    def test_neon_specific_features(self):
        """Test Neon-specific features"""
        self.stdout.write('☁️  Testing Neon-specific features...')
        
        try:
            with connection.cursor() as cursor:
                # Check if we're on Neon
                cursor.execute("SELECT current_setting('neon.tenant_id') AS tenant_id;")
                try:
                    tenant_id = cursor.fetchone()[0]
                    self.stdout.write(f'   Neon Tenant ID: {tenant_id}')
                except:
                    self.stdout.write('   Not running on Neon or tenant_id not available')
                
                # Check connection pooling
                cursor.execute('SHOW max_connections;')
                max_conn = cursor.fetchone()[0]
                self.stdout.write(f'   Max connections: {max_conn}')
                
        except Exception as e:
            self.stdout.write(f'⚠️  Neon feature check failed: {str(e)}')
