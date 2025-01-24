from django.contrib import admin
from .models import Preacher, Sermon


@admin.register(Preacher)
class PreacherAdmin(admin.ModelAdmin):
    list_display = ('first_name', 'last_name')
    search_fields = ('first_name', 'last_name')

@admin.register(Sermon)
class SermonAdmin(admin.ModelAdmin):
    list_display = ('title', 'preacher', 'date')
    search_fields = ('title', 'preacher__first_name', 'preacher__last_name')
    list_filter = ('preacher', 'date')
