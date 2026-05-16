from fastapi import FastAPI, Request
from contextlib import asynccontextmanager
from backend.core.database import engine, Base
from backend.api.v1 import users_router, accounts_router, entries_router, auth_router
from backend.core.exceptions import AppError
from backend.core.logging import log
from fastapi.responses import JSONResponse
from fastapi.middleware.cors import CORSMiddleware


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

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.exception_handler(AppError)
async def app_error_handler(request: Request, exc: AppError):
    log.error("AppError: {} | Status: {}", exc.message, exc.status_code)
    return JSONResponse(
        status_code=exc.status_code,
        content={
            "success": False,
            "message": exc.message,
            "detail": exc.detail,
        },
    )


@app.exception_handler(Exception)
async def generic_exception_handler(request: Request, exc: Exception):
    log.exception("Unhandled Exception occurred")
    return JSONResponse(
        status_code=500,
        content={
            "success": False,
            "message": "An unexpected error occurred.",
            "detail": str(exc),
        },
    )


app.include_router(auth_router.router)
app.include_router(users_router.router)
app.include_router(accounts_router.router)
app.include_router(entries_router.router)


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
