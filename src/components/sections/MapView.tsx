"use client";

import {
  MapContainer,
  TileLayer,
  Marker,
  Popup,
  CircleMarker,
  useMap,
} from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { useEffect, useState } from "react";

// Robust icon configuration
const defaultIcon =
  typeof window !== "undefined"
    ? L.icon({
        iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
        iconRetinaUrl:
          "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
        shadowUrl:
          "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
        iconSize: [25, 41],
        iconAnchor: [12, 41],
        popupAnchor: [1, -34],
        shadowSize: [41, 41],
      })
    : null;

function MapController({ center }: { center: { lat: number; lng: number } }) {
  const map = useMap();
  useEffect(() => {
    if (
      center &&
      typeof center.lat === "number" &&
      typeof center.lng === "number"
    ) {
      map.setView([center.lat, center.lng], map.getZoom());
    }
  }, [center, map]);
  return null;
}

type MapViewProps = {
  trajets: Array<{
    id: string;
    departure: { name: string; lat: number; lng: number };
    arrival: { name: string; lat: number; lng: number };
    driver: { name: string };
    departureTime: string;
  }>;
  center?: { lat: number; lng: number };
  userLocation?: { lat: number; lng: number } | null;
};

export function MapView({
  trajets,
  center = { lat: 6.1256, lng: 1.2317 },
  userLocation,
}: MapViewProps) {
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setIsMounted(true), 0);
    return () => clearTimeout(timer);
  }, []);

  if (!isMounted)
    return <div className="bg-muted h-90 w-full animate-pulse rounded-lg" />;

  // Filter out any trajets with invalid coordinates to prevent Leaflet crashes
  const validTrajets = trajets.filter(
    (t) =>
      t.departure &&
      typeof t.departure.lat === "number" &&
      typeof t.departure.lng === "number"
  );

  return (
    <div className="border-border relative z-0 h-90 w-full overflow-hidden rounded-lg border">
      <MapContainer
        center={[center.lat, center.lng]}
        zoom={13}
        scrollWheelZoom={false}
        style={{ height: "100%", width: "100%" }}
      >
        <MapController center={center} />
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />

        {userLocation && typeof userLocation.lat === "number" && (
          <CircleMarker
            center={[userLocation.lat, userLocation.lng]}
            radius={8}
            pathOptions={{
              color: "#2563EB",
              fillColor: "#2563EB",
              fillOpacity: 0.5,
            }}
          >
            <Popup>Vous êtes ici</Popup>
          </CircleMarker>
        )}

        {validTrajets.map((t) => (
          <Marker
            key={t.id}
            position={[t.departure.lat, t.departure.lng]}
            icon={defaultIcon || undefined}
          >
            <Popup>
              <div className="min-w-40 space-y-1">
                <p className="text-foreground text-sm font-medium">
                  {t.departure.name} → {t.arrival.name}
                </p>
                <div className="text-muted-foreground text-xs">
                  <p>Conducteur: {t.driver.name}</p>
                  <p>Heure: {t.departureTime}</p>
                </div>
              </div>
            </Popup>
          </Marker>
        ))}
      </MapContainer>
    </div>
  );
}
