"""
Attendance and shift management models
"""
from django.db import models
from django.contrib.auth import get_user_model
from apps.core.models import TimeStampedModel
from apps.employees.models import Employee
from datetime import datetime, time
import uuid

User = get_user_model()

class Shift(TimeStampedModel):
    """
    Work shift definitions
    """
    name = models.CharField(max_length=50)
    start_time = models.TimeField()
    end_time = models.TimeField()
    break_duration = models.DurationField(help_text="Break duration in minutes")
    total_hours = models.DecimalField(max_digits=4, decimal_places=2)
    is_active = models.BooleanField(default=True)
    
    def __str__(self):
        return f"{self.name} ({self.start_time} - {self.end_time})"
    
    class Meta:
        db_table = 'attendance_shift'

class EmployeeShift(TimeStampedModel):
    """
    Employee shift assignments
    """
    employee = models.ForeignKey(Employee, on_delete=models.CASCADE, related_name='shifts')
    shift = models.ForeignKey(Shift, on_delete=models.CASCADE)
    effective_from = models.DateField()
    effective_to = models.DateField(null=True, blank=True)
    is_active = models.BooleanField(default=True)
    
    def __str__(self):
        return f"{self.employee.full_name} - {self.shift.name}"
    
    class Meta:
        db_table = 'attendance_employee_shift'

class Attendance(TimeStampedModel):
    """
    Daily attendance records
    """
    STATUS_CHOICES = [
        ('PRESENT', 'Present'),
        ('ABSENT', 'Absent'),
        ('HALF_DAY', 'Half Day'),
        ('LATE', 'Late'),
        ('ON_LEAVE', 'On Leave'),
    ]
    
    employee = models.ForeignKey(Employee, on_delete=models.CASCADE, related_name='attendance')
    date = models.DateField()
    shift = models.ForeignKey(Shift, on_delete=models.SET_NULL, null=True)
    
    check_in_time = models.DateTimeField(null=True, blank=True)
    check_out_time = models.DateTimeField(null=True, blank=True)
    break_time = models.DurationField(null=True, blank=True)
    
    total_hours = models.DecimalField(max_digits=4, decimal_places=2, default=0)
    overtime_hours = models.DecimalField(max_digits=4, decimal_places=2, default=0)
    
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='ABSENT')
    is_manual_entry = models.BooleanField(default=False)
    manual_entry_reason = models.TextField(blank=True)
    approved_by = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, blank=True)
    
    def __str__(self):
        return f"{self.employee.full_name} - {self.date} ({self.status})"
    
    def calculate_total_hours(self):
        """Calculate total working hours"""
        if self.check_in_time and self.check_out_time:
            delta = self.check_out_time - self.check_in_time
            total_seconds = delta.total_seconds()
            
            # Subtract break time if any
            if self.break_time:
                total_seconds -= self.break_time.total_seconds()
            
            self.total_hours = total_seconds / 3600  # Convert to hours
            
            # Calculate overtime (if more than shift hours)
            if self.shift and self.total_hours > float(self.shift.total_hours):
                self.overtime_hours = self.total_hours - float(self.shift.total_hours)
    
    def save(self, *args, **kwargs):
        if self.check_in_time and self.check_out_time:
            self.calculate_total_hours()
            
            # Determine status based on hours worked
            if self.shift:
                required_hours = float(self.shift.total_hours)
                if self.total_hours >= required_hours:
                    self.status = 'PRESENT'
                elif self.total_hours >= required_hours / 2:
                    self.status = 'HALF_DAY'
                else:
                    self.status = 'LATE' if self.total_hours > 0 else 'ABSENT'
        
        super().save(*args, **kwargs)
    
    class Meta:
        db_table = 'attendance_attendance'
        unique_together = ['employee', 'date']

class AttendanceRequest(TimeStampedModel):
    """
    Manual attendance correction requests
    """
    STATUS_CHOICES = [
        ('PENDING', 'Pending'),
        ('APPROVED', 'Approved'),
        ('REJECTED', 'Rejected'),
    ]
    
    employee = models.ForeignKey(Employee, on_delete=models.CASCADE, related_name='attendance_requests')
    date = models.DateField()
    requested_check_in = models.DateTimeField(null=True, blank=True)
    requested_check_out = models.DateTimeField(null=True, blank=True)
    reason = models.TextField()
    
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='PENDING')
    approved_by = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, blank=True)
    approved_date = models.DateTimeField(null=True, blank=True)
    rejection_reason = models.TextField(blank=True)
    
    def __str__(self):
        return f"{self.employee.full_name} - {self.date} correction request"
    
    class Meta:
        db_table = 'attendance_attendance_request'

class WorkFromHome(TimeStampedModel):
    """
    Work from home requests and approvals
    """
    STATUS_CHOICES = [
        ('PENDING', 'Pending'),
        ('APPROVED', 'Approved'),
        ('REJECTED', 'Rejected'),
    ]
    
    employee = models.ForeignKey(Employee, on_delete=models.CASCADE, related_name='wfh_requests')
    date = models.DateField()
    reason = models.TextField()
    
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='PENDING')
    approved_by = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, blank=True)
    approved_date = models.DateTimeField(null=True, blank=True)
    
    def __str__(self):
        return f"{self.employee.full_name} - WFH {self.date}"
    
    class Meta:
        db_table = 'attendance_work_from_home'