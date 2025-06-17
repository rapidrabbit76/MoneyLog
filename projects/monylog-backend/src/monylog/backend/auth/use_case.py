from dataclasses import dataclass
from typing import TYPE_CHECKING
import sqlalchemy as sa


from monylog.shared_kernel.infra.database.sqla.mixin import SyncSqlaMixIn

from .entities import User
from . import exceptions

if TYPE_CHECKING:
    from .dtos.request import UserRegisterRequest, UserLoginRequest


@dataclass
class AuthUseCase(SyncSqlaMixIn):
    def register(self, user_data: "UserRegisterRequest") -> User:
        user = User.build(
            email=user_data.email,
            password=user_data.password,
            nickname=user_data.email.split("@")[0],
        )
        with self.db.session() as session:
            stmt = sa.select(User.id).where(User.email == user_data.email)
            existing_user = session.execute(stmt).scalar_one_or_none()
            if existing_user:
                raise exceptions.UserAlreadyExistsException()
            session.add(user)
            session.commit()
            session.refresh(user)
        return user

    def login(self, user_data: "UserLoginRequest") -> User:
        with self.db.session() as session:
            stmt = sa.select(User).where(User.email == user_data.email)
            user = session.execute(stmt).scalar_one_or_none()
        if not user:
            raise exceptions.UserCredentialsInvalidException
        if not user.check_password(user_data.password):
            raise exceptions.UserCredentialsInvalidException
        if not user.is_active:
            raise exceptions.UserInactiveException()
        return user

    def get_user_by_id(self, user_id: str) -> User:
        with self.db.session() as session:
            stmt = sa.select(User).where(User.id == user_id)
            user = session.execute(stmt).scalar_one_or_none()
        if not user:
            raise exceptions.UserCredentialsInvalidException
        return user
