from fastapi import Depends, Header, HTTPException

from app.config import Settings, get_settings


async def require_admin(
    x_api_key: str | None = Header(default=None),
    settings: Settings = Depends(get_settings),
):
    if not settings.api_key or x_api_key != settings.api_key:
        raise HTTPException(status_code=401, detail='Invalid or missing API key')
