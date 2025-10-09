"""
Custom User model and authentication related models
"""
from django.contrib.auth.models import AbstractUser
from django.db import models
import uuid

class User(AbstractUser):
    """
    Custom User model with role-based access control
    Extended for HRMS specific needs
    """
    ROLE_CHOICES = [
        ('SUPER_ADMIN', 'Super Administrator'),
        ('HR_MANAGER', 'HR Manager'),
        ('PAYROLL_ADMIN', 'Payroll Administrator'),
        ('TEAM_LEAD', 'Team Lead'),
        ('RECRUITER', 'Recruiter'),
        ('EMPLOYEE', 'Employee'),
    ]
    
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    email = models.EmailField(unique=True)
    role = models.CharField(max_length=20, choices=ROLE_CHOICES, default='EMPLOYEE')
    phone = models.CharField(max_length=15, blank=True)
    avatar = models.ImageField(upload_to='avatars/', blank=True)
    is_active = models.BooleanField(default=True)
    last_login_ip = models.GenericIPAddressField(null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    # Multi-tenant preparation
    organization = models.ForeignKey(
        'core.Organization', 
        on_delete=models.CASCADE, 
        null=True, 
        blank=True,
        related_name='users'
    )
    
    USERNAME_FIELD = 'email'
    REQUIRED_FIELDS = ['username', 'first_name', 'last_name']
    
    def __str__(self):
        return f"{self.email} ({self.get_role_display()})"
    
    @property
    def full_name(self):
        return f"{self.first_name} {self.last_name}".strip()
    
    def has_role(self, role):
        """Check if user has specific role"""
        return self.role == role
    
    def is_hr_manager(self):
        return self.role in ['SUPER_ADMIN', 'HR_MANAGER']
    
    def is_payroll_admin(self):
        return self.role in ['SUPER_ADMIN', 'PAYROLL_ADMIN']
    
    def is_team_lead(self):
        return self.role in ['SUPER_ADMIN', 'HR_MANAGER', 'TEAM_LEAD']
    
    class Meta:
        db_table = 'accounts_user'

class UserSession(models.Model):
    """
    Track user sessions for security
    """
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='sessions')
    session_key = models.CharField(max_length=255, unique=True)
    ip_address = models.GenericIPAddressField()
    user_agent = models.TextField()
    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)
    last_activity = models.DateTimeField(auto_now=True)
    
    class Meta:
        db_table = 'accounts_user_session'

class PasswordResetToken(models.Model):
    """
    Password reset tokens
    """
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    user = models.ForeignKey(User, on_delete=models.CASCADE)
    token = models.CharField(max_length=255, unique=True)
    is_used = models.BooleanField(default=False)
    expires_at = models.DateTimeField()
    created_at = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        db_table = 'accounts_password_reset_token'