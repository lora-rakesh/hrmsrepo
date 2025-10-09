# apps/reports/views.py
from django.http import HttpResponse

def index(request):
    return HttpResponse("Reports module working")
