import uuid
from datetime import date, datetime

from pydantic import BaseModel, ConfigDict, EmailStr


class CustomerCreate(BaseModel):
    name: str
    email: EmailStr
    phone: str | None = None
    country: str = 'Unknown'
    signup_date: date | None = None


class CustomerOut(BaseModel):
    id: uuid.UUID
    name: str
    email: EmailStr
    phone: str | None = None
    country: str
    signup_date: date | None = None
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)
