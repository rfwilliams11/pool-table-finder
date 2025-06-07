import { Location, CreateLocationRequest } from '../types/location';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || (
  import.meta.env.PROD ? '' : 'http://localhost:3001'
);

console.log('Environment check:', {
  VITE_API_BASE_URL: import.meta.env.VITE_API_BASE_URL,
  PROD: import.meta.env.PROD,
  MODE: import.meta.env.MODE,
  API_BASE_URL
});

export const api = {
  async getLocations(): Promise<Location[]> {
    const response = await fetch(`${API_BASE_URL}/api/locations`);
    if (!response.ok) {
      throw new Error('Failed to fetch locations');
    }
    return response.json();
  },

  async createLocation(location: CreateLocationRequest): Promise<Location> {
    const response = await fetch(`${API_BASE_URL}/api/locations`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(location),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Failed to create location');
    }

    return response.json();
  },
};