import Navbar from "./Navbar";
import "./App.css";

export default function AboutPage() {
  return (
    <>
      <Navbar />
      <main className="pantry-page">
        <div className="background-glow background-glow-left" aria-hidden="true" />
        <div className="background-glow background-glow-right" aria-hidden="true" />

        <section className="pantry-card" style={{ textAlign: 'left' }}>
            <p className="eyebrow">The Story</p>
            {/* Myabe change image later and add text to the about section */}
            <img className="brand-logo" src="/src/assets/logo.png" alt="BetterCook chef logo"
                style={{float: 'right' }} />
            <h1>About BetterCook</h1> 
            <p className="subtitle" style={{ marginTop: '1rem' }}>
            INSERT TEXT LATER 
            </p>
          
            <div style={{ marginTop: '2rem', color: 'var(--ink)' }}>
            <p>
            INSERT TEXT LATER
            </p>
            </div>
        </section>
      </main>
    </>
  );
}