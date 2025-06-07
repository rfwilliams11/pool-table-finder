-- Pool Table Finder Database Schema

CREATE TABLE IF NOT EXISTS locations (
  id SERIAL PRIMARY KEY,
  google_place_id VARCHAR(255) UNIQUE,
  name VARCHAR(255) NOT NULL,
  address TEXT NOT NULL,
  lat DECIMAL(10, 8) NOT NULL,
  lng DECIMAL(11, 8) NOT NULL,
  pool_table_count INTEGER DEFAULT 1,
  notes TEXT,
  status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
  created_at TIMESTAMP DEFAULT NOW()
);

-- Create index for faster queries on status
CREATE INDEX IF NOT EXISTS idx_locations_status ON locations(status);

-- Create index for faster queries on google_place_id
CREATE INDEX IF NOT EXISTS idx_locations_google_place_id ON locations(google_place_id);