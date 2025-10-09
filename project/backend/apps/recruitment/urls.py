"""
Recruitment URLs - Basic skeleton
"""
from django.urls import path, include
from rest_framework.routers import DefaultRouter
from . import views

router = DefaultRouter()
# TODO: Add recruitment viewsets when implemented

urlpatterns = [
    path('', include(router.urls)),
    # TODO: Add recruitment-specific endpoints
    # path('jobs/', views.JobPostingListView.as_view(), name='job-list'),
    # path('candidates/', views.CandidateListView.as_view(), name='candidate-list'),
]