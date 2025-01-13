import { json } from '@remix-run/node';
import { useLoaderData } from '@remix-run/react';
import { fetchWeatherData } from '../api-services/open-weather-service';
import { capitalizeFirstLetter } from '../utils/text-formatting';
import type { MetaFunction } from '@remix-run/node';

export const meta: MetaFunction = () => {
  return [
    { title: 'Remix Weather' },
    {
      name: 'description',
      content: 'A demo web app using Remix and OpenWeather API.',
    },
  ];
};

const location = {
  city: 'Ottawa',
  postalCode: 'K2G 1V8', // Algonquin College, Woodroffe Campus
  lat: 45.3211,
  lon: -75.7391,
  countryCode: 'CA',
};
const units = 'metric';

export async function loader() {
  const data = await fetchWeatherData({
    lat: location.lat,
    lon: location.lon,
    units: units,
  });

  // Check if weather data is missing from response
  if (!data || !data.weather || !data.main) {
    throw new Error('Missing current weather data in the response.');
  }

  return json({ currentConditions: data });
}

export default function CurrentConditions() {
  const { currentConditions } = useLoaderData<typeof loader>();
  const weather = currentConditions.weather[0];

  return (
    <main
      style={{
        padding: '1.5rem',
        fontFamily: 'system-ui, sans-serif',
        lineHeight: '1.8',
      }}
    >
      <h1>Remix Weather</h1>
      <p>
        For Algonquin College, Woodroffe Campus <br />
        <span style={{ color: 'hsl(220, 23%, 60%)' }}>
          (LAT: {location.lat}, LON: {location.lon})
        </span>
      </p>
      <h2>Current Conditions</h2>
      <div
        style={{
          display: 'flex',
          flexDirection: 'row',
          gap: '2rem',
          alignItems: 'center',
        }}
      >
        <img src={getWeatherIconUrl(weather.icon)} alt="" />
        <div style={{ fontSize: '2rem' }}>
          {currentConditions.main.temp.toFixed(1)}°C
        </div>
      </div>
      <p style={{ fontSize: '1.2rem', fontWeight: '400' }}>
        {capitalizeFirstLetter(weather.description)}. Feels like{' '}
        {currentConditions.main.feels_like.toFixed(1)}°C.
        <br />
        <span style={{ color: 'hsl(220, 23%, 60%)', fontSize: '0.85rem' }}>
          updated at{' '}
          {new Intl.DateTimeFormat('en-CA', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
            hour: 'numeric',
            minute: '2-digit',
          }).format(currentConditions.dt * 1000)}
        </span>
      </p>
    </main>
  );
}

function getWeatherIconUrl(iconCode: string) {
  return `http://openweathermap.org/img/wn/${iconCode}@2x.png`;
}
