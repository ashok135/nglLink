interface LocationDetails {
  ip: string | null;
  location: string | null;
  lat?: number | null;
  lng?: number | null;
  accurateGps?: boolean;
}

/**
 * Asks the browser for GPS location permission.
 * Returns coordinates if granted, otherwise null.
 */
function getBrowserGps(): Promise<{ lat: number; lng: number } | null> {
  return new Promise((resolve) => {
    if (!navigator.geolocation) {
      resolve(null);
      return;
    }
    navigator.geolocation.getCurrentPosition(
      (pos) => resolve({ lat: pos.coords.latitude, lng: pos.coords.longitude }),
      () => resolve(null),          // user denied or timed out
      { timeout: 6000, maximumAge: 60000 }
    );
  });
}

/**
 * Reverse-geocodes lat/lng via a free public API.
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
 * Fetches the user's public IP address and approximate geographic location.
 * Tries browser GPS first (most accurate), then IP-based APIs as fallback.
 */
export async function getClientLocation(): Promise<LocationDetails> {
  // 1. Try browser GPS (highest accuracy, needs user permission)
  const gps = await getBrowserGps();
  if (gps) {
    const geoName = await reverseGeocode(gps.lat, gps.lng);
    // Still try to get the IP for analytics, but don't block on it
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
    console.warn('Primary location API (ipapi.co) failed, attempting fallback...');
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
    console.warn('Fallback location API (ip-api.com) failed.');
  }

  // 4. Last resort: ipify (IP only)
  const basicController = new AbortController();
  const basicTimeoutId = setTimeout(() => basicController.abort(), 3000);
  try {
    const response = await fetch('https://api.ipify.org?format=json', { signal: basicController.signal });
    clearTimeout(basicTimeoutId);
    if (response.ok) {
      const data = await response.json();
      return { ip: data.ip || null, location: 'Unknown Location', accurateGps: false };
    }
  } catch {
    clearTimeout(basicTimeoutId);
  }

  return { ip: null, location: 'Unknown Location', accurateGps: false };
}
