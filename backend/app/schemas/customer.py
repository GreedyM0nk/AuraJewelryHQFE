import uuid
import re
from datetime import date, datetime

import bleach
from pydantic import BaseModel, ConfigDict, EmailStr, field_validator


class CustomerCreate(BaseModel):
    name: str
    email: EmailStr
    phone: str | None = None
    country: str = 'Unknown'
    signup_date: date | None = None

    @field_validator('name')
    @classmethod
    def validate_name(cls, value: str) -> str:
        stripped = value.strip()
        if len(stripped) < 2:
            raise ValueError('Name must be at least 2 characters')
        if len(stripped) > 200:
            raise ValueError('Name must not exceed 200 characters')

        clean = bleach.clean(stripped, tags=[], strip=True).strip()
        if clean != stripped:
            raise ValueError('Name contains invalid characters')
        if len(clean) < 2:
            raise ValueError('Name contains invalid characters')
        return clean

    @field_validator('phone')
    @classmethod
    def validate_phone(cls, value: str | None) -> str | None:
        if value is None:
            return None

        cleaned = value.strip()
        if len(cleaned) > 20:
            raise ValueError('Phone number must not exceed 20 characters')
        if not re.match(r'^[+\d\s\-().]{7,20}$', cleaned):
            raise ValueError('Invalid phone number format')
        return cleaned

    @field_validator('country')
    @classmethod
    def validate_country(cls, value: str) -> str:
        stripped = value.strip()
        if len(stripped) < 2:
            raise ValueError('Country must be at least 2 characters')
        if len(stripped) > 100:
            raise ValueError('Country name too long')
        return stripped


class CustomerLookup(BaseModel):
    email: EmailStr


class CustomerOut(BaseModel):
    id: uuid.UUID
    name: str
    email: EmailStr
    phone: str | None = None
    country: str
    signup_date: date | None = None
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)
