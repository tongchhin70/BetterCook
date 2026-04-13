import "./Filter.css";

export type Filters = {
  mealType:   string[];
  cookTime:   string[];
  difficulty: string[];
  dietary:    string[];
};

export const defaultFilters: Filters = {
  mealType:   [],
  cookTime:   [],
  difficulty: [],
  dietary:    [],
};

const MEAL_TYPES   = ["Breakfast", "Lunch", "Dinner", "Dessert", "Snack"];
const COOK_TIMES   = ["Under 15 min", "15–30 min", "30–60 min", "Over 60 min"];
const DIFFICULTIES = ["Easy", "Medium", "Hard"];
const DIETARY      = ["Vegetarian", "Vegan", "Gluten-free", "Dairy-free"];

type Props = {
  filters:  Filters;
  onChange: (f: Filters) => void;
};

export default function FilterSidebar({ filters, onChange }: Props) {
  const toggle = (field: keyof Filters, value: string) => {
    const arr = filters[field];
    onChange({
      ...filters,
      [field]: arr.includes(value) ? arr.filter((v) => v !== value) : [...arr, value],
    });
  };

  return (
    <aside className="filter-sidebar">
      <span className="filter-sidebar-title">Filters</span>

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