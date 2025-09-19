import React from 'react'
import { MapContainer, TileLayer, Marker, Popup, Circle } from 'react-leaflet'
import L from 'leaflet'

// Fix for default markers in react-leaflet
delete L.Icon.Default.prototype._getIconUrl
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
})

// Get category-specific colors
const getCategoryColor = (category) => {
  const colors = {
    'Music Venue': '#9b59b6',
    'Restaurant': '#e74c3c',
    'Entertainment': '#f39c12',
    'Recreation': '#27ae60',
    'Event Space': '#3498db',
    'Park': '#2ecc71',
    'Festival': '#e67e22',
    'Brewery': '#d35400',
    'Shopping': '#8e44ad',
    'Sports': '#c0392b',
    'Scenic': '#16a085',
    'Education': '#2980b9',
    'Transportation': '#34495e'
  }
  return colors[category] || '#95a5a6'
}

// Create custom icons based on visit frequency and category
const createCustomIcon = (visits, category) => {
  const getColor = (visits) => {
    if (visits >= 200) return '#e74c3c' // Red for very high traffic
    if (visits >= 150) return '#f39c12' // Orange for high traffic
    if (visits >= 100) return '#f1c40f' // Yellow for medium-high
    if (visits >= 50) return '#3498db'  // Blue for medium
    return '#95a5a6' // Gray for low traffic
  }

  const getSize = (visits) => {
    if (visits >= 200) return [35, 35]
    if (visits >= 150) return [30, 30]
    if (visits >= 100) return [25, 25]
    if (visits >= 50) return [20, 20]
    return [16, 16]
  }

  const color = getColor(visits)
  const [width, height] = getSize(visits)
  const fontSize = width > 25 ? '11px' : width > 20 ? '10px' : '8px'
  
  return L.divIcon({
    className: 'custom-marker',
    html: `<div style="
      background: linear-gradient(135deg, ${color} 0%, ${color}dd 100%);
      width: ${width}px;
      height: ${height}px;
      border-radius: 50%;
      border: 3px solid white;
      box-shadow: 0 3px 6px rgba(0,0,0,0.3);
      display: flex;
      align-items: center;
      justify-content: center;
      color: white;
      font-weight: bold;
      font-size: ${fontSize};
      position: relative;
    ">${visits}</div>`,
    iconSize: [width, height],
    iconAnchor: [width/2, height/2]
  })
}

function RideMap({ locations = [] }) {
  // Austin city center coordinates
  const austinCenter = [30.2672, -97.7431]
  
  console.log('🗺️ RideMap received locations:', locations)
  console.log('📊 Number of locations:', locations.length)
  
  // Log each location structure
  locations.forEach((location, index) => {
    console.log(`📍 Location ${index}:`, {
      name: location.name,
      address: location.address,
      visits: location.visits,
      lat: location.lat,
      lng: location.lng,
      category: location.category,
      hasValidCoords: !!(location.lat && location.lng)
    })
  })
  
  return (
    <MapContainer
      center={austinCenter}
      zoom={11}
      style={{ height: '100%', width: '100%' }}
      maxBounds={[
        [30.0000, -98.0000], // Southwest corner
        [30.6000, -97.4000]  // Northeast corner
      ]}
      minZoom={10}
      maxZoom={16}
    >
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />
      

      
      {/* Location markers */}
      {locations.map((location, index) => (
        <Marker
          key={index}
          position={[location.lat, location.lng]}
          icon={createCustomIcon(location.visits, location.category)}
        >
          <Popup>
            <div className="location-popup">
              <h3>{location.name || 'Location'}</h3>
              <p style={{ margin: '0.5rem 0', color: '#666', fontSize: '0.9rem' }}>
                {location.address}
              </p>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                {location.category && (
                  <span style={{ 
                    background: getCategoryColor(location.category), 
                    color: 'white', 
                    padding: '0.2rem 0.5rem', 
                    borderRadius: '12px', 
                    fontSize: '0.7rem',
                    textTransform: 'uppercase'
                  }}>
                    {location.category}
                  </span>
                )}
                <div className="visit-count">{location.visits} visits</div>
              </div>
            </div>
          </Popup>
        </Marker>
      ))}
    </MapContainer>
  )
}

export default RideMap