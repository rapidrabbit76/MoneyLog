from authlib.integrations.starlette_client import OAuth
from httpx_oauth.clients.github import GitHubOAuth2
from httpx_oauth.clients.google import GoogleOAuth2
from dataclasses import dataclass, field
from monylog.backend.settings import Settings


@dataclass(frozen=True, kw_only=True, slots=True)
class OAuthClient:
    """Service for managing OAuth clients."""

    settings: Settings = field(init=True, repr=False)
    client: OAuth = field(default_factory=OAuth, init=False)

    # AUTHORIZE_ENDPOINT = "https://accounts.google.com/o/oauth2/v2/auth"
    # ACCESS_TOKEN_ENDPOINT = "https://oauth2.googleapis.com/token"
    # REVOKE_TOKEN_ENDPOINT = "https://accounts.google.com/o/oauth2/revoke"
    # BASE_SCOPES = [
    # "https://www.googleapis.com/auth/userinfo.profile",
    # "https://www.googleapis.com/auth/userinfo.email",
    # ]
    # PROFILE_ENDPOINT = "https://people.googleapis.com/v1/people/me"

    def __post_init__(self):
        self.client.register(
            "google",
            client_id=self.settings.oauth_google.client_id,
            client_secret=self.settings.oauth_google.client_secret,
            # access_token_url="https://oauth2.googleapis.com/token",
            # access_token_params=None,
            # authorize_url="https://accounts.google.com/o/oauth2/v2/auth",
            # authorize_params=None,
            # api_base_url="https://www.googleapis.com/auth",
            # client_kwargs={"scope": "openid email profile"},
            server_metadata_url="https://accounts.google.com/.well-known/openid-configuration",
            client_kwargs={"scope": "openid email profile"},
        )

        self.client.register(
            "github",
            client_id=self.settings.oauth_github.client_id,
            client_secret=self.settings.oauth_github.client_secret,
            access_token_url="https://github.com/login/oauth/access_token",
            access_token_params=None,
            authorize_url="https://github.com/login/oauth/authorize",
            authorize_params=None,
            api_base_url="https://api.github.com/",
            client_kwargs={
                "scope": ["user", "user:email"],
            },
        )
