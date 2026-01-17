/**
 * Utility functions for handling location, distance calculation,
 * and geofencing for the Campus area.
 */

export interface Coordinates {
  latitude: number;
  longitude: number;
}

/**
 * Bounds of the Campus (example coordinates for Lomé University / UL)
 * To be adjusted according to the real campus coordinates.
 */
export const CAMPUS_BOUNDS = {
  minLat: 6.16,
  maxLat: 6.185,
  minLng: 1.2,
  maxLng: 1.23,
};

/**
 * Calculates the distance between two points in meters using the Haversine formula.
 */
export function calculateDistance(
  point1: Coordinates,
  point2: Coordinates
): number {
  const R = 6371e3; // Earth radius in meters
  const phi1 = (point1.latitude * Math.PI) / 180;
  const phi2 = (point2.latitude * Math.PI) / 180;
  const deltaPhi = ((point2.latitude - point1.latitude) * Math.PI) / 180;
  const deltaLambda = ((point2.longitude - point1.longitude) * Math.PI) / 180;

  const a =
    Math.sin(deltaPhi / 2) * Math.sin(deltaPhi / 2) +
    Math.cos(phi1) *
      Math.cos(phi2) *
      Math.sin(deltaLambda / 2) *
      Math.sin(deltaLambda / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

  return R * c;
}

/**
 * Checks if a coordinate is within the campus boundaries.
 */
export function isWithinCampus(point: Coordinates): boolean {
  return (
    point.latitude >= CAMPUS_BOUNDS.minLat &&
    point.latitude <= CAMPUS_BOUNDS.maxLat &&
    point.longitude >= CAMPUS_BOUNDS.minLng &&
    point.longitude <= CAMPUS_BOUNDS.maxLng
  );
}

/**
 * Validates if coordinates are realistic.
 */
export function isValidCoordinate(point: Coordinates): boolean {
  return (
    point.latitude >= -90 &&
    point.latitude <= 90 &&
    point.longitude >= -180 &&
    point.longitude <= 180
  );
}

/**
 * Formats distance for display (e.g., "500m" or "1.2km").
 */
export function formatDistance(meters: number): string {
  if (meters < 1000) {
    return `${Math.round(meters)}m`;
  }
  return `${(meters / 1000).toFixed(1)}km`;
}
