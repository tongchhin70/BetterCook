import { useState } from "react";
import type { FormEvent } from "react";
import { BrowserRouter, Route, Routes } from "react-router-dom";

import "./App.css";
import AboutPage from "./AboutPage";
import FavoritesPage from "./FavoritesPage";
import LoginPage from "./LoginPage";
import Navbar from "./Navbar";
import RecipesPage from "./RecipesPage";
import { FoodCard, fetchNutrition } from "./card";
import type { PantryItem } from "./card";


function PantryHome() {
  const [itemInput, setItemInput] = useState("");
  const [items, setItems]         = useState<PantryItem[]>([]);
  const [loading, setLoading]     = useState(false);
  const [error, setError]         = useState<string | null>(null);

  const handleAddItem = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const value = itemInput.trim();
    if (!value) return;

    setLoading(true);
    setError(null);

    try {
      const existingIndex = items.findIndex(
        (item) => item.name.toLowerCase() === value.toLowerCase()
      );

      if (existingIndex !== -1) {
        setItems((prev) =>
          prev.map((item, i) =>
            i === existingIndex
              ? { ...item, quantity: item.quantity + 1 }
              : item
          )
        );
        setItemInput("");
        setLoading(false);
        return;
      }

      const nutrition = await fetchNutrition(value);
      setItems((prev) => [
        ...prev,
        { id: Date.now(), name: value, quantity: 1, nutrition },
      ]);
      setItemInput("");
    } catch {
      setError("Could not reach Open Food Facts. Check your internet connection.");
    } finally {
      setLoading(false);
    }
  };

  const handleRemoveItem = (id: number) =>
    setItems((prev) => prev.filter((item) => item.id !== id));

  const handleQuantityChange = (id: number, delta: number) =>
    setItems((prev) =>
      prev.map((item) =>
        item.id === id
          ? { ...item, quantity: Math.max(1, item.quantity + delta) }
          : item
      )
    );

  const totals = items.reduce(
    (acc, item) => ({
      calories: acc.calories + item.nutrition.calories * item.quantity,
      protein:  acc.protein  + item.nutrition.protein  * item.quantity,
      carbs:    acc.carbs    + item.nutrition.carbs    * item.quantity,
      fat:      acc.fat      + item.nutrition.fat      * item.quantity,
    }),
    { calories: 0, protein: 0, carbs: 0, fat: 0 }
  );

  return (
    <main className="pantry-page">
      <div className="background-glow background-glow-left" />
      <div className="background-glow background-glow-right" />

      <section className="pantry-card" aria-label="Pantry input">
        <p className="eyebrow">My Pantry</p>
        <h1>What Is In Your Pantry?</h1>
        <p className="subtitle">Add ingredients to track nutrition and plan meals.</p>

        <form className="pantry-form" onSubmit={handleAddItem}>
          <label htmlFor="pantry-item" className="sr-only">Pantry ingredient</label>
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
            {loading ? "Searching…" : "Add +"}
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
  return (
    <BrowserRouter>
      <Navbar />
      <Routes>
        <Route path="/"          element={<PantryHome />} />
        <Route path="/recipes"   element={<RecipesPage />} />
        <Route path="/favorites" element={<FavoritesPage />} />
        <Route path="/about"     element={<AboutPage />} />
        <Route path="/login"     element={<LoginPage />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;