from pydantic import model_validator
from .schemas import UserLoginSchmema, UserRegisterSchema


class UserLoginRequest(UserLoginSchmema):
    @model_validator(mode="before")
    def validate_email(cls, values):
        email = values.get("email")
        if not email or "@" not in email:
            raise ValueError("Invalid email format")
        return values


class UserRegisterRequest(UserRegisterSchema):
    @model_validator(mode="before")
    def validate_email(cls, values):
        email = values.get("email")
        if not email or "@" not in email:
            raise ValueError("Invalid email format")
        return values

    @model_validator(mode="before")
    def validate_password(cls, values):
        password = values.get("password")
        if not password or len(password) < 8:
            raise ValueError("Password must be at least 8 characters long")
        return values
