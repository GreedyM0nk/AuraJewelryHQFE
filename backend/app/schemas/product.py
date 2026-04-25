import uuid
from datetime import datetime
from decimal import Decimal

from pydantic import BaseModel, ConfigDict

from app.schemas.category import CategoryOut


class ProductBase(BaseModel):
    name: str
    description: str | None = None
    price: Decimal
    category_id: uuid.UUID | None = None
    image_url: str | None = None
    stock_quantity: int = 0
    sku: str


class ProductCreate(ProductBase):
    pass


class ProductUpdate(BaseModel):
    name: str | None = None
    description: str | None = None
    price: Decimal | None = None
    category_id: uuid.UUID | None = None
    image_url: str | None = None
    stock_quantity: int | None = None
    sku: str | None = None


class ProductOut(ProductBase):
    id: uuid.UUID
    created_at: datetime
    category: CategoryOut | None = None

    model_config = ConfigDict(from_attributes=True)
