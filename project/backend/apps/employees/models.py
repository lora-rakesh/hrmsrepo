"""
Employee management models
"""
from django.db import models
from django.contrib.auth import get_user_model
from apps.core.models import TimeStampedModel, Department, JobTitle
import uuid

User = get_user_model()

class Employee(TimeStampedModel):
    """
    Employee profile model - extends User with HR specific information
    """
    EMPLOYMENT_STATUS = [
        ('ACTIVE', 'Active'),
        ('INACTIVE', 'Inactive'),
        ('TERMINATED', 'Terminated'),
        ('ON_LEAVE', 'On Leave'),
    ]
    
    EMPLOYMENT_TYPE = [
        ('FULL_TIME', 'Full Time'),
        ('PART_TIME', 'Part Time'),
        ('CONTRACT', 'Contract'),
        ('INTERNSHIP', 'Internship'),
    ]
    
    GENDER_CHOICES = [
        ('M', 'Male'),
        ('F', 'Female'),
        ('O', 'Other'),
    ]
    
    # Core employee information
    user = models.OneToOneField(User, on_delete=models.CASCADE, related_name='employee_profile')
    employee_id = models.CharField(max_length=20, unique=True)
    
    # Personal Information
    date_of_birth = models.DateField(null=True, blank=True)
    gender = models.CharField(max_length=1, choices=GENDER_CHOICES, blank=True)
    marital_status = models.CharField(max_length=20, blank=True)
    nationality = models.CharField(max_length=50, blank=True)
    
    # Contact Information
    personal_email = models.EmailField(blank=True)
    emergency_contact_name = models.CharField(max_length=100, blank=True)
    emergency_contact_phone = models.CharField(max_length=15, blank=True)
    emergency_contact_relation = models.CharField(max_length=50, blank=True)
    
    # Address Information
    current_address = models.TextField(blank=True)
    permanent_address = models.TextField(blank=True)
    city = models.CharField(max_length=50, blank=True)
    state = models.CharField(max_length=50, blank=True)
    postal_code = models.CharField(max_length=10, blank=True)
    country = models.CharField(max_length=50, default='India')
    
    # Employment Information
    department = models.ForeignKey(Department, on_delete=models.SET_NULL, null=True, related_name='employees')
    job_title = models.ForeignKey(JobTitle, on_delete=models.SET_NULL, null=True)
    manager = models.ForeignKey('self', on_delete=models.SET_NULL, null=True, blank=True, related_name='team_members')
    
    employment_status = models.CharField(max_length=20, choices=EMPLOYMENT_STATUS, default='ACTIVE')
    employment_type = models.CharField(max_length=20, choices=EMPLOYMENT_TYPE, default='FULL_TIME')
    
    date_of_joining = models.DateField()
    date_of_leaving = models.DateField(null=True, blank=True)
    probation_end_date = models.DateField(null=True, blank=True)

    WORK_MODE_CHOICES = [
        ('ONSITE', 'On-Site'),
        ('REMOTE', 'Remote'),
        ('HYBRID', 'Hybrid'),
    ]
        
    work_mode = models.CharField(
        max_length=20,
        choices=WORK_MODE_CHOICES,
        default='ONSITE'
    )

    
    # Salary Information (basic - detailed in payroll app)
    basic_salary = models.DecimalField(max_digits=10, decimal_places=2, default=0)
    
    # Profile and Documents
    profile_picture = models.ImageField(upload_to='employee_profiles/', blank=True)
    resume = models.FileField(upload_to='employee_documents/resumes/', blank=True)
    
    def __str__(self):
        return f"{self.employee_id} - {self.user.get_full_name()}"
    
    @property
    def full_name(self):
        return self.user.get_full_name()
    
    @property
    def age(self):
        if self.date_of_birth:
            from datetime import date
            today = date.today()
            return today.year - self.date_of_birth.year - ((today.month, today.day) < (self.date_of_birth.month, self.date_of_birth.day))
        return None
    
    class Meta:
        db_table = 'employees_employee'

