import { useEffect, useState } from 'react';
import { createClient } from '@supabase/supabase-js';
import Map, { Marker } from 'react-map-gl';
import 'mapbox-gl/dist/mapbox-gl.css';

const supabase = createClient(import.meta.env.VITE_SUPABASE_URL, import.meta.env.VITE_SUPABASE_KEY);

function App() {
  const [vehicles, setVehicles] = useState([]);

  useEffect(() => {
    fetchVehicles();

    const subscription = supabase
      .channel('public:vehicles')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'vehicles' }, () => {
        fetchVehicles();
      })
      .subscribe();

    return () => {
      supabase.removeChannel(subscription);
    };
  }, []);

  async function fetchVehicles() {
    const { data, error } = await supabase.from('vehicles').select('*');
    if (data) setVehicles(data);
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
      mapboxAccessToken={import.meta.env.VITE_MAPBOX_TOKEN}
    >
      {vehicles.map((v) => (
        <Marker
          key={v.id}
          longitude={v.location.coordinates[0]}
          latitude={v.location.coordinates[1]}
        >
          🚌
        </Marker>
      ))}
    </Map>
  );
}

export default App;
