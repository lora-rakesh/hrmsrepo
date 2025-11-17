"""
HRMS URL Configuration
Main URL routing with API versioning and documentation
"""
from django.contrib import admin
from django.urls import path, include
from django.conf import settings
from django.conf.urls.static import static
from rest_framework import permissions
from drf_yasg.views import get_schema_view
from drf_yasg import openapi

# OpenAPI/Swagger Documentation
schema_view = get_schema_view(
    openapi.Info(
        title="HRMS API",
        default_version='v1',
        description="Human Resource Management System API",
        terms_of_service="https://www.example.com/policies/terms/",
        contact=openapi.Contact(email="contact@hrms.local"),
        license=openapi.License(name="MIT License"),
    ),
    public=True,
    permission_classes=(permissions.AllowAny,),
)

urlpatterns = [
    # Admin
    path('admin/', admin.site.urls),
    
    # API Documentation
    path('api/docs/', schema_view.with_ui('swagger', cache_timeout=0), name='schema-swagger-ui'),
    path('api/redoc/', schema_view.with_ui('redoc', cache_timeout=0), name='schema-redoc'),
    
    # API Routes
    path('api/v1/auth/', include('apps.accounts.urls')),
    path('api/v1/employees/', include('apps.employees.urls')),
    path('api/v1/leaves/', include('apps.leaves.urls')),
    path('api/v1/attendance/', include('apps.attendance.urls')),
    path('api/v1/payroll/', include('apps.payroll.urls')),
    path('api/v1/recruitment/', include('apps.recruitment.urls')),
    path('api/v1/reports/', include('apps.reports.urls')),
    path('api/v1/core/', include('apps.core.urls')),
    path('api-auth/',include('rest_framework.urls')),
]

# Serve media files in development
if settings.DEBUG:
    urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)