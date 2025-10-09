#!/bin/bash

# HRMS Local Development Setup Script

set -e

echo "🚀 Setting up HRMS for local development..."

# Check if Python is installed
if ! command -v python3 &> /dev/null; then
    echo "❌ Python 3 is required but not installed."
    exit 1
fi

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo "❌ Node.js is required but not installed."
    exit 1
fi

# Check if PostgreSQL is running
if ! pg_isready -q; then
    echo "⚠️  PostgreSQL is not running. Please start PostgreSQL service."
    echo "   On macOS: brew services start postgresql"
    echo "   On Ubuntu: sudo systemctl start postgresql"
    exit 1
fi

echo "✅ Prerequisites check passed"

# Create Python virtual environment
echo "📦 Creating Python virtual environment..."
cd backend
if [ ! -d "venv" ]; then
    python3 -m venv venv
fi

# Activate virtual environment
source venv/bin/activate

# Install Python dependencies
echo "📦 Installing Python dependencies..."
pip install -r requirements.txt

# Create database
echo "🗄️  Setting up database..."
createdb hrms_db 2>/dev/null || echo "Database already exists"

# Run migrations
echo "🔄 Running database migrations..."
python manage.py migrate

# Load demo data
echo "📊 Loading demo data..."
python manage.py loaddata fixtures/demo_data.json
python manage.py create_demo_users

echo "✅ Backend setup complete!"

# Setup frontend
cd ..
echo "📦 Installing frontend dependencies..."
npm install

echo "✅ Frontend setup complete!"

echo ""
echo "🎉 Setup complete! You can now run the application:"
echo ""
echo "Backend (Django):"
echo "  cd backend && source venv/bin/activate && python manage.py runserver"
echo ""
echo "Frontend (React):"
echo "  npm run dev"
echo ""
echo "Demo credentials:"
echo "  Admin: admin@brandselevate.com / admin123"
echo "  HR Manager: hr@brandselevate.com / hr123"
echo "  Team Lead: teamlead@brandselevate.com / teamlead123"
echo "  Employee: employee@brandselevate.com / emp123"
echo ""
echo "API Documentation: http://localhost:8000/api/docs/"
echo "Frontend: http://localhost:5173"