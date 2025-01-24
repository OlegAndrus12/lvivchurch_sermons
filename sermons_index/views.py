from django.views.generic import ListView
from .models import Sermon


class SermonsListView(ListView):
    context_object_name = 'sermons'
    template_name = "sermons_index/sermons_index.html"

    def get_queryset(self):
        return Sermon.objects.all()
