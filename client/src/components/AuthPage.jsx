import React, { useState } from "react";
import "./AuthPage.css";

function AuthPage({ onLogin }) {
  const [mode, setMode] = useState("register");
  const [form, setForm] = useState({
    fullName: "",
    email: "",
    password: "",
    confirmPassword: "",
    city: "",
    state: "",
    country: "India",
    latitude: "",
    longitude: "",
    radius: "100",
    minMagnitude: "3"
  });

  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  function handleChange(e) {
    setForm({ ...form, [e.target.name]: e.target.value });
  }

  function detectLocation() {
    if (!navigator.geolocation) {
      setMessage("Location is not supported by your browser.");
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        setForm((old) => ({
          ...old,
          latitude: position.coords.latitude.toString(),
          longitude: position.coords.longitude.toString()
        }));
        setMessage("Location detected! Enter your city and state.");
      },
      () => setMessage("Unable to detect location. Enter it manually.")
    );
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setMessage("");

    if (mode === "register" &&
        form.password !== form.confirmPassword) {
      setMessage("Passwords do not match.");
      return;
    }

    setLoading(true);

    try {
      const endpoint =
        mode === "register" ? "/register" : "/login";

      const body =
        mode === "register"
          ? {
              fullName: form.fullName,
              email: form.email,
              password: form.password,
              city: form.city,
              state: form.state,
              country: form.country,
              latitude: form.latitude === "" ? null : Number(form.latitude),
              longitude: form.longitude === "" ? null : Number(form.longitude),
              radius: Number(form.radius),
              minMagnitude: Number(form.minMagnitude)
            }
          : {
              email: form.email,
              password: form.password
            };

      const response = await fetch(
        "http://localhost:5000/api/auth" + endpoint,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(body)
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Request failed.");
      }

      localStorage.setItem("quakealert_token", data.token);
      localStorage.setItem("quakealert_user", JSON.stringify(data.user));

      setMessage("Success!");

      if (onLogin) onLogin(data.user);

    } catch (error) {
      setMessage(error.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="auth-container">
      <div className="auth-card">
        <h1>🌍 QuakeAlert</h1>
        <p>Real-Time Earthquake Alert System</p>

        <div className="auth-tabs">
          <button type="button"
            onClick={() => { setMode("register"); setMessage(""); }}>
            Register
          </button>
          <button type="button"
            onClick={() => { setMode("login"); setMessage(""); }}>
            Login
          </button>
        </div>

        <h2>{mode === "register" ? "Create Account" : "Welcome Back"}</h2>

        <form onSubmit={handleSubmit}>
          {mode === "register" && (
            <>
              <input name="fullName" placeholder="Full Name"
                value={form.fullName} onChange={handleChange} required />

              <input name="city" placeholder="City"
                value={form.city} onChange={handleChange} required />

              <input name="state" placeholder="State"
                value={form.state} onChange={handleChange} required />

              <input name="country" placeholder="Country"
                value={form.country} onChange={handleChange} required />

              <button type="button" onClick={detectLocation}>
                📍 Detect My Location
              </button>

              <p className="location-info">
                Latitude: {form.latitude || "Not detected"}<br />
                Longitude: {form.longitude || "Not detected"}
              </p>

              <label>Alert Radius</label>
              <select name="radius" value={form.radius}
                onChange={handleChange}>
                <option value="50">50 km</option>
                <option value="100">100 km</option>
                <option value="200">200 km</option>
                <option value="500">500 km</option>
              </select>

              <label>Minimum Earthquake Magnitude</label>
              <select name="minMagnitude" value={form.minMagnitude}
                onChange={handleChange}>
                <option value="2">2.0</option>
                <option value="3">3.0</option>
                <option value="4">4.0</option>
                <option value="5">5.0</option>
              </select>
            </>
          )}

          <input type="email" name="email"
            placeholder="Email Address"
            value={form.email} onChange={handleChange} required />

          <input type="password" name="password"
            placeholder="Password (minimum 8 characters)"
            value={form.password} onChange={handleChange}
            minLength={8} required />

          {mode === "register" && (
            <input type="password" name="confirmPassword"
              placeholder="Confirm Password"
              value={form.confirmPassword}
              onChange={handleChange} required />
          )}

          <button type="submit" disabled={loading}>
            {loading ? "Please wait..." :
              mode === "register" ? "Create Account" : "Login"}
          </button>
        </form>

        {message && <p className="auth-message">{message}</p>}

        <p className="switch-text">
          {mode === "register"
            ? "Already have an account?"
            : "Don't have an account?"}
          <button type="button"
            onClick={() => {
              setMode(mode === "register" ? "login" : "register");
              setMessage("");
            }}>
            {mode === "register" ? "Login" : "Register"}
          </button>
        </p>
      </div>
    </div>
  );
}

export default AuthPage;