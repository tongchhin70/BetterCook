import { useState } from "react";
import type { FormEvent } from "react";
import "./App.css";
import logo from "./assets/logo.png";

type PantryItem = {
  id: number;
  name: string;
};

function App() {
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
      <div className="background-glow background-glow-left" aria-hidden="true" />
      <div className="background-glow background-glow-right" aria-hidden="true" />

      <section className="pantry-card" aria-label="Pantry input">
        <img className="brand-logo" src={logo} alt="BetterCook chef logo" />

        <p className="eyebrow">BetterCook</p>
        <h1>What is in your pantry?</h1>
        <p className="subtitle">
          Add a few ingredients and start planning your next meal.
        </p>

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
          <button type="submit">Add item</button>
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

export default App;
