from monylog.shared_kernel.domain.types import DateRange


class ExpenseSummaryQruey(DateRange):
    tag: str | None = None
