"""
Core models for HRMS
Base models and common functionality
"""
from django.db import models
from django.contrib.auth import get_user_model
import uuid

User = get_user_model()

class TimeStampedModel(models.Model):
    """
    Abstract base model with created/updated timestamps
    Multi-tenant extension point: Add organization field here
    """
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        abstract = True

class Organization(models.Model):
    """
    Organization model - prepared for multi-tenancy
    Currently single-tenant but structure ready for expansion
    """
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    name = models.CharField(max_length=100)
    code = models.CharField(max_length=20, unique=True)
    email = models.EmailField()
    phone = models.CharField(max_length=20, blank=True)
    address = models.TextField(blank=True)
    logo = models.ImageField(upload_to='organization/logos/', blank=True)
    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    def __str__(self):
        return self.name
    
    class Meta:
        db_table = 'core_organization'

class Department(TimeStampedModel):
    """
    Department model for organizational structure
    """
    name = models.CharField(max_length=100)
    code = models.CharField(max_length=20)
    description = models.TextField(blank=True)
    head = models.ForeignKey('employees.Employee', on_delete=models.SET_NULL, null=True, blank=True, related_name='headed_departments')
    parent = models.ForeignKey('self', on_delete=models.CASCADE, null=True, blank=True, related_name='sub_departments')
    organization = models.ForeignKey(Organization, on_delete=models.CASCADE, related_name='departments')
    is_active = models.BooleanField(default=True)
    
    def __str__(self):
        return f"{self.name} ({self.code})"
    
    class Meta:
        db_table = 'core_department'
        unique_together = ['name', 'organization']

class JobTitle(TimeStampedModel):
    """
    Job titles/positions within the organization
    """
    title = models.CharField(max_length=100)
    description = models.TextField(blank=True)
    department = models.ForeignKey(Department, on_delete=models.CASCADE, related_name='job_titles')
    level = models.IntegerField(default=1, help_text="Job level hierarchy")
    is_active = models.BooleanField(default=True)
    
    def __str__(self):
        return f"{self.title} - {self.department.name}"
    
    class Meta:
        db_table = 'core_job_title'

class AuditLog(models.Model):
    """
    System audit log for tracking changes
    """
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    user = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, blank=True)
    action = models.CharField(max_length=50)  # CREATE, UPDATE, DELETE, VIEW
    model_name = models.CharField(max_length=100)
    object_id = models.CharField(max_length=255)
    changes = models.JSONField(default=dict, blank=True)
    ip_address = models.GenericIPAddressField(null=True, blank=True)
    user_agent = models.TextField(blank=True)
    timestamp = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        db_table = 'core_audit_log'
        ordering = ['-timestamp']

class Notification(TimeStampedModel):
    """
    In-app notification system
    """
    NOTIFICATION_TYPES = [
        ('LEAVE_APPLIED', 'Leave Applied'),
        ('LEAVE_APPROVED', 'Leave Approved'),
        ('LEAVE_REJECTED', 'Leave Rejected'),
        ('ATTENDANCE_REMINDER', 'Attendance Reminder'),
        ('PAYROLL_GENERATED', 'Payroll Generated'),
        ('SYSTEM_ALERT', 'System Alert'),
    ]
    
    recipient = models.ForeignKey(User, on_delete=models.CASCADE, related_name='notifications')
    sender = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, blank=True, related_name='sent_notifications')
    notification_type = models.CharField(max_length=50, choices=NOTIFICATION_TYPES)
    title = models.CharField(max_length=200)
    message = models.TextField()
    is_read = models.BooleanField(default=False)
    action_url = models.URLField(blank=True)
    
    def __str__(self):
        return f"{self.title} - {self.recipient.username}"
    
    class Meta:
        db_table = 'core_notification'
        ordering = ['-created_at']