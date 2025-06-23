from dependency_injector import containers, providers

from monylog.backend.settings import Settings

from ..use_case import AuthUseCase
from ..services.oauth import OAuthClient, OauthService, OAuthProviders


class AuthContainer(containers.DeclarativeContainer):
    settings = providers.Dependency(Settings)
    use_case = providers.Singleton(AuthUseCase)
    oauth_client = providers.Singleton(OAuthClient, settings=settings)
    oauth_service = providers.Singleton(OauthService, client=oauth_client)
    oauth_providers = providers.Dict(
        {
            "google": providers.Singleton(OAuthProviders.GoogleOauthProvider, name="google"),
            "github": providers.Singleton(OAuthProviders.GithubOauthProvider, name="github"),
        },
    )
