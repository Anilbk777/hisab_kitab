from pydantic import BaseModel, Field, ConfigDict
from typing import Annotated, Optional
from datetime import date, datetime
from decimal import Decimal


class EntryBase(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    entry_date: date = Field(..., examples=["2025-05-12"])
    description: Optional[Annotated[str, Field(max_length=255, examples=["Sold wooden table to Ram"])]] = None
    amount: Annotated[Decimal, Field(
        gt=0, 
        le=10000000, 
        examples=[15000.50],
        description="Amount in NPR"
    )]


class EntryCreate(EntryBase):
    account_id: int = Field(..., gt=0, description="ID of the Account/Khata")


class EntryUpdate(BaseModel):
    """PATCH style - only update fields that are provided"""
    model_config = ConfigDict(from_attributes=True)
    entry_date: Optional[date] = None
    description: Optional[Annotated[str, Field(max_length=255)]] = None
    amount: Optional[Annotated[Decimal, Field(gt=0, le=10000000)]] = None


class EntryResponse(EntryBase):

    id: int
    account_id: int
    created_at: datetime
