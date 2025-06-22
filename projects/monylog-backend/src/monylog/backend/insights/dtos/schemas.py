from datetime import datetime, date as Date
from decimal import Decimal
from monylog.shared_kernel.infra.camel_model import CamelModel, Field
from pydantic import computed_field, field_validator


class ExpenseInsightSchemaBase(CamelModel):
    class Count(CamelModel):
        expense: int = Field(0)
        income: int = Field(0)

        @computed_field
        @property
        def total(self) -> int:
            return self.expense + self.income

    class Amount(CamelModel):
        income: Decimal = Field(Decimal("0.00"))
        expense: Decimal = Field(Decimal("0.00"))
        total: Decimal = Field(Decimal("0.00"))

        @field_validator("expense", "total", "income", mode="before")
        def round_decimal(cls, v):
            if v is not None:
                return round(Decimal(v), 2)
            return v

    amount: Amount = Field(default_factory=Amount)
    count: Count = Field(default_factory=Count)


class ExpenseInsightSchema(ExpenseInsightSchemaBase):
    timeseries: list[ExpenseInsightSchemaBase] = Field(default_factory=list)
    start_date: Date | None = Field(description="Start date of the summary period.")
    end_date: Date | None = Field(description="End date of the summary period.")


class ExpenseTimeSeriesSchema(ExpenseInsightSchemaBase):
    date: Date = Field(description="Date of the expense.")
