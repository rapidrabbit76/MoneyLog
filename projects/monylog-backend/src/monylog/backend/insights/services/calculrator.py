from dataclasses import dataclass, field
from decimal import Decimal
from re import A
from monylog.backend.expense.entities import Expense
from monylog.shared_kernel.domain.enum import ExpenseType
from abc import ABC, abstractmethod
from typing import Annotated, TypeVar


@dataclass
class ExpenseCalculatorResult:
    total: Decimal = field(default=Decimal("0.00"), init=False)
    groups: dict[str, Decimal] = field(default_factory=dict)

    def __post_init__(self):
        for key, value in self.groups.items():
            if not isinstance(value, Decimal):
                raise TypeError(f"Expected Decimal for {key}, got {type(value)}")
            self.total += value


class ExpenseCalculator(ABC):
    """
    A simple calculator for expenses.
    """

    @classmethod
    @abstractmethod
    def calculate(cls, expenses: list[Expense]) -> ExpenseCalculatorResult:
        """
        Calculate the total of a list of expenses.
        :param expenses: List of expense objects.
        :return: Total amount of expenses (income - expense).
        """
        raise NotImplementedError("This method needs to be implemented.")


ExpenseCalculatorOps = TypeVar("ExpenseCalculatorOps", bound=ExpenseCalculator)


class ExpenseSumCalculator(ExpenseCalculator):
    """
    A concrete implementation of ExpenseCalculator that sums expenses.
    """

    @classmethod
    def calculate(cls, expenses: list[Expense]) -> ExpenseCalculatorResult:
        """
        Calculate the total of a list of expenses.
        :param expenses: List of expense objects.
        :return: Total amount of expenses (income - expense).
        """
        total = Decimal(0)
        for expense in expenses:
            match expense.type:
                case ExpenseType.INCOME:
                    total += expense.amount
                case ExpenseType.EXPENSE:
                    total -= expense.amount
                case _:
                    raise ValueError(f"Unknown expense type: {expense.type}")
        return ExpenseCalculatorResult(groups={"total": total})


class ExpenseGroupSumCalculator(ExpenseCalculator):
    """
    A concrete implementation of ExpenseCalculator that groups and sums expenses by type.
    """

    @classmethod
    def calculate(cls, expenses: list[Expense]) -> ExpenseCalculatorResult:
        """
        Calculate the total of a list of expenses grouped by type.
        :param expenses: List of expense objects.
        :return: Dictionary with total amounts grouped by expense type.
        """
        groups = {}
        for expense in expenses:
            if expense.type not in groups:
                groups[expense.type] = Decimal(0)
            if expense.type == ExpenseType.INCOME:
                groups[expense.type] += expense.amount
            elif expense.type == ExpenseType.EXPENSE:
                groups[expense.type] -= expense.amount
            else:
                raise ValueError(f"Unknown expense type: {expense.type}")
        return ExpenseCalculatorResult(groups=groups)
