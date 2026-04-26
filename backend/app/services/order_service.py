import uuid
from decimal import Decimal

from fastapi import HTTPException
from sqlalchemy import select, update
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload

from app.models.customer import Customer
from app.models.order import Order, OrderItem
from app.models.product import Product
from app.schemas.order import OrderCreate, OrderStatusUpdate


async def create_order(payload: OrderCreate, db: AsyncSession) -> Order:
    customer = await db.scalar(select(Customer).where(Customer.id == payload.customer_id))
    if customer is None:
        raise HTTPException(status_code=404, detail='Customer not found')

    for item in payload.items:
        product = await db.scalar(select(Product).where(Product.id == item.product_id))
        if product is None:
            raise HTTPException(status_code=404, detail=f'Product not found: {item.product_id}')

    total = Decimal('0.00')
    for item in payload.items:
        total += Decimal(item.quantity) * Decimal(item.unit_price)

    order = Order(
        customer_id=payload.customer_id,
        total_amount=total,
        status='pending',
        sales_channel=payload.sales_channel,
    )
    db.add(order)
    await db.flush()

    for item in payload.items:
        order_item = OrderItem(
            order_id=order.id,
            product_id=item.product_id,
            quantity=item.quantity,
            unit_price=item.unit_price,
        )
        db.add(order_item)

    await db.flush()

    for item in payload.items:
        result = await db.execute(
            update(Product)
            .where(Product.id == item.product_id, Product.stock_quantity >= item.quantity)
            .values(stock_quantity=Product.stock_quantity - item.quantity)
            .returning(Product.id)
        )
        if result.fetchone() is None:
            product_exists = await db.scalar(select(Product.id).where(Product.id == item.product_id))
            if product_exists is None:
                raise HTTPException(status_code=404, detail=f'Product not found: {item.product_id}')
            raise HTTPException(status_code=422, detail=f'Insufficient stock for product {item.product_id}')

    return await get_order_by_id(order.id, db)


async def get_order_by_id(order_id: uuid.UUID, db: AsyncSession) -> Order:
    result = await db.execute(
        select(Order)
        .options(selectinload(Order.items))
        .where(Order.id == order_id)
    )
    order = result.scalar_one_or_none()
    if order is None:
        raise HTTPException(status_code=404, detail='Order not found')
    return order


async def get_customer_orders(customer_id: uuid.UUID, db: AsyncSession) -> list[Order]:
    result = await db.execute(
        select(Order)
        .options(selectinload(Order.items))
        .where(Order.customer_id == customer_id)
        .order_by(Order.order_date.desc())
    )
    return list(result.scalars().all())


async def list_orders(
    db: AsyncSession,
    status: str | None = None,
    customer_id: uuid.UUID | None = None,
) -> list[Order]:
    query = select(Order).options(selectinload(Order.items)).order_by(Order.order_date.desc())
    if status:
        query = query.where(Order.status == status)
    if customer_id:
        query = query.where(Order.customer_id == customer_id)

    result = await db.execute(query)
    return list(result.scalars().all())


async def update_order_status(order_id: uuid.UUID, payload: OrderStatusUpdate, db: AsyncSession) -> Order:
    order = await get_order_by_id(order_id, db)
    order.status = payload.status
    await db.flush()
    return await get_order_by_id(order_id, db)


async def delete_order(order_id: uuid.UUID, db: AsyncSession) -> None:
    order = await get_order_by_id(order_id, db)
    await db.delete(order)
    await db.flush()
