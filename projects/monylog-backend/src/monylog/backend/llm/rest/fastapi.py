from fastapi import APIRouter, Depends, Body, status
from monylog.backend.llm.use_case.expense_use_case import ExpenseLLMUseCase
from monylog.backend.container import MonyLogContainer
from dependency_injector.wiring import inject, Provide
from ..dtos.request import ExpenseMessageAnalyzeRequest
from ..dtos.response import MessageAnalyzedResponse
from ..dtos.schemas import MessageAnalyzedSchema

router = APIRouter()


@router.post(
    "/expense",
    status_code=status.HTTP_200_OK,
    response_model=MessageAnalyzedResponse,
)
@inject
async def analyze_message(
    use_case: ExpenseLLMUseCase = Depends(Provide[MonyLogContainer.llm.use_case]),
    payload: ExpenseMessageAnalyzeRequest = Body(),
):
    use_case = use_case["expense"]  # type: ignore
    results = await use_case.generate_expense_from_message(message=payload.message, tags=payload.tags)
    return MessageAnalyzedResponse(
        status=status.HTTP_200_OK,
        data=MessageAnalyzedSchema.model_validate(results),
        message="Expense analysis completed successfully.",
    )
