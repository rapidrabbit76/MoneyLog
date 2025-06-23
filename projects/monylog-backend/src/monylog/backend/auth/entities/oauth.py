from authlib.integrations.sqla_oauth2.tokens_mixins import OAuth2TokenMixin
import sqlalchemy as sa
from sqlalchemy import orm
from sqlalchemy.orm import Mapped, mapped_column

from monylog.shared_kernel.infra.database.sqla import Base
from monylog.shared_kernel.infra.database.sqla.mixin import TimestampMixin
from typing import Optional
from typing import TYPE_CHECKING

if TYPE_CHECKING:
    from .user import User


class OAuth2Account(Base, TimestampMixin):
    __tablename__ = "monylog_oauth_account_token"
    id: Mapped[int] = mapped_column(sa.Integer, primary_key=True, autoincrement=True)
    oauth_name: Mapped[str] = mapped_column(sa.String(length=100), index=True, nullable=False)
    access_token: Mapped[str] = mapped_column(sa.String(length=1024), nullable=False)
    expires_at: Mapped[Optional[int]] = mapped_column(sa.Integer, nullable=True)
    refresh_token: Mapped[Optional[str]] = mapped_column(sa.String(length=1024), nullable=True)
    account_id: Mapped[str] = mapped_column(sa.String(length=320), index=True, nullable=False)
    account_email: Mapped[str] = mapped_column(sa.String(length=320), nullable=False)

    @orm.declared_attr
    def user_id(cls) -> Mapped[str]:
        return mapped_column(
            sa.String(32),
            sa.ForeignKey("monylog_user.id", ondelete="cascade"),
            nullable=False,
        )

    @classmethod
    def build(
        cls,
        oauth_name: str,
        access_token: str,
        expires_at: Optional[int] = None,
        refresh_token: Optional[str] = None,
        account_id: str = "",
        account_email: str = "",
        user_id: Optional[str] = None,
    ) -> "OAuth2Account":
        """Builds a new OAuth2Account instance."""
        return cls(
            oauth_name=oauth_name,
            access_token=access_token,
            expires_at=expires_at,
            refresh_token=refresh_token,
            account_id=account_id,
            account_email=account_email,
            user_id=user_id,
        )

    # user: Mapped["User"] = orm.relationship(
    #     "User",
    #     lazy="selectin",
    #     back_populates="oauth2_tokens",
    #     uselist=False,
    # )
