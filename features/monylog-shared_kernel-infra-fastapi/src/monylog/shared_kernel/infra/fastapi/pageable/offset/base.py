from monylog.shared_kernel.infra.camel_model import Field

from ..base import PageableBase


class OffsetPageable(PageableBase):
    page: int = Field(1, ge=1)
    size: int = Field(20, ge=1, le=500)
    sort: str | None = Field(
        None,
        examples=[
            "id:asc",
            "id:desc",
            "writed:asc",
            "writed:desc",
            "writed_date:asc",
            "styles.review_count:asc",
            "styles.review_count:desc",
        ],
        pattern=r"^[\w\.]+:(?:asc|desc)$",
        description="order by field and asc/desc ex: styles.review_count:desc",
    )

    @property
    def pageable(self) -> "OffsetPageable":
        return OffsetPageable(page=self.page, size=self.size, sort=self.sort)

    @property
    def offset(self):
        return (self.page - 1) * self.size

    @property
    def limit(self):
        return self.size

    @property
    def order_by(self):
        try:
            from sqlalchemy import asc, desc, text
        except ImportError:
            return None
        if self.sort is None:
            return None
        name = text(self.sort.split(":")[0])
        if self.sort.split(":")[1] == "desc":
            return desc(name)
        return asc(name)
