import { useEffect, useRef, useState } from 'react';
import { Loader } from '@googlemaps/js-api-loader';
import { Location } from '../types/location';

interface MapProps {
  locations: Location[];
}

const SF_CENTER = { lat: 37.7749, lng: -122.4194 };

export function Map({ locations }: MapProps) {
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<google.maps.Map | null>(null);
  const markersRef = useRef<google.maps.Marker[]>([]);
  const [isLoaded, setIsLoaded] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const initMap = async () => {
      try {
        const loader = new Loader({
          apiKey: import.meta.env.VITE_GOOGLE_MAPS_API_KEY,
          version: 'weekly',
          libraries: ['places']
        });

        await loader.load();
        setIsLoaded(true);

        if (mapRef.current) {
          const map = new google.maps.Map(mapRef.current, {
            center: SF_CENTER,
            zoom: 13,
            styles: [
              {
                featureType: 'poi',
                elementType: 'labels',
                stylers: [{ visibility: 'off' }]
              }
            ]
          });

          mapInstanceRef.current = map;
        }
      } catch (err) {
        console.error('Error loading Google Maps:', err);
        setError('Failed to load Google Maps. Please check your API key.');
      }
    };

    initMap();
  }, []);

  useEffect(() => {
    if (!isLoaded || !mapInstanceRef.current) return;

    const updateMarkers = () => {
      const zoom = mapInstanceRef.current?.getZoom() || 13;
      const iconSize = zoom >= 15 ? 32 : zoom >= 12 ? 24 : 16;
      const anchorPoint = iconSize / 2;

      markersRef.current.forEach(marker => marker.setMap(null));
      markersRef.current = [];

      locations.forEach(location => {
        const marker = new google.maps.Marker({
          position: { lat: Number(location.lat), lng: Number(location.lng) },
          map: mapInstanceRef.current,
          title: location.name,
          icon: {
            url: 'data:image/svg+xml;charset=UTF-8,' + encodeURIComponent(`
              <svg width="${iconSize}" height="${iconSize}" viewBox="0 0 32 32" xmlns="http://www.w3.org/2000/svg">
                <circle cx="16" cy="16" r="14" fill="#000000" stroke="#ffffff" stroke-width="2"/>
                <circle cx="16" cy="11" r="4" fill="#ffffff"/>
                <text x="16" y="14" text-anchor="middle" fill="#000000" font-size="10" font-weight="bold">8</text>
              </svg>
            `),
            scaledSize: new google.maps.Size(iconSize, iconSize),
            anchor: new google.maps.Point(anchorPoint, anchorPoint),
          }
        });

        const infoWindow = new google.maps.InfoWindow({
          content: `
            <div style="font-family: system-ui, sans-serif;">
              <h3 style="margin: 0 0 8px 0; font-size: 16px; font-weight: 600;">${location.name}</h3>
              <p style="margin: 0 0 4px 0; color: #666; font-size: 14px;">${location.address}</p>
              <p style="margin: 0; font-size: 14px;"><strong>Pool tables:</strong> ${location.pool_table_count}</p>
              ${location.notes ? `<p style="margin: 4px 0 0 0; font-size: 14px; color: #666;">${location.notes}</p>` : ''}
            </div>
          `
        });

        marker.addListener('click', () => {
          infoWindow.open(mapInstanceRef.current, marker);
        });

        markersRef.current.push(marker);
      });
    };

    updateMarkers();

    // Add zoom listener to update marker sizes when zoom changes
    const zoomListener = mapInstanceRef.current.addListener('zoom_changed', updateMarkers);

    return () => {
      google.maps.event.removeListener(zoomListener);
    };
  }, [locations, isLoaded]);

  if (error) {
    return (
      <div className="flex items-center justify-center h-96 bg-gray-100 rounded-lg">
        <div className="text-center">
          <p className="text-red-600 mb-2">{error}</p>
          <p className="text-sm text-gray-600">
            Make sure you have set VITE_GOOGLE_MAPS_API_KEY in your .env file
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="relative">
      <div ref={mapRef} className="w-full h-96 rounded-lg" />
      {!isLoaded && (
        <div className="absolute inset-0 flex items-center justify-center bg-gray-100 rounded-lg">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-2"></div>
            <p className="text-gray-600">Loading map...</p>
          </div>
        </div>
      )}
    </div>
  );
}