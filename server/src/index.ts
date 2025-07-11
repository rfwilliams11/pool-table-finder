import dotenv from 'dotenv';
import express, { Request, Response } from 'express';
import cors from 'cors';
import { Pool } from 'pg';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors({
  origin: true,
  credentials: true,
  methods: ['GET', 'POST', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));
app.use(express.json());

// Handle preflight requests
app.options('*', (req, res) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  res.sendStatus(200);
});

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.DATABASE_URL ? { rejectUnauthorized: false } : false
});

interface Location {
  id: number;
  google_place_id: string;
  name: string;
  address: string;
  lat: number;
  lng: number;
  pool_table_count: number;
  notes: string;
  status: 'pending' | 'approved' | 'rejected';
  created_at: Date;
}

interface CreateLocationRequest {
  google_place_id: string;
  name: string;
  address: string;
  lat: number;
  lng: number;
  pool_table_count?: number;
  notes?: string;
}

app.get('/api/locations', async (req: Request, res: Response) => {
  try {
    console.log('Fetching locations...');
    const result = await pool.query(
      'SELECT * FROM locations WHERE status = $1 ORDER BY created_at DESC',
      ['approved']
    );
    console.log(`Found ${result.rows.length} locations`);
    res.json(result.rows);
  } catch (err) {
    console.error('Error fetching locations:', err);
    res.status(500).json({ error: 'Failed to fetch locations', details: err instanceof Error ? err.message : 'Unknown error' });
  }
});

app.post('/api/locations', async (req: Request<{}, Location, CreateLocationRequest>, res: Response) => {
  const { google_place_id, name, address, lat, lng, pool_table_count, notes } = req.body;
  
  try {
    const result = await pool.query(
      `INSERT INTO locations (google_place_id, name, address, lat, lng, pool_table_count, notes, status) 
       VALUES ($1, $2, $3, $4, $5, $6, $7, 'approved') 
       RETURNING *`,
      [google_place_id, name, address, lat, lng, pool_table_count || 1, notes || '']
    );
    res.status(201).json(result.rows[0]);
  } catch (err: any) {
    console.error('Error creating location:', err);
    if (err.constraint === 'locations_google_place_id_key') {
      res.status(409).json({ error: 'Location already exists' });
    } else {
      res.status(500).json({ error: 'Failed to create location' });
    }
  }
});

app.get('/health', (req: Request, res: Response) => {
  res.json({ status: 'OK', timestamp: new Date().toISOString() });
});

// For Vercel serverless functions
export default app;
module.exports = app;

// For local development
if (process.env.NODE_ENV !== 'production') {
  app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
  });
}