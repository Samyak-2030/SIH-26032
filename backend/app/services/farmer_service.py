import sqlite3

from fastapi import HTTPException

from app.core.security import hash_password, verify_password
from app.database.session import get_connection
from app.schemas.farmer import FarmerLogin, FarmerRegister


def register_farmer(farmer: FarmerRegister) -> dict:
    normalized_mobile = farmer.mobile.strip()
    normalized_email = farmer.email.strip().lower() if farmer.email else None
    try:
        with get_connection() as connection:
            cursor = connection.execute(
                """
                INSERT INTO farmers (
                    full_name, mobile, email, state, district, village,
                    land_area, crop, password_hash
                ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
                """,
                (
                    farmer.full_name.strip(), normalized_mobile, normalized_email,
                    farmer.state, farmer.district, farmer.village,
                    farmer.land_area, farmer.crop, hash_password(farmer.password),
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

    return {
        "message": "farmer registered successfully",
        "farmer": {
            "id": farmer_id,
            "fullName": farmer.full_name.strip(),
            "mobile": normalized_mobile,
            "email": normalized_email,
            "state": farmer.state,
            "district": farmer.district,
            "village": farmer.village,
            "landArea": farmer.land_area,
            "crop": farmer.crop,
        },
    }


def authenticate_farmer(login: FarmerLogin):
    identifier = login.identifier.strip()
    normalized_identifier = identifier.lower() if "@" in identifier else identifier
    with get_connection() as connection:
        farmer = connection.execute(
            """
            SELECT id, full_name, mobile, email, password_hash
            FROM farmers
            WHERE mobile = ? OR lower(trim(email)) = ?
            ORDER BY id DESC
            LIMIT 1
            """,
            (identifier, normalized_identifier),
        ).fetchone()

    if farmer is None or not verify_password(login.password, farmer["password_hash"]):
        raise HTTPException(status_code=401, detail="Invalid email/mobile or password.")
    return farmer
