from rest_framework import viewsets, status, serializers
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from .models import ResignationRequest
from .serializers import ResignationRequestSerializer
from .permissions import IsEmployeeCreatingOrOwner


class ResignationRequestViewSet(viewsets.ModelViewSet):
    serializer_class = ResignationRequestSerializer
    permission_classes = [IsAuthenticated, IsEmployeeCreatingOrOwner]
    http_method_names = ['get', 'post', 'patch', 'put', 'delete']

    def get_queryset(self):
        user = self.request.user
        if user.role in ["SUPER_ADMIN", "HR_MANAGER"]:
            return ResignationRequest.objects.all()
        return ResignationRequest.objects.filter(employee=user)

    def create(self, request, *args, **kwargs):
        user = request.user

        # ✅ CHECK existing request of this employee
        last_request = ResignationRequest.objects.filter(employee=user).order_by('-submitted_at').first()

        if last_request and last_request.status != "REJECTED":
            return Response(
                {
                    "detail": f"You already have a resignation request with status '{last_request.status}'. "
                              "You can apply again only after it is REJECTED."
                },
                status=status.HTTP_400_BAD_REQUEST
            )

        # ✅ If allowed, save with employee auto-assigned
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        serializer.save(employee=user)

        return Response(serializer.data, status=status.HTTP_201_CREATED)

    def partial_update(self, request, *args, **kwargs):
        instance = self.get_object()

        # ✅ Only HR or SUPER_ADMIN can update status
        if 'status' in request.data:
            if request.user.role not in ["SUPER_ADMIN", "HR_MANAGER"]:
                return Response(
                    {"detail": "Not allowed to change status"},
                    status=status.HTTP_403_FORBIDDEN
                )

        return super().partial_update(request, *args, **kwargs)
