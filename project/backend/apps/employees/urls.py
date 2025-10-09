"""
Employee URLs
"""
from django.urls import path, include
from rest_framework.routers import DefaultRouter
from rest_framework_nested import routers
from . import views

router = DefaultRouter()
router.register('', views.EmployeeViewSet, basename='employee')

# Nested router for employee documents
employee_router = routers.NestedDefaultRouter(router, '', lookup='employee')
employee_router.register('documents', views.EmployeeDocumentViewSet, basename='employee-documents')

urlpatterns = [
    path('', include(router.urls)),
    path('', include(employee_router.urls)),
]