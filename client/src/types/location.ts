export interface Location {
  id: number;
  google_place_id: string;
  name: string;
  address: string;
  lat: number;
  lng: number;
  pool_table_count: number;
  notes: string;
  status: 'pending' | 'approved' | 'rejected';
  created_at: string;
}

export interface CreateLocationRequest {
  google_place_id: string;
  name: string;
  address: string;
  lat: number;
  lng: number;
  pool_table_count?: number;
  notes?: string;
}