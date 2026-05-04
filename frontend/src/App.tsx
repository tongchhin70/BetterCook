import { useEffect, useState } from "react";
import type { FormEvent } from "react";
import { BrowserRouter, Link, Route, Routes, useNavigate } from "react-router-dom";

import "./App.css";
import AboutPage from "./AboutPage";
import FavoritesPage from "./FavoritesPage";
import LoginPage from "./LoginPage";
import Navbar from "./Navbar";
import RecipesPage from "./RecipesPage";
import { FoodCard, fetchNutrition } from "./card";
import type { NutritionInfo, PantryItem } from "./card";
import { nutritionFromPantryFood, searchPantryFoods } from "./api/pantryFoods";
import type { PantryFood } from "./api/pantryFoods";

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
    calories: 0,
    protein: 0,
    carbs: 0,
    fat: 0,
    fiber: 0,
    sugar: 0,
    sodium: 0,
    source: "Unknown",
  };
}

async function fetchBetterCookNutrition(name: string): Promise<NutritionInfo | null> {
  const foods = await searchPantryFoods(name);
  const query = name.toLowerCase();
  const exactFood = foods.find((food) =>
    food.name.toLowerCase() === query || food.aliases.some((alias) => alias.toLowerCase() === query)
  );
  const food = exactFood ?? foods[0];
  return food ? nutritionFromPantryFood(food) : null;
}

async function fetchNutritionWithFallback(name: string): Promise<NutritionInfo> {
  const betterCookNutrition = await fetchBetterCookNutrition(name);
  if (betterCookNutrition) return betterCookNutrition;

  return fetchNutrition(name);
}

