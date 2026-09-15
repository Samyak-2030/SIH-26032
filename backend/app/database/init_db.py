from app.core.config import SCHEMA_PATH
from app.database.session import get_connection


QUEUE_CHECK_COLUMNS = (
    "quality_check",
    "weighing_check",
    "procurement_check",
    "payment_check",
)


def initialize_database() -> None:
    schema = SCHEMA_PATH.read_text(encoding="utf-8")
    with get_connection() as connection:
        connection.execute(schema)
        for column in QUEUE_CHECK_COLUMNS:
            connection.execute(
                f"ALTER TABLE queue_entries ADD COLUMN IF NOT EXISTS {column} TEXT NOT NULL DEFAULT 'Pending'"
            )
