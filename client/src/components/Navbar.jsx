import React from "react";

function Navbar() {
  return (
    <nav className="navbar">
      <div className="logo">🌍 QuakeAlert</div>

      <ul className="nav-links">
        <li><a href="#home">Home</a></li>
        <li><a href="#dashboard">Dashboard</a></li>
        <li><a href="#alerts">Earthquake Alerts</a></li>
        <li><a href="#safety">Safety Guide</a></li>
      </ul>
    </nav>
  );
}

export default Navbar;