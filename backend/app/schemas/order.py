import uuid
from datetime import datetime
from decimal import Decimal
from typing import Literal

from pydantic import BaseModel, ConfigDict, Field


class OrderItemCreate(BaseModel):
    product_id: uuid.UUID
    quantity: int = Field(gt=0)
    unit_price: Decimal


class OrderItemOut(BaseModel):
    id: uuid.UUID
    order_id: uuid.UUID
    product_id: uuid.UUID
    quantity: int
    unit_price: Decimal

    model_config = ConfigDict(from_attributes=True)


class OrderCreate(BaseModel):
    customer_id: uuid.UUID
    total_amount: Decimal | None = None
    items: list[OrderItemCreate] = Field(min_length=1)
    sales_channel: str | None = None


class OrderOut(BaseModel):
    id: uuid.UUID
    customer_id: uuid.UUID
    order_date: datetime
    total_amount: Decimal
    status: str
    sales_channel: str | None = None
    items: list[OrderItemOut]

    model_config = ConfigDict(from_attributes=True)


class OrderStatusUpdate(BaseModel):
    status: Literal['pending', 'confirmed', 'shipped', 'delivered', 'cancelled']
