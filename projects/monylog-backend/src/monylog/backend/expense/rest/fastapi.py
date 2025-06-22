from dependency_injector.wiring import Provide, inject
from fastapi import APIRouter, Body, Depends, Path, Query, status

from monylog.backend.auth.dtos.schemas import UserPayloadSchema
from monylog.backend.auth.services.jwt import JWTService
from monylog.backend.container import MonyLogContainer
from monylog.backend.expense.use_case import ExpenseUseCase
from monylog.shared_kernel.infra.fastapi.dtos.response import PaginationResponse

from ..dtos.request import CreateExpenseRequest, CreateExpenseTagRequest, ExpenseQeuryRequest, SearchExpenseTagRequest
from ..dtos.response import ExpensePagingResponse, ExpenseTagPagingResponse
from ..dtos.schemas import ExpenseTagSchema

router = APIRouter()

get_exponse_use_case = Provide[MonyLogContainer.expense.use_case]


@router.get(
    "/tags",
    response_model=ExpenseTagPagingResponse,
)
@inject
async def get_tags(
    user: UserPayloadSchema = Depends(JWTService.get_current_user),
    use_case: ExpenseUseCase = Depends(get_exponse_use_case),
):
    response = use_case.get_tags(user)
    return ExpenseTagPagingResponse(
        status=status.HTTP_200_OK,
        data=[ExpenseTagSchema.model_validate(tag) for tag in response],
        message="Expense tags retrieved successfully.",
    )


@router.post(
    "/tags",
    status_code=status.HTTP_201_CREATED,
)
@inject
async def create_tags(
    user: UserPayloadSchema = Depends(JWTService.get_current_user),
    use_case: ExpenseUseCase = Depends(get_exponse_use_case),
    payload: CreateExpenseTagRequest = Body(),
):
    use_case.append_tag(name=payload.name, color=payload.data.color, user=user)


@router.delete(
    "/tags",
    status_code=status.HTTP_204_NO_CONTENT,
)
@inject
async def delete_tags(
    *,
    user: UserPayloadSchema = Depends(JWTService.get_current_user),
    use_case: ExpenseUseCase = Depends(get_exponse_use_case),
    query: SearchExpenseTagRequest = Query(),
):
    use_case.delete_tag(id=query.id, name=query.name, user=user)


@router.patch(
    "/tags/{id}",
    status_code=status.HTTP_204_NO_CONTENT,
)
@inject
async def update_tags(
    *,
    user: UserPayloadSchema = Depends(JWTService.get_current_user),
    use_case: ExpenseUseCase = Depends(get_exponse_use_case),
    id: str = Path(),
    payload: CreateExpenseTagRequest = Body(),
):
    use_case.update_tag(user=user, id=id, **payload.model_dump())


@router.post(
    "",
    status_code=status.HTTP_201_CREATED,
)
@inject
async def create_expense(
    *,
    user: UserPayloadSchema = Depends(JWTService.get_current_user),
    use_case: ExpenseUseCase = Depends(get_exponse_use_case),
    payload: CreateExpenseRequest = Body(),
):
    use_case.create_expense(payload=payload, user=user)


@router.get(
    "",
    status_code=status.HTTP_200_OK,
    response_model=ExpensePagingResponse,
)
@inject
async def get_expense(
    *,
    user: UserPayloadSchema = Depends(JWTService.get_current_user),
    use_case: ExpenseUseCase = Depends(get_exponse_use_case),
    payload: ExpenseQeuryRequest = Query(),
):
    expense = use_case.get_expenses(payload=payload, user=user)
    return ExpensePagingResponse(
        status=status.HTTP_200_OK,
        data=PaginationResponse.build(expense, payload),
        message="Expenses retrieved successfully.",
    )


@router.delete(
    "/{id}",
    status_code=status.HTTP_204_NO_CONTENT,
)
@inject
async def delete_expense(
    *,
    user: UserPayloadSchema = Depends(JWTService.get_current_user),
    use_case: ExpenseUseCase = Depends(get_exponse_use_case),
    id: int = Path(..., description="ID of the expense to delete"),
):
    use_case.delete_expense(id=id, user=user)


@router.post(
    "/{id}/note",
    status_code=status.HTTP_204_NO_CONTENT,
)
@inject
async def edit_expense_note(
    *,
    user: UserPayloadSchema = Depends(JWTService.get_current_user),
    use_case: ExpenseUseCase = Depends(get_exponse_use_case),
    id: int = Path(..., description="ID of the expense to edit"),
    node: str = Body(..., embed=True),
):
    use_case.edit_expense_node(id=id, note=node, user=user)


@router.get(
    "/expenses/summary",
    status_code=status.HTTP_200_OK,
)
@inject
async def get_expenses_summary(
    user: UserPayloadSchema = Depends(JWTService.get_current_user),
    use_case: ExpenseUseCase = Depends(get_exponse_use_case),
    # Add query params for period (week/month/quarter/year) as needed
):
    """
    기간별(주/월/분기/년) 요약 통계 (총 지출, 총 수입, 순수지, 건수)
    """
    raise NotImplementedError("Summary statistics endpoint not implemented yet.")


@router.get(
    "/expenses/aggregate-by-tag",
    status_code=status.HTTP_200_OK,
)
@inject
async def get_expenses_aggregate_by_tag(
    user: UserPayloadSchema = Depends(JWTService.get_current_user),
    use_case: ExpenseUseCase = Depends(get_exponse_use_case),
    # Add query params for filtering as needed
):
    """
    태그별/유형별(지출/수입) 집계 및 비율
    """
    raise NotImplementedError("Aggregate by tag endpoint not implemented yet.")


@router.get(
    "/expenses/trend",
    status_code=status.HTTP_200_OK,
)
@inject
async def get_expenses_trend(
    user: UserPayloadSchema = Depends(JWTService.get_current_user),
    use_case: ExpenseUseCase = Depends(get_exponse_use_case),
    # Add query params for period, tag, type, etc.
):
    """
    태그별/유형별 트렌드(전월/전주 대비 증감률)
    """
    raise NotImplementedError("Trend endpoint not implemented yet.")


@router.get(
    "/expenses/by-tag/{tag_id}",
    status_code=status.HTTP_200_OK,
)
@inject
async def get_expenses_by_tag(
    tag_id: int = Path(..., description="ID of the tag"),
    user: UserPayloadSchema = Depends(JWTService.get_current_user),
    use_case: ExpenseUseCase = Depends(get_exponse_use_case),
    # Add query params for filtering as needed
):
    """
    태그별 상세 내역(해당 태그의 거래 리스트)
    """
    raise NotImplementedError("Expenses by tag endpoint not implemented yet.")


@router.get(
    "/expenses/count-and-sum",
    status_code=status.HTTP_200_OK,
)
@inject
async def get_expenses_count_and_sum(
    user: UserPayloadSchema = Depends(JWTService.get_current_user),
    use_case: ExpenseUseCase = Depends(get_exponse_use_case),
    # Add query params for period, tag, type, etc.
):
    """
    기간/태그/유형별 거래 건수 및 금액 합계
    """
    raise NotImplementedError("Count and sum endpoint not implemented yet.")
