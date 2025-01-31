import React, { useState, useEffect } from "react";
import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import L from "leaflet";

const DefaultIcon = L.icon({
  iconUrl: "/marker-icon.png",
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
});

const MapComponent = ({ latitude, longitude, onPositionChange }) => {
  const [position, setPosition] = useState([latitude, longitude]);

  // Perbarui state saat latitude atau longitude berubah
  useEffect(() => {
    setPosition([latitude, longitude]);
  }, [latitude, longitude]);

  // Fungsi untuk menangani pergeseran marker
  const handleDragEnd = (e) => {
    const marker = e.target;
    const newPosition = marker.getLatLng();
    setPosition([newPosition.lat, newPosition.lng]);

    // Panggil callback function untuk mengirim posisi baru ke parent component
    if (onPositionChange) {
      onPositionChange(newPosition.lat, newPosition.lng);
    }
  };

  if (!latitude || !longitude) return null;

  return (
    <div className="mt-8">
      <MapContainer
        center={position}
        zoom={13}
        style={{ height: "400px", width: "100%" }}
      >
        <TileLayer
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        />
        <Marker
          position={position}
          icon={DefaultIcon}
          draggable={true} // Aktifkan drag
          eventHandlers={{
            dragend: handleDragEnd, // Tangani event dragend
          }}
        >
          <Popup>
            Your Location: <br /> Latitude: {position[0]} <br /> Longitude:{" "}
            {position[1]}
          </Popup>
        </Marker>
      </MapContainer>
    </div>
  );
};

export default MapComponent;
