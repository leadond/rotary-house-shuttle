import { useEffect, useState } from 'react';
import { createClient } from '@supabase/supabase-js';
import mapboxgl from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';
import './index.css';
import RealTimeComponent from './components/RealTimeComponent'
import InsertComponent from './components/InsertComponent'
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://placeholder.supabase.co';
const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'placeholder-key';
const mapboxToken = import.meta.env.VITE_MAPBOX_TOKEN || '';

// Only create Supabase client if we have valid credentials
const supabase = (supabaseUrl !== 'https://placeholder.supabase.co' && supabaseKey !== 'placeholder-key') 
  ? createClient(supabaseUrl, supabaseKey)
  : null;

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
    if (supabase) {
      fetchVehicles();
    }

    let subscription;
    if (supabase) {
      subscription = supabase
        .channel('public:vehicles')
        .on('postgres_changes', { event: '*', schema: 'public', table: 'vehicles' }, () => {
          fetchVehicles();
        })
        .subscribe();
    }

    return () => {
      if (subscription) {
        supabase.removeChannel(subscription);
      }
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
    if (!supabase) {
      setError('Supabase not configured');
      return;
    }
    
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
      <div className="error-container">
        <div className="error-content">
          <h2>Rotary House Shuttle</h2>
          <p>Please configure your environment variables:</p>
          <ul>
            <li>VITE_MAPBOX_TOKEN - Required for map display</li>
            <li>VITE_SUPABASE_URL - Required for database connection</li>
            <li>VITE_SUPABASE_ANON_KEY - Required for database authentication</li>
          </ul>
          <p>Update your frontend/.env file with the correct values.</p>
          {error && <div className="error-message">Error: {error}</div>}
        </div>
      </div>
    );
  }

  if (!supabase) {
    return (
      <div className="error-container">
        <div className="error-content">
          <h2>Rotary House Shuttle</h2>
          <p>Supabase configuration is missing or invalid.</p>
          <p>Please check your VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY in frontend/.env</p>
          {error && <div className="error-message">Error: {error}</div>}
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
