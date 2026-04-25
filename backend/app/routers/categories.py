import uuid

from fastapi import APIRouter, Depends, status
from sqlalchemy.ext.asyncio import AsyncSession

from app.database import get_db
from app.dependencies import require_admin
from app.schemas.category import CategoryCreate, CategoryOut, CategoryWithProducts
from app.services.category_service import create_category, get_categories, get_category_with_products

router = APIRouter(tags=['categories'])


@router.get('/categories', response_model=list[CategoryOut])
async def list_categories(db: AsyncSession = Depends(get_db)):
    return await get_categories(db)


@router.get('/categories/{category_id}', response_model=CategoryWithProducts)
async def get_category(category_id: uuid.UUID, db: AsyncSession = Depends(get_db)):
    return await get_category_with_products(category_id, db)


@router.post(
    '/categories',
    response_model=CategoryOut,
    status_code=status.HTTP_201_CREATED,
    dependencies=[Depends(require_admin)],
)
async def create_category_endpoint(payload: CategoryCreate, db: AsyncSession = Depends(get_db)):
    return await create_category(payload, db)
