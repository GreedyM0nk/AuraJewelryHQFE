import uuid

from pydantic import BaseModel, ConfigDict


class CategoryBase(BaseModel):
    name: str
    description: str | None = None
    image_url: str | None = None


class CategoryCreate(CategoryBase):
    pass


class CategoryOut(CategoryBase):
    id: uuid.UUID

    model_config = ConfigDict(from_attributes=True)


class CategoryWithProducts(CategoryOut):
    products: list['ProductLite'] = []


class ProductLite(BaseModel):
    id: uuid.UUID
    name: str
    price: float
    sku: str

    model_config = ConfigDict(from_attributes=True)
