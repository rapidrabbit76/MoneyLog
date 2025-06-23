from dataclasses import dataclass


@dataclass
class OAuthProviderProfile:
    account_id: str
    account_email: str
    nickname: str | None = None
    thumbnail: str | None = None
