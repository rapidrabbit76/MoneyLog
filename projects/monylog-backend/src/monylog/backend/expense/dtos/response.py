from monylog.shared_kernel.infra.fastapi.dtos.response import ResponseDto
from monylog.shared_kernel.infra.fastapi.pageable import PaginationResponse
from .schemas import MessageAnalyzedSchema, ExpenseTagSchema, ExpenseReadSchema

MessageAnalyzedResponse = ResponseDto[MessageAnalyzedSchema]
ExpenseTagPagingResponse = ResponseDto[list[ExpenseTagSchema]]
ExpensePagingResponse = ResponseDto[PaginationResponse[ExpenseReadSchema]]
