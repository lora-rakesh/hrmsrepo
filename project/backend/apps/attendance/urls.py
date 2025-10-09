"""
Attendance URLs
"""
from django.urls import path, include
from rest_framework.routers import DefaultRouter
from . import views

router = DefaultRouter()
router.register('shifts', views.ShiftViewSet, basename='shift')
router.register('employee-shifts', views.EmployeeShiftViewSet, basename='employee-shift')
router.register('records', views.AttendanceViewSet, basename='attendance')
router.register('requests', views.AttendanceRequestViewSet, basename='attendance-request')
router.register('work-from-home', views.WorkFromHomeViewSet, basename='work-from-home')

urlpatterns = [
    path('', include(router.urls)),
]