"""
Recruitment models - Basic skeleton
"""
from django.db import models
from django.contrib.auth import get_user_model
from apps.core.models import TimeStampedModel, Department, JobTitle

User = get_user_model()

class JobPosting(TimeStampedModel):
    """
    Job posting model - skeleton implementation
    """
    STATUS_CHOICES = [
        ('DRAFT', 'Draft'),
        ('PUBLISHED', 'Published'),
        ('CLOSED', 'Closed'),
        ('CANCELLED', 'Cancelled'),
    ]
    
    title = models.CharField(max_length=200)
    department = models.ForeignKey(Department, on_delete=models.CASCADE)
    job_title = models.ForeignKey(JobTitle, on_delete=models.CASCADE)
    description = models.TextField()
    requirements = models.TextField()
    location = models.CharField(max_length=100)
    employment_type = models.CharField(max_length=20, default='FULL_TIME')
    salary_range_min = models.DecimalField(max_digits=10, decimal_places=2, null=True, blank=True)
    salary_range_max = models.DecimalField(max_digits=10, decimal_places=2, null=True, blank=True)
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='DRAFT')
    posted_by = models.ForeignKey(User, on_delete=models.SET_NULL, null=True)
    posted_date = models.DateTimeField(null=True, blank=True)
    closing_date = models.DateField(null=True, blank=True)
    
    def __str__(self):
        return f"{self.title} - {self.department.name}"
    
    class Meta:
        db_table = 'recruitment_job_posting'

class Candidate(TimeStampedModel):
    """
    Candidate model - skeleton implementation
    """
    STATUS_CHOICES = [
        ('APPLIED', 'Applied'),
        ('SCREENING', 'Screening'),
        ('INTERVIEW', 'Interview'),
        ('SELECTED', 'Selected'),
        ('REJECTED', 'Rejected'),
        ('WITHDRAWN', 'Withdrawn'),
    ]
    
    first_name = models.CharField(max_length=50)
    last_name = models.CharField(max_length=50)
    email = models.EmailField()
    phone = models.CharField(max_length=15)
    resume = models.FileField(upload_to='candidate_resumes/')
    cover_letter = models.TextField(blank=True)
    job_posting = models.ForeignKey(JobPosting, on_delete=models.CASCADE, related_name='candidates')
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='APPLIED')
    applied_date = models.DateTimeField(auto_now_add=True)
    
    @property
    def full_name(self):
        return f"{self.first_name} {self.last_name}"
    
    def __str__(self):
        return f"{self.full_name} - {self.job_posting.title}"
    
    class Meta:
        db_table = 'recruitment_candidate'

# TODO: Add more recruitment models
# - Interview scheduling
# - Candidate evaluation
# - Offer management