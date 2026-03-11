from django.contrib import admin
from .models import Preacher, Sermon


@admin.register(Preacher)
class PreacherAdmin(admin.ModelAdmin):
    list_display = ("first_name", "last_name")
    search_fields = ("first_name", "last_name")


@admin.register(Sermon)
class SermonAdmin(admin.ModelAdmin):
    fields = ["preacher", "title", "date", "reference"]
    list_display = ("title", "preacher", "date")
    search_fields = ("title", "preacher__first_name", "preacher__last_name")
    list_filter = ("preacher", "date")

    def get_fields(self, request, obj=None):
        if obj:
            return self.fields + ["audio", "text", "agenda"]
        return super().get_fields(request, obj)
