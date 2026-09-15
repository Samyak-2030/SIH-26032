from fastapi import HTTPException
from psycopg.errors import UniqueViolation
from pwdlib.exceptions import UnknownHashError

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
                ) VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s)
                RETURNING id
                """,
                (
                    farmer.full_name.strip(), normalized_mobile, normalized_email,
                    farmer.state, farmer.district, farmer.village,
                    farmer.land_area, farmer.crop, hash_password(farmer.password),
                ),
            )
            farmer_id = cursor.fetchone()["id"]
    except UniqueViolation as error:
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
        farmers = connection.execute(
            """
            SELECT id, full_name, mobile, email, password_hash
            FROM farmers
            WHERE mobile = %s OR lower(trim(email)) = %s
            ORDER BY id DESC
            """,
            (identifier, normalized_identifier),
        ).fetchall()

    farmer = None
    for candidate in farmers:
        try:
            if verify_password(login.password, candidate["password_hash"]):
                farmer = candidate
                break
        except (TypeError, ValueError, UnknownHashError):
            continue
    if farmer is None:
        raise HTTPException(status_code=401, detail="Invalid email/mobile or password.")
    return farmer
