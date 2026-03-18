import json
import os

from box_sdk_gen import (
    BoxClient,
    BoxOAuth,
    OAuthConfig,
    UploadFileAttributes,
    UploadFileAttributesParentField,
    UploadFileVersionAttributes,
    CreateFolderParent,
)
from box_sdk_gen.box.errors import BoxAPIError
from box_sdk_gen.box.oauth import TokenStorage, AccessToken
from box_sdk_gen.managers.shared_links_files import (
    AddShareLinkToFileSharedLink,
    AddShareLinkToFileSharedLinkAccessField,
)
from django.core.files.storage import Storage
from django.utils.deconstruct import deconstructible


class FileTokenStorage(TokenStorage):
    """Persists Box OAuth tokens to a JSON file so they survive restarts."""

    def __init__(self, path: str):
        self.path = path

    def store(self, token: AccessToken) -> None:
        with open(self.path, "w") as f:
            json.dump(
                {
                    "access_token": token.access_token,
                    "refresh_token": token.refresh_token,
                    "expires_in": token.expires_in,
                    "token_type": token.token_type,
                },
                f,
            )

    def get(self):
        if not os.path.exists(self.path):
            return None

        with open(self.path) as f:
            data = json.load(f)

        return AccessToken(
            access_token=data.get("access_token"),
            refresh_token=data.get("refresh_token"),
            expires_in=data.get("expires_in"),
            token_type=data.get("token_type"),
        )

    def clear(self):
        if os.path.exists(self.path):
            os.remove(self.path)


@deconstructible
class AppBoxStorage(Storage):
    def __init__(self):
        token_file = os.environ["BOX_TOKEN_FILE"]
        auth = BoxOAuth(
            OAuthConfig(
                client_id=os.environ["BOX_CLIENT_ID"],
                client_secret=os.environ["BOX_CLIENT_SECRET"],
                token_storage=FileTokenStorage(token_file),
            )
        )
        self.api = BoxClient(auth)
        self.folder_id = None

    def _save(self, name, file):
        return self.upload_file(name, file)

    def url(self, name):
        return name

    def exists(self, name):
        return False

    def create_folder(self, name):
        res = self.api.folders.create_folder(name, parent=CreateFolderParent("0"))
        return res.id

    def _create_shared_link(self, file_id: str) -> str:
        result = self.api.shared_links_files.add_share_link_to_file(
            file_id,
            fields="shared_link",
            shared_link=AddShareLinkToFileSharedLink(
                access=AddShareLinkToFileSharedLinkAccessField.OPEN,
            ),
        )
        return result.shared_link.url

    def upload_file(self, name, file):
        try:
            files = self.api.uploads.upload_file(
                UploadFileAttributes(
                    name=name, parent=UploadFileAttributesParentField(id=self.folder_id)
                ),
                file,
            )
            file_id = files.entries[0].id
        except BoxAPIError as e:
            if e.response_info.code != "item_name_in_use":
                raise
            file_id = e.response_info.context_info["conflicts"]["id"]
            self.api.uploads.upload_file_version(
                file_id,
                UploadFileVersionAttributes(name=name),
                file,
            )
        return self._create_shared_link(file_id)

    def set_folder_id(self, id):
        self.folder_id = id
