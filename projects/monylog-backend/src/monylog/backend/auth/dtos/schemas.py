from monylog.shared_kernel.infra.camel_model import CamelModel, Field


class UserLoginSchmema(CamelModel):
    email: str = Field(..., description="User's email address")
    password: str = Field(..., description="User's password")


class UserRegisterSchema(CamelModel):
    email: str = Field(..., description="User's email address")
    password: str = Field(..., description="User's password")


class UserReadSchema(CamelModel):
    id: str = Field(..., description="User's unique identifier")
    email: str = Field(..., description="User's email address")
    nickname: str = Field(..., description="User's nickname")
    thumbnail: str | None = Field(None, description="User's profile thumbnail image URL")


class UserPayloadSchema(CamelModel):
    id: str = Field(..., description="User's unique identifier")
    email: str = Field(..., description="User's email address")
