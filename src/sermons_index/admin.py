from django.contrib import admin
from .models import Preacher, Sermon, box_storage


@admin.register(Preacher)
class PreacherAdmin(admin.ModelAdmin):
    list_display = ("first_name", "last_name")
    search_fields = ("first_name", "last_name")


@admin.register(Sermon)
class SermonAdmin(admin.ModelAdmin):
    fields = ["preacher", "title", "date", "reference", "audio", "text", "agenda"]
    search_fields = ("title", "preacher__first_name", "preacher__last_name")
    list_filter = ("preacher", "date")

    def save_model(self, request, obj, form, change):
        if not obj.folder_id:
            obj.folder_id = box_storage.create_folder(obj.format_sermon_folder())

        box_storage.set_folder_id(obj.folder_id)

        super().save_model(request, obj, form, change)
