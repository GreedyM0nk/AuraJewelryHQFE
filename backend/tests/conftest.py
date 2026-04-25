import os
import uuid
from decimal import Decimal

import pytest_asyncio
from httpx import ASGITransport, AsyncClient
from sqlalchemy import text

os.environ['ENVIRONMENT'] = 'test'

from app.database import Base, AsyncSessionLocal, engine
from app.main import app
from app.models.category import Category
from app.models.customer import Customer
from app.models.product import Product


@pytest_asyncio.fixture(scope='session', autouse=True)
async def setup_db():
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)
        await conn.execute(text('TRUNCATE TABLE order_items, orders, products, categories, customers RESTART IDENTITY CASCADE'))
    yield
    async with engine.begin() as conn:
        await conn.execute(text('TRUNCATE TABLE order_items, orders, products, categories, customers RESTART IDENTITY CASCADE'))
    await engine.dispose()


@pytest_asyncio.fixture
async def client():
    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url='http://test') as ac:
        yield ac


@pytest_asyncio.fixture
async def db_session():
    async with AsyncSessionLocal() as session:
        yield session
        await session.rollback()


@pytest_asyncio.fixture
async def seeded_data(db_session):
    cat = Category(
        id=uuid.UUID('11111111-1111-1111-1111-111111111001'),
        name='Charms',
        description='Charm category',
        image_url='https://images.unsplash.com/photo-1617038220319-276d3cfab638?w=600&q=80',
    )
    product = Product(
        id=uuid.UUID('22222222-2222-2222-2222-222222220001'),
        name='Golden Lotus Charm',
        description='A delicate charm.',
        price=Decimal('4500'),
        category_id=cat.id,
        image_url='https://images.unsplash.com/photo-1617038220319-276d3cfab638?w=600&q=80',
        stock_quantity=10,
        sku='AJ-001',
    )
    customer = Customer(
        id=uuid.UUID('33333333-3333-3333-3333-333333330001'),
        name='Test Customer',
        email='test@example.com',
        country='India',
    )

    db_session.add_all([cat, product, customer])
    await db_session.commit()

    yield {'category': cat, 'product': product, 'customer': customer}

    await db_session.execute(text("DELETE FROM order_items"))
    await db_session.execute(text("DELETE FROM orders"))
    await db_session.execute(text("DELETE FROM products"))
    await db_session.execute(text("DELETE FROM categories"))
    await db_session.execute(text("DELETE FROM customers"))
    await db_session.commit()
