import request from 'supertest';
import { Pool } from 'pg';

// Set NODE_ENV to test before importing
process.env.NODE_ENV = 'test';

// Mock the pg module
jest.mock('pg', () => {
  const mockQuery = jest.fn();
  return {
    Pool: jest.fn().mockImplementation(() => ({
      query: mockQuery,
    })),
    __mockQuery: mockQuery, // Export for access in tests
  };
});

// Import app after mocking
import app from '../index';

// Get the mock query function
const mockQuery = (require('pg') as any).__mockQuery;

describe('API Endpoints', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('GET /api/locations', () => {
    it('should return approved locations', async () => {
      const mockLocations = [
        {
          id: 1,
          google_place_id: 'test_place_1',
          name: 'Test Bar 1',
          address: '123 Test St, San Francisco, CA',
          lat: 37.7749,
          lng: -122.4194,
          pool_table_count: 2,
          notes: 'Great tables',
          status: 'approved',
          created_at: '2024-01-01T00:00:00.000Z'
        },
        {
          id: 2,
          google_place_id: 'test_place_2',
          name: 'Test Bar 2',
          address: '456 Test Ave, San Francisco, CA',
          lat: 37.7849,
          lng: -122.4094,
          pool_table_count: 1,
          notes: '',
          status: 'approved',
          created_at: '2024-01-02T00:00:00.000Z'
        }
      ];

      mockQuery.mockResolvedValueOnce({ rows: mockLocations });

      const response = await request(app)
        .get('/api/locations')
        .expect(200);

      expect(response.body).toEqual(mockLocations);
      expect(mockQuery).toHaveBeenCalledWith(
        'SELECT * FROM locations WHERE status = $1 ORDER BY created_at DESC',
        ['approved']
      );
    });

    it('should handle database errors', async () => {
      const dbError = new Error('Database connection failed');
      mockQuery.mockRejectedValueOnce(dbError);

      const response = await request(app)
        .get('/api/locations')
        .expect(500);

      expect(response.body).toEqual({
        error: 'Failed to fetch locations',
        details: 'Database connection failed'
      });
    });

    it('should return empty array when no locations found', async () => {
      mockQuery.mockResolvedValueOnce({ rows: [] });

      const response = await request(app)
        .get('/api/locations')
        .expect(200);

      expect(response.body).toEqual([]);
    });
  });

  describe('POST /api/locations', () => {
    const validLocationData = {
      google_place_id: 'test_place_123',
      name: 'New Test Bar',
      address: '789 New St, San Francisco, CA',
      lat: 37.7649,
      lng: -122.4294,
      pool_table_count: 3,
      notes: 'Newly added bar'
    };

    it('should create a new location successfully', async () => {
      const mockCreatedLocation = {
        id: 3,
        ...validLocationData,
        status: 'approved',
        created_at: '2024-01-03T00:00:00.000Z'
      };

      mockQuery.mockResolvedValueOnce({ rows: [mockCreatedLocation] });

      const response = await request(app)
        .post('/api/locations')
        .send(validLocationData)
        .expect(201);

      expect(response.body).toEqual(mockCreatedLocation);
      expect(mockQuery).toHaveBeenCalledWith(
        `INSERT INTO locations (google_place_id, name, address, lat, lng, pool_table_count, notes, status) 
       VALUES ($1, $2, $3, $4, $5, $6, $7, 'approved') 
       RETURNING *`,
        [
          validLocationData.google_place_id,
          validLocationData.name,
          validLocationData.address,
          validLocationData.lat,
          validLocationData.lng,
          validLocationData.pool_table_count,
          validLocationData.notes
        ]
      );
    });

    it('should create location with default values when optional fields omitted', async () => {
      const minimalLocationData = {
        google_place_id: 'test_place_minimal',
        name: 'Minimal Bar',
        address: '100 Minimal St, San Francisco, CA',
        lat: 37.7749,
        lng: -122.4194
      };

      const mockCreatedLocation = {
        id: 4,
        ...minimalLocationData,
        pool_table_count: 1,
        notes: '',
        status: 'approved',
        created_at: '2024-01-04T00:00:00.000Z'
      };

      mockQuery.mockResolvedValueOnce({ rows: [mockCreatedLocation] });

      const response = await request(app)
        .post('/api/locations')
        .send(minimalLocationData)
        .expect(201);

      expect(response.body).toEqual(mockCreatedLocation);
      expect(mockQuery).toHaveBeenCalledWith(
        expect.any(String),
        [
          minimalLocationData.google_place_id,
          minimalLocationData.name,
          minimalLocationData.address,
          minimalLocationData.lat,
          minimalLocationData.lng,
          1, // default pool_table_count
          '' // default notes
        ]
      );
    });

    it('should return 409 when location already exists', async () => {
      const duplicateError = new Error('Duplicate key violation');
      (duplicateError as any).constraint = 'locations_google_place_id_key';
      
      mockQuery.mockRejectedValueOnce(duplicateError);

      const response = await request(app)
        .post('/api/locations')
        .send(validLocationData)
        .expect(409);

      expect(response.body).toEqual({
        error: 'Location already exists'
      });
    });

    it('should return 500 for other database errors', async () => {
      const dbError = new Error('Database connection failed');
      mockQuery.mockRejectedValueOnce(dbError);

      const response = await request(app)
        .post('/api/locations')
        .send(validLocationData)
        .expect(500);

      expect(response.body).toEqual({
        error: 'Failed to create location'
      });
    });

    it('should handle missing required fields gracefully', async () => {
      const incompleteData = {
        name: 'Incomplete Bar',
        // missing google_place_id, address, lat, lng
      };

      // The database will throw an error for missing required fields
      const dbError = new Error('null value in column "google_place_id" violates not-null constraint');
      mockQuery.mockRejectedValueOnce(dbError);

      const response = await request(app)
        .post('/api/locations')
        .send(incompleteData)
        .expect(500);

      expect(response.body).toEqual({
        error: 'Failed to create location'
      });
    });
  });

  describe('GET /health', () => {
    it('should return health status', async () => {
      const response = await request(app)
        .get('/health')
        .expect(200);

      expect(response.body).toHaveProperty('status', 'OK');
      expect(response.body).toHaveProperty('timestamp');
      expect(new Date(response.body.timestamp)).toBeInstanceOf(Date);
    });
  });
});