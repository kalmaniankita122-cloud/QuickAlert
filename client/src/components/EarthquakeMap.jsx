import React, { useEffect, useState, useRef } from "react";

import {
  MapContainer,
  TileLayer,
  Marker,
  Popup,
  CircleMarker,
  Circle,
  useMap
} from "react-leaflet";

import L from "leaflet";
import "leaflet/dist/leaflet.css";

// Default Bengaluru location
const BENGALURU = [12.9716, 77.5946];

// Automatically move map when location changes
function MapUpdater({ position }) {
  const map = useMap();

  useEffect(() => {
    map.flyTo(position, 10, {
      animate: true,
      duration: 1.5
    });
  }, [position, map]);

  return null;
}

// Create earthquake markers based on magnitude
function createEarthquakeIcon(magnitude) {
  let color = "green";

  if (magnitude >= 5) {
    color = "red";
  } else if (magnitude >= 3) {
    color = "orange";
  }

  return L.divIcon({
    className: "earthquake-marker",
    html: `
      <div style="
        background:${color};
        width:18px;
        height:18px;
        border:3px solid white;
        border-radius:50%;
        box-shadow:0 0 8px rgba(0,0,0,0.5);
      "></div>
    `,
    iconSize: [24, 24],
    iconAnchor: [12, 12]
  });
}

// Calculate distance between two locations
function calculateDistance(lat1, lon1, lat2, lon2) {
  const earthRadius = 6371;

  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;

  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) ** 2;

  const c = 2 * Math.atan2(
    Math.sqrt(a),
    Math.sqrt(1 - a)
  );

  return earthRadius * c;
}

