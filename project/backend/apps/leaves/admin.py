"""
Leave admin configuration
"""
from django.contrib import admin
from .models import LeaveType, LeaveBalance, LeaveRequest, Holiday

@admin.register(LeaveType)
class LeaveTypeAdmin(admin.ModelAdmin):
    list_display = ['name', 'code', 'days_allowed_per_year', 'is_active']
    search_fields = ['name', 'code']
    list_filter = ['is_active']

@admin.register(LeaveBalance)
class LeaveBalanceAdmin(admin.ModelAdmin):
    list_display = ['employee', 'leave_type', 'year', 'total_days', 'used_days', 'available_days']
    list_filter = ['leave_type', 'year']
    search_fields = ['employee__user__first_name', 'employee__user__last_name']

@admin.register(LeaveRequest)
class LeaveRequestAdmin(admin.ModelAdmin):
    list_display = ['employee', 'leave_type', 'start_date', 'end_date', 'days_requested', 'status']
    list_filter = ['status', 'leave_type', 'applied_date']
    search_fields = ['employee__user__first_name', 'employee__user__last_name']

@admin.register(Holiday)
class HolidayAdmin(admin.ModelAdmin):
    list_display = ['name', 'date', 'is_optional']
    list_filter = ['is_optional', 'date']
    search_fields = ['name']