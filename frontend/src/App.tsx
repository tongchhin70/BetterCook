import { useEffect, useState } from "react";
import type { FormEvent } from "react";
import { BrowserRouter, Link, Route, Routes } from "react-router-dom";

import "./App.css";
import AboutPage from "./AboutPage";
import FavoritesPage from "./FavoritesPage";
import LoginPage from "./LoginPage";
import Navbar from "./Navbar";
import RecipesPage from "./RecipesPage";
import { FoodCard, fetchNutrition } from "./card";
import type { NutritionInfo, PantryItem } from "./card";

const API_URL = (import.meta.env.VITE_API_BASE_URL ?? "http://localhost:8000").replace(/\/+$/, "");

type BackendPantryItem = {
  id: number;
  name: string;
  quantity: number;
  unit: string;
};

function fallbackNutrition(name: string): NutritionInfo {
  return {
    name,
    unit: "100g",
    image_url:
      "https://upload.wikimedia.org/wikipedia/commons/thumb/6/6d/Good_Food_Display_-_NCI_Visuals_Online.jpg/480px-Good_Food_Display_-_NCI_Visuals_Online.jpg",
    calories: 0,
    protein: 0,
    carbs: 0,
    fat: 0,
    fiber: 0,
    sodium: 0,
  };
}

async function hydratePantryItems(items: BackendPantryItem[]): Promise<PantryItem[]> {
  const hydrated = await Promise.all(
    items.map(async (item) => {
      try {
        const nutrition = await fetchNutrition(item.name);
        return { id: item.id, name: item.name, quantity: item.quantity, nutrition };
      } catch {
        return {
          id: item.id,
          name: item.name,
          quantity: item.quantity,
          nutrition: fallbackNutrition(item.name),
        };
      }
    })
  );

  return hydrated;
}

