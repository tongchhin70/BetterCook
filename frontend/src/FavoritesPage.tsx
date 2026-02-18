import { useState } from "react";
import type { FormEvent } from "react";
import Navbar from "./Navbar";
import "./App.css";

type FavoritesSearch = {
  id: number;
  name: string;
};

export default function FavoritesPage() {
  const [itemInput, setItemInput] = useState("");
  const [items, setItems] = useState<FavoritesSearch[]>([]); {/* Saved for reference. */}

  const handleAddItem = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const value = itemInput.trim();
    if (!value) return;

    setItems((prev) => [...prev, { id: Date.now(), name: value }]);
    setItemInput("");
  };

  {/* Saved for reference.
  const handleRemoveItem = (id: number) => {
    setItems((prev) => prev.filter((item) => item.id !== id));
  };
  */}

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
            <form className="pantry-form" onSubmit={handleAddItem}>
              <label htmlFor="pantry-item" className="sr-only">
                Pantry ingredient
              </label>
              <input
                id="pantry-item"
                type="text"
                placeholder="Search for favorite recipes"
                value={itemInput}
                onChange={(event) => setItemInput(event.target.value)}
              />
              <button type="submit">Go!</button>
            </form>
            {/* Rework for search function implementation?
            <ul className="item-list" aria-live="polite">
              {items.length === 0 ? (
                <li className="empty-state">No ingredients yet.</li>
              ) : (
                items.map((item) => (
                  <li key={item.id} className="item-chip">
                    <span>{item.name}</span>
                    <button
                      type="button"
                      className="remove-chip"
                      aria-label={`Remove ${item.name}`}
                      onClick={() => handleRemoveItem(item.id)}
                    >
                      ×
                    </button>
                  </li>
                ))
              )}
            </ul>
            */}
            {/* Search goes to another page maybe? */}
          </div>
        </section>
      </main>
    </>
  );
}
