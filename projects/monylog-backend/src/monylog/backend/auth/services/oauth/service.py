from dataclasses import dataclass, field

import sqlalchemy as sa
from authlib.integrations.starlette_client import OAuth

from monylog.shared_kernel.infra.database.sqla.mixin import SyncSqlaMixIn

from ...entities import OAuth2Account, User, UserLoginHistory
from .client import OAuthClient


@dataclass(kw_only=True, slots=True)
class OauthService(SyncSqlaMixIn):
    """Service for managing OAuth operations."""

    client: OAuthClient = field(init=True, repr=False)

    async def oauth_callback(
        self,
        provider: str,
        token: dict,
    ):
        client = self.client.client.create_client(provider)

        if provider == "google":
            profile_res = await client.get(
                "https://people.googleapis.com/v1/people/me",
                params={"personFields": "emailAddresses"},
                token=token,
            )  # type: ignore
            profile = profile_res.json()
            user_info = token["userinfo"]
            account_id = profile["resourceName"]
            account_email = next(email["value"] for email in profile["emailAddresses"] if email["metadata"]["primary"])
            nickname = user_info.get("name", None)
            thumbnail = user_info.get("picture", None)

        elif provider == "github":
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

        oauth_account_dict = {
            "oauth_name": provider,
            "access_token": token["access_token"],
            "expires_at": token.get("expires_at"),
            "refresh_token": token.get("refresh_token"),
            "account_id": account_id,
            "account_email": account_email,
        }
        user = await self.get_by_oauth_account(provider, account_id)

        if user:
            return user

        if user is None:
            user = await self.get_by_oauth_email(account_email)

        if user is None:
            # If user does not exist, create a new user
            user = await self.create_user_from_oauth(
                account_email,
                oauth_account_dict,
                nickname=nickname,
                thumbnail=thumbnail,
            )
            return user

        if user.oauth_accounts:
            # If user exists, check if the OAuth account already exists
            await self.update_oauth_account(user, oauth_account_dict)
            return user

        if len(user.oauth_accounts) == 0:
            # If user exists, append the new OAuth account
            model = OAuth2Account.build(**oauth_account_dict, user_id=user.id)
            await self.add_oauth_account(user, model)
            return user
        return user

    async def create_user_from_oauth(
        self,
        email: str,
        oauth_account_dict: dict,
        nickname: str | None = None,
        thumbnail: str | None = None,
    ) -> User:
        with self.db.session() as session:
            user = User.build(
                email=email,
                password=User.generate_password(),
                nickname=email.split("@")[0] if nickname is None else nickname,
                thumbnail=thumbnail,
            )
            user.oauth_accounts.append(OAuth2Account.build(**oauth_account_dict))
            session.add(user)
            session.commit()
            session.refresh(user)
        return user

    async def update_oauth_account(
        self,
        user: User,
        oauth_account_dict: dict,
    ):
        oauth_name = oauth_account_dict.get("oauth_name")
        account_id = oauth_account_dict.get("account_id")
        with self.db.session() as session:
            for oauth_account in user.oauth_accounts:
                # If the OAuth account already exists, update it
                if oauth_account.oauth_name == oauth_name and oauth_account.account_id == account_id:
                    for key, value in oauth_account_dict.items():
                        setattr(oauth_account, key, value)
                    session.add(oauth_account)
            session.commit()

    async def get_by_oauth_account(
        self,
        provider: str,
        account_id: str,
    ) -> User | None:
        with self.db.session() as session:
            stmt = (
                sa.select(User)
                .join(User.oauth_accounts)
                .where(OAuth2Account.oauth_name == provider, OAuth2Account.account_id == account_id)
            )
            user = session.execute(stmt).unique().scalar_one_or_none()
        return user

    async def get_by_oauth_email(self, email: str) -> User | None:
        with self.db.session() as session:
            stmt = sa.select(User).where(User.email == email, User.is_active.is_(True))
            user = session.execute(stmt).unique().scalar_one_or_none()
        return user

    async def add_oauth_account(
        self,
        user: User,
        oauth_account: OAuth2Account,
    ) -> OAuth2Account:
        """Add an OAuth account to a user."""
        with self.db.session() as session:
            oauth_account.user_id = user.id
            session.add(oauth_account)
            session.commit()
        return oauth_account

    async def on_after_login(
        self,
        user: User,
    ) -> None:
        """Handle actions after a user logs in."""
        with self.db.session() as session:
            login_history = UserLoginHistory.build(user_id=user.id)
            session.add(login_history)
            session.commit()
