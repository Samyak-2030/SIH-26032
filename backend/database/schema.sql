-- Kisan Setu database schema
-- This file is executed when the FastAPI application starts.

-- Stores farmer profile data and the Argon2 password hash used for login.
-- Kisan Setu database schema
-- This file is executed when the FastAPI application starts.

-- Stores farmer profile data and the Argon2 password hash used for login.

CREATE TABLE IF NOT EXISTS farmers (
    id INTEGER PRIMARY KEY AUTOINCREMENT,

    full_name TEXT NOT NULL,

    mobile TEXT NOT NULL UNIQUE,

    email TEXT,

    state TEXT NOT NULL,

    district TEXT NOT NULL,

    village TEXT NOT NULL,

    land_area REAL NOT NULL,

    crop TEXT NOT NULL,

    password_hash TEXT NOT NULL,

    created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
);
