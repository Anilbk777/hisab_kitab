from pydantic import BaseModel, Field, ConfigDict
from backend.models.model import KhataType


class AccountBase(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    account_name: str = Field(..., description="Name of the account")
    account_type: KhataType = Field(
        ..., description="Type of the account", examples=["income", "expense"]
    )


class AccountCreate(AccountBase):
    pass


class AccountUpdate(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    account_name: str | None = Field(
        default=None,
        description="Name of the account"
    )

    account_type: KhataType | None = Field(
        default=None,
        description="Type of the account",
        examples=["income", "expense"]
    )
class AccountResponse(AccountBase):
    id: int
