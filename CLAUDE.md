Pool Table Finder App - Development Brief
I want to build a simple web application that shows all the bars in San Francisco that have pool tables, similar to Pinball Map but stripped down for pool tables only.
Tech Stack Requirements

Frontend: React + Vite app with Google Maps integration + Typescript
Backend: Node.js + Express API + Typescript
Database: Neon DB (PostgreSQL)
Maps: Google Maps JavaScript API with Places Autocomplete

Core Features
1. Interactive Map View

Display all approved pool table locations on a Google Map
Show markers for each bar with pool tables
Click markers to see basic info (name, address, number of tables, notes)

2. Location Submission Form

Use Google Places Autocomplete for bar search
When user selects a bar, auto-populate name, address, and coordinates
Form fields:

Bar name (from Google Places)
Address (from Google Places)
Number of pool tables (user input)
Notes (optional - table condition, cost, etc.)


Submit to database with "pending" status for admin approval

3. Simple Admin Approval

No voting/verification system needed initially
All submissions go to "pending" status
Admin can approve/reject through database or simple interface

Database Schema
sqlCREATE TABLE locations (
  id SERIAL PRIMARY KEY,
  google_place_id VARCHAR(255) UNIQUE,
  name VARCHAR(255) NOT NULL,
  address TEXT NOT NULL,
  lat DECIMAL(10, 8) NOT NULL,
  lng DECIMAL(11, 8) NOT NULL,
  pool_table_count INTEGER DEFAULT 1,
  notes TEXT,
  status VARCHAR(20) DEFAULT 'pending', -- pending/approved/rejected
  created_at TIMESTAMP DEFAULT NOW()
);
API Endpoints Needed

GET /api/locations - Return all approved locations for map display
POST /api/locations - Submit new location (stores as pending)

Key Implementation Details

Use Google Places Autocomplete to ensure consistent address formatting and get coordinates
Store google_place_id for potential future integration with Google business data
Keep the UI simple and focused - just map + submission form
No user authentication needed initially
Focus on San Francisco area initially

Environment Variables Needed

DATABASE_URL (Neon DB connection string)
GOOGLE_MAPS_API_KEY

Success Criteria
The MVP should allow users to:

View a map of all bars with pool tables in SF
Easily submit new locations using Google Places search
See basic info about each location

Keep it simple - this is an MVP that can be enhanced later with features like user accounts, voting, advanced filtering, etc.