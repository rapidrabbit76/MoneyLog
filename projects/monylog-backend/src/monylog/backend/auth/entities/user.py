import nanoid
import sqlalchemy as sa
from sqlalchemy import orm
from sqlalchemy.orm import Mapped, mapped_column

from monylog.shared_kernel.infra.database.sqla import Base
from monylog.shared_kernel.infra.database.sqla.mixin import TimestampMixin
from typing import Optional
from ..services.password_helper import PasswordHelper


class User(Base, TimestampMixin):
    __tablename__ = "monylog_user"

    id: Mapped[str] = mapped_column(sa.VARCHAR(32), default=lambda: nanoid.generate(size=32), primary_key=True)
    email: Mapped[str] = mapped_column(sa.VARCHAR(300), nullable=False, unique=True)
    hashed_password: Mapped[str] = mapped_column(sa.Text, nullable=False)
    nickname: Mapped[str] = mapped_column(sa.VARCHAR(100), nullable=False, unique=True)
    thumbnail: Mapped[Optional[str]] = mapped_column(sa.Text, nullable=True, default=None)

    is_active: Mapped[bool] = mapped_column(sa.Boolean, default=True, nullable=False)
    is_verified: Mapped[bool] = mapped_column(sa.Boolean, default=False, nullable=False)
    is_superuser: Mapped[bool] = mapped_column(sa.Boolean, default=False, nullable=False)

    login_histories: Mapped[list["UserLoginHistory"]] = orm.relationship(
        "UserLoginHistory",
        lazy="selectin",
        back_populates="user",
        uselist=True,
    )

    def update_thumbnail(self, image: str) -> None:
        self.thumbnail = image

    @classmethod
    def build(
        cls,
        email: str,
        password: str,
        nickname: str | None = None,
        thumbnail: str | None = None,
    ) -> "User":
        hashed_password = PasswordHelper.password_hash(password)
        return cls(email=email, hashed_password=hashed_password, nickname=nickname or email, thumbnail=thumbnail)

    def check_password(self, password: str) -> bool:
        return PasswordHelper.password_verify(password, self.hashed_password)


class UserLoginHistory(Base):
    __tablename__ = "monylog_user_login_history"

    id: Mapped[int] = mapped_column(sa.Integer, primary_key=True, autoincrement=True)
    user_id: Mapped[str] = mapped_column(sa.VARCHAR(32), sa.ForeignKey("monylog_user.id"), nullable=False)
    login_time: Mapped[sa.TIMESTAMP] = mapped_column(
        sa.TIMESTAMP(timezone=True),
        default=sa.func.now(),
        nullable=False,
    )

    user: Mapped[User] = orm.relationship(
        User,
        lazy="selectin",
        back_populates="login_histories",
    )
