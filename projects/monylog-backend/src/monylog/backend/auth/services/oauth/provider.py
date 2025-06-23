from dataclasses import dataclass, field
from abc import ABC
from .types import OAuthProviderProfile


@dataclass(frozen=True, kw_only=True, slots=True)
class OauthProviderBase(ABC):
    name: str = field(default="", repr=True)

    async def fetch_profile(self, client, token: dict) -> OAuthProviderProfile:
        raise NotImplementedError("Subclasses must implement the profile property.")


class GoogleOauthProvider(OauthProviderBase):
    name: str = field(default="google", repr=True)

    async def fetch_profile(self, client, token: dict) -> OAuthProviderProfile:
        profile_res = await client.get(  # type: ignore
            "https://people.googleapis.com/v1/people/me",
            params={"personFields": "emailAddresses"},
            token=token,
        )  # type: ignore
        profile = profile_res.json()
        account_id = profile["resourceName"]
        account_email = next(email["value"] for email in profile["emailAddresses"] if email["metadata"]["primary"])
        user_info = token["userinfo"]
        nickname = user_info.get("name", None)
        thumbnail = user_info.get("picture", None)
        return OAuthProviderProfile(
            account_id=account_id,
            account_email=account_email,
            nickname=nickname,
            thumbnail=thumbnail,
        )


class GithubOauthProvider(OauthProviderBase):
    name: str = field(default="github", repr=True)

    async def fetch_profile(self, client, token: dict) -> OAuthProviderProfile:
        profile_res = await client.get("user", token=token)  # type: ignore
        profile = profile_res.json()
        account_id = profile["id"]
        account_email = profile.get("email")
        nickname = profile.get("name", profile.get("login", None))
        thumbnail = profile.get("avatar_url", None)

        if not account_email:
            email_res = await client.get("user/emails", token=token)  # type: ignore
            emails = email_res.json()
            account_email = next((e["email"] for e in emails if e.get("primary")), emails[0]["email"])

        return OAuthProviderProfile(
            account_id=account_id,
            account_email=account_email,
            nickname=nickname,
            thumbnail=thumbnail,
        )
