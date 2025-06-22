from datetime import datetime, date as Date
from decimal import Decimal
from monylog.shared_kernel.infra.camel_model import CamelModel, Field
from pydantic import field_validator


class ExpenseTimeSeriesSchema(CamelModel):
    date: Date = Field(description="Date of the expense.")
    total: Decimal = Field(description="Total amount of expenses and incomes for the date.")
    expense: Decimal = Field(description="Total amount of expenses for the date.")
    income: Decimal = Field(description="Total amount of incomes for the date.")

    @field_validator("total", "expense", "income", mode="before")
    def round_decimal(cls, v):
        if v is not None:
            return round(Decimal(v), 2)
        return v


class ExpenseSummarySchema(CamelModel):
    total: Decimal = Field(description="Total amount of all expenses and incomes in the specified period.")
    expense: Decimal = Field(description="Total amount of expenses in the specified period.")
    income: Decimal = Field(description="Total amount of incomes in the specified period.")
    count: int = Field(description="Total number of expenses and incomes in the specified period.")
    timeseries: list[ExpenseTimeSeriesSchema] = Field(default_factory=list)

    start_date: Date | None = Field(description="Start date of the summary period.")
    end_date: Date | None = Field(description="End date of the summary period.")

    @field_validator("expense", "total", "income", mode="before")
    def round_decimal(cls, v):
        if v is not None:
            return round(Decimal(v), 2)
        return v
