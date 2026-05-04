import type { Dietary, Difficulty, MealType } from "../Filter";

export type CookingActionType = "prep" | "add" | "stir" | "cook" | "simmer" | "rest" | "plate";

export type CookingStep = {
  id: string;
  stepNumber: number;
  instruction: string;
  durationSeconds?: number;
  ingredient?: string;
  actionType?: CookingActionType;
  tip?: string;
};

export interface Recipe {
  id: number;
  name: string;
  description: string;
  ingredients: string[];
  instructions: string[];
  prepTime: number;
  cookTime: number;
  totalTime: number;
  servings: number;
  calories: number;
  mealType: MealType;
  difficulty: Difficulty;
  dietary: Dietary[];
  cookingSteps: CookingStep[];
}
