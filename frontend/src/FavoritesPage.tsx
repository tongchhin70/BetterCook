import { useState } from "react";
import type { FormEvent } from "react";
import "./App.css";
import FilterSidebar, { defaultFilters } from "./Filter";
import type { Filters } from "./Filter";

type FavoritesSearch = { id: number; name: string; quantity: number; unit: string };

export default function FavoritesPage() {
  const [itemInput, setItemInput] = useState("");
  const [results, setResults]     = useState<FavoritesSearch[]>([]);
  const [filters, setFilters]     = useState<Filters>(defaultFilters);

  const handleSearch = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const value = itemInput.trim();
    if (!value) return;
    try {
      const res = await fetch(
        `http://localhost:8000/api/favorites/search?q=${encodeURIComponent(value)}`
      );
      if (!res.ok) throw new Error("Search failed");
      setResults(await res.json());
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <main className="pantry-page filter-layout">
      <FilterSidebar filters={filters} onChange={setFilters} />

      <div className="filter-main">
        <section className="pantry-card" style={{ textAlign: "left" }}>
          <p className="eyebrow">Your Favorite Recipes</p>
          <img className="brand-logo" src="/src/assets/logo.png"
            alt="BetterCook chef logo" style={{ float: "right" }} />
          <h1>What Favorite Recipes Are You Looking For?</h1>

          <form className="pantry-form" onSubmit={handleSearch}>
            <label htmlFor="favorites-input" className="sr-only">Favorite recipe search</label>
            <input id="favorites-input" type="text" placeholder="Search for favorite recipes"
              value={itemInput} onChange={(e) => setItemInput(e.target.value)} />
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
        </section>
      </div>
    </main>
  );
}