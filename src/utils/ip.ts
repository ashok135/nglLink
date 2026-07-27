interface LocationDetails {
  ip: string | null;
  location: string | null;
}

/**
 * Fetches the user's public IP address and approximate geographic location.
 * Implements fallback APIs and AbortController timeouts to remain fast and resilient.
 */
export async function getClientLocation(): Promise<LocationDetails> {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 3000);

  // 1. Try ipapi.co (returns IP and Location details)
  try {
    const response = await fetch('https://ipapi.co/json/', {
      signal: controller.signal
    });
    clearTimeout(timeoutId);
    
    if (response.ok) {
      const data = await response.json();
      const city = data.city || '';
      const region = data.region || '';
      const country = data.country_name || '';
      
      const locParts = [city, region, country].filter(Boolean);
      return {
        ip: data.ip || null,
        location: locParts.length > 0 ? locParts.join(', ') : 'Unknown Location'
      };
    }
  } catch (error) {
    clearTimeout(timeoutId);
    console.warn('Primary location API (ipapi.co) failed, attempting fallback...');
  }

  // 2. Try ip-api.com as fallback
  const fallbackController = new AbortController();
  const fallbackTimeoutId = setTimeout(() => fallbackController.abort(), 3000);
  try {
    // ip-api.com returns query for IP
    const response = await fetch('http://ip-api.com/json/', {
      signal: fallbackController.signal
    });
    clearTimeout(fallbackTimeoutId);
    
    if (response.ok) {
      const data = await response.json();
      const city = data.city || '';
      const region = data.regionName || '';
      const country = data.country || '';
      
      const locParts = [city, region, country].filter(Boolean);
      return {
        ip: data.query || null,
        location: locParts.length > 0 ? locParts.join(', ') : 'Unknown Location'
      };
    }
  } catch (error) {
    clearTimeout(fallbackTimeoutId);
    console.warn('Fallback location API (ip-api.com) failed.');
  }

  // 3. Fallback to basic ipify for IP lookup only
  const basicController = new AbortController();
  const basicTimeoutId = setTimeout(() => basicController.abort(), 3000);
  try {
    const response = await fetch('https://api.ipify.org?format=json', {
      signal: basicController.signal
    });
    clearTimeout(basicTimeoutId);
    
    if (response.ok) {
      const data = await response.json();
      return {
        ip: data.ip || null,
        location: 'Unknown Location'
      };
    }
  } catch (error) {
    clearTimeout(basicTimeoutId);
    console.warn('Basic IP fetcher (ipify) failed.');
  }

  return { ip: null, location: 'Unknown Location' };
}
