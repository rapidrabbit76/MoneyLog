from dataclasses import dataclass
from decimal import Decimal
from typing import TYPE_CHECKING

import sqlalchemy as sa

from monylog.backend.expense.entities import Expense, ExpenseTag
from monylog.backend.expense.services.calculrator import ExpenseGroupSumCalculator
from monylog.shared_kernel.domain.enum import ExpenseType
from monylog.shared_kernel.infra.database.sqla.mixin import SyncSqlaMixIn

from .dtos.schemas import ExpenseTimeSeriesSchema, ExpenseInsightSchema, ExpenseInsightSchemaBase

if TYPE_CHECKING:
    from monylog.backend.auth.dtos.schemas import UserPayloadSchema

    from .dtos.request import ExpenseSummaryQruey
from collections import defaultdict

from monylog.shared_kernel.infra.logging.trace import trace


@dataclass
class InsightUseCase(SyncSqlaMixIn):
    async def calculate_expense_summary(
        self,
        user: "UserPayloadSchema",
        query: "ExpenseSummaryQruey",
    ):
        expenses = self.get_expenses(user, query)
        summary = ExpenseGroupSumCalculator.calculate(expenses=expenses)
        amount = ExpenseInsightSchema.Amount(
            total=summary.total,
            expense=summary.groups.get(ExpenseType.EXPENSE, Decimal("0.00")),
            income=summary.groups.get(ExpenseType.INCOME, Decimal("0.00")),
        )
        count = ExpenseInsightSchema.Count(
            expense=len([e for e in expenses if e.type == ExpenseType.EXPENSE]),
            income=len([e for e in expenses if e.type == ExpenseType.INCOME]),
        )

        dates = defaultdict(list)
        for expense in expenses:
            dates[expense.dt.date()].append(expense)

        timeseries = []
        for date, daily_expenses in dates.items():
            daily_summary = ExpenseGroupSumCalculator.calculate(expenses=daily_expenses)
            timeseries.append(
                ExpenseTimeSeriesSchema(
                    date=date,
                    amount=ExpenseTimeSeriesSchema.Amount(
                        total=daily_summary.total,
                        expense=daily_summary.groups.get(ExpenseType.EXPENSE, Decimal("0.00")),
                        income=daily_summary.groups.get(ExpenseType.INCOME, Decimal("0.00")),
                    ),
                    count=ExpenseTimeSeriesSchema.Count(
                        expense=len([e for e in daily_expenses if e.type == ExpenseType.EXPENSE]),
                        income=len([e for e in daily_expenses if e.type == ExpenseType.INCOME]),
                    ),
                )
            )

        return ExpenseInsightSchema(
            amount=amount,
            count=count,
            timeseries=timeseries,
            start_date=query.start_date,
            end_date=query.end_date,
        )

    @trace("get_expenses")
    def get_expenses(self, user, query, limit: int = 10000) -> list[Expense]:
        with self.db.session() as session:
            stmt = sa.select(Expense).where(Expense.user_id == user.id).limit(limit)
            if not query.is_empty:
                stmt = stmt.where(query.between(Expense.dt))  # type: ignore

            if query.tag:
                stmt = stmt.where(
                    Expense.tags.any(
                        sa.and_(
                            ExpenseTag.user_id == user.id,
                            ExpenseTag.name == query.tag,
                        )
                    )
                )
            expenses: list[Expense] = session.scalars(stmt).all()
            return expenses
