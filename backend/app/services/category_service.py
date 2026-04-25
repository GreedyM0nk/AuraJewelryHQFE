import uuid

from fastapi import HTTPException
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload

from app.models.category import Category
from app.schemas.category import CategoryCreate


async def get_categories(db: AsyncSession) -> list[Category]:
    result = await db.execute(select(Category).order_by(Category.name.asc()))
    return list(result.scalars().all())


async def get_category_with_products(category_id: uuid.UUID, db: AsyncSession) -> Category:
    result = await db.execute(
        select(Category)
        .options(selectinload(Category.products))
        .where(Category.id == category_id)
    )
    category = result.scalar_one_or_none()
    if category is None:
        raise HTTPException(status_code=404, detail='Category not found')
    return category


async def create_category(payload: CategoryCreate, db: AsyncSession) -> Category:
    category = Category(**payload.model_dump())
    db.add(category)
    await db.flush()
    await db.refresh(category)
    return category
