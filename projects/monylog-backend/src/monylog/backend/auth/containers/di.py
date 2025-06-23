from dependency_injector import containers, providers

from monylog.backend.settings import Settings

from ..use_case import AuthUseCase
from ..services.oauth import OAuthClient, OauthService


class AuthContainer(containers.DeclarativeContainer):
    settings = providers.Dependency(Settings)
    use_case = providers.Singleton(AuthUseCase)
    oauth_client = providers.Singleton(OAuthClient, settings=settings)
    oauth_service = providers.Singleton(OauthService, client=oauth_client)
