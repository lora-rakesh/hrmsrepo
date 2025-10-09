"""
Attendance views
"""
from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from django.db.models import Q
from django.utils import timezone
from datetime import datetime, date
from django.core.exceptions import ObjectDoesNotExist
from .models import Shift, EmployeeShift, Attendance, AttendanceRequest, WorkFromHome
from .serializers import (
    ShiftSerializer, EmployeeShiftSerializer, AttendanceSerializer,
    AttendanceCheckInSerializer, AttendanceCheckOutSerializer,
    AttendanceRequestSerializer, WorkFromHomeSerializer
)
from apps.accounts.permissions import IsSuperAdminOrHRManager, IsOwnerOrTeamLead

class ShiftViewSet(viewsets.ModelViewSet):
    """
    ViewSet for managing shifts
    """
    serializer_class = ShiftSerializer
    permission_classes = [IsAuthenticated, IsSuperAdminOrHRManager]
    queryset = Shift.objects.all()
    
    def get_queryset(self):
        return Shift.objects.all()

class EmployeeShiftViewSet(viewsets.ModelViewSet):
    """
    ViewSet for managing employee shifts
    """
    serializer_class = EmployeeShiftSerializer
    permission_classes = [IsAuthenticated]
    
    def get_queryset(self):
        user = self.request.user
        
        if user.role in ['SUPER_ADMIN', 'HR_MANAGER']:
            return EmployeeShift.objects.all()
        elif user.role == 'TEAM_LEAD':
            return EmployeeShift.objects.filter(
                Q(employee__user=user) | Q(employee__manager__user=user)
            )
        else:
            return EmployeeShift.objects.filter(employee__user=user)

class AttendanceViewSet(viewsets.ModelViewSet):
    """
    ViewSet for managing attendance
    """
    serializer_class = AttendanceSerializer
    permission_classes = [IsAuthenticated]
    
    def get_queryset(self):
        user = self.request.user
        
        if user.role in ['SUPER_ADMIN', 'HR_MANAGER']:
            return Attendance.objects.all()
        elif user.role == 'TEAM_LEAD':
            return Attendance.objects.filter(
                Q(employee__user=user) | Q(employee__manager__user=user)
            )
        else:
            return Attendance.objects.filter(employee__user=user)
    
    def get_employee_profile(self, request):
        """Safely get employee profile with proper error handling"""
        if not hasattr(request.user, 'employee_profile'):
            raise ObjectDoesNotExist("Employee profile not found for this user")
        return request.user.employee_profile
    
    @action(detail=False, methods=['post'])
    def check_in(self, request):
        """Check in for today"""
        try:
            employee = self.get_employee_profile(request)
            today = date.today()
            
            # Check if already checked in
            existing_attendance = Attendance.objects.filter(
                employee=employee, 
                date=today
            ).first()
            
            if existing_attendance and existing_attendance.check_in_time:
                return Response(
                    {'error': 'Already checked in for today'}, 
                    status=status.HTTP_400_BAD_REQUEST
                )
            
            # Get active shift for today
            employee_shift = EmployeeShift.objects.filter(
                employee=employee,
                is_active=True,
                effective_from__lte=today,
                effective_to__gte=today
            ).first()
            
            shift = employee_shift.shift if employee_shift else None
            
            # Create attendance record
            attendance = Attendance.objects.create(
                employee=employee,
                date=today,
                shift=shift,
                check_in_time=timezone.now(),
                status='PRESENT'
            )
            
            serializer = self.get_serializer(attendance)
            return Response({
                'message': 'Checked in successfully',
                'data': serializer.data
            })
            
        except ObjectDoesNotExist as e:
            return Response(
                {'error': str(e)}, 
                status=status.HTTP_400_BAD_REQUEST
            )
        except Exception as e:
            return Response(
                {'error': f'Check-in failed: {str(e)}'}, 
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )
    
    @action(detail=False, methods=['post'])
    def check_out(self, request):
        """Check out for today"""
        try:
            employee = self.get_employee_profile(request)
            today = date.today()
            
            try:
                attendance = Attendance.objects.get(employee=employee, date=today)
            except Attendance.DoesNotExist:
                return Response(
                    {'error': 'No check-in record found for today'}, 
                    status=status.HTTP_400_BAD_REQUEST
                )
            
            if not attendance.check_in_time:
                return Response(
                    {'error': 'Must check in first'}, 
                    status=status.HTTP_400_BAD_REQUEST
                )
            
            if attendance.check_out_time:
                return Response(
                    {'error': 'Already checked out for today'}, 
                    status=status.HTTP_400_BAD_REQUEST
                )
            
            attendance.check_out_time = timezone.now()
            attendance.save()
            
            return Response({
                'message': 'Checked out successfully',
                'check_out_time': attendance.check_out_time,
                'total_hours': float(attendance.total_hours)
            })
            
        except ObjectDoesNotExist as e:
            return Response(
                {'error': str(e)}, 
                status=status.HTTP_400_BAD_REQUEST
            )
        except Exception as e:
            return Response(
                {'error': f'Check-out failed: {str(e)}'}, 
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )
    
    @action(detail=False, methods=['get'])
    def today(self, request):
        """Get today's attendance"""
        try:
            employee = self.get_employee_profile(request)
            today = date.today()
            
            attendance = Attendance.objects.filter(
                employee=employee, 
                date=today
            ).first()
            
            if attendance:
                serializer = self.get_serializer(attendance)
                return Response(serializer.data)
            else:
                return Response({
                    'date': today.isoformat(),
                    'status': 'NOT_MARKED',
                    'check_in_time': None,
                    'check_out_time': None,
                    'total_hours': 0,
                    'overtime_hours': 0
                })
                
        except ObjectDoesNotExist as e:
            return Response(
                {'error': str(e)}, 
                status=status.HTTP_400_BAD_REQUEST
            )
        except Exception as e:
            return Response(
                {'error': f'Failed to get today\'s attendance: {str(e)}'}, 
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )

