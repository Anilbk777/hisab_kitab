from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from typing import List, Annotated

from backend.core.database import get_db
from backend.repositories.user_repo import UserRepository
from backend.schemas.user_schema import UserCreate, UserResponse, UserLogin
from backend.core.logging import get_logger

log = get_logger()

router = APIRouter(
    prefix="/users",
    tags=["Users"],
)


@router.post(
    "/",
    response_model=UserResponse,
    status_code=status.HTTP_201_CREATED,
    summary="Register New User",
    description="Create a new user account",
)
async def create_user(
    user_in: UserCreate, db: Annotated[AsyncSession, Depends(get_db)]
):
    """Register a new user"""
    try:
        user_repo = UserRepository(db)
        return await user_repo.create(user_in)
    except HTTPException:
        raise
    except Exception as e:
        log.error(f"Unexpected error: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Unexpected error: {str(e)}",
        )


@router.get("/", response_model=List[UserResponse], status_code=status.HTTP_200_OK)
async def get_all_users(db: Annotated[AsyncSession, Depends(get_db)]):
    """Get all users"""
    try:
        user_repo = UserRepository(db)
        return await user_repo.get_all()
    except HTTPException:
        raise
    except Exception as e:
        log.error(f"Unexpected error: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Unexpected error: {str(e)}",
        )


@router.post(
    "/login",
    response_model=UserResponse,
    status_code=status.HTTP_200_OK,
    summary="User Login",
)
async def login_user(
    user_login: UserLogin, db: Annotated[AsyncSession, Depends(get_db)]
):
    """Login user with phone number and password"""
    try:
        user_repo = UserRepository(db)

        user = await user_repo.get_by_number(user_login.number)

        if not user:
            raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid phone number or password",
        )

    # Temporary plain password check (for development only)
        if user.hashed_password != user_login.password:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Invalid phone number or password",
            )

        return user
    except HTTPException:
        raise
    except Exception as e:
        log.error(f"Unexpected error: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Unexpected error: {str(e)}",
        )


@router.get("/{user_id}", response_model=UserResponse, status_code=status.HTTP_200_OK)
async def get_user(user_id: int, db: Annotated[AsyncSession, Depends(get_db)]):
    """Get user by ID"""
    try:
        user_repo = UserRepository(db)
        user = await user_repo.get_by_id(user_id)

        if not user:
            raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail="User not found"
        )
        return user
    except HTTPException:
        raise
    except Exception as e:
        log.error(f"Unexpected error: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Unexpected error: {str(e)}",
        )


@router.get(
    "/by-number/{number}", response_model=UserResponse, status_code=status.HTTP_200_OK
)
async def get_user_by_number(number: str, db: Annotated[AsyncSession, Depends(get_db)]):
    """Get user by phone number"""
    try:
        user_repo = UserRepository(db)
        user = await user_repo.get_by_number(number)

        if not user:
            raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail="User not found"
        )
        return user
    except HTTPException:
        raise
    except Exception as e:
        log.error(f"Unexpected error: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Unexpected error: {str(e)}",
        )


@router.delete(
    "/{user_id}", status_code=status.HTTP_204_NO_CONTENT, summary="Delete User"
)
async def delete_user(user_id: int, db: Annotated[AsyncSession, Depends(get_db)]):
    """Delete a user"""
    try:
        user_repo = UserRepository(db)
        deleted = await user_repo.delete(user_id)

        if not deleted:
            raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail="User not found"
        )
    except HTTPException:
        raise
    except Exception as e:
        log.error(f"Unexpected error: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Unexpected error: {str(e)}",
        )
