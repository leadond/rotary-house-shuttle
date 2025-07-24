import { useEffect, useState } from 'react';
import { createClient } from '@supabase/supabase-js';
import Map from 'react-map-gl';
import 'mapbox-gl/dist/mapbox-gl.css';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://placeholder.supabase.co';
const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'placeholder-key';
const mapboxToken = import.meta.env.VITE_MAPBOX_TOKEN || '';

const supabase = createClient(supabaseUrl, supabaseKey);

function App() {
  const [vehicles, setVehicles] = useState([]);
  const [error, setError] = useState(null);

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
    <Map
      initialViewState={{
        latitude: 29.7079,
        longitude: -95.3984,
        zoom: 14
      }}
      style={{ width: '100vw', height: '100vh' }}
      mapStyle="mapbox://styles/mapbox/streets-v11"
      mapboxAccessToken={mapboxToken}
    >
      {vehicles.map((v) => {
        if (v.location && v.location.coordinates) {
          return (
            <div
              key={v.id}
              style={{
                position: 'absolute',
                transform: `translate(${v.location.coordinates[0]}px, ${v.location.coordinates[1]}px)`,
                fontSize: '24px'
              }}
            >
              🚌
            </div>
          );
        }
        return null;
      })}
    </Map>
  );
}

export default App;
