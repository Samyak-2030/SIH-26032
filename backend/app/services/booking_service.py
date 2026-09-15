from datetime import datetime, timezone
from uuid import uuid4

from fastapi import HTTPException
from psycopg.errors import UniqueViolation

from app.database.session import get_connection
from app.schemas.booking import BookingCreate


def create_booking(booking: BookingCreate, farmer) -> dict:
    booking_id = f"BK-{datetime.now(timezone.utc).strftime('%Y%m%d%H%M%S%f')}-{farmer['id']}-{uuid4().hex[:6]}"

    with get_connection() as connection:
        try:
            centre = connection.execute(
                "SELECT id FROM centres WHERE id = %s AND status = 'Active'",
                (booking.centre_id,),
            ).fetchone()
            if centre is None:
                raise HTTPException(status_code=404, detail="Selected procurement centre is not available.")

            connection.execute("SELECT pg_advisory_xact_lock(%s)", (booking.centre_id,))

            cursor = connection.execute(
                """
                INSERT INTO bookings (
                    booking_id, farmer_id, centre_id, crop, booking_date, time_slot, status
                ) VALUES (%s, %s, %s, %s, %s, %s, %s)
                RETURNING id
                """,
                (
                    booking_id, farmer["id"], booking.centre_id, booking.crop,
                    booking.booking_date, booking.time_slot, "Confirmed",
                ),
            )
            database_booking_id = cursor.fetchone()["id"]
            queue_count = connection.execute(
                """
                SELECT COUNT(*) FROM queue_entries
                WHERE centre_id = %s AND status IN ('Waiting', 'Called', 'Serving')
                """,
                (booking.centre_id,),
            ).fetchone()["count"]
            queue_position = queue_count + 1
            token_number = queue_position
            estimated_wait = queue_position * 10
            queue_cursor = connection.execute(
                """
                INSERT INTO queue_entries (
                    booking_id, farmer_id, centre_id, token_number, queue_position,
                    estimated_wait_minutes, status
                ) VALUES (%s, %s, %s, %s, %s, %s, %s)
                RETURNING id
                """,
                (
                    database_booking_id, farmer["id"], booking.centre_id,
                    token_number, queue_position, estimated_wait, "Waiting",
                ),
            )
            queue_entry_id = queue_cursor.fetchone()["id"]
        except UniqueViolation as error:
            raise HTTPException(status_code=400, detail="Unable to create booking.") from error

    return {
        "bookingId": booking_id,
        "queueEntryId": queue_entry_id,
        "farmerId": farmer["id"],
        "centreId": booking.centre_id,
        "crop": booking.crop,
        "bookingDate": booking.booking_date,
        "timeSlot": booking.time_slot,
        "status": "Confirmed",
        "queueToken": token_number,
        "queuePosition": queue_position,
        "estimatedWaitMinutes": estimated_wait,
    }
