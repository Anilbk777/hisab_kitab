from pydantic import BaseModel, Field, field_validator, ConfigDict
from typing import Annotated, Optional
import re
from datetime import datetime


class UserBase(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    user_name: Annotated[
        str, Field(min_length=2, max_length=100, examples=["Ramesh Bahadur"])
    ]
    number: Annotated[str, Field(min_length=10, max_length=15, examples=["9812345678"])]


class UserCreate(UserBase):
    model_config = ConfigDict(from_attributes=True)
    password: Annotated[
        str, Field(min_length=8, max_length=128, examples=["MySecurePass@123"])
    ]

    @field_validator("number")
    @classmethod
    def validate_nepali_number(cls, v: str) -> str:
        v = v.strip().replace("+977", "").replace(" ", "")
        if not re.match(r"^\d{10}$", v):
            raise ValueError("Phone number must be exactly 10 digits")
        return v

    @field_validator("password")
    @classmethod
    def validate_password(cls, v: str) -> str:
        if len(v) < 8:
            raise ValueError("Password must be at least 8 characters long")

        # Optional: Add some basic strength requirements
        if not re.search(r"[A-Za-z]", v):
            raise ValueError("Password must contain at least one letter")
        if not re.search(r"\d", v):
            raise ValueError("Password must contain at least one number")
        if not re.search(r"[@$!%*?&]", v):
            raise ValueError("Password must contain at least one special character")

        return v


class UserUpdate(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    user_name: Optional[str] = Field(
        default=None, min_length=2, max_length=100, examples=["Ramesh Bahadur"]
    )
    number: Optional[str] = Field(
        default=None, min_length=10, max_length=15, examples=["9812345678"]
    )
    password: Optional[str] = Field(
        default=None, min_length=8, max_length=128, examples=["MySecurePass@123"]
    )

    @field_validator("number")
    @classmethod
    def validate_nepali_number(cls, v: str) -> str:
        if v is None:
            return None
        v = v.strip().replace("+977", "").replace(" ", "")
        if not re.match(r"^\d{10}$", v):
            raise ValueError("Phone number must be exactly 10 digits")
        return v

    @field_validator("password")
    @classmethod
    def validate_password(cls, v: str) -> str:
        v = v.strip()
        if not v:
            return None 
        if len(v) < 8:
            raise ValueError("Password must be at least 8 characters long")

        # Optional: Add some basic strength requirements
        if not re.search(r"[A-Za-z]", v):
            raise ValueError("Password must contain at least one letter")
        if not re.search(r"\d", v):
            raise ValueError("Password must contain at least one number")
        if not re.search(r"[@$!%*?&]", v):
            raise ValueError("Password must contain at least one special character")

        return v


class UserLogin(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    number: str = Field(..., examples=["9812345678"])
    password: str = Field(..., min_length=8, examples=["MySecurePass@123"])


class UserResponse(UserBase):
    model_config = ConfigDict(from_attributes=True)
    id: int
    number: str
    created_at: datetime
