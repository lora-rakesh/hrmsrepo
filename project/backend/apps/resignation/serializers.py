from rest_framework import serializers
from .models import ResignationRequest
from django.conf import settings

ALLOWED_FILE_EXT = (".pdf", ".doc", ".docx")
MAX_FILE_SIZE = 5 * 1024 * 1024  # 5 MB

class ResignationRequestSerializer(serializers.ModelSerializer):
    employee_name = serializers.CharField(source="employee.full_name", read_only=True)
    resignation_letter = serializers.FileField(required=False, allow_null=True)

    class Meta:
        model = ResignationRequest
        fields = [
            "id", "employee", "employee_name", "resignation_date", "last_working_day",
            "reason", "other_reason", "signature_data", "resignation_letter",
            "status", "submitted_at"
        ]
        read_only_fields = ["id", "employee", "status", "submitted_at"]

    def validate(self, attrs):
        # date validation: last_working_day must be >= resignation_date
        rd = attrs.get("resignation_date") or getattr(self.instance, "resignation_date", None)
        lwd = attrs.get("last_working_day") or getattr(self.instance, "last_working_day", None)
        if rd and lwd and lwd < rd:
            raise serializers.ValidationError({"last_working_day": "Last working day cannot be before resignation date."})
        return attrs

    def validate_resignation_letter(self, value):
        if not value:
            return value
        name = value.name.lower()
        if not any(name.endswith(ext) for ext in ALLOWED_FILE_EXT):
            raise serializers.ValidationError("Unsupported file type. Allowed: pdf, doc, docx.")
        if value.size > MAX_FILE_SIZE:
            raise serializers.ValidationError("File too large. Max size is 5 MB.")
        return value

    def create(self, validated_data):
        request = self.context["request"]
        validated_data["employee"] = request.user
        return super().create(validated_data)
