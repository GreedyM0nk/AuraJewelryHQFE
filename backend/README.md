# Aura Jewellery HQ Backend

FastAPI backend for Aura Jewellery HQ with NeonDB support.

## Stack

- Python 3.11+
- FastAPI
- SQLAlchemy 2.0 async + asyncpg
- Alembic
- Pydantic v2
- slowapi
- pytest + httpx

## Project Layout

- `app/` API app, models, schemas, routers, services
- `alembic/` migration environment and versions
- `scripts/seed.py` idempotent NeonDB seed script
- `tests/` API tests

## Setup

1. Create and activate virtual environment
2. Install dependencies:

```bash
pip install -r requirements.txt
```

3. Create env file:

```bash
cp .env.example .env
```

4. Set real `DATABASE_URL` and `API_KEY` in `.env`.

## Migrations

```bash
alembic upgrade head
```

If DB already has the schema:

```bash
alembic stamp head
```

## Seed Data

```bash
python -m scripts.seed
```

## Run

```bash
uvicorn app.main:app --reload --port 8000
```

## Test

```bash
pytest tests/ -v
```
