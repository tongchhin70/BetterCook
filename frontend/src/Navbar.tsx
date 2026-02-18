import React, { useState } from "react";
import "./Navbar.css";
import logo from "./assets/logo.png";

type NavLink = { label: string; href: string };

const links: NavLink[] = [
  { label: "Home", href: "/" },
  { label: "Recipes", href: "/recipes" },
  { label: "Favorites", href: "/favorites" },
  { label: "About", href: "/about" },
  { label: "Login", href: "/login" },
];

export default function Navbar() {
  const [open, setOpen] = useState(false);

  return (
    <header style={styles.navbar}>
      <nav style={styles.navbar_inner} aria-label="Primary">
        <img style={styles.navbar_logo} src={logo} alt="BetterCook chef logo" />
        <a href="/" style={styles.logo}>
          BetterCook
        </a>

        {/* Desktop links */}
        <ul style={styles.nav_links}>
          {links.map((l) => (
            <li key={l.href}>
              <a href={l.href} style={styles.nav_links_a}>
                {l.label}
              </a>
            </li>
          ))}
        </ul>

        {/* Mobile button */}
        <button
          type="button"

          onClick={() => setOpen((v) => !v)}
          aria-expanded={open}
          aria-controls="mobile-menu"
          style={styles.menu_btn}
        >
          ☰
        </button>
      </nav>

      {/* Mobile menu */}
      {open && (
        <div id="mobile-menu" style={styles.mobile_menu}>
          {links.map((l) => (
            <a
              key={l.href}
              href={l.href}
              style={styles.mobile_menu_a}
              onClick={() => setOpen(false)}
            >
              {l.label}
            </a>
          ))}
        </div>
      )}
    </header>
  );
}

const styles: Record<string, React.CSSProperties> = {
  navbar: {
    position: "sticky",
    top: 0,
    background: "#ffc49f",
    borderBottom: "1px solid #e5e7eb",
    zIndex: 50,
  },

  navbar_inner: {
    maxWidth: "1100px",
    margin: "auto",
    padding: "12px 16px",
    display: "flex",
    alignItems: "center",
    justifyContent: "flex-start",
    gap: "810px",
    marginLeft: "55px",
  },

  navbar_logo: {
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

  nav_links: {
    listStyle: "none",
    margin: 0,
    padding: 0,
    display: "flex",
    alignItems: "center",
    gap: "1.25rem",
  },

  nav_links_a: {
    textDecoration: "none",
    color: "#374151",
    fontWeight: 500,
  },

  menu_btn: {
    display: "none",
    fontSize: "1.25rem",
    background: "none",
    border: "none",
    cursor: "pointer",
  },

  mobile_menu: {
    display: "flex",
    flexDirection: "column",
    gap: "0.75rem",
    padding: "12px 16px 16px",
  },

  mobile_menu_a: {
    textDecoration: "none",
    color: "#374151",
    fontWeight: 500,
    padding: "10px",
    borderRadius: "8px",
    border: "1px solid #e5e7eb",
  },
};

// Simple CSS for responsiveness (drop into globals.css):
// @media (max-width: 640px) {
//   ul[style] { display: none !important; }   /* hides desktop links */
//   button[style] { display: inline-flex !important; } /* shows menu button */
// }
