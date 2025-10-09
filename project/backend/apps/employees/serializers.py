"""
Employee serializers
"""
from rest_framework import serializers
from django.contrib.auth import get_user_model
from .models import (
    Employee, EmployeeDocument, EmploymentHistory, 
    SkillSet, EducationRecord
)
from apps.accounts.serializers import UserSerializer
from apps.core.serializers import DepartmentSerializer, JobTitleSerializer

User = get_user_model()

class EmployeeSerializer(serializers.ModelSerializer):
    """
    Employee serializer with user information
    """
    user = UserSerializer(read_only=True)
    full_name = serializers.CharField(read_only=True)
    age = serializers.IntegerField(read_only=True)
    department_name = serializers.CharField(source='department.name', read_only=True)
    job_title_name = serializers.CharField(source='job_title.title', read_only=True)
    manager_name = serializers.CharField(source='manager.full_name', read_only=True)
    
    class Meta:
        model = Employee
        fields = '__all__'
        read_only_fields = ['id', 'created_at', 'updated_at', 'user']

class EmployeeCreateSerializer(serializers.ModelSerializer):
    """
    Serializer for creating new employee with user account
    """
    # User fields
    username = serializers.CharField(write_only=True)
    email = serializers.EmailField(write_only=True)
    first_name = serializers.CharField(write_only=True)
    last_name = serializers.CharField(write_only=True)
    password = serializers.CharField(write_only=True, min_length=8)
    role = serializers.ChoiceField(choices=User.ROLE_CHOICES, default='EMPLOYEE')
    
    class Meta:
        model = Employee
        fields = [
            'username', 'email', 'first_name', 'last_name', 'password', 'role',
            'employee_id', 'date_of_birth', 'gender', 'marital_status', 
            'nationality', 'personal_email', 'emergency_contact_name',
            'emergency_contact_phone', 'emergency_contact_relation',
            'current_address', 'permanent_address', 'city', 'state',
            'postal_code', 'country', 'department', 'job_title', 'manager',
            'employment_status', 'employment_type', 'date_of_joining',
            'probation_end_date', 'basic_salary'
        ]
    
    def create(self, validated_data):
        # Extract user data
        user_data = {
            'username': validated_data.pop('username'),
            'email': validated_data.pop('email'),
            'first_name': validated_data.pop('first_name'),
            'last_name': validated_data.pop('last_name'),
            'role': validated_data.pop('role', 'EMPLOYEE'),
        }
        password = validated_data.pop('password')
        
        # Create user account
        user = User.objects.create_user(**user_data)
        user.set_password(password)
        user.save()
        
        # Create employee profile
        employee = Employee.objects.create(user=user, **validated_data)
        return employee

class EmployeeListSerializer(serializers.ModelSerializer):
    """
    Simplified employee serializer for list views
    """
    full_name = serializers.CharField(read_only=True)
    email = serializers.CharField(source='user.email', read_only=True)
    department_name = serializers.CharField(source='department.name', read_only=True)
    job_title_name = serializers.CharField(source='job_title.title', read_only=True)
    manager_name = serializers.CharField(source='manager.full_name', read_only=True)
    
    class Meta:
        model = Employee
        fields = [
            'id', 'employee_id', 'full_name', 'email', 'department_name',
            'job_title_name', 'manager_name', 'employment_status',
            'employment_type', 'date_of_joining'
        ]

class EmployeeDocumentSerializer(serializers.ModelSerializer):
    """
    Employee document serializer
    """
    employee_name = serializers.CharField(source='employee.full_name', read_only=True)
    verified_by_name = serializers.CharField(source='verified_by.get_full_name', read_only=True)
    
    class Meta:
        model = EmployeeDocument
        fields = '__all__'
        read_only_fields = ['id', 'created_at', 'updated_at', 'verified_by', 'verified_at']

class EmploymentHistorySerializer(serializers.ModelSerializer):
    """
    Employment history serializer
    """
    employee_name = serializers.CharField(source='employee.full_name', read_only=True)
    department_name = serializers.CharField(source='department.name', read_only=True)
    job_title_name = serializers.CharField(source='job_title.title', read_only=True)
    manager_name = serializers.CharField(source='manager.full_name', read_only=True)
    
    class Meta:
        model = EmploymentHistory
        fields = '__all__'
        read_only_fields = ['id', 'created_at', 'updated_at']

class SkillSetSerializer(serializers.ModelSerializer):
    """
    Skill set serializer
    """
    employee_name = serializers.CharField(source='employee.full_name', read_only=True)
    
    class Meta:
        model = SkillSet
        fields = '__all__'
        read_only_fields = ['id', 'created_at', 'updated_at']

class EducationRecordSerializer(serializers.ModelSerializer):
    """
    Education record serializer
    """
    employee_name = serializers.CharField(source='employee.full_name', read_only=True)
    
    class Meta:
        model = EducationRecord
        fields = '__all__'
        read_only_fields = ['id', 'created_at', 'updated_at']

class EmployeeDetailSerializer(serializers.ModelSerializer):
    """
    Detailed employee serializer with all related data
    """
    user = UserSerializer(read_only=True)
    department = DepartmentSerializer(read_only=True)
    job_title = JobTitleSerializer(read_only=True)
    manager = EmployeeListSerializer(read_only=True)
    team_members = EmployeeListSerializer(many=True, read_only=True)
    documents = EmployeeDocumentSerializer(many=True, read_only=True)
    employment_history = EmploymentHistorySerializer(many=True, read_only=True)
    skills = SkillSetSerializer(many=True, read_only=True)
    education = EducationRecordSerializer(many=True, read_only=True)
    
    class Meta:
        model = Employee
        fields = '__all__'
        read_only_fields = ['id', 'created_at', 'updated_at']