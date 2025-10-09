"""
Custom middleware for HRMS
"""
from django.utils.deprecation import MiddlewareMixin
from .models import AuditLog
import json

class AuditLogMiddleware(MiddlewareMixin):
    """
    Middleware to log API requests for audit trail
    """
    
    def process_request(self, request):
        # Store request info for potential audit logging
        request._audit_data = {
            'ip_address': self.get_client_ip(request),
            'user_agent': request.META.get('HTTP_USER_AGENT', ''),
        }
    
    def process_response(self, request, response):
        # Log successful operations
        if (hasattr(request, 'user') and request.user.is_authenticated and 
            request.method in ['POST', 'PUT', 'PATCH', 'DELETE'] and
            response.status_code < 400):
            
            try:
                AuditLog.objects.create(
                    user=request.user,
                    action=request.method,
                    model_name=self.extract_model_from_path(request.path),
                    object_id=self.extract_object_id(request.path, response),
                    changes=self.extract_changes(request, response),
                    ip_address=request._audit_data.get('ip_address'),
                    user_agent=request._audit_data.get('user_agent')
                )
            except Exception:
                # Don't break the request if audit logging fails
                pass
        
        return response
    
    def get_client_ip(self, request):
        x_forwarded_for = request.META.get('HTTP_X_FORWARDED_FOR')
        if x_forwarded_for:
            ip = x_forwarded_for.split(',')[0]
        else:
            ip = request.META.get('REMOTE_ADDR')
        return ip
    
    def extract_model_from_path(self, path):
        # Extract model name from API path
        parts = path.split('/')
        if len(parts) > 3 and parts[1] == 'api':
            return parts[3]
        return 'unknown'
    
    def extract_object_id(self, path, response):
        # Try to extract object ID from path or response
        parts = path.split('/')
        if len(parts) > 4:
            return parts[4]
        return ''
    
    def extract_changes(self, request, response):
        # Extract changes from request body
        try:
            if request.content_type == 'application/json':
                return json.loads(request.body.decode('utf-8'))
        except (json.JSONDecodeError, UnicodeDecodeError):
            pass
        return {}