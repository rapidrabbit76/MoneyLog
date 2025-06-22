from dependency_injector import containers, providers

from monylog.backend.settings import Settings

from ..use_case import InsightUseCase


class InsightsContainer(containers.DeclarativeContainer):
    settings = providers.Dependency(Settings)
    use_case = providers.Singleton(InsightUseCase)
