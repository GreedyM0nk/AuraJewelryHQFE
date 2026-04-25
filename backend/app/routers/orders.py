import uuid

from fastapi import APIRouter, Depends, status
from sqlalchemy.ext.asyncio import AsyncSession

from app.database import get_db
from app.dependencies import require_admin
from app.schemas.order import OrderCreate, OrderOut
from app.services.order_service import create_order, get_customer_orders, get_order_by_id

router = APIRouter(tags=['orders'])


@router.post('/orders', response_model=OrderOut, status_code=status.HTTP_201_CREATED)
async def create_order_endpoint(payload: OrderCreate, db: AsyncSession = Depends(get_db)):
    return await create_order(payload, db)


@router.get('/orders/{order_id}', response_model=OrderOut, dependencies=[Depends(require_admin)])
async def get_order(order_id: uuid.UUID, db: AsyncSession = Depends(get_db)):
    return await get_order_by_id(order_id, db)


@router.get('/orders/customer/{customer_id}', response_model=list[OrderOut], dependencies=[Depends(require_admin)])
async def list_customer_orders(customer_id: uuid.UUID, db: AsyncSession = Depends(get_db)):
    return await get_customer_orders(customer_id, db)
