from sqlalchemy.ext.asyncio import AsyncSession, async_sessionmaker, create_async_engine
from sqlalchemy.orm import DeclarativeBase
from typing import AsyncGenerator


# ====================== DATABASE CONFIG ======================
DATABASE_URL = "sqlite+aiosqlite:///./hisab_kitab.db"

engine = create_async_engine(
    DATABASE_URL,
    future=True,
)

AsyncSessionLocal = async_sessionmaker(
    bind=engine,
    expire_on_commit=False,
    class_=AsyncSession,
)


async def get_db() -> AsyncGenerator[AsyncSession, None]:
    async with AsyncSessionLocal() as session:
        yield session


# ====================== BASE ======================
class Base(DeclarativeBase):
    pass