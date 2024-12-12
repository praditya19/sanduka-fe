import React from "react";
import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import L from "leaflet";

const DefaultIcon = L.icon({
  iconUrl: "/marker-icon.png",
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
});

const MapComponent = ({ latitude, longitude }) => {
  if (!latitude || !longitude) return null;

  return (
    <div className="mt-8">
      <MapContainer
        center={[latitude, longitude]}
        zoom={13}
        style={{ height: "400px", width: "100%" }}
      >
        <TileLayer
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        />
        <Marker position={[latitude, longitude]} icon={DefaultIcon}>
          <Popup>
            Your Location: <br /> Latitude: {latitude} <br /> Longitude:{" "}
            {longitude}
          </Popup>
        </Marker>
      </MapContainer>
    </div>
  );
};

export default MapComponent;
