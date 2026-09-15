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
    status TEXT NOT NULL DEFAULT 'Active',
    latitude REAL,
    longitude REAL
);

INSERT OR IGNORE INTO centres
    (name, state, district, location, capacity, status)
VALUES
    ('Kisan Seva Centre - Patna', 'Bihar', 'Patna', 'Danapur', 100, 'Active'),
    ('Kisan Seva Centre - Muzaffarpur', 'Bihar', 'Muzaffarpur', 'Muzaffarpur City', 80, 'Active'),
    ('Kisan Seva Centre - Gaya', 'Bihar', 'Gaya', 'Gaya City', 120, 'Active');

INSERT OR IGNORE INTO centres
    (name, state, district, location, capacity, status, latitude, longitude)
VALUES
    ('Government Procurement Centre - Ambala', 'Haryana', 'Ambala', 'Ambala City', 500, 'Active', 30.3782, 76.7767),
    ('Government Procurement Centre - Bhiwani', 'Haryana', 'Bhiwani', 'Bhiwani City', 400, 'Active', 28.7930, 76.1398),
    ('Government Procurement Centre - Hisar', 'Haryana', 'Hisar', 'Hisar City', 500, 'Active', 29.1492, 75.7217),
    ('Government Procurement Centre - Karnal', 'Haryana', 'Karnal', 'Karnal City', 450, 'Active', 29.6857, 76.9905),
    ('Government Procurement Centre - Kurukshetra', 'Haryana', 'Kurukshetra', 'Thanesar', 350, 'Active', 29.9695, 76.8783),
    ('Government Procurement Centre - Rohtak', 'Haryana', 'Rohtak', 'Rohtak City', 400, 'Active', 28.8955, 76.6066),
    ('Government Procurement Centre - Sirsa', 'Haryana', 'Sirsa', 'Sirsa City', 300, 'Active', 29.5349, 75.0289),
    ('Government Procurement Centre - Sonipat', 'Haryana', 'Sonipat', 'Sonipat City', 450, 'Active', 28.9931, 77.0151),
    ('Government Procurement Centre - Yamunanagar', 'Haryana', 'Yamunanagar', 'Yamunanagar City', 350, 'Active', 30.1290, 77.2674);

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
    quality_check TEXT NOT NULL DEFAULT 'Pending',
    weighing_check TEXT NOT NULL DEFAULT 'Pending',
    procurement_check TEXT NOT NULL DEFAULT 'Pending',
    payment_check TEXT NOT NULL DEFAULT 'Pending',
    created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,

    FOREIGN KEY (booking_id) REFERENCES bookings(id),
    FOREIGN KEY (farmer_id) REFERENCES farmers(id),
    FOREIGN KEY (centre_id) REFERENCES centres(id)
);