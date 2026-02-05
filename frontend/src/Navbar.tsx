import React, { useState } from "react";

type NavLink = { label: string; href: string };

const links: NavLink[] = [
  { label: "Home", href: "/" },
  { label: "Recipes", href: "/recipes" },
  { label: "Favorites", href: "/favorites" },
  { label: "About", href: "/about" },
];

export default function Navbar() {
  const [open, setOpen] = useState(false);

  return (
    <header style={styles.header}>
      <nav style={styles.nav} aria-label="Primary">
        <a href="/" style={styles.brand}>
          BetterCook
        </a>

        {/* Desktop links */}
        <ul style={styles.linksDesktop}>
          {links.map((l) => (
            <li key={l.href}>
              <a href={l.href} style={styles.link}>
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
          style={styles.menuButton}
        >
          ☰
        </button>
      </nav>

      {/* Mobile menu */}
      {open && (
        <div id="mobile-menu" style={styles.mobileMenu}>
          {links.map((l) => (
            <a
              key={l.href}
              href={l.href}
              style={styles.mobileLink}
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
  header: {
    position: "sticky",
    top: 0,
    zIndex: 50,
    background: "#fff",
    borderBottom: "1px solid #e5e7eb",
  },
  nav: {
    maxWidth: 1100,
    margin: "0 auto",
    padding: "12px 16px",
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 12,
  },
  brand: {
    fontWeight: 700,
    textDecoration: "none",
    color: "#111827",
    fontSize: 18,
  },
  linksDesktop: {
    listStyle: "none",
    margin: 0,
    padding: 0,
    display: "flex",
    alignItems: "center",
    gap: 16,
  },
  link: {
    textDecoration: "none",
    color: "#374151",
    fontWeight: 500,
  },
  menuButton: {
    display: "none",
    border: "1px solid #e5e7eb",
    background: "#fff",
    padding: "8px 10px",
    borderRadius: 8,
    cursor: "pointer",
  },
  mobileMenu: {
    maxWidth: 1100,
    margin: "0 auto",
    padding: "8px 16px 16px",
    display: "flex",
    flexDirection: "column",
    gap: 8,
  },
  mobileLink: {
    textDecoration: "none",
    color: "#374151",
    fontWeight: 500,
    padding: "10px 12px",
    borderRadius: 10,
    border: "1px solid #e5e7eb",
  },
};

// Simple CSS for responsiveness (drop into globals.css):
// @media (max-width: 640px) {
//   ul[style] { display: none !important; }   /* hides desktop links */
//   button[style] { display: inline-flex !important; } /* shows menu button */
// }
