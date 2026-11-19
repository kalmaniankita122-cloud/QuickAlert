import React from "react";

function Home() {
  return (
    <section className="hero" id="home">
      <h1>Stay Alert. Stay Safe. Save Lives.</h1>

      <p>
        QuakeAlert is a real-time earthquake monitoring and
        location-based emergency notification system.
        Get earthquake updates, monitor seismic activity
        and stay prepared during emergencies.
      </p>

      <a href="#dashboard">
        <button className="primary-btn">
          Explore Live Dashboard
        </button>
      </a>
    </section>
  );
}

export default Home;