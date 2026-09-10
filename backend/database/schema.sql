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

CREATE TABLE IF NOT EXISTS centres (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    state TEXT NOT NULL,
    district TEXT NOT NULL,
    location TEXT NOT NULL,
    capacity INTEGER NOT NULL,
    status TEXT NOT NULL DEFAULT 'Active'
);

INSERT OR IGNORE INTO centres
    (name, state, district, location, capacity, status)
VALUES
    ('Kisan Seva Centre - Patna', 'Bihar', 'Patna', 'Danapur', 100, 'Active'),
    ('Kisan Seva Centre - Muzaffarpur', 'Bihar', 'Muzaffarpur', 'Muzaffarpur City', 80, 'Active'),
    ('Kisan Seva Centre - Gaya', 'Bihar', 'Gaya', 'Gaya City', 120, 'Active');

CREATE TABLE IF NOT EXISTS bookings (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    booking_id TEXT NOT NULL UNIQUE,
    farmer_id INTEGER NOT NULL,
    centre_id INTEGER NOT NULL,
    crop TEXT NOT NULL,
    booking_date TEXT NOT NULL,
    time_slot TEXT NOT NULL,
    status TEXT NOT NULL DEFAULT 'Confirmed',
    created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,

    FOREIGN KEY (farmer_id) REFERENCES farmers(id),
    FOREIGN KEY (centre_id) REFERENCES centres(id)
);

CREATE TABLE IF NOT EXISTS queue_entries (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    booking_id INTEGER NOT NULL,
    farmer_id INTEGER NOT NULL,
    centre_id INTEGER NOT NULL,
    token_number INTEGER NOT NULL,
    queue_position INTEGER NOT NULL,
    estimated_wait_minutes INTEGER NOT NULL DEFAULT 0,
    status TEXT NOT NULL DEFAULT 'Waiting',
    created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,

    FOREIGN KEY (booking_id) REFERENCES bookings(id),
    FOREIGN KEY (farmer_id) REFERENCES farmers(id),
    FOREIGN KEY (centre_id) REFERENCES centres(id)
);