from app.database.session import get_connection


BOOKING_SELECT = """
    SELECT b.id, b.booking_id, b.crop, b.booking_date, b.time_slot, b.status,
           b.created_at, c.id AS centre_id, c.name AS centre_name,
           q.id AS queue_entry_id, q.token_number, q.queue_position,
           q.estimated_wait_minutes, q.status AS queue_status,
           q.quality_check, q.weighing_check, q.procurement_check, q.payment_check
    FROM bookings b
    JOIN centres c ON c.id = b.centre_id
    LEFT JOIN queue_entries q ON q.booking_id = b.id
"""


def list_farmer_bookings(farmer_id: int) -> list[dict]:
    with get_connection() as connection:
        rows = connection.execute(
            BOOKING_SELECT + " WHERE b.farmer_id = %s ORDER BY b.created_at DESC",
            (farmer_id,),
        ).fetchall()
    return [
        {
            "id": row["id"],
            "bookingId": row["booking_id"],
            "crop": row["crop"],
            "bookingDate": row["booking_date"],
            "timeSlot": row["time_slot"],
            "status": row["status"],
            "createdAt": row["created_at"],
            "centre": {"id": row["centre_id"], "name": row["centre_name"]},
            "ticket": {
                "id": row["queue_entry_id"],
                "tokenNumber": row["token_number"],
                "queuePosition": row["queue_position"],
                "estimatedWaitMinutes": row["estimated_wait_minutes"],
                "status": row["queue_status"],
                "checks": {
                    "quality": row["quality_check"],
                    "weighing": row["weighing_check"],
                    "procurement": row["procurement_check"],
                    "payment": row["payment_check"],
                },
            } if row["queue_entry_id"] else None,
        }
        for row in rows
    ]
