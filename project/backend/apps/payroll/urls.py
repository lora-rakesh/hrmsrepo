"""
Payroll URLs - Basic skeleton
"""
from django.urls import path, include
from rest_framework.routers import DefaultRouter
from . import views

router = DefaultRouter()
# TODO: Add payroll viewsets when implemented

urlpatterns = [
    path('', include(router.urls)),
    # TODO: Add payroll-specific endpoints
    # path('run/', views.PayrollRunView.as_view(), name='payroll-run'),
    # path('payslips/', views.PayslipListView.as_view(), name='payslip-list'),
]