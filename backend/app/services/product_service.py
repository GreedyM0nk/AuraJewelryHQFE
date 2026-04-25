import uuid
from typing import Literal

from fastapi import HTTPException
from sqlalchemy import Select, func, select
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload

from app.models.product import Product
from app.schemas.product import ProductCreate, ProductUpdate


async def get_products(
    db: AsyncSession,
    category_id: uuid.UUID | None = None,
    search: str | None = None,
    limit: int = 20,
    offset: int = 0,
    sort: Literal['newest', 'price_asc', 'price_desc'] = 'newest',
) -> list[Product]:
    limit = min(limit, 100)

    query: Select[tuple[Product]] = select(Product).options(selectinload(Product.category))

    if category_id:
        query = query.where(Product.category_id == category_id)

    if search:
        query = query.where(Product.name.ilike(f'%{search}%'))

    if sort == 'price_asc':
        query = query.order_by(Product.price.asc())
    elif sort == 'price_desc':
        query = query.order_by(Product.price.desc())
    else:
        query = query.order_by(Product.created_at.desc())

    query = query.limit(limit).offset(offset)

    result = await db.execute(query)
    return list(result.scalars().all())


async def get_product_by_id(product_id: uuid.UUID, db: AsyncSession) -> Product:
    result = await db.execute(
        select(Product).options(selectinload(Product.category)).where(Product.id == product_id)
    )
    product = result.scalar_one_or_none()
    if product is None:
        raise HTTPException(status_code=404, detail='Product not found')
    return product


async def _ensure_unique_sku(sku: str, db: AsyncSession, ignore_id: uuid.UUID | None = None):
    query = select(func.count(Product.id)).where(Product.sku == sku)
    if ignore_id:
        query = query.where(Product.id != ignore_id)
    count = await db.scalar(query)
    if (count or 0) > 0:
        raise HTTPException(status_code=409, detail='SKU already exists')


async def create_product(payload: ProductCreate, db: AsyncSession) -> Product:
    await _ensure_unique_sku(payload.sku, db)
    product = Product(**payload.model_dump())
    db.add(product)
    await db.flush()
    await db.refresh(product)
    return await get_product_by_id(product.id, db)


async def update_product(product_id: uuid.UUID, payload: ProductUpdate, db: AsyncSession) -> Product:
    product = await get_product_by_id(product_id, db)
    data = payload.model_dump(exclude_unset=True)

    if 'sku' in data and data['sku']:
        await _ensure_unique_sku(data['sku'], db, ignore_id=product_id)

    for key, value in data.items():
        setattr(product, key, value)

    await db.flush()
    await db.refresh(product)
    return await get_product_by_id(product.id, db)


async def delete_product(product_id: uuid.UUID, db: AsyncSession) -> None:
    product = await get_product_by_id(product_id, db)
    await db.delete(product)
    await db.flush()
