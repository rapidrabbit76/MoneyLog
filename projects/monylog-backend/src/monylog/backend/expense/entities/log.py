import sqlalchemy as sa
from sqlalchemy.orm import Mapped, mapped_column

from monylog.shared_kernel.infra.database.sqla import Base
from monylog.shared_kernel.infra.database.sqla.mixin import TimestampMixin


class ExpenseLog(Base, TimestampMixin):
    __tablename__ = "monylog_expense_log"

    id: Mapped[int] = mapped_column(sa.Integer, primary_key=True, autoincrement=True)
    user_id: Mapped[str] = mapped_column(
        sa.VARCHAR(32),
        sa.ForeignKey("monylog_user.id"),
        nullable=False,
        index=True,
    )
    request_id: Mapped[str] = mapped_column(sa.String(100), unique=True, nullable=False)
    data: Mapped[dict] = mapped_column(sa.JSON, nullable=False)
