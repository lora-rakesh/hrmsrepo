"""
Payroll models - Basic implementation
"""
from django.db import models
from django.contrib.auth import get_user_model
from apps.core.models import TimeStampedModel
from apps.employees.models import Employee
from decimal import Decimal

User = get_user_model()

class SalaryComponent(TimeStampedModel):
    """
    Salary components like Basic, HRA, DA, etc.
    """
    COMPONENT_TYPES = [
        ('EARNING', 'Earning'),
        ('DEDUCTION', 'Deduction'),
    ]
    
    name = models.CharField(max_length=100)
    code = models.CharField(max_length=20, unique=True)
    component_type = models.CharField(max_length=20, choices=COMPONENT_TYPES)
    is_percentage = models.BooleanField(default=False)
    percentage_of = models.ForeignKey('self', on_delete=models.SET_NULL, null=True, blank=True)
    is_taxable = models.BooleanField(default=True)
    is_active = models.BooleanField(default=True)
    
    def __str__(self):
        return f"{self.name} ({self.code})"
    
    class Meta:
        db_table = 'payroll_salary_component'

class EmployeeSalaryStructure(TimeStampedModel):
    """
    Employee salary structure
    """
    employee = models.ForeignKey(Employee, on_delete=models.CASCADE, related_name='salary_structures')
    effective_from = models.DateField()
    effective_to = models.DateField(null=True, blank=True)
    is_active = models.BooleanField(default=True)
    
    def __str__(self):
        return f"{self.employee.full_name} - Salary Structure"
    
    class Meta:
        db_table = 'payroll_employee_salary_structure'

class SalaryStructureComponent(TimeStampedModel):
    """
    Components in employee salary structure
    """
    salary_structure = models.ForeignKey(EmployeeSalaryStructure, on_delete=models.CASCADE, related_name='components')
    component = models.ForeignKey(SalaryComponent, on_delete=models.CASCADE)
    amount = models.DecimalField(max_digits=10, decimal_places=2, default=0)
    percentage = models.DecimalField(max_digits=5, decimal_places=2, default=0)
    
    def __str__(self):
        return f"{self.salary_structure.employee.full_name} - {self.component.name}"
    
    class Meta:
        db_table = 'payroll_salary_structure_component'
        unique_together = ['salary_structure', 'component']

class PayrollRun(TimeStampedModel):
    """
    Monthly payroll run
    """
    STATUS_CHOICES = [
        ('DRAFT', 'Draft'),
        ('PROCESSING', 'Processing'),
        ('COMPLETED', 'Completed'),
        ('CANCELLED', 'Cancelled'),
    ]
    
    name = models.CharField(max_length=100)
    month = models.IntegerField()
    year = models.IntegerField()
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='DRAFT')
    processed_by = models.ForeignKey(User, on_delete=models.SET_NULL, null=True)
    processed_at = models.DateTimeField(null=True, blank=True)
    
    def __str__(self):
        return f"Payroll {self.month}/{self.year}"
    
    class Meta:
        db_table = 'payroll_payroll_run'
        unique_together = ['month', 'year']

class Payslip(TimeStampedModel):
    """
    Individual employee payslip
    """
    payroll_run = models.ForeignKey(PayrollRun, on_delete=models.CASCADE, related_name='payslips')
    employee = models.ForeignKey(Employee, on_delete=models.CASCADE, related_name='payslips')
    
    gross_salary = models.DecimalField(max_digits=10, decimal_places=2, default=0)
    total_deductions = models.DecimalField(max_digits=10, decimal_places=2, default=0)
    net_salary = models.DecimalField(max_digits=10, decimal_places=2, default=0)
    
    # Attendance data
    working_days = models.IntegerField(default=0)
    present_days = models.IntegerField(default=0)
    absent_days = models.IntegerField(default=0)
    
    def __str__(self):
        return f"{self.employee.full_name} - {self.payroll_run.month}/{self.payroll_run.year}"
    
    class Meta:
        db_table = 'payroll_payslip'
        unique_together = ['payroll_run', 'employee']

class PayslipComponent(TimeStampedModel):
    """
    Individual components in payslip
    """
    payslip = models.ForeignKey(Payslip, on_delete=models.CASCADE, related_name='components')
    component = models.ForeignKey(SalaryComponent, on_delete=models.CASCADE)
    amount = models.DecimalField(max_digits=10, decimal_places=2)
    
    def __str__(self):
        return f"{self.payslip.employee.full_name} - {self.component.name}"
    
    class Meta:
        db_table = 'payroll_payslip_component'