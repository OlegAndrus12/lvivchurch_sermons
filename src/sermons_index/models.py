from django.db import models
from sermons_index.services.storage import AppBoxStorage

fs = AppBoxStorage()


class Preacher(models.Model):
    first_name = models.CharField(max_length=100)
    last_name = models.CharField(max_length=100)

    def __str__(self):
        return f"{self.first_name} {self.last_name}"


class Sermon(models.Model):
    preacher = models.ForeignKey(Preacher, on_delete=models.SET_NULL, null=True)
    title = models.CharField(max_length=256)
    date = models.DateField(unique=True)
    reference = models.CharField(max_length=100)

    audio = models.FileField(blank=True, null=True, storage=fs)
    text = models.FileField(blank=True, null=True, storage=fs)
    agenda = models.FileField(blank=True, null=True, storage=fs)
    folder_id = models.CharField(blank=True, max_length=64)

    def __str__(self):
        return self.title

    def format_sermon_folder(self):
        return f"{self.date}, {self.title}, {self.preacher}"

    class Meta:
        ordering = ["date"]

    def save(self, *args, **kwargs):
        if not self.folder_id:
            self.folder_id = fs.create_folder(self.format_sermon_folder())

        fs.set_folder_id(self.folder_id)
        super().save(*args, **kwargs)
