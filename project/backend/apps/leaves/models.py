"""
Leave management models
"""
from django.db import models
from django.contrib.auth import get_user_model
from apps.core.models import TimeStampedModel
from apps.employees.models import Employee
import uuid

User = get_user_model()

class LeaveType(TimeStampedModel):
    """
    Types of leaves available in the organization
    """
    name = models.CharField(max_length=50)  # e.g., "Casual Leave", "Sick Leave"
    code = models.CharField(max_length=10, unique=True)  # e.g., "CL", "SL", "PL"
    days_allowed_per_year = models.IntegerField(default=0)
    carry_forward_allowed = models.BooleanField(default=False)
    max_carry_forward_days = models.IntegerField(default=0)
    minimum_days_notice = models.IntegerField(default=1)
    maximum_consecutive_days = models.IntegerField(default=30)
    description = models.TextField(blank=True)
    is_active = models.BooleanField(default=True)
    
    def __str__(self):
        return f"{self.name} ({self.code})"
    
    class Meta:
        db_table = 'leaves_leave_type'

class LeaveBalance(TimeStampedModel):
    """
    Employee leave balance for each leave type
    """
    employee = models.ForeignKey(Employee, on_delete=models.CASCADE, related_name='leave_balances')
    leave_type = models.ForeignKey(LeaveType, on_delete=models.CASCADE)
    year = models.IntegerField()
    
    total_days = models.DecimalField(max_digits=5, decimal_places=2, default=0)
    used_days = models.DecimalField(max_digits=5, decimal_places=2, default=0)
    carry_forward_days = models.DecimalField(max_digits=5, decimal_places=2, default=0)
    
    @property
    def available_days(self):
        return self.total_days - self.used_days
    
    def __str__(self):
        return f"{self.employee.full_name} - {self.leave_type.name} ({self.year})"
    
    class Meta:
        db_table = 'leaves_leave_balance'
        unique_together = ['employee', 'leave_type', 'year']

class LeaveRequest(TimeStampedModel):
    """
    Employee leave requests
    """
    STATUS_CHOICES = [
        ('PENDING', 'Pending'),
        ('APPROVED', 'Approved'),
        ('REJECTED', 'Rejected'),
        ('CANCELLED', 'Cancelled'),
    ]
    
    employee = models.ForeignKey(Employee, on_delete=models.CASCADE, related_name='leave_requests')
    leave_type = models.ForeignKey(LeaveType, on_delete=models.CASCADE)
    
    start_date = models.DateField()
    end_date = models.DateField()
    days_requested = models.DecimalField(max_digits=4, decimal_places=2)
    reason = models.TextField()
    
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='PENDING')
    applied_date = models.DateTimeField(auto_now_add=True)
    
    # Approval workflow
    approved_by = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, blank=True, related_name='approved_leaves')
    approved_date = models.DateTimeField(null=True, blank=True)
    rejection_reason = models.TextField(blank=True)
    
    # Handover details
    handover_to = models.ForeignKey(Employee, on_delete=models.SET_NULL, null=True, blank=True, related_name='handover_leaves')
    handover_notes = models.TextField(blank=True)
    
    def __str__(self):
        return f"{self.employee.full_name} - {self.leave_type.name} ({self.start_date} to {self.end_date})"
    
    def save(self, *args, **kwargs):
        # Calculate days requested
        if self.start_date and self.end_date:
            delta = self.end_date - self.start_date
            self.days_requested = delta.days + 1
        super().save(*args, **kwargs)
    
    class Meta:
        db_table = 'leaves_leave_request'
        ordering = ['-applied_date']

class Holiday(TimeStampedModel):
    """
    Company holidays
    """
    name = models.CharField(max_length=100)
    date = models.DateField()
    description = models.TextField(blank=True)
    is_optional = models.BooleanField(default=False)
    
    def __str__(self):
        return f"{self.name} - {self.date}"
    
    class Meta:
        db_table = 'leaves_holiday'
        ordering = ['date']

class LeaveRequestComment(TimeStampedModel):
    """
    Comments on leave requests
    """
    leave_request = models.ForeignKey(LeaveRequest, on_delete=models.CASCADE, related_name='comments')
    user = models.ForeignKey(User, on_delete=models.CASCADE)
    comment = models.TextField()
    
    def __str__(self):
        return f"Comment by {self.user.get_full_name()} on {self.leave_request}"
    
    class Meta:
        db_table = 'leaves_leave_request_comment'
        ordering = ['-created_at']