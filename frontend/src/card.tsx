// ─── card.tsx ─────────────────────────────────────────────────────────────────
// Nutrition: USDA FoodData Central (DEMO_KEY)
// Images:    TheMealDB first, Wikipedia as fallback if TheMealDB has no match
// Name:      Always shows exactly what the user typed

// ─── Types ────────────────────────────────────────────────────────────────────

export type NutritionInfo = {
  name:      string;
  unit:      string;
  image_url: string;
  calories:  number;
  protein:   number;
  carbs:     number;
  fat:       number;
  fiber:     number;
  sodium:    number;
};

export type PantryItem = {
  id:        number;
  name:      string;
  quantity:  number;
  nutrition: NutritionInfo;
};

// ─── TheMealDB image ──────────────────────────────────────────────────────────

function getMealDbUrl(ingredient: string): string {
  const formatted = ingredient
    .trim()
    .split(" ")
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase())
    .join("_");
  return `https://www.themealdb.com/images/ingredients/${formatted}-Small.png`;
}

// Check if TheMealDB actually has an image for this ingredient.
// If it returns the generic flour placeholder (or errors), we know it doesn't.
async function getMealDbImage(ingredient: string): Promise<string | null> {
  const url = getMealDbUrl(ingredient);
  try {
    const res = await fetch(url, { method: "HEAD" });
    // TheMealDB returns 200 for known ingredients, 404 for unknown
    if (res.ok) return url;
  } catch { /* network error */ }
  return null;
}

// ─── Wikipedia image fallback ─────────────────────────────────────────────────

const GENERIC_IMAGE =
  "https://upload.wikimedia.org/wikipedia/commons/thumb/6/6d/Good_Food_Display_-_NCI_Visuals_Online.jpg/480px-Good_Food_Display_-_NCI_Visuals_Online.jpg";

async function getWikipediaImage(query: string): Promise<string> {
  try {
    // Try the exact page title first
    const directUrl = `https://en.wikipedia.org/w/api.php?` + new URLSearchParams({
      action:      "query",
      titles:      query,
      prop:        "pageimages",
      format:      "json",
      pithumbsize: "480",
      origin:      "*",
    });

    const directRes  = await fetch(directUrl);
    const directData = await directRes.json();
    for (const page of Object.values(directData?.query?.pages ?? {}) as any[]) {
      if (page?.thumbnail?.source) return page.thumbnail.source;
    }

    // Fall back to searching Wikipedia for "{query} food"
    const searchUrl = `https://en.wikipedia.org/w/api.php?` + new URLSearchParams({
      action:   "query",
      list:     "search",
      srsearch: `${query} food`,
      srlimit:  "5",
      format:   "json",
      origin:   "*",
    });

    const searchRes  = await fetch(searchUrl);
    const searchData = await searchRes.json();
    const results: any[] = searchData?.query?.search ?? [];

    for (const result of results) {
      const thumbUrl = `https://en.wikipedia.org/w/api.php?` + new URLSearchParams({
        action:      "query",
        titles:      result.title,
        prop:        "pageimages",
        format:      "json",
        pithumbsize: "480",
        origin:      "*",
      });
      const thumbRes  = await fetch(thumbUrl);
      const thumbData = await thumbRes.json();
      for (const page of Object.values(thumbData?.query?.pages ?? {}) as any[]) {
        if ((page as any)?.thumbnail?.source) return (page as any).thumbnail.source;
      }
    }
  } catch { /* silently fall through */ }

  return GENERIC_IMAGE;
}

// ─── Combined image fetch ─────────────────────────────────────────────────────
// Try TheMealDB first (instant URL, great for raw ingredients).
// Fall back to Wikipedia for anything TheMealDB doesn't cover (pizza, soup, etc.)

async function getImage(ingredient: string): Promise<string> {
  const mealDbUrl = await getMealDbImage(ingredient);
  if (mealDbUrl) return mealDbUrl;
  return getWikipediaImage(ingredient);
}

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

  // Run image fetch and nutrition fetch in parallel
  const [image_url, nutritionRes] = await Promise.all([
    getImage(query),
    fetch(`${USDA_SEARCH}?${params}`),
  ]);

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
    image_url,
    calories:  Math.round(getNutrientValue(nutrients, NUTRIENT_IDS.calories)),
    protein:   +getNutrientValue(nutrients, NUTRIENT_IDS.protein).toFixed(1),
    carbs:     +getNutrientValue(nutrients, NUTRIENT_IDS.carbs).toFixed(1),
    fat:       +getNutrientValue(nutrients, NUTRIENT_IDS.fat).toFixed(1),
    fiber:     +getNutrientValue(nutrients, NUTRIENT_IDS.fiber).toFixed(1),
    sodium:    +getNutrientValue(nutrients, NUTRIENT_IDS.sodium).toFixed(1),
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

  return (
    <div className="food-card">
      <div className="food-card-img-wrap">
        <img
          src={n.image_url}
          alt={item.name}
          className="food-card-img"
          onError={(e) => {
            (e.target as HTMLImageElement).src = GENERIC_IMAGE;
          }}
        />
        <button
          type="button"
          className="food-card-remove"
          onClick={() => onRemove(item.id)}
          aria-label={`Remove ${item.name}`}
        >×</button>
        <span className="food-card-unit-badge">per {n.unit}</span>
      </div>

      <div className="food-card-body">
        <div className="food-card-header">
          <h3 className="food-card-name">{item.name}</h3>
          <div className="qty-control">
            <button type="button" className="qty-btn"
              onClick={() => onQuantityChange(item.id, -1)}>−</button>
            <span className="qty-value">{q}</span>
            <button type="button" className="qty-btn"
              onClick={() => onQuantityChange(item.id, 1)}>+</button>
          </div>
        </div>

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