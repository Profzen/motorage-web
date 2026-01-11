"use client";

import { MapContainer, TileLayer, Marker, Popup, CircleMarker } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import markerIcon2x from "leaflet/dist/images/marker-icon-2x.png";
import markerIcon from "leaflet/dist/images/marker-icon.png";
import markerShadow from "leaflet/dist/images/marker-shadow.png";

// Fix default marker icon paths in Next.js
L.Icon.Default.mergeOptions({
  iconRetinaUrl: (markerIcon2x as unknown as { src: string }).src,
  iconUrl: (markerIcon as unknown as { src: string }).src,
  shadowUrl: (markerShadow as unknown as { src: string }).src,
});

type MapViewProps = {
  routes: Array<{
    id: string;
    departure: { name: string; lat: number; lng: number };
    arrival: { name: string; lat: number; lng: number };
    driver: { name: string };
    departureTime: string;
  }>;
  center?: { lat: number; lng: number };
  userLocation?: { lat: number; lng: number } | null;
};

export function MapView({ routes, center = { lat: 6.1256, lng: 1.2317 }, userLocation }: MapViewProps) {
  return (
    <div className="w-full h-[360px] rounded-lg overflow-hidden border border-border">
      <MapContainer center={[center.lat, center.lng]} zoom={13} style={{ height: "100%", width: "100%" }}>
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        {userLocation && (
          <CircleMarker
            center={[userLocation.lat, userLocation.lng]}
            radius={8}
            pathOptions={{ color: "#2563EB", fillColor: "#2563EB", fillOpacity: 0.5 }}
          >
            <Popup>Vous êtes ici</Popup>
          </CircleMarker>
        )}
        {routes.map((r) => (
          <Marker key={r.id} position={[r.departure.lat, r.departure.lng]}>
            <Popup>
              <div className="space-y-1">
                <p className="font-medium">{r.departure.name} → {r.arrival.name}</p>
                <p className="text-xs text-muted-foreground">Conducteur: {r.driver.name}</p>
                <p className="text-xs text-muted-foreground">Heure: {r.departureTime}</p>
              </div>
            </Popup>
          </Marker>
        ))}
      </MapContainer>
    </div>
  );
}
