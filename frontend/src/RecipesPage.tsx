import { useEffect, useMemo, useState } from "react";
import type { FormEvent, KeyboardEvent } from "react";
import { useNavigate, useParams } from "react-router-dom";
import "./App.css";
import FilterSidebar, { defaultFilters, hasActiveFilters } from "./Filter";
import type { CookTimeFilter, Filters } from "./Filter";
import { getRecipes, searchRecipes } from "./api/recipes";
import type { Recipe } from "./types/recipes";

function RecipeCard({ recipe, onSelect }: { recipe: Recipe; onSelect: (recipe: Recipe) => void }) {
  const visibleIngredients = recipe.ingredients.slice(0, 4);
  const remainingIngredients = recipe.ingredients.length - visibleIngredients.length;

  const handleKeyDown = (event: KeyboardEvent<HTMLElement>) => {
    if (event.key === "Enter" || event.key === " ") {
      event.preventDefault();
      onSelect(recipe);
    }
  };

  return (
    <article
      className="recipe-card"
      role="button"
      tabIndex={0}
      onClick={() => onSelect(recipe)}
      onKeyDown={handleKeyDown}
      aria-label={`Open ${recipe.name} recipe details`}
    >
      <div className="recipe-card-topline">
        <span>{recipe.totalTime} min</span>
        <span>{recipe.servings} servings</span>
      </div>

      <h2 className="recipe-card-title">{recipe.name}</h2>
      {recipe.description && <p className="recipe-card-description">{recipe.description}</p>}

      <div className="recipe-card-meta">
        <span>
          <strong>{recipe.calories}</strong>
          kcal
        </span>
        <span>
          <strong>{recipe.prepTime}</strong>
          prep
        </span>
        <span>
          <strong>{recipe.cookTime}</strong>
          cook
        </span>
      </div>

      <div className="recipe-card-tags">
        <span>{recipe.mealType}</span>
        <span>{recipe.difficulty}</span>
        {recipe.dietary.slice(0, 2).map((tag) => (
          <span key={tag}>{tag}</span>
        ))}
      </div>

      {visibleIngredients.length > 0 && (
        <ul className="recipe-ingredient-list" aria-label={`${recipe.name} ingredients`}>
          {visibleIngredients.map((ingredient) => (
            <li key={ingredient}>{ingredient}</li>
          ))}
          {remainingIngredients > 0 && <li>+{remainingIngredients} more</li>}
        </ul>
      )}
    </article>
  );
}

function formatTimer(seconds: number): string {
  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = seconds % 60;
  return `${minutes}:${remainingSeconds.toString().padStart(2, "0")}`;
}

