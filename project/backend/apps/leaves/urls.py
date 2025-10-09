"""
Leave management URLs
"""
from django.urls import path, include
from rest_framework.routers import DefaultRouter
from . import views

router = DefaultRouter()
router.register('types', views.LeaveTypeViewSet, basename='leavetype')  # Add basename
router.register('balances', views.LeaveBalanceViewSet, basename='leavebalance')
router.register('requests', views.LeaveRequestViewSet, basename='leaverequest')
router.register('holidays', views.HolidayViewSet, basename='holiday')
router.register('comments', views.LeaveRequestCommentViewSet, basename='leavecomment')

urlpatterns = [
    path('', include(router.urls)),
]