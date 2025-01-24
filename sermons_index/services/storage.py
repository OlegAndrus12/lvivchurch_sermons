from django.core.files.storage import Storage
from box_sdk_gen import BoxClient, BoxDeveloperTokenAuth, UploadFileAttributes, UploadFileAttributesParentField

class AppBoxStorage(Storage):
    def __init__(self):
        self.api = BoxClient(BoxDeveloperTokenAuth(token="ki59f7WM1wOmYMTLRN8BszBuEOG2APtp"))
    

    def _save(self, name, file):

        # for image in Category model: file in method is already read,
        # so we move position to the file beginning
        # ToDo investigate tre root cause of the problem, maybe it's TreeManager

        self.api.uploads.upload_file(UploadFileAttributes(name=file.name, parent=UploadFileAttributesParentField("0")), file)
