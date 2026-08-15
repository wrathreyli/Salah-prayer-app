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

// The shortest signed turn from angle `from` to angle `to`, in the range
// (-180, 180]. Going from 350° to 10° is +20°, not -340°.
export function angleDifference(from, to) {
  return ((((to - from) % 360) + 540) % 360) - 180;
}

// Low-pass filter for a compass angle: move `current` a fraction of the way
// toward `target`. A smaller `weight` means smoother but laggier.
//
// It has to work on the shortest turn, otherwise every pass through North
// makes the needle spin all the way around the dial.
export function smoothAngle(current, target, weight) {
  const next = current + angleDifference(current, target) * weight;
  return (next + 360) % 360;
}