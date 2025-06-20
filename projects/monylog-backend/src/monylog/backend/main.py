from fastapi import FastAPI
from fastapi.staticfiles import StaticFiles
from fastapi.middleware import Middleware
from fastapi.middleware.cors import CORSMiddleware
from fastapi.middleware.gzip import GZipMiddleware

from monylog.backend.container import MonyLogContainer
from monylog.backend.settings import Settings

# from araas.backend.endpoints import router as APIEndpoints
from monylog.backend.endpoint.rest.fastapi import endpoint as APIEndpoints
from monylog.backend.lifespan import lifespan
from monylog.shared_kernel.domain.exception import BaseMsgException
from monylog.shared_kernel.infra.fastapi.exception_handlers.base import custom_exception_handler
from monylog.shared_kernel.infra.fastapi.middlewares.correlation_id import CorrelationIdMiddleware
from monylog.shared_kernel.infra.fastapi.middlewares.session import SessionMiddleware
from monylog.shared_kernel.infra.fastapi.utils.responses import MsgSpecJSONResponse

container = MonyLogContainer()
settings: Settings = container.settings.provided()


def create_app() -> FastAPI:
    middleware = [
        Middleware(CorrelationIdMiddleware),
        Middleware(
            CORSMiddleware,
            allow_origins=settings.cors.allow_origins,
            allow_credentials=settings.cors.allow_credentials,
            allow_methods=settings.cors.allow_methods,
            allow_headers=settings.cors.allow_headers,
        ),
        Middleware(SessionMiddleware, secret_key=settings.session.secret_key),
        Middleware(GZipMiddleware),
    ]

    app = FastAPI(
        title=settings.fastapi.title,
        description=settings.fastapi.description,
        contact=settings.fastapi.contact,
        summary=settings.fastapi.summary,
        middleware=middleware,
        lifespan=lifespan,
        docs_url=settings.fastapi.docs_url,
        redoc_url=settings.fastapi.redoc_url,
        openapi_url=settings.fastapi.openapi_url,
        default_response_class=MsgSpecJSONResponse,
        exception_handlers={
            BaseMsgException: custom_exception_handler,
        },
    )

    app.container = container  # type: ignore
    app.settings = settings  # type: ignore

    # ENDPOINTs
    app.include_router(APIEndpoints)

    app.mount(
        "/",
        StaticFiles(directory="./web", html=True, follow_symlink=True),
    )
    return app


app = create_app()
