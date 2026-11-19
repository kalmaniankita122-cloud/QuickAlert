import React from "react";
import "./App.css";

import Navbar from "./components/Navbar";
import Home from "./pages/Home";
import Dashboard from "./pages/Dashboard";
import Alerts from "./pages/Alerts";
import SafetyGuide from "./pages/SafetyGuide";

function App() {
  return (
    <div className="app">
      <Navbar />

      <main>
        <Home />
        <Dashboard />
        <Alerts />
        <SafetyGuide />
      </main>

      <footer>
        <p>© 2026 QuakeAlert | Real-Time Earthquake Alert System</p>
      </footer>
    </div>
  );
}

export default App;