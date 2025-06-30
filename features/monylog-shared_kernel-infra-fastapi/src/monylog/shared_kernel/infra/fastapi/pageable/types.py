from typing import Generic, List, TypeVar
from pydantic import BaseModel, computed_field
from monylog.shared_kernel.infra.camel_model import CamelModel, Field
from .base import PageableBase


T = TypeVar("T")


class Page(BaseModel, Generic[T]):
    items: List[T] = Field(default_factory=list)
    total: int | None = Field(default=None)
    next_cursor: str | None = Field(default=None)
    previous_cursor: str | None = Field(default=None)
    metadata: dict | None = Field(default=None)


class PageMeta(CamelModel):
    size: int
    page: int | None = Field(default=None)
    total: int | None = Field(default=None)
    next_cursor: str | None = Field(default=None)
    previous_cursor: str | None = Field(default=None)

    @computed_field
    def total_page(self) -> int | None:
        if self.total is None:
            return None
        total_page = self.total // self.size
        if self.total % self.size > 0:
            total_page += 1
        return total_page

    @computed_field
    def offset(self) -> int:
        return (self.page - 1) * self.size


class PaginationResponse(BaseModel, Generic[T]):
    meta: PageMeta = Field()
    items: List[T] = Field(default_factory=list)

    @classmethod
    def build(cls, data: Page[T], pageable: "PageableBase"):
        paging = PageMeta(
            size=pageable.size,
            page=pageable.page if hasattr(data, "page") is not None else None,
            total=data.total if hasattr(data, "total") else None,
            next_cursor=data.next_cursor if hasattr(data, "next_cursor") else None,
            previous_cursor=data.previous_cursor
            if hasattr(data, "previous_cursor")
            else None,
        )
        return PaginationResponse(items=data.items, meta=paging)
