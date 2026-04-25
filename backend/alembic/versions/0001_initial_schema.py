"""initial_schema

Revision ID: 0001_initial_schema
Revises:
Create Date: 2026-04-25
"""

from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import postgresql

# revision identifiers, used by Alembic.
revision = '0001_initial_schema'
down_revision = None
branch_labels = None
depends_on = None


def upgrade() -> None:
    op.create_table(
        'categories',
        sa.Column('id', postgresql.UUID(as_uuid=True), primary_key=True),
        sa.Column('name', sa.String(length=100), nullable=False),
        sa.Column('description', sa.Text(), nullable=True),
        sa.Column('image_url', sa.String(length=500), nullable=True),
    )

    op.create_table(
        'customers',
        sa.Column('id', postgresql.UUID(as_uuid=True), primary_key=True),
        sa.Column('name', sa.String(length=200), nullable=False),
        sa.Column('email', sa.String(length=255), nullable=False, unique=True),
        sa.Column('phone', sa.String(length=20), nullable=True),
        sa.Column('country', sa.String(length=100), nullable=False, server_default='Unknown'),
        sa.Column('signup_date', sa.Date(), nullable=True),
        sa.Column('created_at', sa.DateTime(timezone=True), nullable=False, server_default=sa.func.now()),
    )

    op.create_table(
        'products',
        sa.Column('id', postgresql.UUID(as_uuid=True), primary_key=True),
        sa.Column('name', sa.String(length=200), nullable=False),
        sa.Column('description', sa.Text(), nullable=True),
        sa.Column('price', sa.Numeric(10, 2), nullable=False),
        sa.Column('category_id', postgresql.UUID(as_uuid=True), sa.ForeignKey('categories.id', ondelete='SET NULL')),
        sa.Column('image_url', sa.String(length=500), nullable=True),
        sa.Column('stock_quantity', sa.Integer(), nullable=False, server_default='0'),
        sa.Column('sku', sa.String(length=100), nullable=False, unique=True),
        sa.Column('created_at', sa.DateTime(timezone=True), nullable=False, server_default=sa.func.now()),
    )

    op.create_table(
        'orders',
        sa.Column('id', postgresql.UUID(as_uuid=True), primary_key=True),
        sa.Column('customer_id', postgresql.UUID(as_uuid=True), sa.ForeignKey('customers.id', ondelete='CASCADE'), nullable=False),
        sa.Column('order_date', sa.DateTime(timezone=True), nullable=False, server_default=sa.func.now()),
        sa.Column('total_amount', sa.Numeric(10, 2), nullable=False),
        sa.Column('status', sa.String(length=50), nullable=False, server_default='pending'),
        sa.Column('sales_channel', sa.String(length=100), nullable=True),
    )

    op.create_table(
        'order_items',
        sa.Column('id', postgresql.UUID(as_uuid=True), primary_key=True),
        sa.Column('order_id', postgresql.UUID(as_uuid=True), sa.ForeignKey('orders.id', ondelete='CASCADE'), nullable=False),
        sa.Column('product_id', postgresql.UUID(as_uuid=True), sa.ForeignKey('products.id', ondelete='RESTRICT'), nullable=False),
        sa.Column('quantity', sa.Integer(), nullable=False),
        sa.Column('unit_price', sa.Numeric(10, 2), nullable=False),
    )


def downgrade() -> None:
    op.drop_table('order_items')
    op.drop_table('orders')
    op.drop_table('products')
    op.drop_table('customers')
    op.drop_table('categories')
