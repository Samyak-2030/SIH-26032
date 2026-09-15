import sqlite3
from datetime import datetime, timezone

from fastapi import HTTPException

from app.database.session import get_connection
from app.schemas.queue import QueueCheckUpdate

CHECK_COLUMNS = {
    "quality": "quality_check",
    "weighing": "weighing_check",
    "procurement": "procurement_check",
    "payment": "payment_check",
}

QUEUE_SELECT = """
    SELECT q.id, q.booking_id, b.booking_id AS public_booking_id,
           q.farmer_id, f.full_name AS farmer_name, f.mobile,
           q.centre_id, c.name AS centre_name, q.token_number,
           q.queue_position, q.estimated_wait_minutes, q.status,
           q.quality_check, q.weighing_check, q.procurement_check,
           q.payment_check, b.crop, b.booking_date, b.time_slot,
           q.created_at
    FROM queue_entries q
    JOIN bookings b ON b.id = q.booking_id
    JOIN farmers f ON f.id = q.farmer_id
    JOIN centres c ON c.id = q.centre_id
"""


def _serialize(row) -> dict:
    if row is None:
        return None
    return {
        "id": row["id"], "bookingId": row["public_booking_id"],
        "farmerId": row["farmer_id"], "farmerName": row["farmer_name"],
        "mobile": row["mobile"], "centreId": row["centre_id"],
        "centreName": row["centre_name"], "tokenNumber": row["token_number"],
        "queuePosition": row["queue_position"],
        "estimatedWaitMinutes": row["estimated_wait_minutes"],
        "status": row["status"], "crop": row["crop"],
        "bookingDate": row["booking_date"], "timeSlot": row["time_slot"],
        "checks": {
            "quality": row["quality_check"], "weighing": row["weighing_check"],
            "procurement": row["procurement_check"], "payment": row["payment_check"],
        }, "createdAt": row["created_at"],
    }


def _refresh_positions(connection, centre_id: int) -> None:
    waiting = connection.execute(
        """SELECT id FROM queue_entries WHERE centre_id = ?
           AND status IN ('Waiting', 'Called', 'Serving')
           ORDER BY CASE status WHEN 'Serving' THEN 0 WHEN 'Called' THEN 1 ELSE 2 END,
                    created_at, id""",
        (centre_id,),
    ).fetchall()
    for position, row in enumerate(waiting, start=1):
        connection.execute(
            "UPDATE queue_entries SET queue_position = ?, estimated_wait_minutes = ? WHERE id = ?",
            (position, max(0, position - 1) * 10, row["id"]),
        )


def list_farmer_queue(farmer_id: int) -> list[dict]:
    with get_connection() as connection:
        rows = connection.execute(
            QUEUE_SELECT + " WHERE q.farmer_id = ? ORDER BY q.created_at DESC", (farmer_id,)
        ).fetchall()
    return [_serialize(row) for row in rows]


def list_centre_queue(centre_id: int) -> list[dict]:
    with get_connection() as connection:
        rows = connection.execute(
            QUEUE_SELECT + " WHERE q.centre_id = ? ORDER BY CASE q.status WHEN 'Serving' THEN 0 WHEN 'Called' THEN 1 WHEN 'Waiting' THEN 2 ELSE 3 END, q.created_at, q.id",
            (centre_id,),
        ).fetchall()
    return [_serialize(row) for row in rows]


def call_next_token(centre_id: int) -> dict:
    with get_connection() as connection:
        current = connection.execute(
            "SELECT id FROM queue_entries WHERE centre_id = ? AND status IN ('Called', 'Serving') ORDER BY id LIMIT 1",
            (centre_id,),
        ).fetchone()
        if current:
            raise HTTPException(status_code=409, detail="Finish the current token before calling the next token.")
        next_entry = connection.execute(
            "SELECT id FROM queue_entries WHERE centre_id = ? AND status = 'Waiting' ORDER BY created_at, id LIMIT 1",
            (centre_id,),
        ).fetchone()
        if next_entry is None:
            raise HTTPException(status_code=404, detail="No waiting tokens for this centre.")
        connection.execute(
            "UPDATE queue_entries SET status = 'Called' WHERE id = ?", (next_entry["id"],)
        )
        _refresh_positions(connection, centre_id)
        row = connection.execute(QUEUE_SELECT + " WHERE q.id = ?", (next_entry["id"],)).fetchone()
    return _serialize(row)


def update_check(entry_id: int, update: QueueCheckUpdate) -> dict:
    column = CHECK_COLUMNS[update.check]
    with get_connection() as connection:
        entry = connection.execute(
            "SELECT id, centre_id FROM queue_entries WHERE id = ?", (entry_id,)
        ).fetchone()
        if entry is None:
            raise HTTPException(status_code=404, detail="Queue ticket not found.")
        connection.execute(f"UPDATE queue_entries SET {column} = ? WHERE id = ?", (update.status, entry_id))
        checks = connection.execute(
            """SELECT quality_check, weighing_check, procurement_check, payment_check
               FROM queue_entries WHERE id = ?""",
            (entry_id,),
        ).fetchone()
        next_status = "Completed" if all(value == "Passed" for value in checks) else "Serving"
        connection.execute("UPDATE queue_entries SET status = ? WHERE id = ?", (next_status, entry_id))
        row = connection.execute(QUEUE_SELECT + " WHERE q.id = ?", (entry_id,)).fetchone()
    return _serialize(row)


def reset_queue() -> int:
    with get_connection() as connection:
        cursor = connection.execute(
            "DELETE FROM queue_entries"
        )
        connection.execute("DELETE FROM bookings")
    return cursor.rowcount
