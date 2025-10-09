"""
Authentication URLs
"""
from django.urls import path, include
from rest_framework.routers import DefaultRouter
from rest_framework_simplejwt.views import TokenRefreshView
from . import views

router = DefaultRouter()
router.register('users', views.UserViewSet)

urlpatterns = [
    # Authentication endpoints
    path('login/', views.login_view, name='login'),
    path('register/', views.register_user, name='register'),
    path('logout/', views.logout_view, name='logout'),
    path('token/refresh/', TokenRefreshView.as_view(), name='token_refresh'),
    
    # Profile endpoints
    path('me/', views.user_profile, name='user_profile'),
    path('me/update/', views.update_profile, name='update_profile'),
    path('me/change-password/', views.change_password, name='change_password'),
     path('auth/me/avatar/', views.remove_avatar, name='remove-avatar'),
    
    # User management (admin)
    path('', include(router.urls)),
]