import uuid


async def test_health_check(client):
    res = await client.get('/health')
    assert res.status_code == 200
    assert res.json()['status'] == 'ok'


async def test_get_products_empty(client):
    res = await client.get('/api/v1/products')
    assert res.status_code == 200
    assert isinstance(res.json(), list)


async def test_create_product_unauthorized(client):
    payload = {
        'name': 'Unauthorized Product',
        'description': 'test',
        'price': '10.00',
        'category_id': None,
        'image_url': None,
        'stock_quantity': 1,
        'sku': 'AJ-UNAUTH',
    }
    res = await client.post('/api/v1/products', json=payload)
    assert res.status_code == 401


async def test_get_products_after_seed(client, seeded_data):
    res = await client.get('/api/v1/products')
    assert res.status_code == 200
    data = res.json()
    assert len(data) >= 1


async def test_filter_by_category(client, seeded_data):
    cid = str(seeded_data['category'].id)
    res = await client.get('/api/v1/products', params={'category_id': cid})
    assert res.status_code == 200
    for item in res.json():
        assert item['category_id'] == cid


async def test_get_product_not_found(client):
    res = await client.get(f"/api/v1/products/{uuid.uuid4()}")
    assert res.status_code == 404
