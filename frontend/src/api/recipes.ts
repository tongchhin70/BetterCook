import type { Recipe } from "../types/recipes";

const API_URL = (import.meta.env.VITE_API_BASE_URL ?? "http://localhost:8000").replace(/\/+$/, "");

export async function getRecipes(): Promise<Recipe[]> {
  const response = await fetch(`${API_URL}/api/recipes`);
  return response.json();
}

export async function createRecipe(recipe: Omit<Recipe, "id">): Promise<Recipe> {
  const response = await fetch(`${API_URL}/api/recipes`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(recipe),
  });

  return response.json();
}