class AttendanceRequestViewSet(viewsets.ModelViewSet):
    """
    ViewSet for attendance correction requests
    """
    serializer_class = AttendanceRequestSerializer
    permission_classes = [IsAuthenticated]
    
    def get_queryset(self):
        user = self.request.user
        
        if user.role in ['SUPER_ADMIN', 'HR_MANAGER']:
            return AttendanceRequest.objects.all()
        elif user.role == 'TEAM_LEAD':
            return AttendanceRequest.objects.filter(
                Q(employee__user=user) | Q(employee__manager__user=user)
            )
        else:
            return AttendanceRequest.objects.filter(employee__user=user)
    
    def perform_create(self, serializer):
        serializer.save(employee=self.request.user.employee_profile)
    
    @action(detail=True, methods=['post'])
    def approve(self, request, pk=None):
        """Approve attendance correction request"""
        if not request.user.is_team_lead():
            return Response(
                {'error': 'Permission denied'}, 
                status=status.HTTP_403_FORBIDDEN
            )
        
        attendance_request = self.get_object()
        attendance_request.status = 'APPROVED'
        attendance_request.approved_by = request.user
        attendance_request.approved_date = timezone.now()
        attendance_request.save()
        
        # Create or update attendance record
        attendance, created = Attendance.objects.get_or_create(
            employee=attendance_request.employee,
            date=attendance_request.date,
            defaults={
                'check_in_time': attendance_request.requested_check_in,
                'check_out_time': attendance_request.requested_check_out,
                'is_manual_entry': True,
                'manual_entry_reason': attendance_request.reason,
                'approved_by': request.user
            }
        )
        
        if not created:
            attendance.check_in_time = attendance_request.requested_check_in
            attendance.check_out_time = attendance_request.requested_check_out
            attendance.is_manual_entry = True
            attendance.manual_entry_reason = attendance_request.reason
            attendance.approved_by = request.user
            attendance.save()
        
        return Response({'status': 'Attendance request approved'})

class WorkFromHomeViewSet(viewsets.ModelViewSet):
    """
    ViewSet for work from home requests
    """
    serializer_class = WorkFromHomeSerializer
    permission_classes = [IsAuthenticated]
    
    def get_queryset(self):
        user = self.request.user
        
        if user.role in ['SUPER_ADMIN', 'HR_MANAGER']:
            return WorkFromHome.objects.all()
        elif user.role == 'TEAM_LEAD':
            return WorkFromHome.objects.filter(
                Q(employee__user=user) | Q(employee__manager__user=user)
            )
        else:
            return WorkFromHome.objects.filter(employee__user=user)
    
    def perform_create(self, serializer):
        serializer.save(employee=self.request.user.employee_profile)
    
    @action(detail=True, methods=['post'])
    def approve(self, request, pk=None):
        """Approve work from home request"""
        if not request.user.is_team_lead():
            return Response(
                {'error': 'Permission denied'}, 
                status=status.HTTP_403_FORBIDDEN
            )
        
        wfh_request = self.get_object()
        wfh_request.status = 'APPROVED'
        wfh_request.approved_by = request.user
        wfh_request.approved_date = timezone.now()
        wfh_request.save()
        
        return Response({'status': 'Work from home request approved'})