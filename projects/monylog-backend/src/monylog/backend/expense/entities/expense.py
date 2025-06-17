from decimal import Decimal
from typing import TYPE_CHECKING, Type
from datetime import datetime
import sqlalchemy as sa
from sqlalchemy import orm
from sqlalchemy.orm import Mapped, mapped_column

from monylog.shared_kernel.domain.enum import ExpenseType
from monylog.shared_kernel.infra.database.sqla import Base
from monylog.shared_kernel.infra.database.sqla.mixin import TimestampMixin

from .tag import ExpenseTag, expense_tag_asociation_table

if TYPE_CHECKING:
    from ..services.calculrator import ExpenseCalculatorOps, ExpenseCalculatorResult


class Expense(Base, TimestampMixin):
    __tablename__ = "monylog_expense"

    id: Mapped[int] = mapped_column(sa.Integer, primary_key=True, autoincrement=True)
    amount: Mapped[Decimal] = mapped_column(
        sa.DECIMAL(2),
        nullable=False,
        default=Decimal("0.00"),
    )
    user_id: Mapped[str] = mapped_column(sa.VARCHAR(32), sa.ForeignKey("monylog_user.id"), nullable=False, index=True)
    type: Mapped[ExpenseType] = mapped_column(sa.Enum("income", "expense", name="money_type"), nullable=False)
    title: Mapped[str] = mapped_column(sa.Text, nullable=False)
    note: Mapped[str] = mapped_column(sa.Text, nullable=True, default=None)
    dt: Mapped[datetime] = mapped_column(sa.TIMESTAMP(timezone=True), nullable=False, default=sa.func.now())
    data: Mapped[dict] = mapped_column("data", sa.JSON, nullable=False, default={})

    # relationships
    tags: Mapped[list[ExpenseTag]] = orm.relationship(
        secondary=expense_tag_asociation_table,
        lazy="selectin",
        back_populates="expenses",
    )

    @property
    def request_id(self) -> str:
        return self.metadata.get("request_id", "")

    @classmethod
    def calculate(
        cls,
        ops: Type["ExpenseCalculatorOps"],
        expenses: list["Expense"],
    ) -> "ExpenseCalculatorResult":
        for expense in expenses:
            if isinstance(expense, cls):
                continue
            raise TypeError(f"Expected Expense instance, got {type(expense)}")
        return ops.calculate(expenses)
