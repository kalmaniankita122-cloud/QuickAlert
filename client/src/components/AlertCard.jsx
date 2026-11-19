import React, { useEffect, useState } from "react";
import AuthPage from "./AuthPage";

function AuthGate({ children }) {
  const [user, setUser] = useState(null);
  const [checking, setChecking] = useState(true);

  useEffect(() => {
    async function checkLogin() {
      const token = localStorage.getItem("quakealert_token");

      if (!token) {
        setChecking(false);
        return;
      }

      try {
        const response = await fetch(
          "http://localhost:5000/api/auth/me",
          {
            headers: {
              Authorization: `Bearer ${token}`
            }
          }
        );

        const data = await response.json();

        if (!response.ok) throw new Error("Login expired");

        setUser(data.user);
        localStorage.setItem(
          "quakealert_user",
          JSON.stringify(data.user)
        );
      } catch {
        localStorage.removeItem("quakealert_token");
        localStorage.removeItem("quakealert_user");
      } finally {
        setChecking(false);
      }
    }

    checkLogin();
  }, []);

  function handleLogin(userData) {
    setUser(userData);
    localStorage.setItem(
      "quakealert_user",
      JSON.stringify(userData)
    );
  }

  function handleLogout() {
    localStorage.removeItem("quakealert_token");
    localStorage.removeItem("quakealert_user");
    setUser(null);
  }

  if (checking) {
    return <h2>Checking your account...</h2>;
  }

  if (!user) {
    return <AuthPage onLogin={handleLogin} />;
  }

  return (
    <>
      <div style={{
        padding: "15px",
        background: "#0b2c50",
        color: "white",
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center"
      }}>
        <span>Welcome, {user.fullName || user.full_name}</span>
        <button onClick={handleLogout}>Logout</button>
      </div>

      {children}
    </>
  );
}

export default AuthGate;