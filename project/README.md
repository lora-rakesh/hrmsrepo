# Mana HR - HRMS

A comprehensive Human Resource Management System built with Django REST Framework and React TypeScript.

## 🚀 Quick Start (Local Development)

### Prerequisites
- Python 3.11+
- Node.js 18+
- PostgreSQL 13+
- Redis (optional, for Celery)

### Automated Setup
```bash
# Clone and setup everything
./scripts/setup.sh

# Run development servers
./scripts/run-dev.sh
```

### Manual Setup

#### 1. Backend Setup
```bash
cd backend

# Create virtual environment
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt

# Setup database
createdb hrms_db
python manage.py migrate
python manage.py loaddata fixtures/demo_data.json
python manage.py create_demo_users

# Run server
python manage.py runserver
```

#### 2. Frontend Setup
```bash
# Install dependencies
npm install

# Run development server
npm run dev
```

### Access the Application
- **Frontend**: http://localhost:5173
- **Backend API**: http://localhost:8000/api/v1
- **API Documentation**: http://localhost:8000/api/docs
- **Django Admin**: http://localhost:8000/admin

### Demo Credentials
- **Super Admin**: admin@brandselevate.com / admin123
- **HR Manager**: hr@brandselevate.com / hr123
- **Team Lead**: teamlead@brandselevate.com / teamlead123
- **Employee**: employee@brandselevate.com / emp123

## Features

### Core Modules
- **Employee Management**: Complete employee lifecycle management with profiles, documents, and employment history
- **Leave Management**: Apply, approve/reject leaves with balance tracking and workflow
- **Attendance Management**: Check-in/out, shift management, and attendance tracking
- **User Management**: Role-based access control (RBAC) with multiple user roles
- **Notifications**: In-app notification system

### User Roles
- **Super Admin**: Full system access
- **HR Manager**: Employee and leave management
- **Team Lead**: Team member management and approvals
- **Payroll Admin**: Payroll processing (skeleton)
- **Recruiter**: Recruitment management (skeleton)
- **Employee**: Self-service features

## Environment Configuration

### Backend (.env)
```bash
SECRET_KEY=your-secret-key-here
DEBUG=True
DB_NAME=hrms_db
DB_USER=hrms_user
DB_PASSWORD=hrms_password
DB_HOST=localhost
DB_PORT=5432
REDIS_URL=redis://localhost:6379/0
```

### Frontend (.env)
```bash
VITE_API_BASE_URL=http://localhost:8000/api/v1
VITE_APP_NAME=Mana HR - HRMS
```

## Tech Stack

### Backend
- Django 4.2.7
- Django REST Framework
- PostgreSQL
- Redis (Celery)
- JWT Authentication

### Frontend
- React 18
- TypeScript
- Tailwind CSS
- Vite
- React Router
- Headless UI

### DevOps
- Docker & Docker Compose
- Nginx (reverse proxy)
- GitHub Actions (CI pipeline skeleton)

## Development Commands

### Using Makefile
```bash
make help              # Show available commands
make install           # Install all dependencies
make setup-db          # Setup database and demo data
make run-backend       # Run Django server
make run-frontend      # Run React server
make test              # Run tests
make migrate           # Run Django migrations
make superuser         # Create Django superuser
```

### Manual Commands

#### Backend Commands
```bash
cd backend
python manage.py migrate                    # Run migrations
python manage.py makemigrations            # Create migrations
python manage.py createsuperuser           # Create superuser
python manage.py test                      # Run tests
python manage.py create_demo_users         # Create demo users
python manage.py collectstatic             # Collect static files
```

#### Frontend Commands
```bash
npm run dev            # Start development server
npm run build          # Build for production
npm run preview        # Preview production build
npm run lint           # Run ESLint
npm run type-check     # Run TypeScript checks
```

## Docker Setup (Alternative)

### Using Docker (Recommended)

1. Clone the repository:
```bash
git clone <repository-url>
cd hrms-system
```

2. Start all services:
```bash
docker-compose up -d
```

3. Create a superuser:
```bash
docker-compose exec backend python manage.py createsuperuser
```

4. Load demo data (optional):
```bash
docker-compose exec backend python manage.py loaddata fixtures/demo_data.json
```

5. Access the application:
- Frontend: http://localhost:5173
- Backend API: http://localhost:8000/api/v1
- Django Admin: http://localhost:8000/admin
- API Documentation: http://localhost:8000/api/docs

## API Documentation

API documentation is available at:
- Swagger UI: http://localhost:8000/api/docs/
- ReDoc: http://localhost:8000/api/redoc/

## Project Structure

