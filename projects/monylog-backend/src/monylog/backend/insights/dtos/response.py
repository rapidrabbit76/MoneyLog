from monylog.shared_kernel.infra.fastapi.dtos.response import ResponseDto, PaginationResponse
from .schemas import ExpenseSummarySchema

ExpenseSummaryResponse = ResponseDto[ExpenseSummarySchema]
