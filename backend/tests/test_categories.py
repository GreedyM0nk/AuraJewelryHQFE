import uuid


async def test_get_categories(client, seeded_data):
    res = await client.get('/api/v1/categories')
    assert res.status_code == 200
    assert isinstance(res.json(), list)
    assert len(res.json()) >= 1


async def test_get_category_not_found(client):
    res = await client.get(f"/api/v1/categories/{uuid.uuid4()}")
    assert res.status_code == 404
