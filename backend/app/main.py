from contextlib import asynccontextmanager

from fastapi import Depends, FastAPI
from fastapi.responses import JSONResponse
from slowapi import Limiter, _rate_limit_exceeded_handler
from slowapi.errors import RateLimitExceeded
from slowapi.util import get_remote_address
from sqlalchemy import text
from sqlalchemy.ext.asyncio import AsyncSession
from starlette.requests import Request
from starlette.middleware.cors import CORSMiddleware

from app.config import get_settings
from app.database import engine, get_db
from app.routers import categories_router, customers_router, orders_router, products_router


@asynccontextmanager
async def lifespan(app: FastAPI):
    async with engine.begin() as conn:
        await conn.execute(text('SELECT 1'))
    print('✅ NeonDB connected successfully')
    yield
    await engine.dispose()
    print('🔌 Database connection closed')


settings = get_settings()

app = FastAPI(
    title='Aura Jewellery HQ API',
    version='1.0.0',
    lifespan=lifespan,
    docs_url='/docs',
    redoc_url='/redoc',
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.allowed_origins_list,
    allow_credentials=True,
    allow_methods=['GET', 'POST', 'PATCH', 'DELETE', 'OPTIONS'],
    allow_headers=['*'],
    expose_headers=['X-Total-Count'],
)

limiter = Limiter(key_func=get_remote_address, default_limits=[settings.rate_limit])
app.state.limiter = limiter
app.add_exception_handler(RateLimitExceeded, _rate_limit_exceeded_handler)

app.include_router(categories_router, prefix='/api/v1')
app.include_router(products_router, prefix='/api/v1')
app.include_router(customers_router, prefix='/api/v1')
app.include_router(orders_router, prefix='/api/v1')


@app.get('/health')
@limiter.limit('300/minute')
async def health(request: Request, db: AsyncSession = Depends(get_db)):
    _ = request
    await db.execute(text('SELECT 1'))
    return {'status': 'ok', 'service': 'aura-jewellery-api', 'version': '1.0.0'}


@app.exception_handler(404)
async def not_found(_, __):
    return JSONResponse({'detail': 'Not found'}, status_code=404)


@app.exception_handler(500)
async def server_error(_, __):
    return JSONResponse({'detail': 'Internal server error'}, status_code=500)
