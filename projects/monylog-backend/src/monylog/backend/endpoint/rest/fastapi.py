from fastapi import APIRouter

from monylog.backend.auth.rest.fastapi import router as auth_router
from monylog.backend.expense.rest.fastapi import router as expense_router
from monylog.backend.llm.rest.fastapi import router as llm_router

endpoint = APIRouter(prefix="/api/v1")
endpoint.include_router(auth_router, prefix="/auth", tags=["auth"])
endpoint.include_router(expense_router, prefix="/expenses", tags=["expenses"])
endpoint.include_router(llm_router, prefix="/llm", tags=["llm"])
