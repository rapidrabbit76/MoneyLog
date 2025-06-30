from dataclasses import dataclass
from decimal import Decimal
from typing import TYPE_CHECKING, Optional

import sqlalchemy as sa

from monylog.backend.expense.entities.expense import Expense, ExpenseTag
from monylog.backend.expense.entities.log import ExpenseLog
from monylog.shared_kernel.infra.database.sqla.mixin import SyncSqlaMixIn
from monylog.shared_kernel.infra.fastapi.pageable import Page

from . import exceptions
from .dtos.request import CreateExpenseRequest
from .services.calculrator import ExpenseGroupSumCalculator, ExpenseSumCalculator

if TYPE_CHECKING:
    from monylog.backend.auth.dtos.schemas import UserPayloadSchema
    from .dtos.request import ExpenseQueryRequest


@dataclass
class ExpenseUseCase(SyncSqlaMixIn):
    def append_tag(
        self,
        user: "UserPayloadSchema",
        name: str,
        color: str = "#00f0f0",
    ) -> ExpenseTag:
        with self.db.session() as session:
            stmt = sa.select(ExpenseTag).where(ExpenseTag.name == name, ExpenseTag.user_id == user.id)
            tag = session.execute(stmt).scalar()
            if tag:
                return tag
            tag = ExpenseTag.build(name=name, color=color, user_id=user.id)
            session.add(tag)
            session.commit()
        return tag

    def get_tags(
        self,
        user: "UserPayloadSchema",
    ) -> list[ExpenseTag]:
        with self.db.session() as session:
            stmt = sa.select(ExpenseTag).where(ExpenseTag.user_id == user.id).order_by(ExpenseTag.created_at.desc())
            tags = session.execute(stmt).scalars().all()
        return tags

    def delete_tag(
        self,
        user: "UserPayloadSchema",
        id: str | None,
        name: str | None,
    ) -> None:
        with self.db.session() as session:
            stmt = sa.delete(ExpenseTag).where(ExpenseTag.user_id == user.id)
            if id is not None:
                stmt = stmt.where(ExpenseTag.id == id)
            if name is not None:
                stmt = stmt.where(ExpenseTag.name == name)
            session.execute(stmt)
            session.commit()

    def update_tag(
        self,
        user: "UserPayloadSchema",
        id: str,
        **kw,
    ) -> ExpenseTag:
        with self.db.session() as session:
            stmt = sa.update(ExpenseTag).where(ExpenseTag.id == id, ExpenseTag.user_id == user.id).values(**kw)
            session.execute(stmt)
            session.commit()
            tag = session.get(ExpenseTag, id)
        return tag

    def sum_expenses(
        self,
        user: "UserPayloadSchema",
        start_date: str,
        end_date: str,
    ) -> Decimal:
        with self.db.session() as session:
            stmt = sa.select(Expense).where(
                Expense.date >= start_date, Expense.date <= end_date, Expense.user_id == user.id
            )
            expenses = session.execute(stmt).scalars().all()
        return Expense.calculate(ExpenseSumCalculator, expenses).total

    def group_sum_expenses(
        self,
        user: "UserPayloadSchema",
        start_date: str,
        end_date: str,
    ) -> dict[str, Decimal]:
        with self.db.session() as session:
            stmt = sa.select(Expense).where(
                Expense.date >= start_date, Expense.date <= end_date, Expense.user_id == user.id
            )
            expenses = session.execute(stmt).scalars().all()
        return Expense.calculate(ExpenseGroupSumCalculator, expenses).groups

    def log_generate_expense_from_message(
        self,
        user: "UserPayloadSchema",
        result,
    ):
        with self.db.session() as session:
            model = ExpenseLog(request_id=result.id, data=result.model_dump(mode="json"), user_id=user.id)
            session.add(model)
            session.commit()

    def create_expense(
        self,
        user: "UserPayloadSchema",
        payload: CreateExpenseRequest,
    ):
        with self.db.session() as session:
            tags = self.get_tags(user)
            tags_dict = {tag.name: tag for tag in tags}
            models = []
            for expense in payload.expenses:
                model = Expense(
                    title=expense.title,
                    user_id=user.id,
                    amount=expense.amount,
                    dt=expense.dt,
                    type=expense.type,
                    data={"request_id": payload.request_id},
                )
                tags = [tags_dict[tag] for tag in expense.tags if tag in tags_dict]
                model.tags.extend(tags)
                models.append(model)
            session.add_all(models)
            session.commit()

    def get_expenses(
        self,
        user: "UserPayloadSchema",
        payload: "ExpenseQueryRequest",
    ):
        with self.db.session() as session:
            stmt = sa.select(Expense).where(Expense.user_id == user.id)
            stmt = stmt.offset(payload.offset).limit(payload.limit).order_by(Expense.id.desc())
            if payload.start_date and payload.end_date:
                stmt = stmt.where(Expense.dt >= payload.start_date, Expense.dt <= payload.end_date)

            expenses = session.execute(stmt).scalars().all()
            total = session.execute(sa.select(sa.func.count()).select_from(stmt.cte())).scalar_one()
        return Page(items=expenses, total=total)

    def get_expense_by_id(
        self,
        user: "UserPayloadSchema",
        id: int,
    ) -> Optional[Expense]:
        with self.db.session() as session:
            stmt = sa.select(Expense).where(Expense.id == id, Expense.user_id == user.id)
            expense = session.execute(stmt).scalar_one_or_none()
        return expense

    def edit_expense_node(
        self,
        user: "UserPayloadSchema",
        id: int,
        note: str,
    ) -> Expense:
        expense = self.get_expense_by_id(user, id)
        if expense is None:
            raise exceptions.ExpenseNotFoundException(f"Expense with id {id} not found.")
        with self.db.session() as session:
            expense.note = note
            session.merge(expense)
            session.commit()
        return expense

    def delete_expense(
        self,
        user: "UserPayloadSchema",
        id: int,
    ):
        stmt = sa.delete(Expense).where(Expense.id == id, Expense.user_id == user.id)
        with self.db.session() as session:
            session.execute(stmt)
            session.commit()
