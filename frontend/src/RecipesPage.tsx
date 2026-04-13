import { useState } from "react";
import type { FormEvent } from "react";
import "./App.css";
import FilterSidebar, { defaultFilters } from "./Filter";
import type { Filters } from "./Filter";

type RecipesSearch = { id: number; name: string; quantity: number; unit: string };

export default function RecipesPage() {
  const [itemInput, setItemInput] = useState("");
  const [results, setResults]     = useState<RecipesSearch[]>([]);
  const [filters, setFilters]     = useState<Filters>(defaultFilters);

  const handleSearch = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const value = itemInput.trim();
    if (!value) return;
    try {
      const res = await fetch(
        `http://localhost:8000/api/recipes/search?q=${encodeURIComponent(value)}`
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
          <p className="eyebrow">Your Recipes</p>
          <img className="brand-logo" src="/src/assets/logo.png"
            alt="BetterCook chef logo" style={{ float: "right" }} />
          <h1>What Recipes Are You Looking For?</h1>

          <form className="pantry-form" onSubmit={handleSearch}>
            <label htmlFor="recipes-input" className="sr-only">Recipe search</label>
            <input id="recipes-input" type="text" placeholder="Search for recipes"
              value={itemInput} onChange={(e) => setItemInput(e.target.value)} />
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
        </section>
      </div>
    </main>
  );
}