function PantryHome({ username }: { username: string | null }) {
  const [itemInput, setItemInput] = useState("");
  const [items, setItems] = useState<PantryItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadPantry = async () => {
      if (!username) {
        setItems([]);
        return;
      }

      setLoading(true);
      setError(null);

      try {
        const response = await fetch(`${API_URL}/api/pantry`, {
          headers: {
            "X-Username": username,
          },
        });

        if (!response.ok) {
          throw new Error("Could not load pantry items.");
        }

        const pantryItems: BackendPantryItem[] = await response.json();
        const hydrated = await hydratePantryItems(pantryItems);
        setItems(hydrated);
      } catch {
        setError("Could not load pantry items from backend.");
      } finally {
        setLoading(false);
      }
    };

    void loadPantry();
  }, [username]);

  const handleAddItem = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const value = itemInput.trim();
    if (!value) return;

    if (!username) {
      setError("Please log in to save pantry items.");
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const existing = items.find((item) => item.name.toLowerCase() === value.toLowerCase());

      if (existing) {
        const updatedQty = existing.quantity + 1;
        const response = await fetch(`${API_URL}/api/pantry/${existing.id}`, {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            "X-Username": username,
          },
          body: JSON.stringify({ name: existing.name, quantity: updatedQty, unit: "pcs" }),
        });

        if (!response.ok) {
          throw new Error("Could not update pantry item.");
        }

        setItems((prev) =>
          prev.map((item) =>
            item.id === existing.id ? { ...item, quantity: updatedQty } : item
          )
        );
        setItemInput("");
        return;
      }

      const response = await fetch(`${API_URL}/api/pantry`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "X-Username": username,
        },
        body: JSON.stringify({ name: value, quantity: 1, unit: "pcs" }),
      });

      if (!response.ok) {
        throw new Error("Could not save pantry item.");
      }

      const createdItem: BackendPantryItem = await response.json();

      let nutrition: NutritionInfo;
      try {
        nutrition = await fetchNutrition(createdItem.name);
      } catch {
        nutrition = fallbackNutrition(createdItem.name);
      }

      setItems((prev) => [
        ...prev,
        {
          id: createdItem.id,
          name: createdItem.name,
          quantity: createdItem.quantity,
          nutrition,
        },
      ]);
      setItemInput("");
    } catch {
      setError("Could not save pantry item.");
    } finally {
      setLoading(false);
    }
  };

  const handleRemoveItem = async (id: number) => {
    if (!username) {
      setError("Please log in to save pantry items.");
      return;
    }

    try {
      const response = await fetch(`${API_URL}/api/pantry/${id}`, {
        method: "DELETE",
        headers: {
          "X-Username": username,
        },
      });

      if (!response.ok) {
        throw new Error("Delete failed.");
      }

      setItems((prev) => prev.filter((item) => item.id !== id));
    } catch {
      setError("Could not remove pantry item.");
    }
  };

  const handleQuantityChange = async (id: number, delta: number) => {
    if (!username) {
      setError("Please log in to save pantry items.");
      return;
    }

    const target = items.find((item) => item.id === id);
    if (!target) return;

    const updatedQty = Math.max(1, target.quantity + delta);

    try {
      const response = await fetch(`${API_URL}/api/pantry/${id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          "X-Username": username,
        },
        body: JSON.stringify({ name: target.name, quantity: updatedQty, unit: "pcs" }),
      });

      if (!response.ok) {
        throw new Error("Update failed.");
      }

      setItems((prev) =>
        prev.map((item) =>
          item.id === id ? { ...item, quantity: updatedQty } : item
        )
      );
    } catch {
      setError("Could not update pantry quantity.");
    }
  };

  const totals = items.reduce(
    (acc, item) => ({
      calories: acc.calories + item.nutrition.calories * item.quantity,
      protein: acc.protein + item.nutrition.protein * item.quantity,
      carbs: acc.carbs + item.nutrition.carbs * item.quantity,
      fat: acc.fat + item.nutrition.fat * item.quantity,
    }),
    { calories: 0, protein: 0, carbs: 0, fat: 0 }
  );

  if (!username) {
    return (
      <main className="pantry-page">
        <section className="pantry-card" aria-label="Login required">
          <p className="eyebrow">My Pantry</p>
          <h1>What Is In Your Pantry?</h1>
          <p className="subtitle">Login first so your pantry items are saved to your account.</p>
          <Link to="/login" className="pill-btn">
            Go To Login
          </Link>
        </section>
      </main>
    );
  }

  return (
    <main className="pantry-page">
      <div className="background-glow background-glow-left" />
      <div className="background-glow background-glow-right" />

      <section className="pantry-card" aria-label="Pantry input">
        <p className="eyebrow">My Pantry</p>
        <h1>What Is In Your Pantry?</h1>
        <p className="subtitle">Add ingredients to track nutrition and plan meals.</p>

        <form className="pantry-form" onSubmit={handleAddItem}>
          <label htmlFor="pantry-item" className="sr-only">
            Pantry ingredient
          </label>
          <input
            id="pantry-item"
            type="text"
            placeholder="e.g. egg, banana, chicken…"
            value={itemInput}
            onChange={(e) => setItemInput(e.target.value)}
            autoComplete="off"
            disabled={loading}
          />
          <button type="submit" disabled={loading}>
            {loading ? "Saving..." : "Add +"}
          </button>
        </form>

        {error && <p className="error-msg">{error}</p>}

        {items.length > 0 && (
          <div className="totals-bar">
            <div className="totals-item">
              <span className="totals-number">{Math.round(totals.calories)}</span>
              <span className="totals-label">kcal</span>
            </div>
            <div className="totals-sep" />
            <div className="totals-item">
              <span className="totals-number">{totals.protein.toFixed(1)}g</span>
              <span className="totals-label">protein</span>
            </div>
            <div className="totals-sep" />
            <div className="totals-item">
              <span className="totals-number">{totals.carbs.toFixed(1)}g</span>
              <span className="totals-label">carbs</span>
            </div>
            <div className="totals-sep" />
            <div className="totals-item">
              <span className="totals-number">{totals.fat.toFixed(1)}g</span>
              <span className="totals-label">fat</span>
            </div>
          </div>
        )}
      </section>

      {items.length > 0 ? (
        <section className="food-cards-section" aria-live="polite">
          <div className="food-cards-grid">
            {items.map((item) => (
              <FoodCard
                key={item.id}
                item={item}
                onRemove={handleRemoveItem}
                onQuantityChange={handleQuantityChange}
              />
            ))}
          </div>
        </section>
      ) : (
        !loading && <p className="empty-hint">Start adding ingredients above ↑</p>
      )}
    </main>
  );
}

function App() {
  const [username, setUsername] = useState<string | null>(() =>
    localStorage.getItem("bettercook_username")
  );

  return (
    <BrowserRouter>
      <Navbar />
      <Routes>
        <Route path="/" element={<PantryHome username={username} />} />
        <Route path="/recipes" element={<RecipesPage />} />
        <Route path="/favorites" element={<FavoritesPage />} />
        <Route path="/about" element={<AboutPage />} />
        <Route path="/login" element={<LoginPage onLoginSuccess={setUsername} />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
