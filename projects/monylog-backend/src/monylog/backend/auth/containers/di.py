from dependency_injector import containers, providers

from monylog.backend.settings import Settings

from ..use_case import AuthUseCase


class AuthContainer(containers.DeclarativeContainer):
    settings = providers.Resource(Settings)
    use_case = providers.Singleton(AuthUseCase)
