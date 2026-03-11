from django.urls import path

from . import views

urlpatterns = [
    path("", views.SermonsListView.as_view(), name="index"),
]
