"""
Core app admin configuration
"""
from django.contrib import admin
from .models import Organization, Department, JobTitle, AuditLog, Notification

@admin.register(Organization)
class OrganizationAdmin(admin.ModelAdmin):
    list_display = ['name', 'code', 'email', 'is_active', 'created_at']
    search_fields = ['name', 'code', 'email']
    list_filter = ['is_active', 'created_at']

@admin.register(Department)
class DepartmentAdmin(admin.ModelAdmin):
    list_display = ['name', 'code', 'organization', 'head', 'is_active']
    search_fields = ['name', 'code']
    list_filter = ['organization', 'is_active']

@admin.register(JobTitle)
class JobTitleAdmin(admin.ModelAdmin):
    list_display = ['title', 'department', 'level', 'is_active']
    search_fields = ['title']
    list_filter = ['department', 'level', 'is_active']

@admin.register(AuditLog)
class AuditLogAdmin(admin.ModelAdmin):
    list_display = ['user', 'action', 'model_name', 'timestamp']
    list_filter = ['action', 'model_name', 'timestamp']
    readonly_fields = ['user', 'action', 'model_name', 'object_id', 'changes', 'timestamp']
    
    def has_add_permission(self, request):
        return False
    
    def has_change_permission(self, request, obj=None):
        return False

@admin.register(Notification)
class NotificationAdmin(admin.ModelAdmin):
    list_display = ['title', 'recipient', 'notification_type', 'is_read', 'created_at']
    list_filter = ['notification_type', 'is_read', 'created_at']
    search_fields = ['title', 'recipient__username']