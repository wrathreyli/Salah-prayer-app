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
// [-180, 180). Going from 350° to 10° is +20°, not -340°.
//
// An exact half-turn comes back as -180 rather than +180. Either is correct —
// they're the same rotation — but the range is half-open at the top, which the
// comment used to get backwards.
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

// How much a reading has to move before we treat the phone as turning.
const STILL_DEGREES = 1;
// ...and the point at which we treat it as turning fast.
const FAST_DEGREES = 12;
const MIN_WEIGHT = 0.06;
const MAX_WEIGHT = 0.45;

// Pick a smoothing weight from how far the reading jumped.
//
// A single fixed weight can't win: heavy smoothing is calm when the phone is
// still but feels laggy when you turn, and light smoothing is responsive but
// twitches when you're holding steady. So filter hard when nothing is moving
// (that movement is noise) and barely at all when the phone is really turning
// (that movement is real).
export function adaptiveWeight(turnDegrees) {
  const span = FAST_DEGREES - STILL_DEGREES;
  const position = (Math.abs(turnDegrees) - STILL_DEGREES) / span;
  const clamped = Math.min(1, Math.max(0, position));
  return MIN_WEIGHT + clamped * (MAX_WEIGHT - MIN_WEIGHT);
}