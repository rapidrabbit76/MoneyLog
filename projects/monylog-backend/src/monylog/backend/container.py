import boto3.session
import httpx
from dependency_injector import containers, providers

from monylog.backend.auth.containers.di import AuthContainer
from monylog.backend.expense.containers.di import ExpenseContainer
from monylog.backend.insights.containers.di import InsightsContainer
from monylog.backend.llm.containers.di import LLMContainer
from monylog.backend.settings import Settings
from monylog.shared_kernel.infra.database.sqla.container.di import SqlaContainer


def http_client(retries: int = 3):
    transports = httpx.AsyncHTTPTransport(retries=retries)
    client = httpx.AsyncClient(transport=transports)
    return client


class MonyLogContainer(containers.DeclarativeContainer):
    wiring_config = containers.WiringConfiguration(
        packages=[],
        modules=[
            "monylog.shared_kernel.infra.object_storage.s3",
            "monylog.shared_kernel.infra.database.sqla.mixin",
            "monylog.backend.expense.rest.fastapi",
            "monylog.backend.llm.rest.fastapi",
            "monylog.backend.auth.rest.fastapi",
            "monylog.backend.insights.rest.fastapi",
        ],
    )

    settings = providers.Resource(Settings)  # type: ignore
    boto_session = providers.Resource(boto3.session.Session, region_name="ap-northeast-2")
    s3_client = providers.Resource(
        providers.MethodCaller(boto_session.provided.client),
        service_name="s3",
    )
    sns_client = providers.Resource(
        providers.MethodCaller(boto_session.provided.client),
        service_name="sns",
    )
    database = providers.Container(SqlaContainer, settings=settings.provided.db)
    expense = providers.Container(ExpenseContainer, settings=settings)
    llm = providers.Container(LLMContainer, settings=settings)
    auth = providers.Container(AuthContainer, settings=settings)
    insights = providers.Container(
        InsightsContainer,
        settings=settings,
    )

    async_http_client = providers.Singleton(http_client)
