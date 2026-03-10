import { useState } from "react";
import type { FormEvent } from "react";
import { BrowserRouter, Route, Routes } from "react-router-dom";

import "./App.css";
import AboutPage from "./AboutPage";
import FavoritesPage from "./FavoritesPage";
import LoginPage from "./LoginPage";
import Navbar from "./Navbar";
import RecipesPage from "./RecipesPage";

type PantryItem = {
  id: number;
  name: string;
};

function PantryHome() {
  const [itemInput, setItemInput] = useState("");
  const [items, setItems] = useState<PantryItem[]>([]);

  const handleAddItem = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const value = itemInput.trim();
    if (!value) return;

    setItems((prev) => [...prev, { id: Date.now(), name: value }]);
    setItemInput("");
  };

  const handleRemoveItem = (id: number) => {
    setItems((prev) => prev.filter((item) => item.id !== id));
  };

  return (
    <main className="pantry-page">
      <section className="pantry-card" aria-label="Pantry input">
        <h1>What Is In Your Pantry?</h1>

        <form className="pantry-form" onSubmit={handleAddItem}>
          <label htmlFor="pantry-item" className="sr-only">
            Pantry ingredient
          </label>
          <input
            id="pantry-item"
            type="text"
            placeholder="e.g. eggs, tomatoes, olive oil"
            value={itemInput}
            onChange={(event) => setItemInput(event.target.value)}
          />
          <button type="submit">+</button>
        </form>

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
      </section>
    </main>
  );
}

function App() {
  return (
    <BrowserRouter>
      <Navbar />
      <Routes>
        <Route path="/" element={<PantryHome />} />
        <Route path="/recipes" element={<RecipesPage />} />
        <Route path="/favorites" element={<FavoritesPage />} />
        <Route path="/about" element={<AboutPage />} />
        <Route path="/login" element={<LoginPage />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
