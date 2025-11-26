import fetch from "node-fetch";

const WMO = {
  0: "Soleado",
  1: "Mayormente despejado",
  2: "Parcialmente nublado",
  3: "Nublado",
  45: "Niebla",
  48: "Niebla helada",
  51: "Llovizna ligera",
  53: "Llovizna",
  55: "Llovizna intensa",
  61: "Lluvia ligera",
  63: "Lluvia",
  65: "Lluvia fuerte",
  71: "Nieve ligera",
  73: "Nieve",
  75: "Nieve fuerte",
  95: "Tormenta",
};

// ✅ CACHE SIMPLE
const cache = new Map(); // key => { time, data }
const CACHE_TTL = 10 * 60 * 1000; // 10 minutos

async function geocode(city) {
  const name = city || "Arequipa";
  const url = `https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(
    name
  )}&count=1&language=es&format=json`;

  const res = await fetch(url);
  const json = await res.json();
  const place = json.results?.[0];
  if (!place) throw new Error("Ciudad no encontrada");

  return {
    city: place.name,
    lat: place.latitude,
    lon: place.longitude,
  };
}

async function forecast(lat, lon) {
  const url =
    `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}` +
    `&current=temperature_2m,relative_humidity_2m,precipitation,wind_speed_10m,weather_code,is_day` +
    `&hourly=temperature_2m,precipitation_probability,wind_speed_10m,relative_humidity_2m` +
    `&daily=temperature_2m_max,temperature_2m_min,precipitation_probability_max,wind_speed_10m_max,sunrise,sunset,weather_code` +
    `&timezone=auto`;

  const res = await fetch(url);
  return await res.json();
}

// ✅ clima actual completo + cache
export async function getCurrentWeather(city) {
  const key = (city || "Arequipa").toLowerCase();

  const cached = cache.get(key);
  if (cached && Date.now() - cached.time < CACHE_TTL) {
    return { ...cached.data, cached: true };
  }

  const loc = await geocode(city);
  const data = await forecast(loc.lat, loc.lon);
  const c = data.current;

  const result = {
    city: loc.city,
    coords: { lat: loc.lat, lon: loc.lon },
    current: {
      temp: c.temperature_2m,
      humidity: c.relative_humidity_2m,
      wind: c.wind_speed_10m,
      precipitation: c.precipitation,
      condition: WMO[c.weather_code] || "Desconocido",
      isDay: !!c.is_day,
    },
    today: {
      min: data.daily.temperature_2m_min[0],
      max: data.daily.temperature_2m_max[0],
      sunrise: data.daily.sunrise[0],
      sunset: data.daily.sunset[0],
    },
    updatedAt: new Date().toISOString(),
    source: "open-meteo",
  };

  cache.set(key, { time: Date.now(), data: result });
  return result;
}

// ✅ pronóstico N días
export async function getForecast(city, days = 7) {
  const loc = await geocode(city);
  const data = await forecast(loc.lat, loc.lon);

  const d = Number(days) || 7;
  const out = [];

  for (let i = 0; i < d; i++) {
    out.push({
      date: data.daily.time[i],
      min: data.daily.temperature_2m_min[i],
      max: data.daily.temperature_2m_max[i],
      precipitationProb: data.daily.precipitation_probability_max[i],
      windMax: data.daily.wind_speed_10m_max[i],
      condition:
        WMO[data.daily.weather_code?.[i]] ||
        WMO[data.current.weather_code] ||
        "Desconocido",
    });
  }

  return {
    city: loc.city,
    coords: { lat: loc.lat, lon: loc.lon },
    days: out,
    source: "open-meteo",
  };
}

// ✅ riesgos simples para agricultores
export async function getClimateAlerts(city) {
  const current = await getCurrentWeather(city);
  const forecast3 = await getForecast(city, 3);

  const alerts = [];

  // heladas
  if (current.today.min <= 5) {
    alerts.push({
      type: "helada",
      level: "moderada",
      message: `Riesgo de helada: mínima ${current.today.min}°C`,
    });
  }

  // lluvia fuerte
  const maxRain = Math.max(
    ...forecast3.days.map((d) => d.precipitationProb)
  );
  if (maxRain >= 70) {
    alerts.push({
      type: "lluvia_fuerte",
      level: "alta",
      message: "Probabilidad de lluvia fuerte en próximos días.",
    });
  }

  // viento fuerte
  if (current.current.wind >= 18) {
    alerts.push({
      type: "viento_fuerte",
      level: "alta",
      message: `Viento fuerte actual: ${current.current.wind} km/h`,
    });
  }

  return {
    city: current.city,
    alerts,
    source: "open-meteo",
  };
}
