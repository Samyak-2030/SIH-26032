from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.core.config import CORS_ORIGINS
from app.database.init_db import initialize_database
from app.routers import auth, bookings, centres, farmers


def create_app() -> FastAPI:
    application = FastAPI(title="Kisan Setu API")
    application.add_middleware(
        CORSMiddleware,
        allow_origins=CORS_ORIGINS,
        allow_origin_regex=r"https://.*\.vercel\.app",
        allow_credentials=True,
        allow_methods=["GET", "POST", "OPTIONS"],
        allow_headers=["Content-Type", "Authorization"],
    )
    application.include_router(auth.router)
    application.include_router(farmers.router)
    application.include_router(centres.router)
    application.include_router(bookings.router)

    @application.get("/health")
    def health_check():
        return {"status": "ok"}

    @application.get("/")
    def root():
        return {"service": "Kisan Setu API", "status": "ok"}

    return application


initialize_database()
app = create_app()