function playTimerAlert() {
  const AudioContextClass =
    window.AudioContext ||
    (window as typeof window & { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
  if (!AudioContextClass) return;

  const audioContext = new AudioContextClass();
  const oscillator = audioContext.createOscillator();
  const gain = audioContext.createGain();

  oscillator.type = "sine";
  oscillator.frequency.value = 720;
  gain.gain.setValueAtTime(0.001, audioContext.currentTime);
  gain.gain.exponentialRampToValueAtTime(0.18, audioContext.currentTime + 0.02);
  gain.gain.exponentialRampToValueAtTime(0.001, audioContext.currentTime + 0.45);

  oscillator.connect(gain);
  gain.connect(audioContext.destination);
  oscillator.start();
  oscillator.stop(audioContext.currentTime + 0.5);
}

function GuidedCookingMode({ recipe, onExit }: { recipe: Recipe; onExit: () => void }) {
  const steps = recipe.cookingSteps;
  const [currentIndex, setCurrentIndex] = useState(0);
  const [secondsRemaining, setSecondsRemaining] = useState(steps[0]?.durationSeconds ?? 0);
  const [running, setRunning] = useState(Boolean(steps[0]?.durationSeconds));
  const [stepFinished, setStepFinished] = useState(!steps[0]?.durationSeconds);
  const [finished, setFinished] = useState(false);
  const [notice, setNotice] = useState<string | null>(null);

  const currentStep = steps[currentIndex];
  const progressPercent = finished
    ? 100
    : Math.round((currentIndex / Math.max(steps.length, 1)) * 100);

  useEffect(() => {
    const duration = currentStep?.durationSeconds ?? 0;
    setSecondsRemaining(duration);
    setRunning(duration > 0);
    setStepFinished(duration === 0);
    setNotice(null);
  }, [currentStep]);

  useEffect(() => {
    if (!running || secondsRemaining <= 0) return;

    const intervalId = window.setInterval(() => {
      setSecondsRemaining((seconds) => Math.max(0, seconds - 1));
    }, 1000);

    return () => window.clearInterval(intervalId);
  }, [running, secondsRemaining]);

  useEffect(() => {
    if (!running || !currentStep?.durationSeconds || secondsRemaining > 0 || stepFinished) return;

    setRunning(false);
    setStepFinished(true);
    setNotice("Timer finished. Moving to the next step.");
    playTimerAlert();

    const timeoutId = window.setTimeout(() => {
      if (currentIndex >= steps.length - 1) {
        setFinished(true);
      } else {
        setCurrentIndex((index) => index + 1);
      }
    }, 1400);

    return () => window.clearTimeout(timeoutId);
  }, [currentIndex, currentStep, running, secondsRemaining, stepFinished, steps.length]);

  const goToPreviousStep = () => {
    setFinished(false);
    setCurrentIndex((index) => Math.max(0, index - 1));
  };

  const goToNextStep = () => {
    if (currentIndex >= steps.length - 1) {
      setFinished(true);
      setRunning(false);
      return;
    }

    setCurrentIndex((index) => index + 1);
  };

  if (finished) {
    return (
      <article className="guided-cooking" aria-label={`${recipe.name} cooking complete`}>
        <button type="button" className="recipe-detail-back" onClick={onExit}>
          Back to recipe
        </button>
        <div className="guided-finish">
          <p className="eyebrow">Finished</p>
          <h2>{recipe.name} is ready</h2>
          <p>Nice work. Plate it up, taste once more, and enjoy while it is warm.</p>
          <div className="guided-controls">
            <button type="button" onClick={() => {
              setFinished(false);
              setCurrentIndex(0);
            }}>
              Cook Again
            </button>
            <button type="button" onClick={onExit}>Close</button>
          </div>
        </div>
      </article>
    );
  }

  if (!currentStep) {
    return (
      <article className="guided-cooking">
        <button type="button" className="recipe-detail-back" onClick={onExit}>
          Back to recipe
        </button>
        <p className="empty-state">No guided cooking steps are available.</p>
      </article>
    );
  }

  const isTimedStep = Boolean(currentStep.durationSeconds);

  return (
    <article className="guided-cooking" aria-label={`${recipe.name} guided cooking`}>
      <button type="button" className="recipe-detail-back" onClick={onExit}>
        Back to recipe
      </button>

      <div className="guided-progress-row">
        <span>Step {currentStep.stepNumber} of {steps.length}</span>
        <span>{recipe.name}</span>
      </div>
      <div className="guided-progress-track" aria-hidden="true">
        <div className="guided-progress-fill" style={{ width: `${progressPercent}%` }} />
      </div>

      <section className="guided-step-card">
        <div className="guided-step-meta">
          {currentStep.actionType && <span>{currentStep.actionType}</span>}
          {currentStep.ingredient && <span>{currentStep.ingredient}</span>}
        </div>

        <h2>{currentStep.instruction}</h2>

        {isTimedStep ? (
          <div className={secondsRemaining === 0 ? "guided-timer guided-timer-done" : "guided-timer"}>
            {formatTimer(secondsRemaining)}
          </div>
        ) : (
          <div className="guided-untimed">Ready when you are</div>
        )}

        {currentStep.tip && <p className="guided-tip">{currentStep.tip}</p>}
        {notice && <p className="guided-notice">{notice}</p>}
      </section>

      <div className="guided-controls">
        {isTimedStep && !stepFinished && (
          <button type="button" onClick={() => setRunning((value) => !value)}>
            {running ? "Pause" : secondsRemaining === currentStep.durationSeconds ? "Start" : "Resume"}
          </button>
        )}
        {isTimedStep && (
          <button type="button" onClick={() => {
            setRunning(false);
            setSecondsRemaining(currentStep.durationSeconds ?? 0);
            setStepFinished(false);
            setNotice(null);
          }}>
            Reset Timer
          </button>
        )}
        <button type="button" onClick={goToPreviousStep} disabled={currentIndex === 0}>
          Previous Step
        </button>
        <button type="button" onClick={goToNextStep}>
          Next Step
        </button>
        <button type="button" onClick={goToNextStep}>
          Skip Step
        </button>
      </div>
    </article>
  );
}

function RecipeDetail({ recipe, onClose }: { recipe: Recipe; onClose: () => void }) {
  const [cookingMode, setCookingMode] = useState(false);

  if (cookingMode) {
    return <GuidedCookingMode recipe={recipe} onExit={() => setCookingMode(false)} />;
  }

  return (
    <article className="recipe-detail" aria-label={`${recipe.name} details`}>
      <button type="button" className="recipe-detail-back" onClick={onClose}>
        Back to recipes
      </button>

      <div className="recipe-detail-header">
        <p className="eyebrow">Recipe Details</p>
        <h2>{recipe.name}</h2>
        {recipe.description && <p>{recipe.description}</p>}
      </div>

      <div className="recipe-detail-meta">
        <span><strong>{recipe.prepTime}</strong> prep</span>
        <span><strong>{recipe.cookTime}</strong> cook</span>
        <span><strong>{recipe.totalTime}</strong> total</span>
        <span><strong>{recipe.servings}</strong> servings</span>
        <span><strong>{recipe.calories}</strong> kcal</span>
      </div>

      <div className="recipe-detail-tags">
        <span>{recipe.mealType}</span>
        <span>{recipe.difficulty}</span>
        {recipe.dietary.map((tag) => (
          <span key={tag}>{tag}</span>
        ))}
      </div>

      <button type="button" className="start-cooking-btn" onClick={() => setCookingMode(true)}>
        Start Cooking
      </button>

      <div className="recipe-detail-columns">
        <section>
          <h3>Ingredients</h3>
          <ul className="recipe-detail-list">
            {recipe.ingredients.map((ingredient) => (
              <li key={ingredient}>{ingredient}</li>
            ))}
          </ul>
        </section>

        <section>
          <h3>Instructions</h3>
          <ol className="recipe-step-list">
            {recipe.instructions.map((step) => (
              <li key={step}>{step}</li>
            ))}
          </ol>
        </section>
      </div>
    </article>
  );
}

function isInCookTimeRange(totalTime: number, filter: CookTimeFilter): boolean {
  switch (filter) {
    case "Under 15 minutes":
      return totalTime < 15;
    case "15-30 minutes":
      return totalTime >= 15 && totalTime <= 30;
    case "30-60 minutes":
      return totalTime > 30 && totalTime <= 60;
    case "Over 60 minutes":
      return totalTime > 60;
  }
}

function recipeMatchesFilters(recipe: Recipe, filters: Filters): boolean {
  const matchesMealType =
    filters.mealType.length === 0 || filters.mealType.includes(recipe.mealType);
  const matchesCookTime =
    filters.cookTime.length === 0 || filters.cookTime.some((filter) => isInCookTimeRange(recipe.totalTime, filter));
  const matchesDifficulty =
    filters.difficulty.length === 0 || filters.difficulty.includes(recipe.difficulty);
  const matchesDietary =
    filters.dietary.length === 0 || filters.dietary.every((filter) => recipe.dietary.includes(filter));

  return matchesMealType && matchesCookTime && matchesDifficulty && matchesDietary;
}

export default function RecipesPage() {
  const navigate = useNavigate();
  const { recipeId } = useParams();
  const [itemInput, setItemInput] = useState("");
  const [results, setResults] = useState<Recipe[]>([]);
  const [filters, setFilters] = useState<Filters>(defaultFilters);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const filteredResults = useMemo(
    () => results.filter((recipe) => recipeMatchesFilters(recipe, filters)),
    [results, filters]
  );

  const selectedRecipe = useMemo(
    () => results.find((recipe) => recipe.id === Number(recipeId)) ?? null,
    [results, recipeId]
  );

  useEffect(() => {
    const loadRecipes = async () => {
      setLoading(true);
      setError(null);

      try {
        setResults(await getRecipes());
      } catch {
        setError("Could not load recipes.");
      } finally {
        setLoading(false);
      }
    };

    void loadRecipes();
  }, []);

  const handleSearch = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const value = itemInput.trim();

    navigate("/recipes");
    setLoading(true);
    setError(null);

    try {
      setResults(value ? await searchRecipes(value) : await getRecipes());
    } catch {
      setError("Could not search recipes.");
    } finally {
      setLoading(false);
    }
  };

  const handleSelectRecipe = (recipe: Recipe) => {
    navigate(`/recipes/${recipe.id}`);
  };

  const handleBackToRecipes = () => {
    navigate("/recipes");
  };

  return (
    <main className="pantry-page filter-layout">
      <FilterSidebar filters={filters} onChange={setFilters} />

      <div className="filter-main">
        <section className="pantry-card recipe-panel" style={{ textAlign: "left" }}>
          <p className="eyebrow">Your Recipes</p>
          <img className="brand-logo" src="/src/assets/logo.png"
            alt="BetterCook chef logo" style={{ float: "right" }} />
          <h1>What Recipes Are You Looking For?</h1>

          <form className="pantry-form" onSubmit={handleSearch}>
            <label htmlFor="recipes-input" className="sr-only">Recipe search</label>
            <input id="recipes-input" type="text" placeholder="Search for recipes"
              value={itemInput} onChange={(e) => setItemInput(e.target.value)} />
            <button type="submit" disabled={loading}>{loading ? "Searching..." : "Go!"}</button>
          </form>

          {error && <p className="error-msg">{error}</p>}

          {selectedRecipe ? (
            <RecipeDetail recipe={selectedRecipe} onClose={handleBackToRecipes} />
          ) : (
            <div className="recipe-cards-grid" aria-live="polite">
              {loading ? (
                <p className="empty-state">Loading recipes...</p>
              ) : filteredResults.length === 0 ? (
                <p className="empty-state">
                  {hasActiveFilters(filters) ? "No recipes match your filters." : "No recipes yet."}
                </p>
              ) : (
                filteredResults.map((recipe) => (
                  <RecipeCard key={recipe.id} recipe={recipe} onSelect={handleSelectRecipe} />
                ))
              )}
            </div>
          )}
        </section>
      </div>
    </main>
  );
}