```
hrms-system/
├── backend/                 # Django backend
│   ├── hrms/               # Main Django project
│   ├── apps/               # Django applications
│   │   ├── accounts/       # User management
│   │   ├── core/          # Core models and utilities
│   │   ├── employees/     # Employee management
│   │   ├── leaves/        # Leave management
│   │   ├── attendance/    # Attendance management
│   │   ├── payroll/       # Payroll management (skeleton)
│   │   ├── recruitment/   # Recruitment (skeleton)
│   │   └── reports/       # Reporting (skeleton)
│   ├── requirements.txt   # Python dependencies
│   └── Dockerfile        # Backend Docker config
├── src/                   # React frontend source
│   ├── components/       # Reusable UI components
│   ├── contexts/         # React contexts
│   ├── pages/           # Page components
│   ├── services/        # API services
│   ├── types/           # TypeScript types
│   └── utils/           # Utility functions
├── docker-compose.yml    # Multi-service Docker setup
├── nginx.conf           # Nginx configuration
└── README.md           # This file
```

## Testing

### Backend Tests
```bash
cd backend
python manage.py test
```

### Frontend Tests
```bash
npm run test
```

## Troubleshooting

### Common Issues

1. **Database Connection Error**
   ```bash
   # Make sure PostgreSQL is running
   pg_isready
   
   # Create database if it doesn't exist
   createdb hrms_db
   ```

2. **Python Dependencies Issues**
   ```bash
   # Upgrade pip
   pip install --upgrade pip
   
   # Clear cache and reinstall
   pip cache purge
   pip install -r requirements.txt
   ```

3. **Node.js Dependencies Issues**
   ```bash
   # Clear cache and reinstall
   rm -rf node_modules package-lock.json
   npm install
   ```

4. **Port Already in Use**
   ```bash
   # Kill process on port 8000 (Django)
   lsof -ti:8000 | xargs kill -9
   
   # Kill process on port 5173 (Vite)
   lsof -ti:5173 | xargs kill -9
   ```

## Deployment

### Production Environment Variables

Update environment variables for production:
- Set `DEBUG=False`
- Use strong `SECRET_KEY`
- Configure proper database credentials
- Set up email service credentials
- Configure allowed hosts

### Docker Production Build
```bash
docker-compose -f docker-compose.prod.yml up -d
```

## Development Workflow

### Adding New Features
1. Create feature branch from main
2. Add/modify Django models in appropriate app
3. Create and run migrations
4. Add API endpoints (serializers, views, URLs)
5. Add frontend components and pages
6. Add tests for new functionality
7. Update documentation
8. Create pull request

### Code Style
- **Backend**: Follow PEP 8, use Black for formatting
- **Frontend**: Use ESLint and Prettier configurations
- **Commits**: Use conventional commit messages

## Multi-Tenant Preparation

The system is designed with multi-tenancy in mind:

1. **Organization Model**: Core organization structure ready for expansion
2. **User Organization Link**: Users are linked to organizations
3. **Middleware Ready**: Tenant detection middleware can be added
4. **Database Structure**: Foreign keys designed for tenant isolation

To enable multi-tenancy:
1. Add tenant middleware
2. Update QuerySets to filter by organization
3. Add organization context to all operations
4. Update authentication to include tenant information

## Security Considerations

- JWT tokens stored securely in httpOnly cookies (recommended)
- CORS properly configured for development/production
- Input validation on all API endpoints
- Role-based access control (RBAC) implemented
- SQL injection protection via Django ORM
- XSS protection via React's built-in escaping

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## Performance Optimization

### Backend
- Database query optimization with select_related/prefetch_related
- API pagination for large datasets
- Caching with Redis for frequently accessed data
- Background tasks with Celery for heavy operations

### Frontend
- Code splitting with React.lazy()
- Memoization with React.memo() and useMemo()
- Virtual scrolling for large lists
- Image optimization and lazy loading

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Support

For support and questions:
- Create an issue in the repository
- Contact: support@brandselevate.com

## Roadmap

### Phase 1 (Current)
- ✅ Complete HRMS foundation
- ✅ Employee management system
- ✅ Leave management workflow
- ✅ Attendance tracking system
- ✅ Role-based access control
- ✅ Production-ready architecture

### Phase 2 (Planned)
- [ ] Complete payroll module
- [ ] Advanced reporting
- [ ] Performance management
- [ ] Recruitment workflow
- [ ] Document management
- [ ] Mobile application

### Phase 3 (Future)
- [ ] Multi-tenant architecture
- [ ] Advanced analytics
- [ ] Integration with external systems
- [ ] AI-powered features
- [ ] Advanced workflow engine