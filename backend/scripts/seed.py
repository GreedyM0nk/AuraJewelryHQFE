"""
Idempotent seed script for Aura Jewellery HQ.

NOTE: This script uses ON CONFLICT DO NOTHING to safely insert seed data.
The DataAnalystProject repo also writes to these tables daily via its own 
GitHub Actions cron job. Do NOT drop/truncate tables here — only insert 
missing seeds. Both data sources (seed + cron) coexist in the same DB.
"""

import asyncio
import os
import uuid
from decimal import Decimal

import asyncpg
from dotenv import load_dotenv

load_dotenv()

CATEGORY_IDS = {
    'cat-001': uuid.UUID('11111111-1111-1111-1111-111111111001'),
    'cat-002': uuid.UUID('11111111-1111-1111-1111-111111111002'),
    'cat-003': uuid.UUID('11111111-1111-1111-1111-111111111003'),
    'cat-004': uuid.UUID('11111111-1111-1111-1111-111111111004'),
}

PRODUCT_IDS = {
    'AJ-001': uuid.UUID('22222222-2222-2222-2222-222222220001'),
    'AJ-002': uuid.UUID('22222222-2222-2222-2222-222222220002'),
    'AJ-003': uuid.UUID('22222222-2222-2222-2222-222222220003'),
    'AJ-004': uuid.UUID('22222222-2222-2222-2222-222222220004'),
    'AJ-005': uuid.UUID('22222222-2222-2222-2222-222222220005'),
    'AJ-006': uuid.UUID('22222222-2222-2222-2222-222222220006'),
    'AJ-007': uuid.UUID('22222222-2222-2222-2222-222222220007'),
    'AJ-008': uuid.UUID('22222222-2222-2222-2222-222222220008'),
    'AJ-009': uuid.UUID('22222222-2222-2222-2222-222222220009'),
    'AJ-010': uuid.UUID('22222222-2222-2222-2222-222222220010'),
    'AJ-011': uuid.UUID('22222222-2222-2222-2222-222222220011'),
    'AJ-012': uuid.UUID('22222222-2222-2222-2222-222222220012'),
}

CATEGORIES = [
    (
        CATEGORY_IDS['cat-001'],
        'Charms',
        'Delicate handcrafted gold charms for every occasion.',
        'https://images.unsplash.com/photo-1617038220319-276d3cfab638?w=600&q=80',
    ),
    (
        CATEGORY_IDS['cat-002'],
        'Bracelets',
        'Elegant gold and silver bracelets crafted in Kolkata.',
        'https://images.unsplash.com/photo-1611591437281-460bfbe1220a?w=600&q=80',
    ),
    (
        CATEGORY_IDS['cat-003'],
        'Necklaces',
        'Statement necklaces for the discerning collector.',
        'https://images.unsplash.com/photo-1599643477877-530eb83abc8e?w=600&q=80',
    ),
    (
        CATEGORY_IDS['cat-004'],
        'Rings',
        'Heritage rings in fine gold and gemstones.',
        'https://images.unsplash.com/photo-1605100804763-247f67b3557e?w=600&q=80',
    ),
]

