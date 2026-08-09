// The Kaaba's coordinates in Mecca.
const KAABA_LAT = 21.4225;
const KAABA_LNG = 39.8262;

// Convert degrees to radians and back.
function toRadians(deg) {
  return (deg * Math.PI) / 180;
}
function toDegrees(rad) {
  return (rad * 180) / Math.PI;
}

// Calculate the compass bearing (0-360°) from a given point to the Kaaba.
// This is the great-circle initial bearing formula.
export function getQiblaBearing(latitude, longitude) {
  const lat1 = toRadians(latitude);
  const lat2 = toRadians(KAABA_LAT);
  const deltaLng = toRadians(KAABA_LNG - longitude);

  const y = Math.sin(deltaLng) * Math.cos(lat2);
  const x =
    Math.cos(lat1) * Math.sin(lat2) -
    Math.sin(lat1) * Math.cos(lat2) * Math.cos(deltaLng);

  let bearing = toDegrees(Math.atan2(y, x));

  // Normalize to 0-360.
  bearing = (bearing + 360) % 360;
  return bearing;
}