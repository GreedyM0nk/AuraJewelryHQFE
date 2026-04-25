import uuid
from decimal import Decimal


async def test_create_order_success(client, seeded_data):
    payload = {
        'customer_id': str(seeded_data['customer'].id),
        'sales_channel': 'website',
        'items': [
            {
                'product_id': str(seeded_data['product'].id),
                'quantity': 2,
                'unit_price': '4500.00',
            }
        ],
    }
    res = await client.post('/api/v1/orders', json=payload)
    assert res.status_code == 201
    data = res.json()
    assert Decimal(data['total_amount']) == Decimal('9000.00')


async def test_create_order_insufficient_stock(client, seeded_data):
    payload = {
        'customer_id': str(seeded_data['customer'].id),
        'sales_channel': 'website',
        'items': [
            {
                'product_id': str(seeded_data['product'].id),
                'quantity': 999,
                'unit_price': '4500.00',
            }
        ],
    }
    res = await client.post('/api/v1/orders', json=payload)
    assert res.status_code == 422


async def test_create_order_product_not_found(client, seeded_data):
    payload = {
        'customer_id': str(seeded_data['customer'].id),
        'sales_channel': 'website',
        'items': [
            {
                'product_id': str(uuid.uuid4()),
                'quantity': 1,
                'unit_price': '100.00',
            }
        ],
    }
    res = await client.post('/api/v1/orders', json=payload)
    assert res.status_code == 404
