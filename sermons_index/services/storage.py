from django.core.files.storage import Storage
from box_sdk_gen import BoxClient, BoxDeveloperTokenAuth, UploadFileAttributes, UploadFileAttributesParentField
from django.utils.deconstruct import deconstructible
from box_sdk_gen.managers.search import SearchForContentTrashContent

@deconstructible
class AppBoxStorage(Storage):
    def __init__(self):
        self.api = BoxClient(BoxDeveloperTokenAuth(token="ki59f7WM1wOmYMTLRN8BszBuEOG2APtp"))
        self.folder_id = "304312357938"
        self.file_url = "https://app.box.com/file/{file_id}"
    

    def _save(self, name, file):
        files = self.api.uploads.upload_file(UploadFileAttributes(name=name, parent=UploadFileAttributesParentField(self.folder_id)), file)
        return str(files.entries[0].id)
    
    def url(self, name):
        return self.file_url.format(file_id=name)
    
    def exists(self, name):
        print(name)
        results = self.api.search.search_for_content(query=f'"{name}"', trash_content=SearchForContentTrashContent.NON_TRASHED_ONLY)
        print(results)
        return results.total_count > 0
