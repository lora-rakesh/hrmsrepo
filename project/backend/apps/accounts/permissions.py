"""
Custom permissions for role-based access control
"""
from rest_framework import permissions

class IsSuperAdmin(permissions.BasePermission):
    """
    Permission class for Super Admin only
    """
    def has_permission(self, request, view):
        return (
            request.user and 
            request.user.is_authenticated and 
            request.user.role == 'SUPER_ADMIN'
        )

class IsSuperAdminOrHRManager(permissions.BasePermission):
    """
    Permission class for Super Admin or HR Manager
    """
    def has_permission(self, request, view):
        return (
            request.user and 
            request.user.is_authenticated and 
            request.user.role in ['SUPER_ADMIN', 'HR_MANAGER']
        )

class IsPayrollAdmin(permissions.BasePermission):
    """
    Permission class for payroll operations
    """
    def has_permission(self, request, view):
        return (
            request.user and 
            request.user.is_authenticated and 
            request.user.role in ['SUPER_ADMIN', 'PAYROLL_ADMIN']
        )

class IsTeamLead(permissions.BasePermission):
    """
    Permission class for team lead operations
    """
    def has_permission(self, request, view):
        return (
            request.user and 
            request.user.is_authenticated and 
            request.user.role in ['SUPER_ADMIN', 'HR_MANAGER', 'TEAM_LEAD']
        )

class IsRecruiter(permissions.BasePermission):
    """
    Permission class for recruitment operations
    """
    def has_permission(self, request, view):
        return (
            request.user and 
            request.user.is_authenticated and 
            request.user.role in ['SUPER_ADMIN', 'HR_MANAGER', 'RECRUITER']
        )

class IsOwnerOrHRManager(permissions.BasePermission):
    """
    Permission to allow owners of an object or HR managers to access it
    """
    def has_object_permission(self, request, view, obj):
        if request.user.role in ['SUPER_ADMIN', 'HR_MANAGER']:
            return True
        
        # Check if the object has a user field and if it matches the request user
        if hasattr(obj, 'user'):
            return obj.user == request.user
        elif hasattr(obj, 'employee') and hasattr(obj.employee, 'user'):
            return obj.employee.user == request.user
        
        return False

class IsOwnerOrTeamLead(permissions.BasePermission):
    """
    Permission for team leads to manage their team members
    """
    def has_object_permission(self, request, view, obj):
        if request.user.role in ['SUPER_ADMIN', 'HR_MANAGER']:
            return True
        
        if request.user.role == 'TEAM_LEAD':
            # Check if the user is the team lead of the employee
            if hasattr(obj, 'employee') and hasattr(obj.employee, 'manager'):
                return obj.employee.manager.user == request.user
            elif hasattr(obj, 'manager'):
                return obj.manager.user == request.user
        
        # Allow access to own records
        if hasattr(obj, 'user'):
            return obj.user == request.user
        elif hasattr(obj, 'employee') and hasattr(obj.employee, 'user'):
            return obj.employee.user == request.user
        
        return False