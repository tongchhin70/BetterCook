import { useState, type CSSProperties } from "react";
import { Link, NavLink } from "react-router-dom";

import "./Navbar.css";
import logo from "./assets/logo.png";

type NavItem = { label: string; to: string };

const links: NavItem[] = [
  { label: "Home", to: "/" },
  { label: "Recipes", to: "/recipes" },
  { label: "Favorites", to: "/favorites" },
  { label: "About", to: "/about" },
  { label: "Login", to: "/login" },
];

export default function Navbar() {
  const [open, setOpen] = useState(false);

  return (
    <header style={styles.navbar}>
      <nav style={styles.navbarInner} aria-label="Primary">
        <img style={styles.navbarLogo} src={logo} alt="BetterCook chef logo" />
        <Link to="/" style={styles.logo}>
          BetterCook
        </Link>

        <ul style={styles.navLinks}>
          {links.map((link) => (
            <li key={link.to}>
              <NavLink to={link.to} style={styles.navLinksA}>
                {link.label}
              </NavLink>
            </li>
          ))}
        </ul>

        <button
          type="button"
          onClick={() => setOpen((v) => !v)}
          aria-expanded={open}
          aria-controls="mobile-menu"
          style={styles.menuBtn}
        >
          ☰
        </button>
      </nav>

      {open && (
        <div id="mobile-menu" style={styles.mobileMenu}>
          {links.map((link) => (
            <NavLink
              key={link.to}
              to={link.to}
              style={styles.mobileMenuA}
              onClick={() => setOpen(false)}
            >
              {link.label}
            </NavLink>
          ))}
        </div>
      )}
    </header>
  );
}

const styles: Record<string, CSSProperties> = {
  navbar: {
    position: "sticky",
    top: 0,
    background: "#ffc49f",
    borderBottom: "1px solid #e5e7eb",
    zIndex: 50,
  },
  navbarInner: {
    maxWidth: "1100px",
    margin: "auto",
    padding: "12px 16px",
    display: "flex",
    alignItems: "center",
    justifyContent: "flex-start",
    gap: "765px",
    marginLeft: "55px",
  },
  navbarLogo: {
    position: "absolute",
    left: "15px",
    top: "50%",
    transform: "translateY(-50%)",
    width: "50px",
    height: "50px",
    objectFit: "contain",
  },
  logo: {
    fontWeight: 700,
    fontSize: "1.1rem",
    color: "#111827",
    textDecoration: "none",
  },
  navLinks: {
    listStyle: "none",
    margin: 0,
    padding: 0,
    display: "flex",
    alignItems: "center",
    gap: "1.25rem",
  },
  navLinksA: {
    textDecoration: "none",
    color: "#374151",
    fontWeight: 500,
  },
  menuBtn: {
    display: "none",
    fontSize: "1.25rem",
    background: "none",
    border: "none",
    cursor: "pointer",
  },
  mobileMenu: {
    display: "flex",
    flexDirection: "column",
    gap: "0.75rem",
    padding: "12px 16px 16px",
  },
  mobileMenuA: {
    textDecoration: "none",
    color: "#374151",
    fontWeight: 500,
    padding: "10px",
    borderRadius: "8px",
    border: "1px solid #e5e7eb",
  },
};
