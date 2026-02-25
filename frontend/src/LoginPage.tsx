import { useState } from "react";
import "./Navbar.css";
import "./App.css";
import logo from "./assets/logo.png";

type UserEntry = {
  username: string;
  password: string;
};

function LoginPage() {
  const [user, setUser] = useState<UserEntry>({
    username: "",
    password: "",
  });

  return (
    <main className="pantry-page">
      <section className="pantry-card">
        <img className="brand-logo" src={logo} alt="BetterCook chef logo" />
        <h1>Welcome Back!</h1>
        <form className="pantry-form">
          <label htmlFor="username" className="sr-only">
            Username
          </label>
          <input
            id="username"
            type="text"
            placeholder="Username"
            value={user.username}
            onChange={(event) => setUser({ ...user, username: event.target.value })}
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
          />
          <button type="submit">Login</button>
        </form>
      </section>
    </main>
  );
}

export default LoginPage;
