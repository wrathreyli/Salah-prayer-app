// Rules for whether a cached set of prayer times can still be shown.
//
// Nothing native in here on purpose — it's the part worth testing, so it has
// to be importable outside the app.

// Beyond this, prayer times are different enough that showing the old city's
// would be misleading rather than merely stale.
export const MAX_DISTANCE_KM = 75;

const EARTH_RADIUS_KM = 6371;

function toRadians(deg) {
  return (deg * Math.PI) / 180;
}

// Great-circle distance between two coordinates, in kilometres (haversine).
export function distanceKm(lat1, lng1, lat2, lng2) {
  const dLat = toRadians(lat2 - lat1);
  const dLng = toRadians(lng2 - lng1);

  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRadians(lat1)) *
      Math.cos(toRadians(lat2)) *
      Math.sin(dLng / 2) ** 2;

  return 2 * EARTH_RADIUS_KM * Math.asin(Math.min(1, Math.sqrt(a)));
}

// Can we fall back to this cached record for this request?
//
// Returns { usable, reason }. `reason` is what the screen tells the user when
// the answer is no — "there's nothing saved" and "what's saved is for another
// city" need different words.
export function checkCache(cached, request) {
  if (!cached || !cached.timings) {
    return { usable: false, reason: 'empty' };
  }

  // Times computed with a different method are simply different times.
  if (
    typeof cached.method === 'number' &&
    typeof request?.method === 'number' &&
    cached.method !== request.method
  ) {
    return { usable: false, reason: 'method' };
  }

  const hasBoth =
    typeof cached.latitude === 'number' &&
    typeof cached.longitude === 'number' &&
    typeof request?.latitude === 'number' &&
    typeof request?.longitude === 'number';

  if (hasBoth) {
    const moved = distanceKm(
      cached.latitude,
      cached.longitude,
      request.latitude,
      request.longitude
    );
    if (moved > MAX_DISTANCE_KM) {
      return { usable: false, reason: 'moved' };
    }
  }

  // Records saved before this check existed have no coordinates. Trusting them
  // is the same behaviour as before, which is better than discarding history.
  return { usable: true, reason: null };
}
