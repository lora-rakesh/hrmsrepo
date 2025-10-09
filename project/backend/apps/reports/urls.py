"""
Reports URLs - Basic skeleton
"""
from django.urls import path, include
from rest_framework.routers import DefaultRouter
from . import views

router = DefaultRouter()
# TODO: Add report viewsets when implemented

urlpatterns = [
    path('', include(router.urls)),
    # TODO: Add report-specific endpoints
    # path('templates/', views.ReportTemplateListView.as_view(), name='report-templates'),
    # path('generate/', views.GenerateReportView.as_view(), name='generate-report'),
]