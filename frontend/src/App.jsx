import { useEffect, useState } from 'react';
import { createClient } from '@supabase/supabase-js';
import mapboxgl from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://placeholder.supabase.co';
const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'placeholder-key';
const mapboxToken = import.meta.env.VITE_MAPBOX_TOKEN || '';

const supabase = createClient(supabaseUrl, supabaseKey);

// Set Mapbox access token
if (mapboxToken) {
  mapboxgl.accessToken = mapboxToken;
}

function App() {
  const [vehicles, setVehicles] = useState([]);
  const [error, setError] = useState(null);
  const [map, setMap] = useState(null);
  const [mapContainer, setMapContainer] = useState(null);

  useEffect(() => {
    if (supabaseUrl !== 'https://placeholder.supabase.co') {
      fetchVehicles();
    }

    const subscription = supabase
      .channel('public:vehicles')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'vehicles' }, () => {
        if (supabaseUrl !== 'https://placeholder.supabase.co') {
          fetchVehicles();
        }
      })
      .subscribe();

    return () => {
      supabase.removeChannel(subscription);
    };
  }, []);

  useEffect(() => {
    if (mapContainer && mapboxToken && !map) {
      const mapInstance = new mapboxgl.Map({
        container: mapContainer,
        style: 'mapbox://styles/mapbox/streets-v11',
        center: [-95.3984, 29.7079],
        zoom: 14
      });
      
      setMap(mapInstance);
      
      return () => mapInstance.remove();
    }
  }, [mapContainer, mapboxToken, map]);

  useEffect(() => {
    if (map && vehicles.length > 0) {
      // Clear existing markers
      const existingMarkers = document.querySelectorAll('.vehicle-marker');
      existingMarkers.forEach(marker => marker.remove());
      
      // Add new markers
      vehicles.forEach((vehicle) => {
        if (vehicle.location && vehicle.location.coordinates) {
          const el = document.createElement('div');
          el.className = 'vehicle-marker';
          el.innerHTML = '🚌';
          el.style.fontSize = '24px';
          
          new mapboxgl.Marker(el)
            .setLngLat(vehicle.location.coordinates)
            .addTo(map);
        }
      });
    }
  }, [map, vehicles]);

  async function fetchVehicles() {
    try {
      const { data, error } = await supabase.from('vehicles').select('*');
      if (error) {
        console.error('Error fetching vehicles:', error);
        setError(error.message);
      } else if (data) {
        setVehicles(data);
      }
    } catch (err) {
      console.error('Network error:', err);
      setError('Failed to connect to database');
    }
  }

  if (!mapboxToken) {
    return (
      <div style={{ 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center', 
        height: '100vh',
        backgroundColor: '#f0f0f0',
        fontFamily: 'Arial, sans-serif'
      }}>
        <div style={{ textAlign: 'center', padding: '20px' }}>
          <h2>Rotary House Shuttle</h2>
          <p>Please configure your Mapbox token to view the map.</p>
          {error && <p style={{ color: 'red' }}>Database Error: {error}</p>}
        </div>
      </div>
    );
  }

  return (
    <div 
      ref={setMapContainer}
      style={{ width: '100vw', height: '100vh' }}
    />
  );
}

export default App;
