from django.contrib import admin
from .models import ResignationRequest

@admin.register(ResignationRequest)
class ResignationRequestAdmin(admin.ModelAdmin):
    list_display = ("employee", "resignation_date", "last_working_day", "status", "submitted_at")
    list_filter = ("status", "submitted_at")
    search_fields = ("employee__email", "employee__username", "reason", "other_reason")
    readonly_fields = ("submitted_at", "updated_at",)
