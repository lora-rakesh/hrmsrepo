from rest_framework.routers import DefaultRouter
from .views import ResignationRequestViewSet

router = DefaultRouter()
router.register(r"resignations", ResignationRequestViewSet, basename="resignation")

urlpatterns = router.urls
