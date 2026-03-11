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
    </main>
  );
}
