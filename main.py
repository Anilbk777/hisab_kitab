from fastapi import FastAPI
from contextlib import asynccontextmanager
from backend.core.database import engine, Base
from backend.api.v1 import users_router, accounts_router


@asynccontextmanager
async def lifespan(app: FastAPI):

    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)

    yield

    await engine.dispose()


app = FastAPI(
    title="Hisab Kitab",
    description="Personal Finance Ledger App",
    version="1.0.0",
    lifespan=lifespan,
)
app.include_router(users_router.router)
app.include_router(accounts_router.router)


@app.get("/")
async def root():
    return {
        "message": "Welcome to Hisab Kitab API",
        "status": "running",
        "docs": "/docs",
    }


@app.get("/health")
async def health():
    return {"status": "healthy"}
