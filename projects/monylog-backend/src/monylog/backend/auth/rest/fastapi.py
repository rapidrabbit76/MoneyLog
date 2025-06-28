from typing import Optional

import jmespath
from authlib.integrations.base_client import OAuthError
from dependency_injector.wiring import Provide, inject
from fastapi import APIRouter, Body, Depends, Form, Path, Request, Response, status

from monylog.backend.auth.dtos.schemas import UserPayloadSchema
from monylog.backend.auth.services.jwt import JWTService
from monylog.backend.container import MonyLogContainer
from monylog.backend.settings import get_settings

from .. import exceptions
from ..dtos.request import UserLoginRequest, UserRegisterRequest
from ..dtos.response import UserReadSchema, UserResponse
from ..services.oauth import OAuthClient, OauthProviderBase, OauthService
from ..use_case import AuthUseCase

settings = get_settings()
router = APIRouter()
oauth_router = APIRouter()
get_auth_use_case = Provide[MonyLogContainer.auth.use_case]
get_oauth_client = Provide[MonyLogContainer.auth.oauth_client]
get_oauth_service = Provide[MonyLogContainer.auth.oauth_service]
get_oauth_providers = Provide[MonyLogContainer.auth.oauth_providers]


@oauth_router.get(
    "/login/{provider}",
    status_code=status.HTTP_200_OK,
)
@inject
async def oauth_login(
    request: Request,
    oauth: OAuthClient = Depends(get_oauth_client),
    provider: str = Path(
        ...,
        description="OAuth provider name (e.g., 'google', 'github')",
    ),
):
    redirect_uri = f"{request.url.scheme}://{request.url.netloc}/api/v1/oauth/login/{provider}/callback"
    client = oauth.client.create_client(provider)
    result = await client.authorize_redirect(request, redirect_uri)  # type: ignore
    return result


@oauth_router.get(
    "/login/{provider}/callback",
)
@inject
async def oauth_callback(
    request: Request,
    response: Response,
    oauth: OAuthClient = Depends(get_oauth_client),
    service: OauthService = Depends(get_oauth_service),
    providers: dict[str, OauthProviderBase] = Depends(get_oauth_providers),
    provider: str = Path(
        ...,
        description="OAuth provider name (e.g., 'google', 'github')",
    ),
):
    client = oauth.client.create_client(provider)

    try:
        token = await client.authorize_access_token(request)  # type: ignore
    except OAuthError as e:
        ex = exceptions.AuthTokenInvalidException()
        ex.message = f"OAuth error: {e.error} - {e.description}"
        raise ex
    user = await service.oauth_callback(providers[provider], token)
    await service.on_after_login(user)

    # Set cookies for access and refresh tokens
    response.set_cookie(
        key=JWTService.access_cookie_scheme.model.name,
        value=JWTService.create_access_token({"sub": user.email, "user": {"id": user.id, "email": user.email}}),
        httponly=True,
        secure=False,
        samesite="lax",
    )
    response.set_cookie(
        key=JWTService.refresh_cookie_scheme.model.name,
        value=JWTService.create_refresh_token({"sub": user.email, "user": {"id": user.id, "email": user.email}}),
        httponly=True,
        secure=False,
        samesite="lax",
    )


@router.post(
    "/register",
    status_code=status.HTTP_201_CREATED,
)
@inject
async def register(
    response: Response,
    user_data: UserRegisterRequest = Form(...),
    use_case: AuthUseCase = Depends(get_auth_use_case),
):
    user = use_case.register(user_data)
    response.set_cookie(
        key=JWTService.access_cookie_scheme.model.name,
        value=JWTService.create_access_token({"sub": user.email, "user": {"id": user.id, "email": user.email}}),
        httponly=True,
        secure=False,
        samesite="lax",
    )
    response.set_cookie(
        key=JWTService.refresh_cookie_scheme.model.name,
        value=JWTService.create_refresh_token({"sub": user.email, "user": {"id": user.id, "email": user.email}}),
        httponly=True,
        secure=False,
        samesite="lax",
    )


@router.post(
    "/login",
)
@inject
async def login(
    response: Response,
    user_data: UserLoginRequest = Form(...),
    use_case: AuthUseCase = Depends(get_auth_use_case),
):
    user = use_case.login(user_data)

    response.set_cookie(
        key=JWTService.access_cookie_scheme.model.name,
        value=JWTService.create_access_token(
            {
                "sub": user.email,
                "user": {"id": user.id, "email": user.email},
            },
        ),
        httponly=True,
        secure=False,
        samesite="lax",
    )
    response.set_cookie(
        key=JWTService.refresh_cookie_scheme.model.name,
        value=JWTService.create_refresh_token(
            {
                "sub": user.email,
                "user": {"id": user.id, "email": user.email},
            }
        ),
        httponly=True,
        secure=False,
        samesite="lax",
    )


@router.post("/logout")
@inject
async def logout(response: Response):
    response.delete_cookie(
        key=JWTService.access_cookie_scheme.model.name,
        httponly=True,
        secure=False,
        samesite="lax",
    )
    response.delete_cookie(
        key=JWTService.refresh_cookie_scheme.model.name,
        httponly=True,
        secure=False,
        samesite="lax",
    )


@router.get(
    "/me",
    response_model=UserResponse,
    status_code=status.HTTP_200_OK,
)
@inject
async def get_current_user_info(
    user: UserPayloadSchema = Depends(JWTService.get_current_user),
    use_case: AuthUseCase = Depends(get_auth_use_case),
):
    user = use_case.get_user_by_id(user.id)
    if not user.is_active:
        raise exceptions.UserInactiveException()
    return UserResponse(
        data=UserReadSchema.model_validate(user),
        message="User information retrieved successfully",
        status=status.HTTP_200_OK,
    )


@router.post(
    "/refresh",
)
@inject
async def refresh_token(
    response: Response,
    refresh_token: Optional[str] = Depends(JWTService.refresh_cookie_scheme),
):
    if not refresh_token:
        raise exceptions.AuthTokenInvalidException()
    response.set_cookie(
        key=JWTService.access_cookie_scheme.model.name,
        value=JWTService.refresh_access_token(refresh_token),
        httponly=True,
        secure=False,
        samesite="lax",
    )
    payload = JWTService.verify_token(refresh_token)
    response.set_cookie(
        key=JWTService.refresh_cookie_scheme.model.name,
        value=JWTService.create_access_token({"sub": payload.sub, "user": payload.user.model_dump()}),
        httponly=True,
        secure=False,
        samesite="lax",
    )


@router.post(
    "/forgot-password",
)
@inject
async def forgot_password(email: str = Body(...)):
    pass


@router.post(
    "/reset-password",
)
@inject
async def reset_password(token: str = Body(...), new_password: str = Body(...)):
    pass
