import { useState } from "react";
import { useNavigate } from "react-router-dom";

import "./Navbar.css";
import "./App.css";
import logo from "./assets/logo.png";

type UserEntry = {
  username: string;
  password: string;
};

type LoginPageProps = {
  onLoginSuccess: (username: string) => void;
};

const API_URL = (import.meta.env.VITE_API_BASE_URL ?? "http://localhost:8000").replace(/\/+$/, "");

function LoginPage({ onLoginSuccess }: LoginPageProps) {
  const navigate = useNavigate();

  const [user, setUser] = useState<UserEntry>({ username: "", password: "" });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);

  const submit = async (path: "/login" | "/register") => {
    const username = user.username.trim();
    const password = user.password;

    if (!username || !password) {
      setError("Enter username and password.");
      return;
    }

    setLoading(true);
    setError(null);
    setMessage(null);

    try {
      const response = await fetch(`${API_URL}${path}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password }),
      });

      const data = await response.json().catch(() => ({}));
      if (!response.ok) {
        throw new Error(data.detail ?? "Authentication failed.");
      }

      if (path === "/register") {
        setMessage("Account created. You can log in now.");
      } else {
        localStorage.setItem("bettercook_username", username);
        onLoginSuccess(username);
        navigate("/");
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Authentication failed.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="pantry-page">
      <section className="pantry-card">
        <img className="brand-logo" src={logo} alt="BetterCook chef logo" />
        <h1>Login</h1>
        <p className="subtitle">Sign in to save pantry items to your account.</p>

        <form
          className="pantry-form"
          onSubmit={(event) => {
            event.preventDefault();
            void submit("/login");
          }}
        >
          <label htmlFor="username" className="sr-only">
            Username
          </label>
          <input
            id="username"
            type="text"
            placeholder="Username"
            value={user.username}
            onChange={(event) => setUser({ ...user, username: event.target.value })}
            disabled={loading}
          />

          <label htmlFor="password" className="sr-only">
            Password
          </label>
          <input
            id="password"
            type="password"
            placeholder="Password"
            value={user.password}
            onChange={(event) => setUser({ ...user, password: event.target.value })}
            disabled={loading}
          />

          <button type="submit" disabled={loading}>
            {loading ? "Checking..." : "Login"}
          </button>
        </form>

        <button
          type="button"
          className="pill-btn"
          onClick={() => void submit("/register")}
          disabled={loading}
        >
          Create Account
        </button>

        {error && <p className="error-msg">{error}</p>}
        {message && <p className="empty-hint">{message}</p>}
      </section>
    </main>
  );
}

export default LoginPage;
