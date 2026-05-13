from fastapi import APIRouter, Depends, status
from sqlalchemy.ext.asyncio import AsyncSession
from typing import List

from backend.core.database import get_db
from backend.services.account_service import AccountService
from backend.schemas.account import AccountCreate, AccountUpdate, AccountResponse
from backend.core.logging import get_logger
from backend.middlewares.auth_middleware import CurrentUser

router = APIRouter(prefix="/api/accounts", tags=["Accounts"])


@router.post("/", response_model=AccountResponse, status_code=status.HTTP_201_CREATED)
async def create_account(
    account_in: AccountCreate,
    current_user: CurrentUser,
    db: AsyncSession = Depends(get_db),
    logger=Depends(get_logger),
):
    user_id = current_user.id
    logger.info("Router: Creating account request for user_id: {}", user_id)
    account_service = AccountService(db)
    account = await account_service.create_account(account_in, user_id=user_id)
    return account


@router.get("/", response_model=List[AccountResponse])
async def get_all_accounts(
    current_user: CurrentUser,
    db: AsyncSession = Depends(get_db),
    logger=Depends(get_logger),
    skip: int = 0,
    limit: int = 50,
):
    user_id = current_user.id
    logger.debug("Router: Fetching all accounts for user_id: {}", user_id)
    account_service = AccountService(db)
    return await account_service.get_all_accounts(
        user_id=user_id, skip=skip, limit=limit
    )


@router.get("/{account_id}", response_model=AccountResponse)
async def get_account(
    account_id: int,
    current_user: CurrentUser,
    db: AsyncSession = Depends(get_db),
    logger=Depends(get_logger),
):
    user_id = current_user.id
    logger.info("Router: Fetching account ID: {}", account_id)
    account_service = AccountService(db)
    return await account_service.get_account_by_id(account_id, user_id)


@router.patch("/{account_id}", response_model=AccountResponse)
async def update_account(
    account_id: int,
    current_user: CurrentUser,
    account_update: AccountUpdate,
    db: AsyncSession = Depends(get_db),
    logger=Depends(get_logger),
):
    user_id = current_user.id
    logger.info("Router: Updating account ID: {}", account_id)
    account_service = AccountService(db)
    return await account_service.update_account(account_id, user_id, account_update)


@router.delete("/{account_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_account(
    account_id: int,
    current_user: CurrentUser,
    db: AsyncSession = Depends(get_db),
    logger=Depends(get_logger),
):
    user_id = current_user.id
    logger.info("Router: Deleting account ID: {}", account_id)
    account_service = AccountService(db)
    await account_service.delete_account(account_id, user_id)
    return None
