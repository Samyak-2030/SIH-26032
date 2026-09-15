from fastapi import HTTPException
from psycopg.errors import UniqueViolation

from app.database.session import get_connection
from app.schemas.centre import CentreCreate


def list_active_centres() -> list[dict]:
    with get_connection() as connection:
        centres = connection.execute(
            """
            SELECT id, name, state, district, location, capacity, status,
                   latitude, longitude
            FROM centres
            WHERE status = 'Active'
            ORDER BY name
            """
        ).fetchall()
    return [dict(centre) for centre in centres]


def create_centre(centre: CentreCreate) -> dict:
    if centre.capacity <= 0:
        raise HTTPException(status_code=400, detail="Capacity must be greater than zero.")
    if not -90 <= centre.latitude <= 90 or not -180 <= centre.longitude <= 180:
        raise HTTPException(status_code=400, detail="Enter valid map coordinates.")

    try:
        with get_connection() as connection:
            cursor = connection.execute(
                """
                INSERT INTO centres (
                    name, state, district, location, capacity, status, latitude, longitude
                ) VALUES (%s, %s, %s, %s, %s, %s, %s, %s)
                RETURNING id
                """,
                (
                    centre.name.strip(), centre.state.strip(), centre.district.strip(),
                    centre.location.strip(), centre.capacity, centre.status,
                    centre.latitude, centre.longitude,
                ),
            )
            centre_id = cursor.fetchone()["id"]
    except UniqueViolation as error:
        raise HTTPException(status_code=409, detail="A centre with this name already exists.") from error

    return {"id": centre_id, **centre.model_dump()}
