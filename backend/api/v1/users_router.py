from fastapi import APIRouter, Depends, status
from sqlalchemy.ext.asyncio import AsyncSession
from typing import List, Annotated

from backend.core.database import get_db
from backend.services.user_service import UserService
from backend.schemas.user_schema import  UserResponse
from backend.core.logging import get_logger

log = get_logger()

router = APIRouter(
    prefix="/api/users",
    tags=["Users"],
)




@router.get("/", response_model=List[UserResponse], status_code=status.HTTP_200_OK)
async def get_all_users(db: Annotated[AsyncSession, Depends(get_db)]):
    """Get all users"""
    log.debug("Router: Fetching all users")
    user_service = UserService(db)
    return await user_service.get_all_users()




@router.get("/{user_id}", response_model=UserResponse, status_code=status.HTTP_200_OK)
async def get_user(
    user_id: int, 
    db: Annotated[AsyncSession, Depends(get_db)]
):
    """Get user by ID"""
    log.info("Router: Fetching user ID: {}", user_id)
    user_service = UserService(db)
    return await user_service.get_user_by_id(user_id)


@router.get(
    "/by-number/{number}", 
    response_model=UserResponse, 
    status_code=status.HTTP_200_OK
)
async def get_user_by_number(
    number: str, 
    db: Annotated[AsyncSession, Depends(get_db)]
):
    """Get user by phone number"""
    log.info("Router: Fetching user by number: {}", number)
    user_service = UserService(db)
    return await user_service.get_user_by_number(number)


@router.delete(
    "/{user_id}", 
    status_code=status.HTTP_204_NO_CONTENT, 
    summary="Delete User"
)
async def delete_user(
    user_id: int, 
    db: Annotated[AsyncSession, Depends(get_db)]
):
    """Delete a user"""
    log.info("Router: Deleting user ID: {}", user_id)
    user_service = UserService(db)
    await user_service.delete_user(user_id)
    return None

