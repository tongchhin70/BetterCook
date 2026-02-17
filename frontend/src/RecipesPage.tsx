import Navbar from "./Navbar";
import "./App.css";

export default function RecipesPage() {
  return (
    <>
      <Navbar />
      <main className="pantry-page">
        <div className="background-glow background-glow-left" aria-hidden="true" />
        <div className="background-glow background-glow-right" aria-hidden="true" />
        <section className="pantry-card" style={{ textAlign: 'left' }}>
            <p className="eyebrow">Your Recipes</p>
            <img className="brand-logo" src="/src/assets/logo.png" alt="BetterCook chef logo"
                style={{float: 'right' }} />
            <h1>What Recipes Are You Looking For?</h1> 
            <p className="subtitle" style={{ marginTop: '1rem' }}>
            </p>
            <div style={{ marginTop: '2rem', color: 'var(--ink)' }}>
            <p>
            (Search bar and recipe cards will go here)
            </p>
            </div>
        </section>
      </main>
    </>
  );
}
