import {useState} from "react";
import type {FormEvent} from "react";
import "./App.css";

type RecipesSearch = {
  id: number;
  name: string;
  quantity: number;
  unit: string
};

export default function RecipesPage() {
  const [itemInput, setItemInput] = useState("");
  const [, setItems] = useState<RecipesSearch[]>([]);
  const [results, setResults] = useState<RecipesSearch[]>([]);
  const handleSearch = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const value = itemInput.trim();
    if (!value) return;
    try {
      const response = await fetch(
        `http://localhost:8000/api/pantry/search?q=${encodeURIComponent(value)}`
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
            <p className="eyebrow">Your Recipes</p>
            <img className="brand-logo" src="/src/assets/logo.png" alt="BetterCook chef logo"
                style={{float: 'right'}} />
            <h1>What Recipes Are You Looking For?</h1> 
            <div style={{marginTop: '2rem', color: 'var(--ink)'}}>
            <form className="pantry-form" onSubmit={handleSearch}>
              <label htmlFor="pantry-item" className="sr-only">
                Pantry ingredient
              </label>
              <input
                id="pantry-item"
                type="text"
                placeholder="Search for recipes"
                value={itemInput}
                onChange={(event) => setItemInput(event.target.value)}
              />
              <button type="submit">Go!</button>
            </form>
            <ul className="item-list" aria-live="polite">
              {results.length === 0 ? (
                <li className="empty-state">No recipes yet.</li>
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
