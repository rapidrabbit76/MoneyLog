from monylog.shared_kernel.infra.camel_model import CamelModel
from typing import Literal


class PageableBase(CamelModel):
    pass


SORT = r"^[\w\.]+:(?:asc|desc)$"
DIRECTION = Literal["next", "prev"]
