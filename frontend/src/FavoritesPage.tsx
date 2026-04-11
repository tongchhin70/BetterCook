import {useState} from "react";
import type {FormEvent} from "react";
import "./App.css";

type FavoritesSearch = {
  id: number;
  name: string;
  quantity: number;
  unit: string
};

export default function FavoritesPage() {
  const [itemInput, setItemInput] = useState("");
  const [, setItems] = useState<FavoritesSearch[]>([]);
  const [results, setResults] = useState<FavoritesSearch[]>([]);
  const handleSearch = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const value = itemInput.trim();
    if (!value) return;
    try {
      const response = await fetch(
        `http://localhost:8000/api/favorites/search?q=${encodeURIComponent(value)}`
      );
      if (!response.ok) {
        throw new Error("Search failed");
      }
      const data = await response.json();
      setResults(data);
    } catch (error) {
      console.error(error);
    }
  };

  {/* Saved for reference.
  const handleRemoveItem = (id: number) => {
    setItems((prev) => prev.filter((item) => item.id !== id));
  };
  */}

  return (
    <main className="pantry-page">
        <section className="pantry-card" style={{textAlign: 'left'}}>
            <p className="eyebrow">Your Favorite Recipes</p>
            <img className="brand-logo" src="/src/assets/logo.png" alt="BetterCook chef logo"
                style={{float: 'right'}} />
            <h1>What Favorite Recipes Are You Looking For?</h1>
            <div style={{marginTop: '2rem', color: 'var(--ink)'}}>
            <form className="pantry-form" onSubmit={handleSearch}>
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
            <ul className="item-list" aria-live="polite">
              {results.length === 0 ? (
                <li className="empty-state">No favorites yet.</li>
              ) : (
                results.map((item) => (
                  <li key={item.id} className="item-chip">
                    <span>{item.name} ({item.quantity} {item.unit})</span>
                  </li>
                ))
              )}
            </ul>
            {/* Search goes to another page maybe? */}
          </div>
        </section>
    </main>
  );
}
