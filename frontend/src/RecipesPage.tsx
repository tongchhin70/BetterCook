<<<<<<< HEAD
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
=======
import { useEffect, useMemo, useState } from "react";
import type { Recipe } from "./types/recipes";
import "./Navbar.css";
import "./App.css";

export default function RecipesPage() {
  const [search, setSearch] = useState("");
  const [recipes, setRecipes] = useState<Recipe[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const apiBaseUrl = useMemo(
    () => (import.meta.env.VITE_API_BASE_URL ?? "http://localhost:8000").replace(/\/+$/, ""),
    []
  );

  const buildApiUrl = (path: string) => `${apiBaseUrl}${path.startsWith("/") ? path : `/${path}`}`;

  const fetchRecipes = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch(buildApiUrl("/api/recipes"));
      if (!response.ok) {
        throw new Error(`Failed to load recipes (${response.status})`);
      }
      const data: Recipe[] = await response.json();
      setRecipes(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unable to load recipes");
    } finally {
      setLoading(false);
>>>>>>> tong-branch
    }
  };

  useEffect(() => {
    void fetchRecipes();
  }, []);

  const filteredRecipes = recipes.filter((recipe) =>
    recipe.name.toLowerCase().includes(search.toLowerCase().trim())
  );

  return (
    <main className="pantry-page">
<<<<<<< HEAD
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
=======
      <section className="pantry-card" style={{ textAlign: "left" }}>
        <p className="eyebrow">Your Recipes</p>
        <h1>Recipes in Database</h1>

        <form className="pantry-form" onSubmit={(event) => event.preventDefault()}>
          <input
            type="text"
            placeholder="Search recipe name"
            value={search}
            onChange={(event) => setSearch(event.target.value)}
          />
          <button type="button" onClick={() => void fetchRecipes()}>
            Refresh
          </button>
        </form>

        {error ? <p style={{ color: "#b91c1c", marginTop: "0.75rem" }}>{error}</p> : null}

        <div style={{ marginTop: "1rem", color: "var(--ink)" }}>
          {loading ? (
            <p>Loading recipes...</p>
          ) : filteredRecipes.length === 0 ? (
            <p>No recipes found.</p>
          ) : (
            <ul className="item-list" style={{ justifyContent: "flex-start" }}>
              {filteredRecipes.map((recipe) => (
                <li key={recipe.id} className="item-chip" style={{ borderRadius: "12px" }}>
                  <span>
                    <strong>{recipe.name}</strong> ({recipe.prep_time + recipe.cook_time} min, {recipe.servings} servings)
                  </span>
                </li>
              ))}
            </ul>
          )}
        </div>
      </section>
>>>>>>> tong-branch
    </main>
  );
}