function EarthquakeMap() {
  const [earthquakes, setEarthquakes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [userLocation, setUserLocation] = useState(null);
  const [locationMessage, setLocationMessage] = useState("");

  const [radius, setRadius] = useState(100);

  const [lastUpdated, setLastUpdated] = useState("");

  const [notificationsEnabled, setNotificationsEnabled] =
    useState(
      typeof Notification !== "undefined" &&
      Notification.permission === "granted"
    );

  const [newAlerts, setNewAlerts] = useState([]);

  const previousEarthquakeIds = useRef(null);

  // Fetch live earthquake data from USGS
  async function fetchEarthquakes() {
    try {
      const response = await fetch(
        "https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/all_day.geojson"
      );

      if (!response.ok) {
        throw new Error("Unable to fetch earthquake data");
      }

      const data = await response.json();

      setEarthquakes(data.features || []);

      setLastUpdated(
        new Date().toLocaleTimeString()
      );

      setError("");
    } catch (err) {
      console.error("Earthquake error:", err);

      setError(
        "Unable to load earthquake data. Please try again."
      );
    } finally {
      setLoading(false);
    }
  }

  // Initial fetch and automatic refresh
  useEffect(() => {
    fetchEarthquakes();

    const interval = setInterval(() => {
      fetchEarthquakes();
    }, 60000);

    return () => clearInterval(interval);
  }, []);

  // Detect current location
  function getUserLocation() {
    if (!navigator.geolocation) {
      setLocationMessage(
        "Your browser does not support location detection."
      );
      return;
    }

    setLocationMessage("Detecting your location...");

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const location = {
          lat: position.coords.latitude,
          lng: position.coords.longitude
        };

        setUserLocation(location);

        setLocationMessage(
          "Your location detected successfully."
        );
      },
      (err) => {
        console.error("Location error:", err);

        if (err.code === 1) {
          setLocationMessage(
            "Location permission denied. Please allow location access."
          );
        } else {
          setLocationMessage(
            "Unable to detect location. Please try again."
          );
        }
      },
      {
        enableHighAccuracy: true,
        timeout: 15000
      }
    );
  }

  // Enable browser notifications
  async function enableNotifications() {
    if (!("Notification" in window)) {
      alert(
        "Your browser does not support notifications."
      );
      return;
    }

    const permission =
      await Notification.requestPermission();

    setNotificationsEnabled(
      permission === "granted"
    );

    if (permission === "granted") {
      new Notification("QuakeAlert", {
        body: "Emergency notifications are now enabled."
      });
    } else {
      alert(
        "Please allow notifications in your browser settings."
      );
    }
  }

  // Detect newly reported nearby earthquakes
  useEffect(() => {
    if (earthquakes.length === 0) return;

    const currentIds = new Set(
      earthquakes.map((item) => item.id)
    );

    // Avoid showing existing earthquakes as new alerts
    if (previousEarthquakeIds.current === null) {
      previousEarthquakeIds.current = currentIds;
      return;
    }

    const newEarthquakes = earthquakes.filter(
      (item) =>
        !previousEarthquakeIds.current.has(item.id)
    );

    previousEarthquakeIds.current = currentIds;

    if (!userLocation) return;

    const nearbyAlerts = newEarthquakes.filter(
      (item) => {
        const [lng, lat] = item.geometry.coordinates;

        const magnitude =
          item.properties.mag ?? 0;

        const distance = calculateDistance(
          userLocation.lat,
          userLocation.lng,
          lat,
          lng
        );

        return (
          distance <= radius &&
          magnitude >= 3
        );
      }
    );

    if (nearbyAlerts.length > 0) {
      setNewAlerts((previous) => [
        ...nearbyAlerts,
        ...previous
      ]);

      if (
        "Notification" in window &&
        Notification.permission === "granted"
      ) {
        nearbyAlerts.forEach((item) => {
          new Notification(
            "QuakeAlert - Earthquake Report",
            {
              body: `${item.properties.place}. Magnitude: ${item.properties.mag}`,
              tag: item.id
            }
          );
        });
      }
    }
  }, [earthquakes, userLocation, radius]);

  // Earthquake statistics
  const totalEarthquakes = earthquakes.length;

  const magnitudes = earthquakes
    .map((item) => item.properties.mag)
    .filter((value) => value !== null);

  const maxMagnitude =
    magnitudes.length > 0
      ? Math.max(...magnitudes)
      : 0;

  const averageMagnitude =
    magnitudes.length > 0
      ? (
          magnitudes.reduce(
            (a, b) => a + b,
            0
          ) / magnitudes.length
        ).toFixed(2)
      : "0";

  const latestEarthquake =
    earthquakes.length > 0
      ? earthquakes[0]
      : null;

  // Nearby earthquake calculations
  const nearbyEarthquakes = userLocation
    ? earthquakes
        .map((item) => {
          const [lng, lat] =
            item.geometry.coordinates;

          const distance = calculateDistance(
            userLocation.lat,
            userLocation.lng,
            lat,
            lng
          );

          return {
            ...item,
            distance
          };
        })
        .filter(
          (item) => item.distance <= radius
        )
        .sort(
          (a, b) => a.distance - b.distance
        )
    : [];

  // Map center changes automatically
  const mapPosition = userLocation
    ? [userLocation.lat, userLocation.lng]
    : BENGALURU;

  return (
    <div className="earthquake-map-section">

      <h2>🌍 Live Earthquake Monitoring</h2>

      <p>
        Monitor earthquake activity around Bengaluru
        and other locations using live USGS reports.
      </p>

      {loading && (
        <p>Loading earthquake data...</p>
      )}

      {error && (
        <p style={{ color: "red" }}>
          {error}
        </p>
      )}

      {/* Statistics */}
      <div className="stats-grid">

        <div className="stat-card">
          <h3>Total Earthquakes</h3>
          <h2>{totalEarthquakes}</h2>
          <p>Last 24 hours worldwide</p>
        </div>

        <div className="stat-card">
          <h3>Maximum Magnitude</h3>
          <h2>{maxMagnitude}</h2>
          <p>Highest reported magnitude</p>
        </div>

        <div className="stat-card">
          <h3>Average Magnitude</h3>
          <h2>{averageMagnitude}</h2>
          <p>Average earthquake magnitude</p>
        </div>

        <div className="stat-card">
          <h3>Last Updated</h3>
          <h2 style={{ fontSize: "18px" }}>
            {lastUpdated || "Loading..."}
          </h2>
          <p>Refreshes every 60 seconds</p>
        </div>

      </div>

      {/* Location Detection */}
      <div style={{ marginTop: "30px" }}>

        <h2>📍 Nearby Earthquake Monitoring</h2>

        <button
          className="primary-btn"
          onClick={getUserLocation}
        >
          Detect My Location
        </button>

        <p>{locationMessage}</p>

        {userLocation && (
          <p>
            Latitude: {userLocation.lat.toFixed(4)}
            {" | "}
            Longitude: {userLocation.lng.toFixed(4)}
          </p>
        )}

        {/* Notification Settings */}
        <div style={{ margin: "15px 0" }}>

          <button
            className="primary-btn"
            onClick={enableNotifications}
          >
            {notificationsEnabled
              ? "Notifications Enabled ✓"
              : "Enable Emergency Notifications"}
          </button>

          <p>
            Notification Status:{" "}
            {notificationsEnabled
              ? "Enabled"
              : "Not Enabled"}
          </p>

        </div>

        {/* Radius Selection */}
        <div style={{ margin: "20px 0" }}>

          <label>
            <strong>
              Select Search Radius:
            </strong>
          </label>

          <select
            value={radius}
            onChange={(e) =>
              setRadius(Number(e.target.value))
            }
            style={{
              padding: "10px",
              marginLeft: "10px",
              borderRadius: "5px"
            }}
          >
            <option value={50}>50 KM</option>
            <option value={100}>100 KM</option>
            <option value={200}>200 KM</option>
            <option value={500}>500 KM</option>
          </select>

        </div>

        {/* Nearby Earthquake List */}
        {userLocation && (
          <div className="alert-card">

            <h3>
              Earthquakes Within {radius} KM
            </h3>

            {nearbyEarthquakes.length === 0 ? (
              <p>
                No earthquake reports found within
                the selected radius in the current
                USGS feed.
              </p>
            ) : (
              nearbyEarthquakes.map((item) => (
                <div
                  key={item.id}
                  style={{
                    padding: "12px",
                    marginTop: "10px",
                    borderBottom: "1px solid #ddd"
                  }}
                >
                  <h4>
                    {item.properties.place}
                  </h4>

                  <p>
                    Magnitude: {item.properties.mag}
                  </p>

                  <p>
                    Distance: {item.distance.toFixed(2)} KM
                  </p>

                  <p>
                    Depth: {item.geometry.coordinates[2]} KM
                  </p>

                  <p>
                    Time:{" "}
                    {new Date(
                      item.properties.time
                    ).toLocaleString()}
                  </p>

                </div>
              ))
            )}

          </div>
        )}

        {/* New Earthquake Alerts */}
        {newAlerts.length > 0 && (
          <div className="alert-card">

            <h3>
              ⚠️ New Nearby Earthquake Reports
            </h3>

            {newAlerts.map((item) => (
              <div
                key={item.id}
                style={{ marginTop: "15px" }}
              >
                <h4>
                  {item.properties.place}
                </h4>

                <p>
                  Magnitude: {item.properties.mag}
                </p>

              </div>
            ))}

          </div>
        )}

      </div>

      {/* Interactive Map */}
      <h2 style={{ marginTop: "35px" }}>
        🗺️ Interactive Earthquake Map
      </h2>

      <p>
        The map initially displays Bengaluru.
        Detect your location to view your surroundings.
      </p>

      <div
        className="map-container"
        style={{
          height: "500px",
          width: "100%",
          marginTop: "20px"
        }}
      >

        <MapContainer
          center={BENGALURU}
          zoom={10}
          style={{
            height: "100%",
            width: "100%"
          }}
        >

          <MapUpdater position={mapPosition} />

          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />

          {/* Earthquake Markers */}
          {earthquakes.map((item) => {
            const [lng, lat, depth] =
              item.geometry.coordinates;

            const magnitude =
              item.properties.mag ?? 0;

            return (
              <Marker
                key={item.id}
                position={[lat, lng]}
                icon={createEarthquakeIcon(magnitude)}
              >

                <Popup>

                  <h3>Earthquake Details</h3>

                  <p>
                    <strong>Place:</strong>{" "}
                    {item.properties.place}
                  </p>

                  <p>
                    <strong>Magnitude:</strong>{" "}
                    {magnitude}
                  </p>

                  <p>
                    <strong>Depth:</strong>{" "}
                    {depth} KM
                  </p>

                  <p>
                    <strong>Time:</strong>{" "}
                    {new Date(
                      item.properties.time
                    ).toLocaleString()}
                  </p>

                  <a
                    href={item.properties.url}
                    target="_blank"
                    rel="noreferrer"
                  >
                    View USGS Report
                  </a>

                </Popup>

              </Marker>
            );
          })}

          {/* User Location */}
          {userLocation && (
            <>
              <CircleMarker
                center={[
                  userLocation.lat,
                  userLocation.lng
                ]}
                radius={10}
                pathOptions={{
                  color: "blue",
                  fillColor: "blue",
                  fillOpacity: 1
                }}
              >
                <Popup>
                  Your Current Location
                </Popup>
              </CircleMarker>

              {/* Nearby Search Radius */}
              <Circle
                center={[
                  userLocation.lat,
                  userLocation.lng
                ]}
                radius={radius * 1000}
                pathOptions={{
                  color: "blue",
                  fillColor: "blue",
                  fillOpacity: 0.08
                }}
              />
            </>
          )}

        </MapContainer>

      </div>

      {/* Map Legend */}
      <div style={{ marginTop: "15px" }}>

        <h3>Map Legend</h3>

        <p>🟢 Magnitude below 3</p>
        <p>🟠 Magnitude 3 to 4.9</p>
        <p>🔴 Magnitude 5 or above</p>
        <p>🔵 Your Current Location</p>

      </div>

      {/* Latest Earthquake */}
      {latestEarthquake && (
        <div className="alert-card">

          <h3>Latest Earthquake Report</h3>

          <p>
            <strong>Location:</strong>{" "}
            {latestEarthquake.properties.place}
          </p>

          <p>
            <strong>Magnitude:</strong>{" "}
            {latestEarthquake.properties.mag}
          </p>

          <p>
            <strong>Time:</strong>{" "}
            {new Date(
              latestEarthquake.properties.time
            ).toLocaleString()}
          </p>

        </div>
      )}

      <p style={{ marginTop: "20px", fontSize: "13px" }}>
        Data Source: USGS Earthquake Hazards Program.
        This application displays reported earthquake
        events and does not predict earthquakes or
        provide guaranteed advance warnings.
      </p>

    </div>
  );
}

export default EarthquakeMap;