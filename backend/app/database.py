from typing import AsyncGenerator

from sqlalchemy import text
from sqlalchemy.ext.asyncio import AsyncSession, async_sessionmaker, create_async_engine
from sqlalchemy.orm import DeclarativeBase
from sqlalchemy.pool import NullPool

from app.config import get_settings


class Base(DeclarativeBase):
    pass


def get_engine():
    settings = get_settings()
    if settings.environment == 'test':
        return create_async_engine(
            settings.database_url,
            poolclass=NullPool,
            echo=False,
        )
    return create_async_engine(
        settings.database_url,
        pool_size=5,
        max_overflow=10,
        pool_pre_ping=True,
        pool_recycle=300,
        echo=settings.environment == 'development',
    )


engine = get_engine()

AsyncSessionLocal = async_sessionmaker(engine, expire_on_commit=False, class_=AsyncSession)


async def get_db() -> AsyncGenerator[AsyncSession, None]:
    async with AsyncSessionLocal() as session:
        try:
            yield session
            await session.commit()
        except Exception:
            await session.rollback()
            raise


async def ping_db() -> None:
    async with engine.connect() as conn:
        await conn.execute(text('SELECT 1'))
