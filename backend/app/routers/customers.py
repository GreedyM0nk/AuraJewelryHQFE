import uuid

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.database import get_db
from app.dependencies import require_admin
from app.models.customer import Customer
from app.schemas.customer import CustomerCreate, CustomerOut

router = APIRouter(tags=['customers'])


@router.post('/customers', response_model=CustomerOut, status_code=status.HTTP_201_CREATED)
async def create_customer(payload: CustomerCreate, db: AsyncSession = Depends(get_db)):
    existing = await db.scalar(select(Customer).where(Customer.email == payload.email))
    if existing:
        raise HTTPException(status_code=409, detail='Email already exists')

    customer = Customer(**payload.model_dump())
    db.add(customer)
    await db.flush()
    await db.refresh(customer)
    return customer


@router.get('/customers/{customer_id}', response_model=CustomerOut, dependencies=[Depends(require_admin)])
async def get_customer(customer_id: uuid.UUID, db: AsyncSession = Depends(get_db)):
    customer = await db.scalar(select(Customer).where(Customer.id == customer_id))
    if customer is None:
        raise HTTPException(status_code=404, detail='Customer not found')
    return customer
