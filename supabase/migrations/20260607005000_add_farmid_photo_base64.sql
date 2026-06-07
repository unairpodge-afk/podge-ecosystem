-- Migration: Add photo_base64 to farmer_ids table
ALTER TABLE farmer_ids ADD COLUMN IF NOT EXISTS photo_base64 TEXT;
