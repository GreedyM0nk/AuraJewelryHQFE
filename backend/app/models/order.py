import uuid
from datetime import datetime
from decimal import Decimal
from typing import TYPE_CHECKING

from sqlalchemy import DateTime, ForeignKey, Integer, Numeric, String, func
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.database import Base

if TYPE_CHECKING:
    from app.models.customer import Customer
    from app.models.product import Product


class Order(Base):
    __tablename__ = 'orders'

    id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    customer_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), ForeignKey('customers.id', ondelete='CASCADE'), nullable=False
    )
    order_date: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now())
    total_amount: Mapped[Decimal] = mapped_column(Numeric(10, 2), nullable=False)
    status: Mapped[str] = mapped_column(String(50), nullable=False, default='pending')
    sales_channel: Mapped[str | None] = mapped_column(String(100), nullable=True)

    customer: Mapped['Customer'] = relationship(back_populates='orders')
    items: Mapped[list['OrderItem']] = relationship(
        back_populates='order', cascade='all, delete-orphan'
    )


class OrderItem(Base):
    __tablename__ = 'order_items'

    id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    order_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), ForeignKey('orders.id', ondelete='CASCADE'), nullable=False
    )
    product_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), ForeignKey('products.id', ondelete='RESTRICT'), nullable=False
    )
    quantity: Mapped[int] = mapped_column(Integer, nullable=False)
    unit_price: Mapped[Decimal] = mapped_column(Numeric(10, 2), nullable=False)

    order: Mapped['Order'] = relationship(back_populates='items')
    product: Mapped['Product'] = relationship()
