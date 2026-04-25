from functools import lru_cache
from pathlib import Path

from pydantic import field_validator
from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    database_url: str
    environment: str = 'development'
    allowed_origins: str = 'http://localhost:5173'
    api_key: str = ''
    rate_limit: str = '100/minute'

    model_config = SettingsConfigDict(
        env_file=str(Path(__file__).resolve().parents[1] / '.env'),
        extra='ignore',
    )

    @field_validator('database_url', mode='before')
    @classmethod
    def normalize_database_url(cls, value: str) -> str:
        url = value
        url = url.replace('sslmode=require', 'ssl=require')
        url = url.replace('&channel_binding=require', '')
        url = url.replace('?channel_binding=require', '')
        return url

    @property
    def allowed_origins_list(self) -> list[str]:
        if isinstance(self.allowed_origins, str):
            return [origin.strip() for origin in self.allowed_origins.split(',') if origin.strip()]
        return ['http://localhost:5173']


@lru_cache()
def get_settings() -> Settings:
    return Settings()
