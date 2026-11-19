import React from "react";
import EarthquakeMap from "../components/EarthquakeMap";

function Dashboard() {
  return (
    <section className="section" id="dashboard">

      <h2>Earthquake Monitoring Dashboard</h2>
      <EarthquakeMap/>

      <p className="section-description">
        Monitor real-time earthquake activity around the world.
      </p>

      <div className="stats-grid">

        <div className="stat-card">
          <h3>Earthquake Monitoring</h3>
          <h2>LIVE</h2>
          <p>USGS earthquake feed</p>
        </div>

        <div className="stat-card">
          <h3>Map Status</h3>
          <h2>Active</h2>
          <p>Interactive earthquake map</p>
        </div>

        <div className="stat-card">
          <h3>Data Refresh</h3>
          <h2>60 sec</h2>
          <p>Automatic data refresh interval</p>
        </div>

      </div>

      <div style={{ marginTop: "40px" }}>
        <EarthquakeMap />
      </div>

    </section>
  );
}

export default Dashboard;