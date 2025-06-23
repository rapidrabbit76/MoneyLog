from pydantic_settings import BaseSettings, SettingsConfigDict

from monylog.shared_kernel.domain.enum import ApplicationMode
from monylog.shared_kernel.infra.settings.model import (
    SessionSettings,
    CacheSettings,
    CookieSettings,
    CORSSettings,
    EmailSettings,
    FastAPISettings,
    GZipSettings,
    JWTSettings,
    LoggerSettings,
    OAuthSettings,
    ObjectStorageSettings,
    RatelimiterSettings,
)
from monylog.shared_kernel.infra.database.sqla.settings import DatabaseSettings
from monylog.backend.llm.service.v1 import LangchainLLMExpenseAnalyzerConfig
from functools import lru_cache


class Settings(BaseSettings):
    mode: ApplicationMode = ApplicationMode.devel
    db: DatabaseSettings = DatabaseSettings()
    cors: CORSSettings = CORSSettings()
    gzip: GZipSettings = GZipSettings()
    logger: LoggerSettings = LoggerSettings()
    jwt: JWTSettings = JWTSettings()
    email: EmailSettings = EmailSettings()
    oauth_google: OAuthSettings = OAuthSettings()
    oauth_github: OAuthSettings = OAuthSettings()
    rate_limiter: RatelimiterSettings = RatelimiterSettings()
    object_storege: ObjectStorageSettings = ObjectStorageSettings()
    cache: CacheSettings = CacheSettings()
    cookie_organization: CookieSettings = CookieSettings()
    cookie_auth: CookieSettings = CookieSettings()
    fastapi: FastAPISettings = FastAPISettings(
        title="MonyLog API",
        description="MonyLog API",
        docs_url="/docs/openapi",
        openapi_url="/docs/openapi.json",
        redoc_url="/redoc",
    )
    expense_analyzer: LangchainLLMExpenseAnalyzerConfig = LangchainLLMExpenseAnalyzerConfig()
    session: SessionSettings = SessionSettings()

    model_config = SettingsConfigDict(
        env_prefix="MONYLOG_", env_nested_delimiter="__", env_file_encoding="utf-8", extra="allow"
    )


Settings.model_rebuild()


@lru_cache(maxsize=1)
def get_settings() -> Settings:
    return Settings()
