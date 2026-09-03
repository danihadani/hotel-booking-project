-- ============================================================
-- Booking mini-project - Database schema (PostgreSQL)
-- ============================================================
-- Entities and relations:
--   users        1 --- N  reservations
--   hotels       1 --- N  rooms
--   hotels       1 --- N  reservations
--   rooms        1 --- N  reservations
-- ============================================================

DROP TABLE IF EXISTS reservations CASCADE;
DROP TABLE IF EXISTS rooms        CASCADE;
DROP TABLE IF EXISTS hotels       CASCADE;
DROP TABLE IF EXISTS users        CASCADE;

-- ---------- users ----------
CREATE TABLE users (
    id            SERIAL PRIMARY KEY,
    username      VARCHAR(50)  NOT NULL UNIQUE,
    password_hash TEXT         NOT NULL,
    full_name     VARCHAR(100) NOT NULL,
    email         VARCHAR(120) NOT NULL,
    created_at    TIMESTAMPTZ  NOT NULL DEFAULT now()
);

-- ---------- hotels ----------
CREATE TABLE hotels (
    id              SERIAL PRIMARY KEY,
    name            VARCHAR(120) NOT NULL,
    country         VARCHAR(60)  NOT NULL,
    city            VARCHAR(60)  NOT NULL,
    number_of_rooms INTEGER      NOT NULL CHECK (number_of_rooms > 0),
    stars           SMALLINT     NOT NULL CHECK (stars BETWEEN 1 AND 5)
);

-- ---------- rooms ----------
CREATE TABLE rooms (
    id         SERIAL PRIMARY KEY,
    hotel_id   INTEGER       NOT NULL REFERENCES hotels(id) ON DELETE CASCADE,
    name       VARCHAR(120)  NOT NULL,
    max_guests INTEGER       NOT NULL CHECK (max_guests > 0),
    price      NUMERIC(10,2) NOT NULL CHECK (price > 0),
    size       INTEGER       NOT NULL CHECK (size > 0)
);

CREATE INDEX idx_rooms_hotel_id ON rooms(hotel_id);

-- ---------- reservations ----------
CREATE TABLE reservations (
    id          SERIAL PRIMARY KEY,
    user_id     INTEGER       REFERENCES users(id)  ON DELETE SET NULL,
    hotel_id    INTEGER       NOT NULL REFERENCES hotels(id) ON DELETE CASCADE,
    room_id     INTEGER       NOT NULL REFERENCES rooms(id)  ON DELETE CASCADE,
    guest_name  VARCHAR(120)  NOT NULL,
    start_date  DATE          NOT NULL,
    end_date    DATE          NOT NULL,
    nights      INTEGER       NOT NULL,
    price_per_night NUMERIC(10,2) NOT NULL,
    total_price NUMERIC(10,2) NOT NULL,
    created_at  TIMESTAMPTZ   NOT NULL DEFAULT now(),
    CONSTRAINT chk_dates_order CHECK (end_date > start_date)
);

CREATE INDEX idx_reservations_room_dates ON reservations(room_id, start_date, end_date);
