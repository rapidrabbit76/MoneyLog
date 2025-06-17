from dataclasses import dataclass
from datetime import datetime, timedelta
from typing import Optional

import jwt
from fastapi import Depends
from fastapi.security import APIKeyCookie
from pydantic import BaseModel

from monylog.backend.settings import get_settings

from .. import exceptions
from ..dtos.schemas import UserPayloadSchema

settings = get_settings().jwt


@dataclass(init=True, repr=True, eq=True, frozen=True)
class JWTService:
    class Payload(BaseModel):
        sub: str
        user: UserPayloadSchema
        type: str | None = None
        exp: datetime

    access_cookie_scheme = APIKeyCookie(name="x-monylog-access-token")
    refresh_cookie_scheme = APIKeyCookie(name="x-monylog-refresh-token")

    @classmethod
    def create_access_token(
        cls,
        payload: dict,
        expires_delta: Optional[timedelta] = None,
    ):
        to_encode = payload.copy()
        expire = datetime.utcnow() + (expires_delta or timedelta(seconds=settings.access_token_exp))
        to_encode.update({"exp": expire})
        cls.Payload.model_validate(to_encode)
        encoded_jwt = jwt.encode(to_encode, settings.secret_key, algorithm=settings.algorithm)
        return encoded_jwt

    @classmethod
    def create_refresh_token(
        cls,
        payload: dict,
        expires_delta: Optional[timedelta] = None,
    ):
        to_encode = payload.copy()
        expire = datetime.utcnow() + (expires_delta or timedelta(seconds=settings.refresh_token_exp))
        to_encode.update({"exp": expire, "type": "refresh"})
        cls.Payload.model_validate(to_encode)
        encoded_jwt = jwt.encode(to_encode, settings.secret_key, algorithm=settings.algorithm)
        return encoded_jwt

    @classmethod
    def verify_token(cls, token: str) -> Payload:
        try:
            payload = jwt.decode(token, settings.secret_key, algorithms=[settings.algorithm])
        except jwt.ExpiredSignatureError:
            raise exceptions.AuthTokenExpiredException()
        except jwt.InvalidTokenError:
            raise exceptions.AuthTokenInvalidException()
        return cls.Payload.model_validate(payload)

    @classmethod
    def refresh_access_token(
        cls,
        refresh_token: Optional[str] = Depends(refresh_cookie_scheme),
    ) -> str:
        if not refresh_token:
            raise exceptions.AuthTokenInvalidException()
        payload = cls.verify_token(refresh_token)
        if payload.type != "refresh":
            raise exceptions.AuthTokenInvalidException()
        new_access_token = cls.create_access_token({"sub": payload.sub, "user": payload.user.model_dump()})
        return new_access_token

    @classmethod
    def get_current_user(
        cls,
        token: Optional[str] = Depends(access_cookie_scheme),
    ) -> UserPayloadSchema:
        if not token:
            raise exceptions.AuthTokenInvalidException()
        payload = cls.verify_token(token)
        return UserPayloadSchema.model_validate(payload.user)
