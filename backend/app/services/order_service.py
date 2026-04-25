import uuid
from decimal import Decimal

from fastapi import HTTPException
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload

from app.models.customer import Customer
from app.models.order import Order, OrderItem
from app.models.product import Product
from app.schemas.order import OrderCreate


async def create_order(payload: OrderCreate, db: AsyncSession) -> Order:
    customer = await db.scalar(select(Customer).where(Customer.id == payload.customer_id))
    if customer is None:
        raise HTTPException(status_code=404, detail='Customer not found')

    product_cache: dict[uuid.UUID, Product] = {}

    for item in payload.items:
        product = await db.scalar(select(Product).where(Product.id == item.product_id).with_for_update())
        if product is None:
            raise HTTPException(status_code=404, detail=f'Product not found: {item.product_id}')
        if product.stock_quantity < item.quantity:
            raise HTTPException(
                status_code=422,
                detail=f'Insufficient stock for {product.name}',
            )
        product_cache[item.product_id] = product

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

    order_items: list[OrderItem] = []
    for item in payload.items:
        order_item = OrderItem(
            order_id=order.id,
            product_id=item.product_id,
            quantity=item.quantity,
            unit_price=item.unit_price,
        )
        order_items.append(order_item)
        db.add(order_item)

        product = product_cache[item.product_id]
        product.stock_quantity -= item.quantity

    await db.flush()
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
