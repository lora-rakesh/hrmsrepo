from rest_framework import permissions

class IsEmployeeCreatingOrOwner(permissions.BasePermission):
    """
    - POST: allowed for authenticated employees
    - GET list: allowed for HR_MANAGER or SUPER_ADMIN (others only see own via view logic)
    - Object-level: owners or HR/SUPER_ADMIN allowed
    """
    def has_permission(self, request, view):
        # Require authentication for all API access
        if not request.user or not request.user.is_authenticated:
            return False
        # Allow POST for any authenticated employee
        if request.method == "POST":
            return True
        # List/GET other methods allowed, actual queryset will filter
        return True

    def has_object_permission(self, request, view, obj):
        if request.user.role in ["SUPER_ADMIN", "HR_MANAGER"]:
            return True
        return obj.employee == request.user
