// ─── card.tsx ─────────────────────────────────────────────────────────────────
// Nutrition: USDA FoodData Central (DEMO_KEY)
// Name:      Always shows exactly what the user typed

// ─── Types ────────────────────────────────────────────────────────────────────

export type NutritionInfo = {
  name:      string;
  unit:      string;
  calories:  number;
  protein:   number;
  carbs:     number;
  fat:       number;
  fiber:     number;
  sugar:     number;
  sodium:    number;
  source:    "BetterCook Database" | "USDA API" | "Unknown";
  icon?:     string;
};

export type PantryItem = {
  id:        number;
  name:      string;
  quantity:  number;
  nutrition: NutritionInfo;
};

// ─── USDA nutrition ───────────────────────────────────────────────────────────

const USDA_API_KEY = "DEMO_KEY";
const USDA_SEARCH  = "https://api.nal.usda.gov/fdc/v1/foods/search";

const NUTRIENT_IDS = {
  calories: [1008, 2047],
  protein:  [1003],
  carbs:    [1005],
  fat:      [1004],
  fiber:    [1079],
  sodium:   [1093],
};

function getNutrientValue(foodNutrients: any[], ids: number[]): number {
  for (const nutrient of foodNutrients) {
    const id = nutrient.nutrientId ?? nutrient.nutrient?.id;
    if (ids.includes(id)) return nutrient.value ?? nutrient.amount ?? 0;
  }
  return 0;
}

// ─── Main fetch ───────────────────────────────────────────────────────────────

export async function fetchNutrition(query: string): Promise<NutritionInfo> {
  const displayName = query.charAt(0).toUpperCase() + query.slice(1).toLowerCase();

  const params = new URLSearchParams({
    api_key:         USDA_API_KEY,
    query:           query,
    dataType:        "Foundation,SR Legacy",
    pageSize:        "5",
    requireAllWords: "false",
  });

  const nutritionRes = await fetch(`${USDA_SEARCH}?${params}`);

  if (!nutritionRes.ok) throw new Error("Could not reach the nutrition database. Too many requests.");

  const data         = await nutritionRes.json();
  const foods: any[] = data.foods ?? [];

  if (foods.length === 0) {
    throw new Error(`"${displayName}" was not found. Please check the spelling and try again.`);
  }

  const queryLower = query.toLowerCase();
  const best = foods.find((f) =>
    f.description?.toLowerCase().includes(queryLower)
  );

  if (!best) {
    throw new Error(`"${displayName}" was not found. Please check the spelling and try again.`);
  }

  const nutrients: any[] = best.foodNutrients ?? [];
  const servingSize = best.servingSize
    ? `${best.servingSize}${best.servingSizeUnit ?? "g"}`
    : "100g";

  return {
    name:      displayName,
    unit:      servingSize,
    calories:  Math.round(getNutrientValue(nutrients, NUTRIENT_IDS.calories)),
    protein:   +getNutrientValue(nutrients, NUTRIENT_IDS.protein).toFixed(1),
    carbs:     +getNutrientValue(nutrients, NUTRIENT_IDS.carbs).toFixed(1),
    fat:       +getNutrientValue(nutrients, NUTRIENT_IDS.fat).toFixed(1),
    fiber:     +getNutrientValue(nutrients, NUTRIENT_IDS.fiber).toFixed(1),
    sugar:     0,
    sodium:    +getNutrientValue(nutrients, NUTRIENT_IDS.sodium).toFixed(1),
    source:    "USDA API",
  };
}

// ─── NutriBadge ───────────────────────────────────────────────────────────────

function NutriBadge({
  label, value, unit, color,
}: { label: string; value: number; unit: string; color: string }) {
  return (
    <div className="nutri-badge">
      <div className="nutri-dot" style={{ background: color }} />
      <div className="nutri-text">
        <span className="nutri-value">
          {Number.isInteger(value) ? value : value.toFixed(1)}{unit}
        </span>
        <span className="nutri-label">{label}</span>
      </div>
    </div>
  );
}

// ─── FoodCard ─────────────────────────────────────────────────────────────────

export function FoodCard({
  item,
  onRemove,
  onQuantityChange,
}: {
  item: PantryItem;
  onRemove: (id: number) => void;
  onQuantityChange: (id: number, delta: number) => void;
}) {
  const q = item.quantity;
  const n = item.nutrition;
  const decreaseDisabled = q <= 1;

  return (
    <div className="food-card">
      <div className="food-card-body">
        <div className="food-card-header">
          <div className="food-card-title-wrap">
            <h3 className="food-card-name">{item.name}</h3>
          </div>
          <div className="food-card-actions">
            <div className="qty-control">
              <button type="button" className="qty-btn"
                onClick={() => onQuantityChange(item.id, -1)}
                disabled={decreaseDisabled}
                aria-label={`Decrease ${item.name} quantity`}>−</button>
              <span className="qty-value">{q}</span>
              <button type="button" className="qty-btn"
                onClick={() => onQuantityChange(item.id, 1)}
                aria-label={`Increase ${item.name} quantity`}>+</button>
            </div>
            <button
              type="button"
              className="food-card-remove"
              onClick={() => onRemove(item.id)}
              aria-label={`Remove ${item.name}`}
            >×</button>
          </div>
        </div>
        <span className="food-card-unit-badge">per {n.unit}</span>

        <div className="food-card-calories">
          <span className="cal-number">{Math.round(n.calories * q)}</span>
          <span className="cal-label">kcal total</span>
        </div>

        <div className="food-card-divider" />

        <div className="nutri-grid">
          <NutriBadge label="Protein" value={+(n.protein * q).toFixed(1)} unit="g"  color="#e86f2f" />
          <NutriBadge label="Carbs"   value={+(n.carbs   * q).toFixed(1)} unit="g"  color="#f5b942" />
          <NutriBadge label="Fat"     value={+(n.fat     * q).toFixed(1)} unit="g"  color="#5bb8a0" />
          <NutriBadge label="Fiber"   value={+(n.fiber   * q).toFixed(1)} unit="g"  color="#7d9e6e" />
          <NutriBadge label="Sodium"  value={+(n.sodium  * q).toFixed(1)} unit="mg" color="#9b8fc7" />
        </div>
      </div>
    </div>
  );
}
