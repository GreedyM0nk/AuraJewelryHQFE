from fastapi import APIRouter, Depends, status
from fastapi.responses import JSONResponse
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.database import get_db
from app.models.customer import Customer
from app.schemas.newsletter import NewsletterSubscribe

router = APIRouter(tags=['newsletter'])


@router.post('/newsletter', status_code=status.HTTP_201_CREATED)
async def subscribe(payload: NewsletterSubscribe, db: AsyncSession = Depends(get_db)):
    existing = await db.scalar(select(Customer).where(Customer.email == payload.email))
    if existing:
        return JSONResponse({'message': 'Already subscribed'}, status_code=status.HTTP_200_OK)

    customer = Customer(name='Subscriber', email=payload.email, country='Unknown')
    db.add(customer)
    await db.flush()
    return {'message': 'Subscribed'}
