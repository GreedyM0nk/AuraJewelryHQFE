import uuid

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy import or_, select
from sqlalchemy.ext.asyncio import AsyncSession

from app.database import get_db
from app.dependencies import require_admin
from app.models.customer import Customer
from app.schemas.customer import CustomerCreate, CustomerLookup, CustomerOut

router = APIRouter(tags=['customers'])


@router.post('/customers', response_model=CustomerOut, status_code=status.HTTP_201_CREATED)
async def create_customer(payload: CustomerCreate, db: AsyncSession = Depends(get_db)):
    existing = await db.scalar(select(Customer).where(Customer.email == payload.email))
    if existing:
        raise HTTPException(
            status_code=409,
            detail={
                'message': 'Email already exists',
                'customer_id': str(existing.id),
            },
        )

    customer = Customer(**payload.model_dump())
    db.add(customer)
    await db.flush()
    await db.refresh(customer)
    return customer


@router.post('/customers/lookup', response_model=CustomerOut)
async def lookup_customer(payload: CustomerLookup, db: AsyncSession = Depends(get_db)):
    customer = await db.scalar(select(Customer).where(Customer.email == payload.email))
    if customer is None:
        raise HTTPException(status_code=404, detail='Customer not found')
    return customer


@router.get('/customers/{customer_id}', response_model=CustomerOut, dependencies=[Depends(require_admin)])
async def get_customer(customer_id: uuid.UUID, db: AsyncSession = Depends(get_db)):
    customer = await db.scalar(select(Customer).where(Customer.id == customer_id))
    if customer is None:
        raise HTTPException(status_code=404, detail='Customer not found')
    return customer


@router.get('/customers', response_model=list[CustomerOut], dependencies=[Depends(require_admin)])
async def list_customers(search: str | None = None, db: AsyncSession = Depends(get_db)):
    query = select(Customer).order_by(Customer.created_at.desc())
    if search:
        term = f'%{search.strip()}%'
        query = query.where(or_(Customer.name.ilike(term), Customer.email.ilike(term)))
    result = await db.execute(query)
    return list(result.scalars().all())


@router.delete('/customers/{customer_id}', status_code=status.HTTP_204_NO_CONTENT, dependencies=[Depends(require_admin)])
async def delete_customer(customer_id: uuid.UUID, db: AsyncSession = Depends(get_db)):
    customer = await db.scalar(select(Customer).where(Customer.id == customer_id))
    if customer is None:
        raise HTTPException(status_code=404, detail='Customer not found')
    await db.delete(customer)
    await db.flush()
    return None
