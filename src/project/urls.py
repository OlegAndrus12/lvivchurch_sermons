from django.contrib import admin
from django.urls import path, include
from two_factor.admin import AdminSiteOTPRequired
from two_factor.urls import urlpatterns as tf_urls

admin.site.__class__ = AdminSiteOTPRequired

urlpatterns = [
    path("", include(tf_urls)),
    path("admin/", admin.site.urls),
    path("", include("sermons_index.urls")),
]
