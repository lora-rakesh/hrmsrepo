"""
Reports models - Basic skeleton
"""
from django.db import models
from django.contrib.auth import get_user_model
from apps.core.models import TimeStampedModel

User = get_user_model()

class ReportTemplate(TimeStampedModel):
    """
    Report template model - skeleton implementation
    """
    REPORT_TYPES = [
        ('EMPLOYEE', 'Employee Report'),
        ('ATTENDANCE', 'Attendance Report'),
        ('LEAVE', 'Leave Report'),
        ('PAYROLL', 'Payroll Report'),
        ('CUSTOM', 'Custom Report'),
    ]
    
    name = models.CharField(max_length=200)
    report_type = models.CharField(max_length=20, choices=REPORT_TYPES)
    description = models.TextField(blank=True)
    query_template = models.TextField()  # SQL template or query config
    is_active = models.BooleanField(default=True)
    created_by = models.ForeignKey(User, on_delete=models.SET_NULL, null=True)
    
    def __str__(self):
        return self.name
    
    class Meta:
        db_table = 'reports_report_template'

class GeneratedReport(TimeStampedModel):
    """
    Generated report instances
    """
    STATUS_CHOICES = [
        ('PENDING', 'Pending'),
        ('PROCESSING', 'Processing'),
        ('COMPLETED', 'Completed'),
        ('FAILED', 'Failed'),
    ]
    
    template = models.ForeignKey(ReportTemplate, on_delete=models.CASCADE)
    name = models.CharField(max_length=200)
    parameters = models.JSONField(default=dict)  # Report parameters
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='PENDING')
    file_path = models.CharField(max_length=500, blank=True)
    generated_by = models.ForeignKey(User, on_delete=models.SET_NULL, null=True)
    generated_at = models.DateTimeField(null=True, blank=True)
    
    def __str__(self):
        return f"{self.name} - {self.status}"
    
    class Meta:
        db_table = 'reports_generated_report'

# TODO: Add more report models as needed
# - Scheduled reports
# - Report subscriptions
# - Dashboard widgets