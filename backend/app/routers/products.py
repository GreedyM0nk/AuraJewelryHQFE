import uuid
from typing import Literal

from fastapi import APIRouter, Depends, status
from sqlalchemy.ext.asyncio import AsyncSession

from app.database import get_db
from app.dependencies import require_admin
from app.schemas.product import ProductCreate, ProductOut, ProductUpdate
from app.services.product_service import (
    create_product,
    delete_product,
    get_product_by_id,
    get_products,
    update_product,
)

router = APIRouter(tags=['products'])


@router.get('/products', response_model=list[ProductOut])
async def list_products(
    category_id: uuid.UUID | None = None,
    search: str | None = None,
    limit: int = 20,
    offset: int = 0,
    sort: Literal['newest', 'price_asc', 'price_desc'] = 'newest',
    db: AsyncSession = Depends(get_db),
):
    return await get_products(db, category_id, search, limit, offset, sort)


@router.get('/products/{product_id}', response_model=ProductOut)
async def get_product(product_id: uuid.UUID, db: AsyncSession = Depends(get_db)):
    return await get_product_by_id(product_id, db)


@router.post(
    '/products',
    response_model=ProductOut,
    status_code=status.HTTP_201_CREATED,
    dependencies=[Depends(require_admin)],
)
async def create_product_endpoint(payload: ProductCreate, db: AsyncSession = Depends(get_db)):
    return await create_product(payload, db)


@router.patch('/products/{product_id}', response_model=ProductOut, dependencies=[Depends(require_admin)])
async def update_product_endpoint(
    product_id: uuid.UUID, payload: ProductUpdate, db: AsyncSession = Depends(get_db)
):
    return await update_product(product_id, payload, db)


@router.delete('/products/{product_id}', status_code=status.HTTP_204_NO_CONTENT, dependencies=[Depends(require_admin)])
async def delete_product_endpoint(product_id: uuid.UUID, db: AsyncSession = Depends(get_db)):
    await delete_product(product_id, db)
    return None
