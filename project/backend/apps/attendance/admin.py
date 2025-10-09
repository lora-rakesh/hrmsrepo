"""
Attendance admin configuration
"""
from django.contrib import admin
from .models import Shift, EmployeeShift, Attendance, AttendanceRequest, WorkFromHome

@admin.register(Shift)
class ShiftAdmin(admin.ModelAdmin):
    list_display = ['name', 'start_time', 'end_time', 'total_hours', 'is_active']
    list_filter = ['is_active']

@admin.register(EmployeeShift)
class EmployeeShiftAdmin(admin.ModelAdmin):
    list_display = ['employee', 'shift', 'effective_from', 'effective_to', 'is_active']
    list_filter = ['shift', 'is_active']

@admin.register(Attendance)
class AttendanceAdmin(admin.ModelAdmin):
    list_display = ['employee', 'date', 'status', 'check_in_time', 'check_out_time', 'total_hours']
    list_filter = ['status', 'date', 'is_manual_entry']
    search_fields = ['employee__user__first_name', 'employee__user__last_name']

@admin.register(AttendanceRequest)
class AttendanceRequestAdmin(admin.ModelAdmin):
    list_display = ['employee', 'date', 'status', 'approved_by']
    list_filter = ['status']

@admin.register(WorkFromHome)
class WorkFromHomeAdmin(admin.ModelAdmin):
    list_display = ['employee', 'date', 'status', 'approved_by']
    list_filter = ['status']