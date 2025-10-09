"""
Leave management serializers
"""
from rest_framework import serializers
from .models import LeaveType, LeaveBalance, LeaveRequest, Holiday, LeaveRequestComment
from apps.employees.serializers import EmployeeListSerializer
from datetime import datetime

class LeaveTypeSerializer(serializers.ModelSerializer):
    class Meta:
        model = LeaveType
        fields = '__all__'
        read_only_fields = ['id', 'created_at', 'updated_at']

class LeaveBalanceSerializer(serializers.ModelSerializer):
    employee_name = serializers.CharField(source='employee.full_name', read_only=True)
    leave_type_name = serializers.CharField(source='leave_type.name', read_only=True)
    available_days = serializers.DecimalField(max_digits=5, decimal_places=2, read_only=True)
    
    class Meta:
        model = LeaveBalance
        fields = '__all__'
        read_only_fields = ['id', 'created_at', 'updated_at']

class LeaveRequestSerializer(serializers.ModelSerializer):
    employee_name = serializers.CharField(source='employee.full_name', read_only=True)
    leave_type_name = serializers.CharField(source='leave_type.name', read_only=True)
    approved_by_name = serializers.CharField(source='approved_by.get_full_name', read_only=True)
    handover_to_name = serializers.CharField(source='handover_to.full_name', read_only=True)
    
    class Meta:
        model = LeaveRequest
        fields = '__all__'
        read_only_fields = [
            'id', 'created_at', 'updated_at', 'employee', 'days_requested',
            'applied_date', 'approved_by', 'approved_date'
        ]
    
    def validate(self, attrs):
        start_date = attrs.get('start_date')
        end_date = attrs.get('end_date')
        
        if start_date and end_date and start_date > end_date:
            raise serializers.ValidationError("Start date must be before end date")
        
        if start_date and start_date < datetime.now().date():
            raise serializers.ValidationError("Cannot apply for past dates")
        
        return attrs

class LeaveRequestCreateSerializer(serializers.ModelSerializer):
    class Meta:
        model = LeaveRequest
        fields = [
            'leave_type', 'start_date', 'end_date', 'reason',
            'handover_to', 'handover_notes'
        ]
    
    def create(self, validated_data):
        request = self.context['request']
        employee = request.user.employee_profile
        validated_data['employee'] = employee
        return super().create(validated_data)

class HolidaySerializer(serializers.ModelSerializer):
    class Meta:
        model = Holiday
        fields = '__all__'
        read_only_fields = ['id', 'created_at', 'updated_at']

class LeaveRequestCommentSerializer(serializers.ModelSerializer):
    user_name = serializers.CharField(source='user.get_full_name', read_only=True)
    
    class Meta:
        model = LeaveRequestComment
        fields = '__all__'
        read_only_fields = ['id', 'created_at', 'updated_at', 'user']