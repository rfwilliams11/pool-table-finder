// Simple Vercel API route for locations
const { Pool } = require('pg');

let pool;

function getPool() {
  if (!pool) {
    pool = new Pool({
      connectionString: process.env.DATABASE_URL,
      ssl: process.env.DATABASE_URL ? { rejectUnauthorized: false } : false
    });
  }
  return pool;
}

module.exports = async (req, res) => {
  // Set CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  // Handle preflight requests
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  const dbPool = getPool();

  try {
    if (req.method === 'GET') {
      console.log('Fetching locations...');
      const result = await dbPool.query(
        'SELECT * FROM locations WHERE status = $1 ORDER BY created_at DESC',
        ['approved']
      );
      console.log(`Found ${result.rows.length} locations`);
      return res.status(200).json(result.rows);
    }

    if (req.method === 'POST') {
      const { google_place_id, name, address, lat, lng, pool_table_count, notes } = req.body;
      
      const result = await dbPool.query(
        `INSERT INTO locations (google_place_id, name, address, lat, lng, pool_table_count, notes, status) 
         VALUES ($1, $2, $3, $4, $5, $6, $7, 'approved') 
         RETURNING *`,
        [google_place_id, name, address, lat, lng, pool_table_count || 1, notes || '']
      );
      return res.status(201).json(result.rows[0]);
    }

    return res.status(405).json({ error: 'Method not allowed' });
  } catch (err) {
    console.error('API Error:', err);
    return res.status(500).json({ 
      error: 'Server error', 
      details: err instanceof Error ? err.message : 'Unknown error' 
    });
  }
};