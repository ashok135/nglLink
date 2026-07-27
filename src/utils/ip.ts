interface LocationDetails {
  ip: string | null;
  location: string | null;
  lat?: number | null;
  lng?: number | null;
  accurateGps?: boolean;
}

// Module-level cache so GPS result is reused without re-prompting
let cachedGps: { lat: number; lng: number } | null | undefined = undefined;

/**
 * Asks the browser for GPS location permission.
 * Returns coordinates if granted, otherwise null.
 * Uses module-level cache to avoid re-prompting.
 */
export function requestGpsPermission(): Promise<{ lat: number; lng: number } | null> {
  // Return cached result immediately if already resolved
  if (cachedGps !== undefined) {
    return Promise.resolve(cachedGps);
  }

  return new Promise((resolve) => {
    if (!navigator.geolocation) {
      cachedGps = null;
      resolve(null);
      return;
    }
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        cachedGps = { lat: pos.coords.latitude, lng: pos.coords.longitude };
        resolve(cachedGps);
      },
      () => {
        cachedGps = null;
        resolve(null);
      },
      { timeout: 8000, maximumAge: 120000, enableHighAccuracy: true }
    );
  });
}

/**
 * Reverse-geocodes lat/lng via OpenStreetMap Nominatim.
 */
async function reverseGeocode(lat: number, lng: number): Promise<string | null> {
  try {
    const res = await fetch(
      `https://nominatim.openstreetmap.org/reverse?format=jsonv2&lat=${lat}&lon=${lng}`,
      { headers: { 'Accept-Language': 'en' } }
    );
    if (!res.ok) return null;
    const data = await res.json();
    const addr = data.address || {};
    const parts = [
      addr.city || addr.town || addr.village || addr.county || '',
      addr.state || '',
      addr.country || '',
    ].filter(Boolean);
    return parts.length > 0 ? parts.join(', ') : null;
  } catch {
    return null;
  }
}

/**
 * Main location function called on form submit.
 * Uses cached GPS if already granted, otherwise falls back to IP APIs.
 */
export async function getClientLocation(): Promise<LocationDetails> {
  // 1. Use cached GPS (from early permission request on page load)
  const gps = cachedGps !== undefined ? cachedGps : await requestGpsPermission();

  if (gps) {
    const geoName = await reverseGeocode(gps.lat, gps.lng);
    let ip: string | null = null;
    try {
      const ipRes = await fetch('https://api.ipify.org?format=json');
      if (ipRes.ok) ip = (await ipRes.json()).ip || null;
    } catch { /* ignore */ }

    return {
      ip,
      location: geoName || `${gps.lat.toFixed(4)}, ${gps.lng.toFixed(4)}`,
      lat: gps.lat,
      lng: gps.lng,
      accurateGps: true,
    };
  }

  // 2. IP-based fallback: ipapi.co
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 3000);
  try {
    const response = await fetch('https://ipapi.co/json/', { signal: controller.signal });
    clearTimeout(timeoutId);
    if (response.ok) {
      const data = await response.json();
      const city = data.city || '';
      const region = data.region || '';
      const country = data.country_name || '';
      const locParts = [city, region, country].filter(Boolean);
      return {
        ip: data.ip || null,
        location: locParts.length > 0 ? locParts.join(', ') : 'Unknown Location',
        lat: data.latitude || null,
        lng: data.longitude || null,
        accurateGps: false,
      };
    }
  } catch {
    clearTimeout(timeoutId);
  }

  // 3. Fallback: ip-api.com
  const fallbackController = new AbortController();
  const fallbackTimeoutId = setTimeout(() => fallbackController.abort(), 3000);
  try {
    const response = await fetch('http://ip-api.com/json/', { signal: fallbackController.signal });
    clearTimeout(fallbackTimeoutId);
    if (response.ok) {
      const data = await response.json();
      const city = data.city || '';
      const region = data.regionName || '';
      const country = data.country || '';
      const locParts = [city, region, country].filter(Boolean);
      return {
        ip: data.query || null,
        location: locParts.length > 0 ? locParts.join(', ') : 'Unknown Location',
        lat: data.lat || null,
        lng: data.lon || null,
        accurateGps: false,
      };
    }
  } catch {
    clearTimeout(fallbackTimeoutId);
  }

  // 4. Last resort: IP only
  try {
    const response = await fetch('https://api.ipify.org?format=json');
    if (response.ok) {
      const data = await response.json();
      return { ip: data.ip || null, location: 'Unknown Location', accurateGps: false };
    }
  } catch { /* ignore */ }

  return { ip: null, location: 'Unknown Location', accurateGps: false };
}