class EmployeeDocument(TimeStampedModel):
    """
    Employee documents storage
    """
    DOCUMENT_TYPES = [
        ('AADHAR', 'Aadhar Card'),
        ('PAN', 'PAN Card'),
        ('PASSPORT', 'Passport'),
        ('DRIVING_LICENSE', 'Driving License'),
        ('VOTER_ID', 'Voter ID'),
        ('EDUCATION', 'Education Certificate'),
        ('EXPERIENCE', 'Experience Letter'),
        ('OFFER_LETTER', 'Offer Letter'),
        ('CONTRACT', 'Contract'),
        ('OTHER', 'Other'),
    ]
    
    employee = models.ForeignKey(Employee, on_delete=models.CASCADE, related_name='documents')
    document_type = models.CharField(max_length=50, choices=DOCUMENT_TYPES)
    title = models.CharField(max_length=200)
    document_file = models.FileField(upload_to='employee_documents/')
    document_number = models.CharField(max_length=100, blank=True)
    issue_date = models.DateField(null=True, blank=True)
    expiry_date = models.DateField(null=True, blank=True)
    is_verified = models.BooleanField(default=False)
    verified_by = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, blank=True, related_name='verified_documents')
    verified_at = models.DateTimeField(null=True, blank=True)
    
    def __str__(self):
        return f"{self.employee.full_name} - {self.title}"
    
    class Meta:
        db_table = 'employees_employee_document'

class EmploymentHistory(TimeStampedModel):
    """
    Employee employment history within the organization
    """
    employee = models.ForeignKey(Employee, on_delete=models.CASCADE, related_name='employment_history')
    department = models.ForeignKey(Department, on_delete=models.SET_NULL, null=True)
    job_title = models.ForeignKey(JobTitle, on_delete=models.SET_NULL, null=True)
    manager = models.ForeignKey(Employee, on_delete=models.SET_NULL, null=True, blank=True, related_name='managed_history')
    
    start_date = models.DateField()
    end_date = models.DateField(null=True, blank=True)
    salary = models.DecimalField(max_digits=10, decimal_places=2)
    
    reason_for_change = models.CharField(max_length=200, blank=True)
    remarks = models.TextField(blank=True)
    
    def __str__(self):
        return f"{self.employee.full_name} - {self.job_title} ({self.start_date})"
    
    class Meta:
        db_table = 'employees_employment_history'
        ordering = ['-start_date']

class SkillSet(TimeStampedModel):
    """
    Employee skills and competencies
    """
    PROFICIENCY_LEVELS = [
        ('BEGINNER', 'Beginner'),
        ('INTERMEDIATE', 'Intermediate'),
        ('ADVANCED', 'Advanced'),
        ('EXPERT', 'Expert'),
    ]
    
    employee = models.ForeignKey(Employee, on_delete=models.CASCADE, related_name='skills')
    skill_name = models.CharField(max_length=100)
    proficiency_level = models.CharField(max_length=20, choices=PROFICIENCY_LEVELS)
    years_of_experience = models.IntegerField(default=0)
    is_certified = models.BooleanField(default=False)
    certification_details = models.CharField(max_length=200, blank=True)
    
    def __str__(self):
        return f"{self.employee.full_name} - {self.skill_name}"
    
    class Meta:
        db_table = 'employees_skill_set'
        unique_together = ['employee', 'skill_name']

class EducationRecord(TimeStampedModel):
    """
    Employee education records
    """
    EDUCATION_LEVELS = [
        ('HIGH_SCHOOL', 'High School'),
        ('INTERMEDIATE', 'Intermediate'),
        ('DIPLOMA', 'Diploma'),
        ('BACHELOR', 'Bachelor\'s Degree'),
        ('MASTER', 'Master\'s Degree'),
        ('DOCTORATE', 'Doctorate'),
        ('OTHER', 'Other'),
    ]
    
    employee = models.ForeignKey(Employee, on_delete=models.CASCADE, related_name='education')
    education_level = models.CharField(max_length=20, choices=EDUCATION_LEVELS)
    institution_name = models.CharField(max_length=200)
    field_of_study = models.CharField(max_length=100)
    start_date = models.DateField()
    end_date = models.DateField(null=True, blank=True)
    grade_or_score = models.CharField(max_length=50, blank=True)
    is_completed = models.BooleanField(default=True)
    
    def __str__(self):
        return f"{self.employee.full_name} - {self.education_level}"
    
    class Meta:
        db_table = 'employees_education_record'
        ordering = ['-end_date']