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
    allow_headers=["Content-Type", "Authorization"],
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

@app.get("/api/centres")
def get_centres():
    with sqlite3.connect(DATABASE_PATH) as connection:
        connection.row_factory = sqlite3.Row

        centres = connection.execute(
            """
            SELECT id, name, state, district, location, capacity, status
            FROM centres
            WHERE status = 'Active'
            ORDER BY name
            """
        ).fetchall()

    return {
        "centres": [dict(centre) for centre in centres]
    }

class BookingCreate(BaseModel):
    centre_id: int
    crop: str
    booking_date: str
    time_slot: str


@app.post("/api/bookings")
def create_booking(
    booking: BookingCreate,
    farmer=Depends(get_current_farmer)
):
    booking_id = f"BK-{datetime.now().strftime('%Y%m%d%H%M%S')}-{farmer['id']}"

    with sqlite3.connect(DATABASE_PATH) as connection:
        try:
            # Check that the selected centre exists and is active
            centre = connection.execute(
                """
                SELECT id
                FROM centres
                WHERE id = ? AND status = 'Active'
                """,
                (booking.centre_id,)
            ).fetchone()

            if centre is None:
                raise HTTPException(
                    status_code=404,
                    detail="Selected procurement centre is not available."
                )

            # Create the booking
            cursor = connection.execute(
                """
                INSERT INTO bookings (
                    booking_id,
                    farmer_id,
                    centre_id,
                    crop,
                    booking_date,
                    time_slot,
                    status
                )
                VALUES (?, ?, ?, ?, ?, ?, ?)
                """,
                (
                    booking_id,
                    farmer["id"],
                    booking.centre_id,
                    booking.crop,
                    booking.booking_date,
                    booking.time_slot,
                    "Confirmed",
                ),
            )

            database_booking_id = cursor.lastrowid

            # Find the next queue position for this centre
            queue_count = connection.execute(
                """
                SELECT COUNT(*)
                FROM queue_entries
                WHERE centre_id = ?
                AND status IN ('Waiting', 'Serving')
                """,
                (booking.centre_id,)
            ).fetchone()[0]

            queue_position = queue_count + 1
            token_number = queue_position
            estimated_wait = queue_position * 10

            # Create queue entry
            connection.execute(
                """
                INSERT INTO queue_entries (
                    booking_id,
                    farmer_id,
                    centre_id,
                    token_number,
                    queue_position,
                    estimated_wait_minutes,
                    status
                )
                VALUES (?, ?, ?, ?, ?, ?, ?)
                """,
                (
                    database_booking_id,
                    farmer["id"],
                    booking.centre_id,
                    token_number,
                    queue_position,
                    estimated_wait,
                    "Waiting",
                ),
            )

            connection.commit()

        except sqlite3.IntegrityError as error:
            raise HTTPException(
                status_code=400,
                detail="Unable to create booking."
            ) from error

    return {
        "message": "Booking created successfully.",
        "booking": {
            "bookingId": booking_id,
            "farmerId": farmer["id"],
            "centreId": booking.centre_id,
            "crop": booking.crop,
            "bookingDate": booking.booking_date,
            "timeSlot": booking.time_slot,
            "status": "Confirmed",
            "queueToken": token_number,
            "queuePosition": queue_position,
            "estimatedWaitMinutes": estimated_wait,
        },
    }