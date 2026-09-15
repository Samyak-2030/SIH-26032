import sqlite3

from app.core.config import DATABASE_PATH, SCHEMA_PATH


def initialize_database() -> None:
    DATABASE_PATH.parent.mkdir(parents=True, exist_ok=True)
    with sqlite3.connect(DATABASE_PATH) as connection:
        columns = {
            row[1] for row in connection.execute("PRAGMA table_info(centres)")
        }
        if columns and "latitude" not in columns:
            connection.execute("ALTER TABLE centres ADD COLUMN latitude REAL")
        if columns and "longitude" not in columns:
            connection.execute("ALTER TABLE centres ADD COLUMN longitude REAL")
        queue_columns = {
            row[1] for row in connection.execute("PRAGMA table_info(queue_entries)")
        }
        for column in (
            "quality_check",
            "weighing_check",
            "procurement_check",
            "payment_check",
        ):
            if queue_columns and column not in queue_columns:
                connection.execute(
                    f"ALTER TABLE queue_entries ADD COLUMN {column} TEXT NOT NULL DEFAULT 'Pending'"
                )
        connection.executescript(SCHEMA_PATH.read_text(encoding="utf-8"))
        connection.execute(
            "DELETE FROM centres WHERE id NOT IN (SELECT MIN(id) FROM centres GROUP BY name)"
        )
        connection.execute(
            "CREATE UNIQUE INDEX IF NOT EXISTS idx_centres_name ON centres(name)"
        )
