"""
Leave management views
"""
from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from django.db.models import Q
from django.utils import timezone
from .models import LeaveType, LeaveBalance, LeaveRequest, Holiday, LeaveRequestComment
from .serializers import (
    LeaveTypeSerializer, LeaveBalanceSerializer, LeaveRequestSerializer,
    LeaveRequestCreateSerializer, HolidaySerializer, LeaveRequestCommentSerializer
)
from apps.accounts.permissions import IsSuperAdminOrHRManager

class LeaveTypeViewSet(viewsets.ModelViewSet):
    """
    ViewSet for managing leave types
    """
    queryset = LeaveType.objects.filter(is_active=True)  # Add queryset attribute
    serializer_class = LeaveTypeSerializer
    
    def get_queryset(self):
        """Return active leave types for all users"""
        return LeaveType.objects.filter(is_active=True)
    
    def get_permissions(self):
        """
        Set permissions based on action:
        - All authenticated users can view leave types
        - Only super admins and HR managers can modify leave types
        """
        if self.action in ['create', 'update', 'partial_update', 'destroy']:
            permission_classes = [IsSuperAdminOrHRManager]
        else:
            # Allow all authenticated users to view leave types
            permission_classes = [IsAuthenticated]
        return [permission() for permission in permission_classes]

class LeaveBalanceViewSet(viewsets.ReadOnlyModelViewSet):
    """
    ViewSet for viewing leave balances
    """
    queryset = LeaveBalance.objects.all()  # Add queryset
    serializer_class = LeaveBalanceSerializer
    permission_classes = [IsAuthenticated]
    
    def get_queryset(self):
        user = self.request.user
        current_year = timezone.now().year
        
        if user.role in ['SUPER_ADMIN', 'HR_MANAGER']:
            return LeaveBalance.objects.filter(year=current_year)
        elif user.role == 'TEAM_LEAD':
            # Team leads can see their team members' balances
            return LeaveBalance.objects.filter(
                Q(employee__user=user) | Q(employee__manager__user=user),
                year=current_year
            )
        else:
            # Employees can only see their own balances
            if hasattr(user, 'employee_profile'):
                return LeaveBalance.objects.filter(
                    employee__user=user, 
                    year=current_year
                )
            return LeaveBalance.objects.none()

class LeaveRequestViewSet(viewsets.ModelViewSet):
    """
    ViewSet for managing leave requests
    """
    queryset = LeaveRequest.objects.all()  # Add queryset
    permission_classes = [IsAuthenticated]
    
    def get_serializer_class(self):
        if self.action == 'create':
            return LeaveRequestCreateSerializer
        return LeaveRequestSerializer
    
    def get_queryset(self):
        user = self.request.user
        
        if user.role in ['SUPER_ADMIN', 'HR_MANAGER']:
            return LeaveRequest.objects.all()
        elif user.role == 'TEAM_LEAD':
            # Team leads can see their team members' requests
            return LeaveRequest.objects.filter(
                Q(employee__user=user) | Q(employee__manager__user=user)
            )
        else:
            # Employees can only see their own requests
            if hasattr(user, 'employee_profile'):
                return LeaveRequest.objects.filter(employee__user=user)
            return LeaveRequest.objects.none()
    
    def perform_create(self, serializer):
        """Set the employee when creating a leave request"""
        if hasattr(self.request.user, 'employee_profile'):
            serializer.save(employee=self.request.user.employee_profile)
        else:
            from rest_framework.exceptions import PermissionDenied
            raise PermissionDenied("Employee profile not found")
    
    @action(detail=True, methods=['post'])
    def approve(self, request, pk=None):
        """Approve leave request"""
        if request.user.role not in ['SUPER_ADMIN', 'HR_MANAGER', 'TEAM_LEAD']:
            return Response(
                {'error': 'Permission denied'}, 
                status=status.HTTP_403_FORBIDDEN
            )
        
        leave_request = self.get_object()
        if leave_request.status != 'PENDING':
            return Response(
                {'error': 'Only pending requests can be approved'}, 
                status=status.HTTP_400_BAD_REQUEST
            )
        
        leave_request.status = 'APPROVED'
        leave_request.approved_by = request.user
        leave_request.approved_date = timezone.now()
        leave_request.save()
        
        return Response({'status': 'Leave request approved'})
    
    @action(detail=True, methods=['post'])
    def reject(self, request, pk=None):
        """Reject leave request"""
        if request.user.role not in ['SUPER_ADMIN', 'HR_MANAGER', 'TEAM_LEAD']:
            return Response(
                {'error': 'Permission denied'}, 
                status=status.HTTP_403_FORBIDDEN
            )
        
        leave_request = self.get_object()
        if leave_request.status != 'PENDING':
            return Response(
                {'error': 'Only pending requests can be rejected'}, 
                status=status.HTTP_400_BAD_REQUEST
            )
        
        rejection_reason = request.data.get('reason', '')
        leave_request.status = 'REJECTED'
        leave_request.approved_by = request.user
        leave_request.approved_date = timezone.now()
        leave_request.rejection_reason = rejection_reason
        leave_request.save()
        
        return Response({'status': 'Leave request rejected'})
    
    @action(detail=False, methods=['get'])
    def pending(self, request):
        """Get pending leave requests for approval"""
        if request.user.role not in ['SUPER_ADMIN', 'HR_MANAGER', 'TEAM_LEAD']:
            return Response(
                {'error': 'Permission denied'}, 
                status=status.HTTP_403_FORBIDDEN
            )
        
        pending_requests = self.get_queryset().filter(status='PENDING')
        serializer = self.get_serializer(pending_requests, many=True)
        return Response(serializer.data)

class HolidayViewSet(viewsets.ModelViewSet):
    """
    ViewSet for managing holidays
    """
    queryset = Holiday.objects.all()  # Add queryset
    serializer_class = HolidaySerializer
    
    def get_queryset(self):
        current_year = timezone.now().year
        return Holiday.objects.filter(date__year=current_year)
    
    def get_permissions(self):
        if self.action in ['create', 'update', 'partial_update', 'destroy']:
            permission_classes = [IsSuperAdminOrHRManager]
        else:
            permission_classes = [IsAuthenticated]
        return [permission() for permission in permission_classes]

class LeaveRequestCommentViewSet(viewsets.ModelViewSet):
    """
    ViewSet for managing leave request comments
    """
    queryset = LeaveRequestComment.objects.all()  # Add queryset
    serializer_class = LeaveRequestCommentSerializer
    permission_classes = [IsAuthenticated]
    
    def perform_create(self, serializer):
        serializer.save(user=self.request.user)