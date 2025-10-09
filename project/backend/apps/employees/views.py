"""
Employee management views
"""
from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from django.db import transaction
from .models import (
    Employee, EmployeeDocument, EmploymentHistory, 
    SkillSet, EducationRecord
)
from .serializers import (
    EmployeeSerializer, EmployeeCreateSerializer, EmployeeListSerializer,
    EmployeeDocumentSerializer, EmploymentHistorySerializer,
    SkillSetSerializer, EducationRecordSerializer, EmployeeDetailSerializer
)
from apps.accounts.permissions import IsSuperAdminOrHRManager, IsOwnerOrHRManager
from django.contrib.auth import get_user_model

User = get_user_model()

class EmployeeViewSet(viewsets.ModelViewSet):
    """
    ViewSet for employee management
    """
    permission_classes = [IsAuthenticated]
    
    def get_serializer_class(self):
        if self.action == 'list':
            return EmployeeListSerializer
        elif self.action == 'create':
            return EmployeeCreateSerializer
        elif self.action == 'retrieve':
            return EmployeeDetailSerializer
        return EmployeeSerializer
    
    def get_queryset(self):
        queryset = Employee.objects.select_related(
            'user', 'department', 'job_title', 'manager'
        ).filter(employment_status='ACTIVE')
        
        # Filter based on user role
        user = self.request.user
        if user.role in ['SUPER_ADMIN', 'HR_MANAGER']:
            return queryset
        elif user.role == 'TEAM_LEAD':
            # Team leads can see their team members
            return queryset.filter(manager__user=user)
        else:
            # Employees can only see their own profile
            return queryset.filter(user=user)
    
    def get_permissions(self):
        if self.action in ['create', 'update', 'partial_update', 'destroy']:
            self.permission_classes = [IsSuperAdminOrHRManager]
        elif self.action in ['retrieve', 'update_profile']:
            self.permission_classes = [IsOwnerOrHRManager]
        return super().get_permissions()
    
    @action(detail=True, methods=['put'])
    def update_profile(self, request, pk=None):
        """Allow employees to update their own profile (limited fields)"""
        employee = self.get_object()
        
        # Only allow certain fields for self-update
        allowed_fields = [
            'personal_email', 'current_address', 'emergency_contact_name',
            'emergency_contact_phone', 'emergency_contact_relation'
        ]
        
        data = {k: v for k, v in request.data.items() if k in allowed_fields}
        serializer = self.get_serializer(employee, data=data, partial=True)
        
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
    
    @action(detail=True, methods=['post'])
    def terminate(self, request, pk=None):
        """Terminate employee"""
        employee = self.get_object()
        termination_date = request.data.get('termination_date')
        reason = request.data.get('reason', '')
        
        if not termination_date:
            return Response(
                {'error': 'Termination date is required'}, 
                status=status.HTTP_400_BAD_REQUEST
            )
        
        employee.employment_status = 'TERMINATED'
        employee.date_of_leaving = termination_date
        employee.save()
        
        # Deactivate user account
        employee.user.is_active = False
        employee.user.save()
        
        return Response({'status': 'Employee terminated successfully'})

class EmployeeDocumentViewSet(viewsets.ModelViewSet):
    """
    ViewSet for employee documents
    """
    serializer_class = EmployeeDocumentSerializer
    permission_classes = [IsAuthenticated]
    
    def get_queryset(self):
        employee_id = self.kwargs.get('employee_pk')
        return EmployeeDocument.objects.filter(employee_id=employee_id)
    
    def perform_create(self, serializer):
        employee_id = self.kwargs.get('employee_pk')
        serializer.save(employee_id=employee_id)
    
    @action(detail=True, methods=['post'])
    def verify(self, request, employee_pk=None, pk=None):
        """Verify document (HR only)"""
        if not request.user.is_hr_manager():
            return Response(
                {'error': 'Permission denied'}, 
                status=status.HTTP_403_FORBIDDEN
            )
        
        document = self.get_object()
        document.is_verified = True
        document.verified_by = request.user
        document.save()
        
        return Response({'status': 'Document verified'})