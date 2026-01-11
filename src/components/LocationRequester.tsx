"use client";

import { useEffect } from "react";
import { useLocationStore } from "@/lib/store";

export function LocationRequester() {
  const setLocation = useLocationStore((s) => s.setLocation);
  const setStatus = useLocationStore((s) => s.setStatus);
  const setError = useLocationStore((s) => s.setError);
  const status = useLocationStore((s) => s.status);

  useEffect(() => {
    if (typeof window === "undefined") return;
    if (!navigator?.geolocation) {
      setStatus("error");
      setError("La géolocalisation n'est pas disponible sur ce navigateur");
      return;
    }
    if (status === "granted" || status === "prompting") return;

    setStatus("prompting");
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setLocation({ lat: pos.coords.latitude, lng: pos.coords.longitude });
        setStatus("granted");
        setError(null);
      },
      (err) => {
        const denied = err.code === err.PERMISSION_DENIED;
        setStatus(denied ? "denied" : "error");
        setError(err.message);
      },
      { enableHighAccuracy: true, timeout: 8000, maximumAge: 60000 }
    );
  }, [setError, setLocation, setStatus, status]);

  return null;
}
