from .schemas import UserReadSchema, OAuthLoginSchema
from monylog.shared_kernel.infra.camel_model import CamelModel, Field
from monylog.shared_kernel.infra.fastapi.dtos.response import ResponseDto


UserResponse = ResponseDto[UserReadSchema]

OAuthLoginResponse = ResponseDto[OAuthLoginSchema]
