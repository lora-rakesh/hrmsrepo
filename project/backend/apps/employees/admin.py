from django.contrib import admin
from .models import Employee, EmployeeDocument, EmploymentHistory, SkillSet, EducationRecord

@admin.register(Employee)
class EmployeeAdmin(admin.ModelAdmin):
    list_display = (
        'employee_id', 'full_name', 'department', 'job_title',
        'employment_status', 'employment_type', 'work_mode', 'date_of_joining'
    )
    list_filter = ('employment_status', 'employment_type', 'work_mode', 'department')
    search_fields = ('employee_id', 'user__first_name', 'user__last_name', 'user__email')

admin.site.register(EmployeeDocument)
admin.site.register(EmploymentHistory)
admin.site.register(SkillSet)
admin.site.register(EducationRecord)
