import Navbar from "./Navbar";
import "./App.css";

export default function FavoritesPage() {
  return (
    <>
      <Navbar />
      <main className="pantry-page">
        <div className="background-glow background-glow-left" aria-hidden="true" />
        <div className="background-glow background-glow-right" aria-hidden="true" />
        <section className="pantry-card" style={{ textAlign: 'left' }}>
            <p className="eyebrow">Your Favorite Recipes</p>
            <img className="brand-logo" src="/src/assets/logo.png" alt="BetterCook chef logo"
                style={{float: 'right' }} />
            <h1>What Are Your Favorite Recipes?</h1>
            <div style={{ marginTop: '2rem', color: 'var(--ink)' }}>
            <p>
            (Favorites search bar and favorite recipe cards will go here)
            </p>
            </div>
        </section>
      </main>
    </>
  );
}
