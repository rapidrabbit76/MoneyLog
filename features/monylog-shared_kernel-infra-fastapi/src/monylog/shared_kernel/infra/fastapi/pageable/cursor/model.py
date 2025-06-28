import base64
import json
from typing import Generic, TypeVar

from faker.providers.color import de
from pydantic import Field, computed_field, field_validator

from monylog.shared_kernel.infra.camel_model import CamelModel, Field

from ..base import DIRECTION, PageableBase


class CursorBase(CamelModel):
    direction: DIRECTION = Field(
        "next",
        description="Direction of the cursor, either 'next' or 'prev'.",
        examples=["next", "prev"],
    )

    @classmethod
    def decode_cursor(cls, cursor: str) -> dict:
        try:
            decoded_bytes = base64.b64decode(cursor)
            return json.loads(decoded_bytes.decode("utf-8"))
        except (ValueError, json.JSONDecodeError) as e:
            raise ValueError(f"Invalid cursor format: {cursor}. Error: {str(e)}") from e

    @classmethod
    def encode_cursor(cls, cursor: "CursorBase") -> str:
        """Encode the cursor dictionary into a base64 string."""
        if not cursor:
            return ""
        json_str = cursor.model_dump_json()
        encoded_bytes = base64.b64encode(json_str.encode("utf-8"))
        return encoded_bytes.decode("utf-8")


CT = TypeVar("CT", bound=CursorBase)


class CursorPageableBase(PageableBase, Generic[CT]):
    cursor: str | None = Field(
        None,
        description="Cursor for pagination, used to fetch the next or previous page.",
        examples=["eyJwYWdlIjoxLCJzaXplIjo1MH0=", "eyJwYWdlIjoxLCJzaXplIjo1MH0="],
    )
    size: int = Field(20, ge=1)

    @field_validator("cursor", mode="before")
    @classmethod
    def validate_cursor(cls, cursor: str | None) -> str | None:
        if not cursor:
            return None
        try:
            CamelModel.parse_obj(CursorBase.decode_cursor(cursor), cls=CT)
        except (ValueError, json.JSONDecodeError) as e:
            raise ValueError(f"Invalid cursor format: {cursor}. Error: {str(e)}") from e
        return cursor

    @computed_field(exclude=True)
    @property
    def cursor_model(self) -> CT | None:
        if not self.cursor:
            return None
        decoded_cursor = CursorBase.decode_cursor(self.cursor)
        try:
            model = CamelModel.parse_obj(decoded_cursor, cls=CT)
            return model
        except Exception as e:
            raise ValueError(f"Invalid cursor format: {self.cursor}. Error: {str(e)}") from e

    @classmethod
    def decode_cursor(cls, cursor: str) -> dict:
        return CursorBase.decode_cursor(cursor)

    @classmethod
    def encode_cursor(cls, cursor: "CursorBase") -> str:
        return CursorBase.encode_cursor(cursor)
