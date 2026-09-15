import os
from pathlib import Path

from dotenv import load_dotenv

BACKEND_DIR = Path(__file__).resolve().parents[2]
load_dotenv(BACKEND_DIR / ".env")


def _split_origins(value: str | None) -> list[str]:
    return [origin.strip().rstrip("/") for origin in (value or "").split(",") if origin.strip()]


JWT_SECRET_KEY = os.getenv(
    "JWT_SECRET_KEY", "change-this-development-secret-key-32-bytes"
)
JWT_ALGORITHM = "HS256"
JWT_EXPIRE_MINUTES = int(os.getenv("JWT_EXPIRE_MINUTES", "60"))
DATABASE_URL = os.getenv("DATABASE_URL")
SCHEMA_PATH = BACKEND_DIR / "database" / "schema.sql"

CORS_ORIGINS = _split_origins(os.getenv("CORS_ORIGINS"))
VERCEL_FRONTEND_URL = os.getenv("VERCEL_FRONTEND_URL")
if VERCEL_FRONTEND_URL:
    CORS_ORIGINS.append(VERCEL_FRONTEND_URL.rstrip("/"))

CORS_ORIGINS.extend(
    origin
    for origin in (
        "http://localhost:5500",
        "http://127.0.0.1:5500",
        "http://localhost:5501",
        "http://127.0.0.1:5501",
        "http://localhost:3000",
        "http://127.0.0.1:3000",
    )
    if origin not in CORS_ORIGINS
)
