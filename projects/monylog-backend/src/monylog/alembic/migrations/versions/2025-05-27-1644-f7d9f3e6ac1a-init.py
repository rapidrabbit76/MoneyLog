"""init

Revision ID: f7d9f3e6ac1a
Revises:
Create Date: 2025-05-27 16:44:14.958849+00:00

"""

from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa
from monylog.alembic.migrations.utils import get_existing_tables
from sqlalchemy_fields.types import UUIDType, URLType
from monylog.backend.expense import entities as expense_entities
from monylog.backend.auth import entities as auth_entities

# revision identifiers, used by Alembic.
revision: str = "f7d9f3e6ac1a"
down_revision: Union[str, None] = None
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    existing_tables = set(get_existing_tables())  # noqa: F841

    print(expense_entities.Expense.__tablename__)

    if auth_entities.User.__tablename__ not in existing_tables:
        op.create_table(
            auth_entities.User.__tablename__,
            sa.Column("id", sa.VARCHAR(32), primary_key=True),
            sa.Column("email", sa.VARCHAR(300), nullable=False, unique=True),
            sa.Column("hashed_password", sa.Text, nullable=False),
            sa.Column("nickname", sa.Text, nullable=False),
            sa.Column("thumbnail", sa.Text, nullable=True, default=None),
            sa.Column("is_active", sa.Boolean, default=True, nullable=False),
            sa.Column("is_verified", sa.Boolean, default=False, nullable=False),
            sa.Column("is_superuser", sa.Boolean, default=False, nullable=False),
            sa.Column("created_at", sa.TIMESTAMP(timezone=True), default=sa.func.now(), nullable=False),
            sa.Column("updated_at", sa.TIMESTAMP(timezone=True), default=sa.func.now(), nullable=False),
        )
    if auth_entities.OAuth2Account.__tablename__ not in existing_tables:
        op.create_table(
            auth_entities.OAuth2Account.__tablename__,
            sa.Column("id", sa.Integer, primary_key=True, autoincrement=True),
            sa.Column("oauth_name", sa.String(length=100), index=True, nullable=False),
            sa.Column("access_token", sa.String(length=1024), nullable=False),
            sa.Column("expires_at", sa.Integer, nullable=True),
            sa.Column("refresh_token", sa.String(length=1024), nullable=True),
            sa.Column("account_id", sa.String(length=320), index=True, nullable=False),
            sa.Column("account_email", sa.String(length=320), nullable=False),
            sa.Column("user_id", sa.VARCHAR(32), sa.ForeignKey("monylog_user.id"), nullable=False),
            sa.Column("created_at", sa.TIMESTAMP(timezone=True), default=sa.func.now(), nullable=False),
            sa.Column("updated_at", sa.TIMESTAMP(timezone=True), default=sa.func.now(), nullable=False),
        )
    if auth_entities.UserLoginHistory.__tablename__ not in existing_tables:
        op.create_table(
            auth_entities.UserLoginHistory.__tablename__,
            sa.Column("id", sa.Integer, primary_key=True, autoincrement=True),
            sa.Column("user_id", sa.VARCHAR(32), sa.ForeignKey("monylog_user.id"), nullable=False),
            sa.Column("login_time", sa.TIMESTAMP(timezone=True), default=sa.func.now(), nullable=False),
        )

    if expense_entities.Expense.__tablename__ not in existing_tables:
        op.create_table(
            expense_entities.Expense.__tablename__,
            sa.Column("id", sa.Integer, primary_key=True, nullable=False, autoincrement=True),
            sa.Column("user_id", sa.VARCHAR(32), sa.ForeignKey("monylog_user.id"), nullable=False),
            sa.Column("amount", sa.DECIMAL(2), nullable=False),
            sa.Column("type", sa.Enum("income", "expense", name="money_type"), nullable=False),
            sa.Column("title", sa.Text, nullable=False),
            sa.Column("note", sa.Text, nullable=True, default=None),
            sa.Column("data", sa.JSON, nullable=True, default={}),
            sa.Column("dt", sa.TIMESTAMP(timezone=True), default=sa.func.now(), nullable=False),
            sa.Column("created_at", sa.TIMESTAMP(timezone=True), default=sa.func.now(), nullable=False),
            sa.Column("updated_at", sa.TIMESTAMP(timezone=True), default=sa.func.now(), nullable=False),
        )

    if expense_entities.ExpenseTag.__tablename__ not in existing_tables:
        op.create_table(
            expense_entities.ExpenseTag.__tablename__,
            sa.Column("id", sa.VARCHAR(12), primary_key=True),
            sa.Column("user_id", sa.VARCHAR(32), sa.ForeignKey("monylog_user.id"), nullable=False),
            sa.Column("name", sa.Text, nullable=False),
            sa.Column("data", sa.JSON, nullable=True, default={}),
            sa.Column("created_at", sa.TIMESTAMP(timezone=True), default=sa.func.now(), nullable=False),
            sa.Column("updated_at", sa.TIMESTAMP(timezone=True), default=sa.func.now(), nullable=False),
            sa.Index("idx_expense_tag_user_id_name", "user_id", "name", unique=True),
        )

    if expense_entities.expense_tag_asociation_table.name not in existing_tables:
        op.create_table(
            expense_entities.expense_tag_asociation_table.name,
            sa.Column("id", sa.Integer, primary_key=True, autoincrement=True),
            sa.Column("expense_id", sa.Integer, sa.ForeignKey("monylog_expense.id"), nullable=False),
            sa.Column("tag_id", sa.VARCHAR(12), sa.ForeignKey("monylog_expense_tag.id"), nullable=False),
            sa.Column("created_at", sa.TIMESTAMP(timezone=True), default=sa.func.now(), nullable=False),
            sa.Column("updated_at", sa.TIMESTAMP(timezone=True), default=sa.func.now(), nullable=False),
        )
    if expense_entities.ExpenseLog.__tablename__ not in existing_tables:
        op.create_table(
            expense_entities.ExpenseLog.__tablename__,
            sa.Column("id", sa.Integer, primary_key=True, autoincrement=True),
            sa.Column("user_id", sa.VARCHAR(32), sa.ForeignKey("monylog_user.id"), nullable=False),
            sa.Column("request_id", sa.String(100), nullable=False, unique=True),
            sa.Column("data", sa.JSON, nullable=False),
            sa.Column("created_at", sa.TIMESTAMP(timezone=True), default=sa.func.now(), nullable=False),
            sa.Column("updated_at", sa.TIMESTAMP(timezone=True), default=sa.func.now(), nullable=False),
        )


def downgrade() -> None:
    existing_tables = set(get_existing_tables())  # noqa: F841

    if expense_entities.ExpenseLog.__tablename__ in existing_tables:
        op.drop_table(expense_entities.ExpenseLog.__tablename__)
    if expense_entities.Expense.__tablename__ in existing_tables:
        op.drop_table(expense_entities.Expense.__tablename__)
    if expense_entities.ExpenseTag.__tablename__ in existing_tables:
        op.drop_table(expense_entities.ExpenseTag.__tablename__)
    if expense_entities.expense_tag_asociation_table.name in existing_tables:
        op.drop_table(expense_entities.expense_tag_asociation_table.name)
