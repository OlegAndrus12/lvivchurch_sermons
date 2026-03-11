from django.views.generic import ListView
from .models import Preacher, Sermon


class SermonsListView(ListView):
    context_object_name = "sermons"
    template_name = "sermons_index/sermons_index.html"

    def get_queryset(self):
        return Sermon.objects.order_by("-date")

    def get_context_data(self, **kwargs):
        ctx = super().get_context_data(**kwargs)
        ctx["preachers"] = Preacher.objects.order_by("last_name", "first_name")
        ctx["sermon_count"] = Sermon.objects.count()
        return ctx
