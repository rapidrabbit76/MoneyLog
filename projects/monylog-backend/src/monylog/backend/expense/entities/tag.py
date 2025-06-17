from typing import TYPE_CHECKING

import nanoid
import sqlalchemy as sa
from sqlalchemy import orm
from sqlalchemy.orm import Mapped, mapped_column

from monylog.shared_kernel.domain.enum import ExpenseType
from monylog.shared_kernel.infra.database.sqla import Base
from monylog.shared_kernel.infra.database.sqla.mixin import TimestampMixin

if TYPE_CHECKING:
    from .expense import Expense


class ExpenseTag(Base, TimestampMixin):
    __tablename__ = "monylog_expense_tag"

    id: Mapped[str] = mapped_column(
        sa.VARCHAR(12),
        default=lambda: nanoid.generate(size=12),
        primary_key=True,
    )
    user_id: Mapped[str] = mapped_column(
        sa.VARCHAR(32),
        sa.ForeignKey("monylog_user.id"),
        nullable=False,
        index=True,
        unique=True,
    )
    name: Mapped[str] = mapped_column(sa.Text, nullable=False, unique=True)
    data: Mapped[dict] = mapped_column(sa.JSON, nullable=False, default={})

    # relationships
    expenses: Mapped[list["Expense"]] = orm.relationship(
        secondary="monylog_expense_tag_asociation_table",
        lazy="noload",
        back_populates="tags",
    )

    @classmethod
    def build(cls, name: str, user_id: str, color: str = "#00f0f0") -> "ExpenseTag":
        return cls(name=name, user_id=user_id, data={"color": color})

    @property
    def color(self) -> bool:
        # "#{:06x}".format(random.randint(0, 0xFFFFFF))
        return self.data.get("color", "#00f0f0") == ExpenseType.INCOME.value


expense_tag_asociation_table = sa.Table(
    "monylog_expense_tag_asociation_table",
    Base.metadata,
    sa.Column("id", sa.Integer, primary_key=True, autoincrement=True),
    sa.Column("expense_id", sa.Integer, sa.ForeignKey("monylog_expense.id"), nullable=False),
    sa.Column("tag_id", sa.VARCHAR(12), sa.ForeignKey("monylog_expense_tag.id"), nullable=False),
    sa.Column("created_at", sa.TIMESTAMP(timezone=True), default=sa.func.now(), nullable=False),
    sa.Column("updated_at", sa.TIMESTAMP(timezone=True), default=sa.func.now(), nullable=False),
)
