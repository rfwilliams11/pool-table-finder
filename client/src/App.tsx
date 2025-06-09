import { useState, useEffect } from 'react';
import { Map } from './components/Map';
import { LocationForm } from './components/LocationForm';
import { Modal } from './components/Modal';
import { Toast } from './components/Toast';
import { api } from './services/api';
import { Location, CreateLocationRequest } from './types/location';
import './App.css';

interface ToastState {
  message: string;
  type: 'success' | 'error';
}

function App() {
  const [locations, setLocations] = useState<Location[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [toast, setToast] = useState<ToastState | null>(null);

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
      setToast({ message: 'Location added successfully!', type: 'success' });
      setShowForm(false);
      setError(null);
      // Reload locations to show the new one immediately
      loadLocations();
    } catch (err: any) {
      console.error('Error submitting location:', err);
      if (err.message.includes('already exists')) {
        setToast({ message: 'This location has already been submitted.', type: 'error' });
      } else {
        setToast({ message: 'Failed to submit location. Please try again.', type: 'error' });
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCloseModal = () => {
    setShowForm(false);
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

        <div className="bg-white p-6 rounded-lg shadow-md">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-semibold">
              Pool Tables in San Francisco ({locations.length})
            </h2>
            <button
              onClick={() => setShowForm(true)}
              className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
            >
              Add Location
            </button>
          </div>
          <Map 
            locations={locations}
          />
        </div>

        {locations.length === 0 && !error && (
          <div className="bg-white p-6 rounded-lg shadow-md mt-6">
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

        <Modal
          isOpen={showForm}
          onClose={handleCloseModal}
          title="Add New Location"
        >
          <LocationForm 
            onSubmit={handleSubmitLocation}
            isSubmitting={isSubmitting}
          />
        </Modal>

        {toast && (
          <Toast
            message={toast.message}
            type={toast.type}
            onClose={() => setToast(null)}
          />
        )}
      </main>
    </div>
  );
}

export default App;