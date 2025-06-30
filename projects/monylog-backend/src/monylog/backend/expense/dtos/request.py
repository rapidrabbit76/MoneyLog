from monylog.shared_kernel.infra.camel_model import CamelModel, Field
from pydantic import model_validator
from .schemas import ExpenseSchema
from monylog.shared_kernel.infra.fastapi.pageable import OffsetPageable
from monylog.shared_kernel.domain.types import DateRange


class CreateExpenseTagRequest(CamelModel):
    class ExpenseTagDataSchema(CamelModel):
        color: str = Field("#00f0f0")

    name: str = Field(default="", description="name of ExpenseTag")
    data: ExpenseTagDataSchema = Field(default_factory=ExpenseTagDataSchema)  # type: ignore


class SearchExpenseTagRequest(CamelModel):
    name: str | None = None
    id: str | None = None

    @model_validator(mode="after")
    def validate_at_least_one_field(self) -> "SearchExpenseTagRequest":
        if self.name is None and self.id is None:
            raise ValueError("At least one of name or id must be provided")
        return self


class CreateExpenseRequest(CamelModel):
    request_id: str
    expenses: list[ExpenseSchema]


class ExpenseQueryRequest(OffsetPageable, DateRange, CamelModel):
    pass
