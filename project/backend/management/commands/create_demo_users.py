"""
Management command to create demo users
"""
from django.core.management.base import BaseCommand
from django.contrib.auth import get_user_model
from apps.employees.models import Employee
from apps.core.models import Organization, Department, JobTitle
from apps.leaves.models import LeaveType, LeaveBalance
from datetime import date

User = get_user_model()

class Command(BaseCommand):
    help = 'Create demo users and employees for testing'

    def handle(self, *args, **options):
        # Get or create organization
        org, _ = Organization.objects.get_or_create(
            code='BES',
            defaults={
                'name': 'Mana HR',
                'email': 'info@brandselevate.com',
                'phone': '+1-555-0123',
                'address': '123 Business Street, Tech City, TC 12345'
            }
        )

        # Create departments
        hr_dept, _ = Department.objects.get_or_create(
            code='HR',
            organization=org,
            defaults={
                'name': 'Human Resources',
                'description': 'Human Resources Department'
            }
        )

        eng_dept, _ = Department.objects.get_or_create(
            code='ENG',
            organization=org,
            defaults={
                'name': 'Engineering',
                'description': 'Software Engineering Department'
            }
        )

        # Create job titles
        hr_manager_title, _ = JobTitle.objects.get_or_create(
            title='HR Manager',
            department=hr_dept,
            defaults={
                'description': 'Human Resources Manager',
                'level': 3
            }
        )

        software_engineer_title, _ = JobTitle.objects.get_or_create(
            title='Software Engineer',
            department=eng_dept,
            defaults={
                'description': 'Software Engineer',
                'level': 2
            }
        )

        team_lead_title, _ = JobTitle.objects.get_or_create(
            title='Team Lead',
            department=eng_dept,
            defaults={
                'description': 'Engineering Team Lead',
                'level': 3
            }
        )

        # Create users and employees
        users_data = [
            {
                'username': 'admin',
                'email': 'admin@brandselevate.com',
                'password': 'admin123',
                'first_name': 'System',
                'last_name': 'Administrator',
                'role': 'SUPER_ADMIN',
                'employee_data': {
                    'employee_id': 'BES001',
                    'department': hr_dept,
                    'job_title': hr_manager_title,
                    'date_of_joining': date(2024, 1, 1),
                    'basic_salary': 100000
                }
            },
            {
                'username': 'hrmanager',
                'email': 'hr@brandselevate.com',
                'password': 'hr123',
                'first_name': 'Sarah',
                'last_name': 'Johnson',
                'role': 'HR_MANAGER',
                'employee_data': {
                    'employee_id': 'BES002',
                    'department': hr_dept,
                    'job_title': hr_manager_title,
                    'date_of_joining': date(2024, 1, 15),
                    'basic_salary': 80000
                }
            },
            {
                'username': 'teamlead',
                'email': 'teamlead@brandselevate.com',
                'password': 'teamlead123',
                'first_name': 'Michael',
                'last_name': 'Chen',
                'role': 'TEAM_LEAD',
                'employee_data': {
                    'employee_id': 'BES003',
                    'department': eng_dept,
                    'job_title': team_lead_title,
                    'date_of_joining': date(2024, 2, 1),
                    'basic_salary': 90000
                }
            },
            {
                'username': 'employee1',
                'email': 'employee@brandselevate.com',
                'password': 'emp123',
                'first_name': 'John',
                'last_name': 'Doe',
                'role': 'EMPLOYEE',
                'employee_data': {
                    'employee_id': 'BES004',
                    'department': eng_dept,
                    'job_title': software_engineer_title,
                    'date_of_joining': date(2024, 2, 15),
                    'basic_salary': 70000
                }
            }
        ]

        created_employees = []
        
        for user_data in users_data:
            employee_data = user_data.pop('employee_data')
            
            # Create or get user
            user, created = User.objects.get_or_create(
                email=user_data['email'],
                defaults=user_data
            )
            
            if created:
                user.set_password(user_data['password'])
                user.save()
                self.stdout.write(f"Created user: {user.email}")
            
            # Create or get employee
            employee, emp_created = Employee.objects.get_or_create(
                user=user,
                defaults={
                    **employee_data,
                    'personal_email': user.email,
                    'current_address': '123 Main St, City, State 12345',
                    'emergency_contact_name': 'Emergency Contact',
                    'emergency_contact_phone': '+1-555-0199',
                    'emergency_contact_relation': 'Family'
                }
            )
            
            if emp_created:
                created_employees.append(employee)
                self.stdout.write(f"Created employee: {employee.full_name}")

        # Set manager relationships
        if len(created_employees) >= 4:
            # Set team lead as manager for employee
            employee_emp = created_employees[3]  # John Doe
            team_lead_emp = created_employees[2]  # Michael Chen
            employee_emp.manager = team_lead_emp
            employee_emp.save()

        # Create leave balances for all employees
        leave_types = LeaveType.objects.all()
        current_year = date.today().year
        
        for employee in Employee.objects.all():
            for leave_type in leave_types:
                LeaveBalance.objects.get_or_create(
                    employee=employee,
                    leave_type=leave_type,
                    year=current_year,
                    defaults={
                        'total_days': leave_type.days_allowed_per_year,
                        'used_days': 0,
                        'carry_forward_days': 0
                    }
                )

        self.stdout.write(
            self.style.SUCCESS('Successfully created demo users and employees!')
        )
        self.stdout.write('Demo credentials:')
        self.stdout.write('- Admin: admin@brandselevate.com / admin123')
        self.stdout.write('- HR Manager: hr@brandselevate.com / hr123')
        self.stdout.write('- Team Lead: teamlead@brandselevate.com / teamlead123')
        self.stdout.write('- Employee: employee@brandselevate.com / emp123')