import uuid
from django.db import models
from django.conf import settings

def resignation_letter_upload_path(instance, filename):
    # organized per employee id and request id
    return f"resignations/{instance.employee.id}/{instance.id}/{filename}"

class ResignationRequest(models.Model):
    STATUS_PENDING = "PENDING"
    STATUS_APPROVED = "APPROVED"
    STATUS_REJECTED = "REJECTED"
    STATUS_CHOICES = [
        (STATUS_PENDING, "Pending"),
        (STATUS_APPROVED, "Approved"),
        (STATUS_REJECTED, "Rejected"),
    ]

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    employee = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name="resignations"
    )
    resignation_date = models.DateField()
    last_working_day = models.DateField()
    reason = models.CharField(max_length=255)
    other_reason = models.CharField(max_length=512, blank=True, null=True)

    signature_data = models.TextField(blank=True, null=True)  # base64 data URL
    resignation_letter = models.FileField(
        upload_to=resignation_letter_upload_path,
        blank=True,
        null=True
    )

    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default=STATUS_PENDING)
    submitted_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = "resignation_request"
        ordering = ["-submitted_at"]

    def __str__(self):
        return f"Resignation {self.id} - {self.employee.email} ({self.status})"
