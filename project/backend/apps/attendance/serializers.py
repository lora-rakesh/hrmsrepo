"""
Attendance serializers
"""
from rest_framework import serializers
from django.utils import timezone
from datetime import datetime
from .models import Shift, EmployeeShift, Attendance, AttendanceRequest, WorkFromHome

class ShiftSerializer(serializers.ModelSerializer):
    class Meta:
        model = Shift
        fields = '__all__'
        read_only_fields = ['id', 'created_at', 'updated_at']

class EmployeeShiftSerializer(serializers.ModelSerializer):
    employee_name = serializers.CharField(source='employee.full_name', read_only=True)
    shift_name = serializers.CharField(source='shift.name', read_only=True)
    
    class Meta:
        model = EmployeeShift
        fields = '__all__'
        read_only_fields = ['id', 'created_at', 'updated_at']

class AttendanceSerializer(serializers.ModelSerializer):
    employee_name = serializers.CharField(source='employee.full_name', read_only=True)
    shift_name = serializers.CharField(source='shift.name', read_only=True)
    approved_by_name = serializers.CharField(source='approved_by.get_full_name', read_only=True)
    
    class Meta:
        model = Attendance
        fields = '__all__'
        read_only_fields = [
            'id', 'created_at', 'updated_at', 'total_hours', 
            'overtime_hours', 'status'
        ]

class AttendanceCheckInSerializer(serializers.Serializer):
    """Serializer for check-in action"""
    check_in_time = serializers.DateTimeField(required=False, default=timezone.now)
    
    def validate_check_in_time(self, value):
        if value and value.date() != timezone.now().date():
            raise serializers.ValidationError("Can only check in for today")
        return value or timezone.now()

class AttendanceCheckOutSerializer(serializers.Serializer):
    """Serializer for check-out action"""
    check_out_time = serializers.DateTimeField(required=False, default=timezone.now)
    
    def validate_check_out_time(self, value):
        if value and value.date() != timezone.now().date():
            raise serializers.ValidationError("Can only check out for today")
        return value or timezone.now()

class AttendanceRequestSerializer(serializers.ModelSerializer):
    employee_name = serializers.CharField(source='employee.full_name', read_only=True)
    approved_by_name = serializers.CharField(source='approved_by.get_full_name', read_only=True)
    
    class Meta:
        model = AttendanceRequest
        fields = '__all__'
        read_only_fields = [
            'id', 'created_at', 'updated_at', 'employee', 
            'approved_by', 'approved_date'
        ]

class WorkFromHomeSerializer(serializers.ModelSerializer):
    employee_name = serializers.CharField(source='employee.full_name', read_only=True)
    approved_by_name = serializers.CharField(source='approved_by.get_full_name', read_only=True)
    
    class Meta:
        model = WorkFromHome
        fields = '__all__'
        read_only_fields = [
            'id', 'created_at', 'updated_at', 'employee',
            'approved_by', 'approved_date'
        ]