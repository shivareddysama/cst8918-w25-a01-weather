const API_KEY = process.env.WEATHER_API_KEY;
const TEN_MINUTES = 1000 * 60 * 10; // in milliseconds

const resultsCache: Record<string, { lastFetch: number; data: unknown }> = {};
function getCacheEntry(key: string) {
  return resultsCache[key];
}
function setCacheEntry(key: string, data: unknown) {
  resultsCache[key] = { lastFetch: Date.now(), data };
}
function isDataStale(lastFetch: number) {
  return Date.now() - lastFetch > TEN_MINUTES;
}

interface FetchWeatherDataParams {
  lat: number;
  lon: number;
  units: string;
}

export async function fetchWeatherData({
  lat,
  lon,
  units,
}: FetchWeatherDataParams) {
  const baseURL = 'https://api.openweathermap.org/data/2.5/weather';
  const queryString = `lat=${lat}&lon=${lon}&units=${units}&appid=${API_KEY}`;

  console.log('Fetching weather data with query:', queryString);
  console.log('Using API key:', API_KEY);

  const cacheEntry = getCacheEntry(queryString);
  if (cacheEntry && !isDataStale(cacheEntry.lastFetch)) {
    return cacheEntry.data;
  }

  try {
    const response = await fetch(`${baseURL}?${queryString}`);
    const data = await response.json();

    console.log('API response data:', data);

    // Check for valid data and return response
    if (!data || data.cod !== 200) {
      throw new Error('Error fetching weather data');
    }

    setCacheEntry(queryString, data);
    return data;
  } catch (error) {
    console.error('Error fetching weather data:', error);
    throw error;
  }
}
