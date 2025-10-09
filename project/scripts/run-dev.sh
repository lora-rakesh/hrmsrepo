#!/bin/bash

# Development server runner script

set -e

echo "🚀 Starting HRMS development servers..."

# Function to run backend
run_backend() {
    echo "Starting Django backend server..."
    cd backend
    source venv/bin/activate
    python manage.py runserver
}

# Function to run frontend
run_frontend() {
    echo "Starting React frontend server..."
    npm run dev
}

# Check if we should run both or specific service
case "${1:-both}" in
    "backend")
        run_backend
        ;;
    "frontend")
        run_frontend
        ;;
    "both"|*)
        echo "Starting both backend and frontend..."
        echo "Backend will run on http://localhost:8000"
        echo "Frontend will run on http://localhost:5173"
        echo ""
        
        # Run backend in background
        run_backend &
        BACKEND_PID=$!
        
        # Wait a moment for backend to start
        sleep 3
        
        # Run frontend in foreground
        run_frontend
        
        # Kill backend when frontend stops
        kill $BACKEND_PID 2>/dev/null || true
        ;;
esac