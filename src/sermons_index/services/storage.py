from django.core.files.storage import Storage
from box_sdk_gen import (
    BoxClient,
    BoxDeveloperTokenAuth,
    UploadFileAttributes,
    UploadFileAttributesParentField,
    CreateFolderParent,
)
from django.utils.deconstruct import deconstructible
from box_sdk_gen.managers.search import SearchForContentTrashContent


@deconstructible
class AppBoxStorage(Storage):
    def __init__(self):
        self.api = BoxClient(
            BoxDeveloperTokenAuth(token="TZNxfaXhSKZ9TXAnEIJLbb44D1IMGbis")
        )
        self.file_url = "https://app.box.com/file/{file_id}"
        self.folder_id = None

    def _save(self, name, file):
        return self.upload_file(name, file)

    def url(self, name):
        return self.file_url.format(file_id=name)

    def exists(self, name):
        results = self.api.search.search_for_content(
            query=f'"{name}"',
            trash_content=SearchForContentTrashContent.NON_TRASHED_ONLY,
        )
        return results.total_count > 0

    def create_folder(self, name):
        res = self.api.folders.create_folder(name, parent=CreateFolderParent("0"))
        return res.id

    def upload_file(self, name, file):
        files = self.api.uploads.upload_file(
            UploadFileAttributes(
                name=name, parent=UploadFileAttributesParentField(id=self.folder_id)
            ),
            file,
        )
        return str(files.entries[0].id)

    def set_folder_id(self, id):
        self.folder_id = id
