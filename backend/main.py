import os
import sqlite3
from datetime import datetime, timedelta, timezone
from pathlib import Path

import jwt
from fastapi import Depends, FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.security import HTTPAuthorizationCredentials, HTTPBearer
from pydantic import BaseModel
from pwdlib import PasswordHash

app = FastAPI()
DATABASE_PATH = Path(__file__).with_name("farmers.db")
SCHEMA_PATH = Path(__file__).parent / "database" / "schema.sql"
JWT_SECRET_KEY = os.getenv(
    "JWT_SECRET_KEY", "change-this-development-secret-key-32-bytes"
)
JWT_ALGORITHM = "HS256"
JWT_EXPIRE_MINUTES = 60
password_hash = PasswordHash.recommended()
bearer_scheme = HTTPBearer()

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5500",
        "http://127.0.0.1:5500",
        "http://localhost:3000",
        "http://127.0.0.1:3000",
    ],
    allow_credentials=True,
    allow_methods=["GET", "POST", "OPTIONS"],
    allow_headers=["Content-Type"],
)

class FarmerRegister(BaseModel):

    fullName:str
    mobile: str
    email : str | None=None
    state:str
    district:str
    village:str
    landArea:float
    crop:str
    password:str


class FarmerLogin(BaseModel):
    identifier: str
    password: str


def initialize_database():
    with sqlite3.connect(DATABASE_PATH) as connection:
        connection.executescript(SCHEMA_PATH.read_text(encoding="utf-8"))


def hash_password(password: str) -> str:
    return password_hash.hash(password)


def create_access_token(farmer_id: int) -> str:
    expires_at = datetime.now(timezone.utc) + timedelta(minutes=JWT_EXPIRE_MINUTES)
    return jwt.encode(
        {"sub": str(farmer_id), "exp": expires_at},
        JWT_SECRET_KEY,
        algorithm=JWT_ALGORITHM,
    )


def get_current_farmer(
    credentials: HTTPAuthorizationCredentials = Depends(bearer_scheme),
):
    try:
        payload = jwt.decode(
            credentials.credentials,
            JWT_SECRET_KEY,
            algorithms=[JWT_ALGORITHM],
        )
        farmer_id = int(payload["sub"])
    except (jwt.InvalidTokenError, KeyError, TypeError, ValueError) as error:
        raise HTTPException(status_code=401, detail="Invalid or expired token.") from error

    with sqlite3.connect(DATABASE_PATH) as connection:
        connection.row_factory = sqlite3.Row
        farmer = connection.execute(
            """
            SELECT id, full_name, mobile, email, state, district, village,
                   land_area, crop, created_at
            FROM farmers
            WHERE id = ?
            """,
            (farmer_id,),
        ).fetchone()

    if farmer is None:
        raise HTTPException(status_code=401, detail="Farmer account not found.")
    return farmer


initialize_database()


@app.post('/api/farmers/register')

def register_farmer(farmer:FarmerRegister):
    try:
        with sqlite3.connect(DATABASE_PATH) as connection:
            cursor = connection.execute(
                """
                INSERT INTO farmers (
                    full_name, mobile, email, state, district, village,
                    land_area, crop, password_hash
                ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
                """,
                (
                    farmer.fullName,
                    farmer.mobile,
                    farmer.email,
                    farmer.state,
                    farmer.district,
                    farmer.village,
                    farmer.landArea,
                    farmer.crop,
                    hash_password(farmer.password),
                ),
            )
            farmer_id = cursor.lastrowid
    except sqlite3.IntegrityError as error:
        if "mobile" in str(error).lower():
            raise HTTPException(
                status_code=409,
                detail="A farmer with this mobile number already exists.",
            ) from error
        raise

    return{
        "message":"farmer registered successfully",
        "farmer": {
            "id": farmer_id,
            "fullName": farmer.fullName,
            "mobile": farmer.mobile,
            "email": farmer.email,
            "state": farmer.state,
            "district": farmer.district,
            "village": farmer.village,
            "landArea": farmer.landArea,
            "crop": farmer.crop,
        }
    }


@app.post("/api/auth/login")
def login_farmer(login: FarmerLogin):
    with sqlite3.connect(DATABASE_PATH) as connection:
        connection.row_factory = sqlite3.Row
        farmer = connection.execute(
            """
            SELECT id, full_name, mobile, email, password_hash
            FROM farmers
            WHERE mobile = ? OR lower(email) = lower(?)
            """,
            (login.identifier.strip(), login.identifier.strip()),
        ).fetchone()

    if farmer is None or not password_hash.verify(login.password, farmer["password_hash"]):
        raise HTTPException(status_code=401, detail="Invalid email/mobile or password.")

    return {
        "message": "login successful",
        "access_token": create_access_token(farmer["id"]),
        "token_type": "bearer",
        "farmer": {
            "id": farmer["id"],
            "fullName": farmer["full_name"],
            "mobile": farmer["mobile"],
            "email": farmer["email"],
        },
    }


@app.get("/api/farmers/me")
def read_current_farmer(farmer=Depends(get_current_farmer)):
    return {
        "id": farmer["id"],
        "fullName": farmer["full_name"],
        "mobile": farmer["mobile"],
        "email": farmer["email"],
        "state": farmer["state"],
        "district": farmer["district"],
        "village": farmer["village"],
        "landArea": farmer["land_area"],
        "crop": farmer["crop"],
        "createdAt": farmer["created_at"],
    }