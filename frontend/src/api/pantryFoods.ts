import type { NutritionInfo } from "../card";

const API_URL = (import.meta.env.VITE_API_BASE_URL ?? "http://localhost:8000").replace(/\/+$/, "");

export type PantryFood = {
  id: string;
  name: string;
  category: string;
  defaultServingSize: number;
  servingUnit: string;
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  fiber: number;
  sugar: number;
  sodium: number;
  commonUnits: string[];
  storageType: string;
  shelfLifeDays: number;
  imageEmoji: string;
  aliases: string[];
};

export function nutritionFromPantryFood(food: PantryFood): NutritionInfo {
  return {
    name: food.name,
    unit: `${food.defaultServingSize}${food.servingUnit}`,
    calories: food.calories,
    protein: food.protein,
    carbs: food.carbs,
    fat: food.fat,
    fiber: food.fiber,
    sugar: food.sugar,
    sodium: food.sodium,
    source: "BetterCook Database",
    icon: food.imageEmoji,
  };
}

export async function searchPantryFoods(query: string): Promise<PantryFood[]> {
  const response = await fetch(`${API_URL}/pantry-foods/search?query=${encodeURIComponent(query)}`);
  if (!response.ok) throw new Error("Could not search pantry foods.");
  return response.json();
}
