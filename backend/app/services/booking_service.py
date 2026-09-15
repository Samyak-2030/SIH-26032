import sqlite3
from datetime import datetime

from fastapi import HTTPException

from app.database.session import get_connection
from app.schemas.booking import BookingCreate


def create_booking(booking: BookingCreate, farmer) -> dict:
    booking_id = f"BK-{datetime.now().strftime('%Y%m%d%H%M%S')}-{farmer['id']}"

    with get_connection() as connection:
        try:
            centre = connection.execute(
                "SELECT id FROM centres WHERE id = ? AND status = 'Active'",
                (booking.centre_id,),
            ).fetchone()
            if centre is None:
                raise HTTPException(status_code=404, detail="Selected procurement centre is not available.")

            cursor = connection.execute(
                """
                INSERT INTO bookings (
                    booking_id, farmer_id, centre_id, crop, booking_date, time_slot, status
                ) VALUES (?, ?, ?, ?, ?, ?, ?)
                """,
                (
                    booking_id, farmer["id"], booking.centre_id, booking.crop,
                    booking.booking_date, booking.time_slot, "Confirmed",
                ),
            )
            database_booking_id = cursor.lastrowid
            queue_count = connection.execute(
                """
                SELECT COUNT(*) FROM queue_entries
                WHERE centre_id = ? AND status IN ('Waiting', 'Serving')
                """,
                (booking.centre_id,),
            ).fetchone()[0]
            queue_position = queue_count + 1
            token_number = queue_position
            estimated_wait = queue_position * 10
            connection.execute(
                """
                INSERT INTO queue_entries (
                    booking_id, farmer_id, centre_id, token_number, queue_position,
                    estimated_wait_minutes, status
                ) VALUES (?, ?, ?, ?, ?, ?, ?)
                """,
                (
                    database_booking_id, farmer["id"], booking.centre_id,
                    token_number, queue_position, estimated_wait, "Waiting",
                ),
            )
            connection.commit()
        except sqlite3.IntegrityError as error:
            raise HTTPException(status_code=400, detail="Unable to create booking.") from error

    return {
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
    }
