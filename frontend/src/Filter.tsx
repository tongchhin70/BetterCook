import "./Filter.css";

export type MealType = "Breakfast" | "Lunch" | "Dinner" | "Snack" | "Dessert";
export type CookTimeFilter = "Under 15 minutes" | "15-30 minutes" | "30-60 minutes" | "Over 60 minutes";
export type Difficulty = "Easy" | "Medium" | "Hard";
export type Dietary = "Vegetarian" | "Vegan" | "Gluten-Free" | "High-Protein" | "Low-Carb" | "Dairy-Free";

export type Filters = {
  mealType:   MealType[];
  cookTime:   CookTimeFilter[];
  difficulty: Difficulty[];
  dietary:    Dietary[];
  favorites:  boolean;
};

export const defaultFilters: Filters = {
  mealType:   [],
  cookTime:   [],
  difficulty: [],
  dietary:    [],
  favorites:  false,
};

const MEAL_TYPES: MealType[] = ["Breakfast", "Lunch", "Dinner", "Snack", "Dessert"];
const COOK_TIMES: CookTimeFilter[] = ["Under 15 minutes", "15-30 minutes", "30-60 minutes", "Over 60 minutes"];
const DIFFICULTIES: Difficulty[] = ["Easy", "Medium", "Hard"];
const DIETARY: Dietary[] = ["Vegetarian", "Vegan", "Gluten-Free", "High-Protein", "Low-Carb", "Dairy-Free"];

type Props = {
  filters:  Filters;
  onChange: (f: Filters) => void;
};

type FilterListKey = Exclude<keyof Filters, "favorites">;

export function hasActiveFilters(filters: Filters): boolean {
  return (
    filters.mealType.length > 0 ||
    filters.cookTime.length > 0 ||
    filters.difficulty.length > 0 ||
    filters.dietary.length > 0 ||
    filters.favorites
  );
}

export default function FilterSidebar({ filters, onChange }: Props) {
  const toggle = <K extends FilterListKey>(field: K, value: Filters[K][number]) => {
    const arr = filters[field];
    onChange({
      ...filters,
      [field]: arr.includes(value as never)
        ? arr.filter((v) => v !== value)
        : [...arr, value],
    });
  };

  const clearFilters = () => onChange(defaultFilters);

  return (
    <aside className="filter-sidebar">
      <div className="filter-sidebar-header">
        <span className="filter-sidebar-title">Filters</span>
        <button type="button" className="filter-clear" onClick={clearFilters} disabled={!hasActiveFilters(filters)}>
          Clear
        </button>
      </div>

      <div className="filter-section">
        <p className="filter-section-title">Favorites</p>
        <label className="filter-row">
          <input
            type="checkbox"
            checked={filters.favorites}
            onChange={() => onChange({ ...filters, favorites: !filters.favorites })}
          />
          Favorites only
        </label>
      </div>

      <div className="filter-section">
        <p className="filter-section-title">Meal Type</p>
        {MEAL_TYPES.map((v) => (
          <label key={v} className="filter-row">
            <input type="checkbox" checked={filters.mealType.includes(v)}
              onChange={() => toggle("mealType", v)} />
            {v}
          </label>
        ))}
      </div>

      <div className="filter-section">
        <p className="filter-section-title">Cook Time</p>
        {COOK_TIMES.map((v) => (
          <label key={v} className="filter-row">
            <input type="checkbox" checked={filters.cookTime.includes(v)}
              onChange={() => toggle("cookTime", v)} />
            {v}
          </label>
        ))}
      </div>

      <div className="filter-section">
        <p className="filter-section-title">Difficulty</p>
        {DIFFICULTIES.map((v) => (
          <label key={v} className="filter-row">
            <input type="checkbox" checked={filters.difficulty.includes(v)}
              onChange={() => toggle("difficulty", v)} />
            {v}
          </label>
        ))}
      </div>

      <div className="filter-section">
        <p className="filter-section-title">Dietary</p>
        {DIETARY.map((v) => (
          <label key={v} className="filter-row">
            <input type="checkbox" checked={filters.dietary.includes(v)}
              onChange={() => toggle("dietary", v)} />
            {v}
          </label>
        ))}
      </div>
    </aside>
  );
}
