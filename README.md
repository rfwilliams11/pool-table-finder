# Pool Table Finder

A web application for finding bars with pool tables in San Francisco.

## Setup

### Prerequisites
- Node.js (v18 or higher)
- npm
- Neon DB account
- Google Maps API key

### Environment Variables

1. **Server Environment Variables** (`server/.env`):
   ```
   DATABASE_URL=your_neon_db_connection_string
   PORT=3001
   ```

2. **Client Environment Variables** (`client/.env`):
   ```
   VITE_GOOGLE_MAPS_API_KEY=your_google_maps_api_key
   VITE_API_BASE_URL=http://localhost:3001
   ```

### Getting Started

1. **Set up the database:**
   - Create a new database in [Neon](https://neon.tech)
   - Copy the connection string to `server/.env`

2. **Get Google Maps API key:**
   - Go to [Google Cloud Console](https://console.cloud.google.com)
   - Enable Maps JavaScript API and Places API
   - Create an API key and add it to `client/.env`

3. **Install dependencies:**
   ```bash
   # Install server dependencies
   cd server
   npm install
   
   # Install client dependencies
   cd ../client
   npm install
   ```

4. **Run the application:**
   ```bash
   # Terminal 1: Start the server
   cd server
   npm run dev
   
   # Terminal 2: Start the client
   cd client
   npm run dev
   ```

## Project Structure

```
pool-table-finder/
├── client/          # React + Vite frontend
├── server/          # Node.js + Express backend
├── .gitignore
└── README.md
```