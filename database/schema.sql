CREATE EXTENSION IF NOT EXISTS "pgcrypto";

DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'inquiry_user_type') THEN
        CREATE TYPE inquiry_user_type AS ENUM ('Parent', 'Student', 'School');
    END IF;

    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'inquiry_category') THEN
        CREATE TYPE inquiry_category AS ENUM ('Scholarship', 'Concert', 'Admission', 'General Query');
    END IF;

    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'inquiry_status') THEN
        CREATE TYPE inquiry_status AS ENUM ('New', 'Contacted', 'In Progress', 'Resolved');
    END IF;
END$$;

CREATE TABLE IF NOT EXISTS admins (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email VARCHAR(255) NOT NULL UNIQUE,
    password_hash TEXT NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    last_login_at TIMESTAMPTZ NULL
);

CREATE INDEX IF NOT EXISTS idx_admins_email ON admins (LOWER(email));

CREATE TABLE IF NOT EXISTS inquiries (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(150) NOT NULL,
    email VARCHAR(255) NOT NULL,
    phone VARCHAR(30) NOT NULL,
    user_type VARCHAR(30) NOT NULL CHECK (user_type IN ('Parent', 'Student', 'School')),
    category VARCHAR(40) NOT NULL CHECK (category IN ('Scholarship', 'Concert', 'Admission', 'General Query')),
    message TEXT NOT NULL,
    status VARCHAR(30) NOT NULL DEFAULT 'New' CHECK (status IN ('New', 'Contacted', 'In Progress', 'Resolved')),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_inquiries_created_at ON inquiries (created_at DESC);
CREATE INDEX IF NOT EXISTS idx_inquiries_status ON inquiries (status);
CREATE INDEX IF NOT EXISTS idx_inquiries_category ON inquiries (category);
CREATE INDEX IF NOT EXISTS idx_inquiries_user_type ON inquiries (user_type);
CREATE INDEX IF NOT EXISTS idx_inquiries_name_lower ON inquiries (LOWER(name));
CREATE INDEX IF NOT EXISTS idx_inquiries_phone ON inquiries (phone);

CREATE OR REPLACE FUNCTION update_inquiries_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_inquiries_updated_at ON inquiries;

CREATE TRIGGER trg_inquiries_updated_at
BEFORE UPDATE ON inquiries
FOR EACH ROW
EXECUTE FUNCTION update_inquiries_updated_at();
