import { useEffect, useRef, useState } from "react";
import { translations } from "../i18n";

const FEED =
  "https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/2.5_day.geojson";

function distanceKm(lat1, lon1, lat2, lon2) {
  const rad = (d) => (d * Math.PI) / 180;
  const dLat = rad(lat2 - lat1);
  const dLon = rad(lon2 - lon1);
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(rad(lat1)) * Math.cos(rad(lat2)) * Math.sin(dLon / 2) ** 2;
  return 6371 * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

function EarthquakeAlerts() {
  const [quakes, setQuakes] = useState([]);
  const [position, setPosition] = useState(null);
  const [error, setError] = useState(false);
  const [minMag, setMinMag] = useState(0);
  const [lang, setLang] = useState(localStorage.getItem("lang") || "en");
  const langRef = useRef(lang);
  const seen = useRef(new Set());
  const firstLoad = useRef(true);

  const t = translations[lang];

  useEffect(() => {
    langRef.current = lang;
    localStorage.setItem("lang", lang);
  }, [lang]);

  useEffect(() => {
    if ("Notification" in window && Notification.permission === "default") {
      Notification.requestPermission();
    }
    navigator.geolocation?.getCurrentPosition(
      (p) => setPosition({ lat: p.coords.latitude, lon: p.coords.longitude }),
      () => {}
    );
  }, []);

  useEffect(() => {
    const load = async () => {
      try {
        const res = await fetch(FEED);
        const data = await res.json();
        const list = data.features.map((f) => ({
          id: f.id,
          mag: f.properties.mag,
          place: f.properties.place,
          time: f.properties.time,
          lon: f.geometry.coordinates[0],
          lat: f.geometry.coordinates[1],
        }));
        if (!firstLoad.current && "Notification" in window) {
          list
            .filter((q) => !seen.current.has(q.id) && q.mag >= 4.5)
            .forEach((q) => {
              if (Notification.permission === "granted") {
                const tr = translations[langRef.current];
                new Notification(`${tr.notifTitle}${q.mag}`, { body: q.place });
              }
            });
        }
        list.forEach((q) => seen.current.add(q.id));
        firstLoad.current = false;
        setQuakes(list);
        setError(false);
      } catch {
        setError(true);
      }
    };
    load();
    const timer = setInterval(load, 60000);
    return () => clearInterval(timer);
  }, []);

  const filtered = quakes.filter((q) => q.mag >= minMag);

  const nearby = position
    ? filtered.filter(
        (q) => distanceKm(position.lat, position.lon, q.lat, q.lon) <= 500
      )
    : [];

  const row = (q) => (
    <li key={q.id}>
      <strong>M{q.mag}</strong> {q.place} -{" "}
      {new Date(q.time).toLocaleString(t.locale)}
    </li>
  );

  return (
    <div style={{ padding: 24, textAlign: "center" }}>
      <h1>{t.title}</h1>
      <div style={{ marginBottom: 16 }}>
        <label>{t.language}: </label>
        <select value={lang} onChange={(e) => setLang(e.target.value)}>
          <option value="en">English</option>
          <option value="hi">हिन्दी</option>
          <option value="kn">ಕನ್ನಡ</option>
        </select>
        <label style={{ marginLeft: 16 }}>{t.magnitude}: </label>
        <select
          value={minMag}
          onChange={(e) => setMinMag(Number(e.target.value))}
        >
          <option value={0}>{t.all}</option>
          <option value={3}>3+</option>
          <option value={4.5}>4.5+</option>
          <option value={6}>6+</option>
        </select>
      </div>
      {error && <p>{t.loadError}</p>}
      <div style={{ margin: "24px auto", maxWidth: 800 }}>
        <h2>{t.monitoring}</h2>
        <ul style={{ listStyle: "none", padding: 0 }}>
          {filtered.slice(0, 15).map(row)}
        </ul>
      </div>
      <div style={{ margin: "24px auto", maxWidth: 800 }}>
        <h2>{t.location}</h2>
        {!position && <p>{t.allowLocation}</p>}
        {position && nearby.length === 0 && <p>{t.noNearby}</p>}
        <ul style={{ listStyle: "none", padding: 0 }}>{nearby.map(row)}</ul>
      </div>
    </div>
  );
}

export default EarthquakeAlerts;