PRODUCTS = [
    (PRODUCT_IDS['AJ-001'], 'Golden Lotus Charm', 'A delicate 22k gold lotus charm, handcrafted in Kolkata.', Decimal('4500'), CATEGORY_IDS['cat-001'], 'https://images.unsplash.com/photo-1617038220319-276d3cfab638?w=600&q=80', 10, 'AJ-001'),
    (PRODUCT_IDS['AJ-002'], 'Heritage Bangle', 'Intricate filigree work in sterling silver with gold plating.', Decimal('8200'), CATEGORY_IDS['cat-002'], 'https://images.unsplash.com/photo-1611591437281-460bfbe1220a?w=600&q=80', 3, 'AJ-002'),
    (PRODUCT_IDS['AJ-003'], 'Pearl Drop Charm', 'Freshwater pearl suspended in a gold teardrop setting.', Decimal('3800'), CATEGORY_IDS['cat-001'], 'https://images.unsplash.com/photo-1598560917505-59a3ad559071?w=600&q=80', 15, 'AJ-003'),
    (PRODUCT_IDS['AJ-004'], 'Celestial Chain Bracelet', 'Layered gold chains with celestial moon and star accents.', Decimal('6900'), CATEGORY_IDS['cat-002'], 'https://images.unsplash.com/photo-1573408301185-9519f94b4e15?w=600&q=80', 2, 'AJ-004'),
    (PRODUCT_IDS['AJ-005'], 'Hamsa Hand Charm', 'Traditional Hamsa hand in 18k yellow gold with sapphire eye.', Decimal('5600'), CATEGORY_IDS['cat-001'], 'https://images.unsplash.com/photo-1599643477877-530eb83abc8e?w=600&q=80', 8, 'AJ-005'),
    (PRODUCT_IDS['AJ-006'], 'Twisted Rope Bracelet', 'Bold twisted rope design in two-tone gold, adjustable closure.', Decimal('9400'), CATEGORY_IDS['cat-002'], 'https://images.unsplash.com/photo-1605100804763-247f67b3557e?w=600&q=80', 6, 'AJ-006'),
    (PRODUCT_IDS['AJ-007'], 'Floral Mandala Charm', 'Intricate mandala motif in oxidised gold finish.', Decimal('4200'), CATEGORY_IDS['cat-001'], 'https://images.unsplash.com/photo-1630019852942-f89202989a59?w=600&q=80', 12, 'AJ-007'),
    (PRODUCT_IDS['AJ-008'], 'Diamond Cut Tennis Bracelet', 'Classic tennis bracelet with diamond-cut links in 22k gold.', Decimal('15800'), CATEGORY_IDS['cat-002'], 'https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?w=600&q=80', 4, 'AJ-008'),
    (PRODUCT_IDS['AJ-009'], 'Temple Coin Necklace', '22k gold coin pendant on a fine rope chain, inspired by temple motifs.', Decimal('12500'), CATEGORY_IDS['cat-003'], 'https://images.unsplash.com/photo-1599643477877-530eb83abc8e?w=600&q=80', 5, 'AJ-009'),
    (PRODUCT_IDS['AJ-010'], 'Layered Kundan Necklace', 'Three-strand kundan set necklace in antique gold finish.', Decimal('18900'), CATEGORY_IDS['cat-003'], 'https://images.unsplash.com/photo-1611591437281-460bfbe1220a?w=600&q=80', 3, 'AJ-010'),
    (PRODUCT_IDS['AJ-011'], 'Floral Signet Ring', 'Handcrafted floral signet in 18k yellow gold, adjustable band.', Decimal('7200'), CATEGORY_IDS['cat-004'], 'https://images.unsplash.com/photo-1605100804763-247f67b3557e?w=600&q=80', 8, 'AJ-011'),
    (PRODUCT_IDS['AJ-012'], 'Meenakari Statement Ring', 'Bold meenakari enamel ring with peacock motif in 22k gold.', Decimal('9800'), CATEGORY_IDS['cat-004'], 'https://images.unsplash.com/photo-1573408301185-9519f94b4e15?w=600&q=80', 6, 'AJ-012'),
]


def normalize_dsn(dsn: str) -> str:
    # asyncpg expects postgres:// or postgresql:// DSN
    return dsn.replace('postgresql+asyncpg://', 'postgresql://', 1)


# Stock replenishment — bumps stock on critically low items back to base levels
# Safe to run repeatedly (uses UPDATE WHERE stock < threshold, not INSERT)
STOCK_REPLENISHMENT = [
    ('AJ-001', 10), ('AJ-002', 8),  ('AJ-003', 15),
    ('AJ-004', 6),  ('AJ-005', 10), ('AJ-006', 8),
    ('AJ-007', 12), ('AJ-008', 6),  ('AJ-009', 8),
    ('AJ-010', 5),  ('AJ-011', 8),  ('AJ-012', 8),
]


async def replenish_stock(conn: asyncpg.Connection) -> None:
    """Only replenish if stock has dropped below half the base level."""
    replenished = 0
    for sku, base_stock in STOCK_REPLENISHMENT:
        threshold = base_stock // 2
        result = await conn.execute(
            '''
            UPDATE products SET stock_quantity = $1
            WHERE sku = $2 AND stock_quantity < $3
            ''',
            base_stock, sku, threshold,
        )
        if result.endswith('1'):
            replenished += 1
    print(f'✅ Stock replenishment complete ({replenished} products restocked)')


async def seed() -> None:
    dsn = os.getenv('DATABASE_URL')
    if not dsn:
        raise RuntimeError('DATABASE_URL is required')

    conn = await asyncpg.connect(normalize_dsn(dsn))
    try:
        categories_count = 0
        products_count = 0

        for row in CATEGORIES:
            result = await conn.execute(
                '''
                INSERT INTO categories (id, name, description, image_url)
                VALUES ($1, $2, $3, $4)
                ON CONFLICT (id) DO NOTHING
                ''',
                *row,
            )
            if result.endswith('1'):
                categories_count += 1

        for row in PRODUCTS:
            result = await conn.execute(
                '''
                INSERT INTO products (
                    id, name, description, price, category_id, image_url, stock_quantity, sku
                )
                VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
                ON CONFLICT (id) DO NOTHING
                ''',
                *row,
            )
            if result.endswith('1'):
                products_count += 1

        print(f'✅ Seeded {categories_count} categories, {products_count} products')
        await replenish_stock(conn)
    finally:
        await conn.close()


if __name__ == '__main__':
    asyncio.run(seed())
