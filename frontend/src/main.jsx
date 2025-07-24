import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App.jsx';
import 'mapbox-gl/dist/mapbox-gl.css'; // ✅ CSS for mapbox-gl

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
);
