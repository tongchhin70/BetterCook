
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

// ─── Config ───────────────────────────────────────────────────────────────────

const USDA_API_KEY = "DEMO_KEY"; // Free, no signup. Get a personal key at fdc.nal.usda.gov
const USDA_SEARCH  = "https://api.nal.usda.gov/fdc/v1/foods/search";

const GENERIC_FOOD_IMAGE =
  "https://upload.wikimedia.org/wikipedia/commons/thumb/6/6d/Good_Food_Display_-_NCI_Visuals_Online.jpg/640px-Good_Food_Display_-_NCI_Visuals_Online.jpg";

// USDA nutrient IDs
const NUTRIENT_IDS = {
  calories: [1008, 2047],
  protein:  [1003],
  carbs:    [1005],
  fat:      [1004],
  fiber:    [1079],
  sodium:   [1093],
};

async function fetchWikimediaImage(query: string): Promise<string> {
  // Search Wikipedia for the food article
  const searchUrl = `https://en.wikipedia.org/w/api.php?` + new URLSearchParams({
    action:   "query",
    titles:   query,
    prop:     "pageimages",
    format:   "json",
    pithumbsize: "480",
    origin:   "*",   // required for browser CORS
  });

  try {
    const res  = await fetch(searchUrl);
    const data = await res.json();
    const pages = data?.query?.pages ?? {};

    for (const page of Object.values(pages) as any[]) {
      const thumb = page?.thumbnail?.source;
      if (thumb) return thumb;
    }

    const searchFallbackUrl = `https://en.wikipedia.org/w/api.php?` + new URLSearchParams({
      action:      "query",
      list:        "search",
      srsearch:    `${query} food`,
      srlimit:     "3",
      format:      "json",
      origin:      "*",
    });

    const searchRes  = await fetch(searchFallbackUrl);
    const searchData = await searchRes.json();
    const results    = searchData?.query?.search ?? [];

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
      const thumbPages = thumbData?.query?.pages ?? {};

      for (const page of Object.values(thumbPages) as any[]) {
        const thumb = (page as any)?.thumbnail?.source;
        if (thumb) return thumb;
      }
    }
  } catch {
    
  }

  return GENERIC_FOOD_IMAGE;
}

function getNutrientValue(foodNutrients: any[], ids: number[]): number {
  for (const nutrient of foodNutrients) {
    const id = nutrient.nutrientId ?? nutrient.nutrient?.id;
    if (ids.includes(id)) return nutrient.value ?? nutrient.amount ?? 0;
  }
  return 0;
}

// ─── Main export ──────────────────────────────────────────────────────────────

export async function fetchNutrition(query: string): Promise<NutritionInfo> {
  // Run both fetches in parallel so the card loads as fast as possible
  const [nutritionResult, imageUrl] = await Promise.all([
    fetchUSDANutrition(query),
    fetchWikimediaImage(query),
  ]);

  return { ...nutritionResult, image_url: imageUrl };
}

async function fetchUSDANutrition(query: string): Promise<Omit<NutritionInfo, "image_url">> {
  const params = new URLSearchParams({
    api_key:         USDA_API_KEY,
    query:           query,
    dataType:        "Foundation,SR Legacy",
    pageSize:        "5",
    requireAllWords: "false",
  });

  const res = await fetch(`${USDA_SEARCH}?${params}`);
  if (!res.ok) throw new Error(`USDA API error: ${res.status}`);

  const data  = await res.json();
  const foods: any[] = data.foods ?? [];

  const placeholder = {
    name:     query.charAt(0).toUpperCase() + query.slice(1),
    unit:     "serving",
    calories: 0, protein: 0, carbs: 0, fat: 0, fiber: 0, sodium: 0,
  };

  if (foods.length === 0) return placeholder;

  const queryLower = query.toLowerCase();
  const best = foods.find((f) =>
    f.description?.toLowerCase().includes(queryLower)
  ) ?? foods[0];

  const nutrients: any[] = best.foodNutrients ?? [];

  const servingSize = best.servingSize
    ? `${best.servingSize}${best.servingSizeUnit ?? "g"}`
    : "100g";

  return {
    name:     best.description ?? query,
    unit:     servingSize,
    calories: Math.round(getNutrientValue(nutrients, NUTRIENT_IDS.calories)),
    protein:  +getNutrientValue(nutrients, NUTRIENT_IDS.protein).toFixed(1),
    carbs:    +getNutrientValue(nutrients, NUTRIENT_IDS.carbs).toFixed(1),
    fat:      +getNutrientValue(nutrients, NUTRIENT_IDS.fat).toFixed(1),
    fiber:    +getNutrientValue(nutrients, NUTRIENT_IDS.fiber).toFixed(1),
    sodium:   +getNutrientValue(nutrients, NUTRIENT_IDS.sodium).toFixed(1),
  };
}

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
          alt={n.name}
          className="food-card-img"
          onError={(e) => {
            (e.target as HTMLImageElement).src = GENERIC_FOOD_IMAGE;
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
          <h3 className="food-card-name">
            {n.name.charAt(0).toUpperCase() + n.name.slice(1)}
          </h3>
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