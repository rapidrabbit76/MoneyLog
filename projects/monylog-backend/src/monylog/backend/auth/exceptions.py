from monylog.shared_kernel.infra.fastapi.exception_handlers.base import BaseMsgException


class AuthException(BaseMsgException):
    error: str = ""
    message: str = ""
    code: int = 401


class AuthTokenExpiredException(AuthException):
    error: str = "AUTH_TOKEN_EXPIRED"
    message: str = "인증 토큰이 만료되었습니다."
    code: int = 401


class AuthTokenInvalidException(AuthException):
    error: str = "AUTH_TOKEN_INVALID"
    message: str = "유효하지 않은 인증 토큰입니다."
    code: int = 401


class UserCredentialsInvalidException(AuthException):
    error: str = "USER_CREDENTIALS_INVALID"
    message: str = "사용자 인증 정보가 유효하지 않습니다."
    code: int = 401


class UserAlreadyExistsException(AuthException):
    error: str = "USER_ALREADY_EXISTS"
    message: str = "이미 존재하는 사용자입니다."
    code: int = 409


class UserInactiveException(AuthException):
    error: str = "USER_INACTIVE"
    message: str = "사용자가 비활성화 상태입니다."
    code: int = 403


class UserNotVerifiedException(AuthException):
    error: str = "USER_NOT_VERIFIED"
    message: str = "사용자가 인증되지 않았습니다."
    code: int = 403
