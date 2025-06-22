from dependency_injector.wiring import Provide, inject
from fastapi import APIRouter, Depends, Path, status, Query

from monylog.backend.auth.dtos.schemas import UserPayloadSchema
from monylog.backend.auth.services.jwt import JWTService
from monylog.backend.container import MonyLogContainer
from ..use_case import InsightUseCase
from ..dtos.request import ExpenseSummaryQruey
from ..dtos.response import ExpenseSummaryResponse


router = APIRouter()

get_exponse_use_case = Provide[MonyLogContainer.insights.use_case]


@router.get(
    "/summary",
    status_code=status.HTTP_200_OK,
    response_model=ExpenseSummaryResponse,
)
@inject
async def get_expenses_summary(
    user: UserPayloadSchema = Depends(JWTService.get_current_user),
    use_case: InsightUseCase = Depends(get_exponse_use_case),
    query: ExpenseSummaryQruey = Query(),
):
    """
    기간별(주/월/분기/년) 요약 통계 (총 지출, 총 수입, 순수지, 건수)
    """
    response = await use_case.calculate_expense_summary(user=user, query=query)
    return ExpenseSummaryResponse(
        status=status.HTTP_200_OK,
        data=response,
        message="Expense summary retrieved successfully.",
    )


@router.get(
    "/aggregate-by-tag",
    status_code=status.HTTP_200_OK,
)
@inject
async def get_expenses_aggregate_by_tag(
    user: UserPayloadSchema = Depends(JWTService.get_current_user),
    use_case: InsightUseCase = Depends(get_exponse_use_case),
    # Add query params for filtering as needed
):
    """
    태그별/유형별(지출/수입) 집계 및 비율
    """
    raise NotImplementedError("Aggregate by tag endpoint not implemented yet.")


@router.get(
    "/trend",
    status_code=status.HTTP_200_OK,
)
@inject
async def get_expenses_trend(
    user: UserPayloadSchema = Depends(JWTService.get_current_user),
    use_case: InsightUseCase = Depends(get_exponse_use_case),
    # Add query params for period, tag, type, etc.
):
    """
    태그별/유형별 트렌드(전월/전주 대비 증감률)
    """
    raise NotImplementedError("Trend endpoint not implemented yet.")
