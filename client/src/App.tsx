import { useState, useEffect } from 'react';
import { Map } from './components/Map';
import { LocationForm } from './components/LocationForm';
import { api } from './services/api';
import { Location, CreateLocationRequest } from './types/location';
import './App.css';

function App() {
  const [locations, setLocations] = useState<Location[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedLocation, setSelectedLocation] = useState<Location | null>(null);

  useEffect(() => {
    loadLocations();
  }, []);

  const loadLocations = async () => {
    try {
      const data = await api.getLocations();
      setLocations(data);
      setError(null);
    } catch (err) {
      console.error('Error loading locations:', err);
      setError('Failed to load locations. Please try again later.');
    }
  };

  const handleSubmitLocation = async (locationData: CreateLocationRequest) => {
    setIsSubmitting(true);
    try {
      await api.createLocation(locationData);
      alert('Location added successfully!');
      setShowForm(false);
      setError(null);
      // Reload locations to show the new one immediately
      loadLocations();
    } catch (err: any) {
      console.error('Error submitting location:', err);
      if (err.message.includes('already exists')) {
        alert('This location has already been submitted.');
      } else {
        alert('Failed to submit location. Please try again.');
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <h1 className="text-2xl font-bold text-gray-900">
            Pool Table Finder - San Francisco
          </h1>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-md p-4 mb-6">
            <p className="text-red-600">{error}</p>
            <button
              onClick={loadLocations}
              className="text-red-600 underline hover:text-red-700 mt-2"
            >
              Try again
            </button>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            <div className="bg-white p-6 rounded-lg shadow-md">
              <h2 className="text-xl font-semibold mb-4">
                Pool Tables in San Francisco ({locations.length})
              </h2>
              <Map 
                locations={locations} 
                onLocationSelect={setSelectedLocation}
              />
            </div>
          </div>

          <div className="space-y-6">
            <button
              onClick={() => setShowForm(!showForm)}
              className="w-full bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
            >
              {showForm ? 'Close Form' : 'Add Location'}
            </button>

            {showForm && (
              <LocationForm 
                onSubmit={handleSubmitLocation}
                isSubmitting={isSubmitting}
              />
            )}

            {selectedLocation && (
              <div className="bg-white p-6 rounded-lg shadow-md">
                <h3 className="text-lg font-semibold mb-2">{selectedLocation.name}</h3>
                <p className="text-gray-600 mb-2">{selectedLocation.address}</p>
                <div className="space-y-1">
                  <p><strong>Pool tables:</strong> {selectedLocation.pool_table_count}</p>
                  {selectedLocation.notes && (
                    <p><strong>Notes:</strong> {selectedLocation.notes}</p>
                  )}
                  <p className="text-sm text-gray-500">
                    Added: {new Date(selectedLocation.created_at).toLocaleDateString()}
                  </p>
                </div>
              </div>
            )}

            {locations.length === 0 && !error && (
              <div className="bg-white p-6 rounded-lg shadow-md">
                <h3 className="text-lg font-semibold mb-2">No locations yet</h3>
                <p className="text-gray-600 mb-4">
                  Be the first to add a pool table location in San Francisco!
                </p>
                <button
                  onClick={() => setShowForm(true)}
                  className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700"
                >
                  Add First Location
                </button>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}

export default App;