import { useState, useRef, useEffect } from 'react';
import { Loader } from '@googlemaps/js-api-loader';
import { CreateLocationRequest } from '../types/location';

interface LocationFormProps {
  onSubmit: (location: CreateLocationRequest) => Promise<void>;
  isSubmitting?: boolean;
}

export function LocationForm({ onSubmit, isSubmitting = false }: LocationFormProps) {
  const [formData, setFormData] = useState({
    poolTableCount: 1,
    notes: ''
  });
  const [selectedPlace, setSelectedPlace] = useState<google.maps.places.PlaceResult | null>(null);
  const [isLoaded, setIsLoaded] = useState(false);
  const autocompleteRef = useRef<google.maps.places.Autocomplete | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const initAutocomplete = async () => {
      try {
        const loader = new Loader({
          apiKey: import.meta.env.VITE_GOOGLE_MAPS_API_KEY,
          version: 'weekly',
          libraries: ['places']
        });

        await loader.load();
        setIsLoaded(true);

        if (inputRef.current) {
          const autocomplete = new google.maps.places.Autocomplete(inputRef.current, {
            types: ['establishment'],
            componentRestrictions: { country: 'us' },
            fields: ['place_id', 'name', 'formatted_address', 'geometry']
          });

          autocomplete.addListener('place_changed', () => {
            const place = autocomplete.getPlace();
            if (place.geometry?.location) {
              setSelectedPlace(place);
            }
          });

          autocompleteRef.current = autocomplete;
        }
      } catch (err) {
        console.error('Error loading Google Places:', err);
      }
    };

    initAutocomplete();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!selectedPlace || !selectedPlace.geometry?.location) {
      alert('Please select a valid location from the dropdown');
      return;
    }

    const location: CreateLocationRequest = {
      google_place_id: selectedPlace.place_id!,
      name: selectedPlace.name!,
      address: selectedPlace.formatted_address!,
      lat: selectedPlace.geometry.location.lat(),
      lng: selectedPlace.geometry.location.lng(),
      pool_table_count: formData.poolTableCount,
      notes: formData.notes
    };

    try {
      await onSubmit(location);
      
      setSelectedPlace(null);
      setFormData({ poolTableCount: 1, notes: '' });
      if (inputRef.current) {
        inputRef.current.value = '';
      }
    } catch (error) {
      console.error('Error submitting location:', error);
    }
  };

  return (
    <div className="bg-white p-6 rounded-lg shadow-md">
      <h2 className="text-xl font-semibold mb-4">Add New Location</h2>
      
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label htmlFor="place-search" className="block text-sm font-medium text-gray-700 mb-1">
            Search for a bar or venue
          </label>
          <input
            ref={inputRef}
            type="text"
            id="place-search"
            placeholder="Start typing to search for a bar..."
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            disabled={!isLoaded}
          />
          {!isLoaded && (
            <p className="text-sm text-gray-500 mt-1">Loading Google Places...</p>
          )}
        </div>

        {selectedPlace && (
          <div className="p-3 bg-gray-50 rounded-md">
            <h3 className="font-medium">{selectedPlace.name}</h3>
            <p className="text-sm text-gray-600">{selectedPlace.formatted_address}</p>
          </div>
        )}

        <div>
          <label htmlFor="pool-table-count" className="block text-sm font-medium text-gray-700 mb-1">
            Number of Pool Tables
          </label>
          <input
            type="number"
            id="pool-table-count"
            min="1"
            max="20"
            value={formData.poolTableCount}
            onChange={(e) => setFormData(prev => ({ ...prev, poolTableCount: parseInt(e.target.value) || 1 }))}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          />
        </div>

        <div>
          <label htmlFor="notes" className="block text-sm font-medium text-gray-700 mb-1">
            Notes (optional)
          </label>
          <textarea
            id="notes"
            rows={3}
            value={formData.notes}
            onChange={(e) => setFormData(prev => ({ ...prev, notes: e.target.value }))}
            placeholder="Table condition, cost, special hours, etc."
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          />
        </div>

        <button
          type="submit"
          disabled={!selectedPlace || isSubmitting || !isLoaded}
          className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isSubmitting ? 'Submitting...' : 'Add Location'}
        </button>

        <p className="text-sm text-gray-500">
          Your submission will be reviewed before appearing on the map.
        </p>
      </form>
    </div>
  );
}