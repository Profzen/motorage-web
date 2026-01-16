"use client";

import { useEffect } from "react";
import { useLocationStore } from "@/lib/store";

export function LocationRequester() {
  const requestLocation = useLocationStore((s) => s.requestLocation);
  const status = useLocationStore((s) => s.status);

  useEffect(() => {
    if (status === "granted" || status === "prompting") return;
    requestLocation();
  }, [requestLocation, status]);

  return null;
}
