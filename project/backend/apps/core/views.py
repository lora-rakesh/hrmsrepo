"""
Core app views
"""
from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from .models import Organization, Department, JobTitle, Notification
from .serializers import (
    OrganizationSerializer, DepartmentSerializer, 
    JobTitleSerializer, NotificationSerializer
)
from apps.accounts.permissions import IsSuperAdminOrHRManager

class OrganizationViewSet(viewsets.ModelViewSet):
    """
    ViewSet for managing organizations
    """
    queryset = Organization.objects.all()
    serializer_class = OrganizationSerializer
    permission_classes = [IsSuperAdminOrHRManager]

class DepartmentViewSet(viewsets.ModelViewSet):
    """
    ViewSet for managing departments
    """
    queryset = Department.objects.filter(is_active=True)
    serializer_class = DepartmentSerializer
    permission_classes = [IsSuperAdminOrHRManager]
    
    def get_queryset(self):
        queryset = super().get_queryset()
        organization_id = self.request.query_params.get('organization', None)
        if organization_id:
            queryset = queryset.filter(organization_id=organization_id)
        return queryset

class JobTitleViewSet(viewsets.ModelViewSet):
    """
    ViewSet for managing job titles
    """
    queryset = JobTitle.objects.filter(is_active=True)
    serializer_class = JobTitleSerializer
    permission_classes = [IsSuperAdminOrHRManager]
    
    def get_queryset(self):
        queryset = super().get_queryset()
        department_id = self.request.query_params.get('department', None)
        if department_id:
            queryset = queryset.filter(department_id=department_id)
        return queryset

class NotificationViewSet(viewsets.ModelViewSet):
    """
    ViewSet for managing notifications
    """
    queryset = Notification.objects.all()
    serializer_class = NotificationSerializer
    permission_classes = [IsAuthenticated]
    
    def get_queryset(self):
        return Notification.objects.filter(recipient=self.request.user)
    
    @action(detail=True, methods=['post'])
    def mark_as_read(self, request, pk=None):
        """Mark notification as read"""
        notification = self.get_object()
        notification.is_read = True
        notification.save()
        return Response({'status': 'notification marked as read'})
    
    @action(detail=False, methods=['post'])
    def mark_all_as_read(self, request):
        """Mark all notifications as read"""
        self.get_queryset().update(is_read=True)
        return Response({'status': 'all notifications marked as read'})