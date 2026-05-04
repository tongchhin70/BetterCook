import type { Recipe } from "../types/recipes";
import type { CookingActionType, CookingStep } from "../types/recipes";
import type { Dietary, Difficulty, MealType } from "../Filter";

const API_URL = (import.meta.env.VITE_API_BASE_URL ?? "http://localhost:8000").replace(/\/+$/, "");

export type RecipeCreateInput = Omit<Recipe, "id" | "totalTime" | "cookingSteps">;

type ApiRecipe = {
  id: number;
  name: string;
  description: string;
  ingredients: string[];
  instructions: string[];
  prep_time: number;
  cook_time: number;
  total_time: number;
  servings: number;
  calories: number;
  meal_type: MealType;
  difficulty: Difficulty;
  dietary: Dietary[];
};

type ApiRecipeCreateInput = Omit<ApiRecipe, "id" | "total_time">;

const SAMPLE_STEP_TIMERS: Record<string, number[]> = {
  "garlic fried rice": [30, 120, 180, 60, 15],
  "egg fried rice": [30, 60, 180, 20, 15],
  "chicken rice bowl": [60, 300, 30, 60, 20],
  "simple vegetable stir fry": [120, 30, 30, 240, 45],
  "tuna rice bowl": [30, 45, 60, 15, 20],
  "tomato egg rice": [90, 60, 240, 20, 30],
};

function getActionType(instruction: string): CookingActionType {
  const text = instruction.toLowerCase();
  if (text.includes("stir") || text.includes("fold")) return "stir";
  if (text.includes("simmer")) return "simmer";
  if (text.includes("serve") || text.includes("top")) return "plate";
  if (text.includes("rest")) return "rest";
  if (text.includes("add") || text.includes("pour") || text.includes("season")) return "add";
  if (text.includes("cook") || text.includes("scramble") || text.includes("brown")) return "cook";
  return "prep";
}

function getStepTip(actionType: CookingActionType): string {
  switch (actionType) {
    case "prep":
      return "Keep pieces similar in size so they cook evenly.";
    case "add":
      return "Add ingredients evenly across the pan for better cooking.";
    case "stir":
      return "Keep things moving so nothing sticks or burns.";
    case "cook":
      return "Adjust the heat if the pan gets too hot.";
    case "simmer":
      return "Look for gentle bubbles, not a hard boil.";
    case "rest":
      return "Resting helps the texture settle before serving.";
    case "plate":
      return "Taste once more before serving and adjust seasoning if needed.";
  }
}

function getIngredientForStep(instruction: string, ingredients: string[]): string | undefined {
  const text = instruction.toLowerCase();
  return ingredients.find((ingredient) => {
    const cleaned = ingredient.replace(/^[\d\s/.,]+/, "").toLowerCase();
    const words = cleaned.split(/\s+/).filter((word) => word.length > 2);
    return words.some((word) => text.includes(word));
  });
}

function buildCookingSteps(recipe: ApiRecipe): CookingStep[] {
  const timers = SAMPLE_STEP_TIMERS[recipe.name.toLowerCase()] ?? [];

  return recipe.instructions.map((instruction, index) => {
    const actionType = getActionType(instruction);
    const durationSeconds = timers[index];

    return {
      id: `${recipe.id}-${index + 1}`,
      stepNumber: index + 1,
      instruction,
      ...(durationSeconds ? { durationSeconds } : {}),
      ingredient: getIngredientForStep(instruction, recipe.ingredients),
      actionType,
      tip: getStepTip(actionType),
    };
  });
}

function toRecipe(recipe: ApiRecipe): Recipe {
  return {
    id: recipe.id,
    name: recipe.name,
    description: recipe.description,
    ingredients: recipe.ingredients,
    instructions: recipe.instructions,
    prepTime: recipe.prep_time,
    cookTime: recipe.cook_time,
    totalTime: recipe.total_time,
    servings: recipe.servings,
    calories: recipe.calories,
    mealType: recipe.meal_type,
    difficulty: recipe.difficulty,
    dietary: recipe.dietary,
    cookingSteps: buildCookingSteps(recipe),
  };
}

function toApiRecipeCreateInput(recipe: RecipeCreateInput): ApiRecipeCreateInput {
  return {
    name: recipe.name,
    description: recipe.description,
    ingredients: recipe.ingredients,
    instructions: recipe.instructions,
    prep_time: recipe.prepTime,
    cook_time: recipe.cookTime,
    servings: recipe.servings,
    calories: recipe.calories,
    meal_type: recipe.mealType,
    difficulty: recipe.difficulty,
    dietary: recipe.dietary,
  };
}

export async function getRecipes(): Promise<Recipe[]> {
  const response = await fetch(`${API_URL}/api/recipes`);
  if (!response.ok) throw new Error("Could not load recipes.");
  const recipes: ApiRecipe[] = await response.json();
  return recipes.map(toRecipe);
}

export async function searchRecipes(query: string): Promise<Recipe[]> {
  const response = await fetch(`${API_URL}/api/recipes/search?q=${encodeURIComponent(query)}`);
  if (!response.ok) throw new Error("Could not search recipes.");
  const recipes: ApiRecipe[] = await response.json();
  return recipes.map(toRecipe);
}

export async function createRecipe(recipe: RecipeCreateInput): Promise<Recipe> {
  const response = await fetch(`${API_URL}/api/recipes`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(toApiRecipeCreateInput(recipe)),
  });

  if (!response.ok) throw new Error("Could not create recipe.");
  const createdRecipe: ApiRecipe = await response.json();
  return toRecipe(createdRecipe);
}