async function hydratePantryItems(items: BackendPantryItem[]): Promise<PantryItem[]> {
  const hydrated = await Promise.all(
    items.map(async (item) => {
      try {
        const nutrition = await fetchNutritionWithFallback(item.name);
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
  const [foodSuggestions, setFoodSuggestions] = useState<PantryFood[]>([]);
  const [selectedFood, setSelectedFood] = useState<PantryFood | null>(null);
  const [loading, setLoading] = useState(false);
  const [searchingFoods, setSearchingFoods] = useState(false);
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

  useEffect(() => {
    const value = itemInput.trim();
    if (value.length < 2) {
      setFoodSuggestions([]);
      return;
    }

    const timeoutId = window.setTimeout(async () => {
      setSearchingFoods(true);
      try {
        setFoodSuggestions(await searchPantryFoods(value));
      } catch {
        setFoodSuggestions([]);
      } finally {
        setSearchingFoods(false);
      }
    }, 180);

    return () => window.clearTimeout(timeoutId);
  }, [itemInput]);

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
      let selectedNutrition: NutritionInfo;
      try {
        selectedNutrition =
          selectedFood && selectedFood.name.toLowerCase() === value.toLowerCase()
            ? nutritionFromPantryFood(selectedFood)
            : await fetchNutritionWithFallback(value);
      } catch {
        selectedNutrition = fallbackNutrition(value);
      }
      const itemName = selectedNutrition.name;
      const existing = items.find((item) => item.name.toLowerCase() === itemName.toLowerCase());

      if (existing) {
        const updatedQty = existing.quantity + 1;
        const response = await fetch(`${API_URL}/api/pantry/${existing.id}`, {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            "X-Username": username,
          },
          body: JSON.stringify({ name: existing.name, quantity: updatedQty, unit: "pcs", calories: existing.nutrition.calories }),
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
        setSelectedFood(null);
        setFoodSuggestions([]);
        return;
      }

      const response = await fetch(`${API_URL}/api/pantry`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "X-Username": username,
        },
        body: JSON.stringify({ name: itemName, quantity: 1, unit: "pcs", calories: selectedNutrition.calories }),
      });

      if (!response.ok) {
        throw new Error("Could not save pantry item.");
      }

      const createdItem: BackendPantryItem = await response.json();

      setItems((prev) => [
        ...prev,
        {
          id: createdItem.id,
          name: createdItem.name,
          quantity: createdItem.quantity,
          nutrition: selectedNutrition,
        },
      ]);
      setItemInput("");
      setSelectedFood(null);
      setFoodSuggestions([]);
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
        body: JSON.stringify({ name: target.name, quantity: updatedQty, unit: "pcs", calories: target.nutrition.calories }),
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

  const pantryTotals = items.reduce(
    (totals, item) => ({
      calories: totals.calories + item.nutrition.calories * item.quantity,
      protein: totals.protein + item.nutrition.protein * item.quantity,
      carbs: totals.carbs + item.nutrition.carbs * item.quantity,
      fat: totals.fat + item.nutrition.fat * item.quantity,
      fiber: totals.fiber + item.nutrition.fiber * item.quantity,
      sodium: totals.sodium + item.nutrition.sodium * item.quantity,
    }),
    { calories: 0, protein: 0, carbs: 0, fat: 0, fiber: 0, sodium: 0 }
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
            onChange={(e) => {
              setItemInput(e.target.value);
              setSelectedFood(null);
            }}
            autoComplete="off"
            disabled={loading}
          />
          <button type="submit" disabled={loading}>
            {loading ? "Saving..." : "Add +"}
          </button>
        </form>

        {(searchingFoods || foodSuggestions.length > 0) && (
          <div className="pantry-food-suggestions" aria-live="polite">
            {searchingFoods && <p>Searching BetterCook Database...</p>}
            {foodSuggestions.map((food) => (
              <button
                type="button"
                key={food.id}
                onClick={() => {
                  setSelectedFood(food);
                  setItemInput(food.name);
                  setFoodSuggestions([]);
                }}
              >
                <span className="pantry-food-icon">{food.imageEmoji}</span>
                <span>
                  <strong>{food.name}</strong>
                  <small>{food.category} · {food.calories} kcal per {food.defaultServingSize}{food.servingUnit}</small>
                </span>
              </button>
            ))}
          </div>
        )}

        {selectedFood && (
          <p className="nutrition-source-hint">
            Using BetterCook Database nutrition for {selectedFood.name}.
          </p>
        )}

        {error && <p className="error-msg">{error}</p>}

        {items.length > 0 && (
          <div className="pantry-summary" aria-label="Total pantry nutrition">
            <div className="pantry-summary-item">
              <span className="pantry-summary-value">{Math.round(pantryTotals.calories)}</span>
              <span className="pantry-summary-label">kcal</span>
            </div>
            <div className="pantry-summary-item">
              <span className="pantry-summary-value">{pantryTotals.protein.toFixed(1)}g</span>
              <span className="pantry-summary-label">protein</span>
            </div>
            <div className="pantry-summary-item">
              <span className="pantry-summary-value">{pantryTotals.carbs.toFixed(1)}g</span>
              <span className="pantry-summary-label">carbs</span>
            </div>
            <div className="pantry-summary-item">
              <span className="pantry-summary-value">{pantryTotals.fat.toFixed(1)}g</span>
              <span className="pantry-summary-label">fat</span>
            </div>
            <div className="pantry-summary-item">
              <span className="pantry-summary-value">{pantryTotals.fiber.toFixed(1)}g</span>
              <span className="pantry-summary-label">fiber</span>
            </div>
            <div className="pantry-summary-item">
              <span className="pantry-summary-value">{Math.round(pantryTotals.sodium)}mg</span>
              <span className="pantry-summary-label">sodium</span>
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

function AppShell() {
  const navigate = useNavigate();
  const [username, setUsername] = useState<string | null>(() =>
    localStorage.getItem("bettercook_username")
  );

  const handleLogout = () => {
    localStorage.removeItem("bettercook_username");
    setUsername(null);
    navigate("/login");
  };

  return (
    <>
      <Navbar username={username} onLogout={handleLogout} />
      <Routes>
        <Route path="/" element={<PantryHome username={username} />} />
        <Route path="/recipes" element={<RecipesPage />} />
        <Route path="/recipes/:recipeId" element={<RecipesPage />} />
        <Route path="/favorites" element={<FavoritesPage />} />
        <Route path="/about" element={<AboutPage />} />
        <Route path="/login" element={<LoginPage onLoginSuccess={setUsername} />} />
      </Routes>
    </>
  );
}

function App() {
  return (
    <BrowserRouter>
      <AppShell />
    </BrowserRouter>
  );
}

export default App;
