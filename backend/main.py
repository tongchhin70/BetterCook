from typing import Any, Dict, List, Optional

from fastapi import Depends, FastAPI, Header, HTTPException, Response, status
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, ConfigDict, Field
from sqlalchemy import Integer, String, insert, inspect, select, text
from sqlalchemy.orm import Mapped, Session, mapped_column

from db import Base, engine, get_db
from model import favorites, recipes, users
from schemas import Favorite, FavoriteCreate, Recipe, RecipeCreate, UserCreate, UserLogin


class PantryItemDB(Base):
    __tablename__ = "pantry_items"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, index=True)
    user_id: Mapped[Optional[int]] = mapped_column(Integer, index=True)
    name: Mapped[str] = mapped_column(String(255), nullable=False)
    quantity: Mapped[int] = mapped_column(Integer, nullable=False)
    unit: Mapped[str] = mapped_column(String(50), nullable=False)
    calories: Mapped[int] = mapped_column(Integer, nullable=False, default=0)

class PantryItemCreate(BaseModel):
    name: str = Field(..., examples=["Eggs"])
    quantity: int = Field(1, ge=1, examples=[12])
    unit: str = Field("pcs", examples=["pcs"])
    calories: int = Field(0, ge=0, examples=[100])

class PantryItem(PantryItemCreate):
    id: int = Field(..., examples=[1])
    model_config = ConfigDict(from_attributes=True)


class RecipesSearchHistory(Base):
    __tablename__ = "recipes_search_history"

    id: Mapped[int] = mapped_column(Integer, primary_key=True)
    query: Mapped[str] = mapped_column(String, nullable=False)


class FavoritesSearchHistory(Base):
    __tablename__ = "favorites_search_history"

    id: Mapped[int] = mapped_column(Integer, primary_key=True)
    query: Mapped[str] = mapped_column(String, nullable=False)


class AuthResponse(BaseModel):
    message: str
    username: str


app = FastAPI(
    title="BetterCook API",
    version="1.3.0",
    description="Pantry, auth, and recipes API backed by PostgreSQL.",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"]
)


def _ensure_pantry_columns() -> None:
    inspector = inspect(engine)
    if "pantry_items" not in inspector.get_table_names():
        return

    cols = {col["name"] for col in inspector.get_columns("pantry_items")}
    with engine.begin() as conn:
        if "user_id" not in cols:
            conn.execute(text("ALTER TABLE pantry_items ADD COLUMN user_id INTEGER"))
        if "calories" not in cols:
            conn.execute(text("ALTER TABLE pantry_items ADD COLUMN calories INTEGER NOT NULL DEFAULT 0"))


@app.on_event("startup")
def on_startup() -> None:
    Base.metadata.create_all(bind=engine)
    users.metadata.create_all(bind=engine)
    _ensure_pantry_columns()


# Auth
@app.post("/register", response_model=AuthResponse, tags=["Auth"])
def register(payload: UserCreate, db: Session = Depends(get_db)) -> AuthResponse:
    username = payload.username.strip()
    password = payload.password

    existing_user = db.execute(select(users.c.id).where(users.c.username == username)).first()
    if existing_user is not None:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="Username already exists",
        )

    db.execute(insert(users).values(username=username, password=password))
    db.commit()
    return AuthResponse(message="User registered", username=username)


@app.post("/login", response_model=AuthResponse, tags=["Auth"])
def login(payload: UserLogin, db: Session = Depends(get_db)) -> AuthResponse:
    username = payload.username.strip()
    password = payload.password

    user = db.execute(
        select(users.c.username, users.c.password).where(users.c.username == username)
    ).first()
    if user is None or user._mapping["password"] != password:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid username or password",
        )

    return AuthResponse(message="Login successful", username=username)


def get_current_user_id(
    x_username: Optional[str] = Header(default=None, alias="X-Username"),
    db: Session = Depends(get_db),
) -> int:
    username = (x_username or "").strip()
    if not username:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Login required")

    row = db.execute(select(users.c.id).where(users.c.username == username)).first()
    if row is None:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid user")

    return int(row._mapping["id"])


# Pantry
@app.get("/api/pantry", response_model=list[PantryItem], tags=["Pantry"])
def get_pantry(
    user_id: int = Depends(get_current_user_id),
    db: Session = Depends(get_db),
) -> list[PantryItemDB]:
    return (
        db.query(PantryItemDB)
        .filter(PantryItemDB.user_id == user_id)
        .order_by(PantryItemDB.id.asc())
        .all()
    )

@app.post(
    "/api/pantry",
    response_model=PantryItem,
    status_code=status.HTTP_201_CREATED,
    tags=["Pantry"],
    summary="Add pantry item",
)
def add_pantry_item(
    payload: PantryItemCreate,
    user_id: int = Depends(get_current_user_id),
    db: Session = Depends(get_db),
) -> PantryItemDB:
    item = PantryItemDB(
        user_id=user_id,
        name=payload.name.strip(),
        quantity=payload.quantity,
        unit=payload.unit.strip(),
        calories=payload.calories,
    )
    db.add(item)
    db.commit()
    db.refresh(item)
    return item

@app.put(
    "/api/pantry/{item_id}",
    response_model=PantryItem,
    tags=["Pantry"],
    summary="Update pantry item",
)
def update_pantry_item(
    item_id: int,
    payload: PantryItemCreate,
    user_id: int = Depends(get_current_user_id),
    db: Session = Depends(get_db),
) -> PantryItemDB:
    item = db.get(PantryItemDB, item_id)
    if item is None or item.user_id != user_id:
        raise HTTPException(status_code=404, detail="Pantry item not found")

    item.name = payload.name.strip()
    item.quantity = payload.quantity
    item.unit = payload.unit.strip()
    item.calories = payload.calories
    db.commit()
    db.refresh(item)
    return item


@app.delete(
    "/api/pantry/{item_id}",
    status_code=status.HTTP_204_NO_CONTENT,
    tags=["Pantry"],
    summary="Remove pantry item",
)
def remove_pantry_item(
    item_id: int,
    user_id: int = Depends(get_current_user_id),
    db: Session = Depends(get_db),
) -> Response:
    item = db.get(PantryItemDB, item_id)
    if item is None or item.user_id != user_id:
        raise HTTPException(status_code=404, detail="Pantry item not found")

    db.delete(item)
    db.commit()
    return Response(status_code=status.HTTP_204_NO_CONTENT)


@app.get(
    "/api/pantry/search",
    response_model=List[PantryItem],
    tags=["Pantry"],
    summary="Search pantry items by name",
)
def search_pantry(
    q: str,
    user_id: int = Depends(get_current_user_id),
    db: Session = Depends(get_db),
) -> List[PantryItemDB]:
    return (
        db.query(PantryItemDB)
        .filter(PantryItemDB.user_id == user_id)
        .filter(PantryItemDB.name.ilike(f"%{q}%"))
        .order_by(PantryItemDB.id.asc())
        .all()
    )


# Recipes

def _list_to_db_text(values: List[str]) -> str:
    return "\n".join(v.strip() for v in values if v.strip())


def _db_text_to_list(value: Optional[str]) -> List[str]:
    if not value:
        return []
    return [line.strip() for line in value.splitlines() if line.strip()]


def _row_to_recipe(row: Dict[str, Any]) -> Recipe:
    return Recipe(
        id=row["id"],
        name=row["name"],
        description=row.get("description") or "",
        ingredients=_db_text_to_list(row.get("ingredients")),
        instructions=_db_text_to_list(row.get("instructions")),
        prep_time=row["prep_time"],
        cook_time=row["cook_time"],
        servings=row["servings"],
    )


@app.get("/api/recipes", response_model=List[Recipe], tags=["Recipes"])
def get_recipes(db: Session = Depends(get_db)) -> List[Recipe]:
    rows = db.execute(select(recipes).order_by(recipes.c.id.asc())).mappings().all()
    return [_row_to_recipe(dict(row)) for row in rows]


@app.post(
    "/api/recipes",
    response_model=Recipe,
    status_code=status.HTTP_201_CREATED,
    tags=["Recipes"],
    summary="Add recipe",
)
def add_recipes(payload: RecipeCreate, db: Session = Depends(get_db)) -> Recipe:
    row = (
        db.execute(
            insert(recipes)
            .values(
                name=payload.name.strip(),
                description=payload.description.strip(),
                ingredients=_list_to_db_text(payload.ingredients),
                instructions=_list_to_db_text(payload.instructions),
                prep_time=payload.prep_time,
                cook_time=payload.cook_time,
                servings=payload.servings
            )
            .returning(*recipes.c)
        )
        .mappings()
        .one()
    )
    db.commit()
    return _row_to_recipe(dict(row))


@app.get("/api/recipes/recommend", response_model=List[Recipe], tags=["Recipes"])
def recommend_recipes(db: Session = Depends(get_db)) -> List[Recipe]:
    pantry_items = db.query(PantryItemDB).all()
    pantry_names = [item.name.lower() for item in pantry_items]

    rows = db.execute(select(recipes)).mappings().all()
    recommended: List[Recipe] = []

    for row in rows:
        recipe = dict(row)
        ingredients = (recipe.get("ingredients") or "").lower()
        if any(pantry_item in ingredients for pantry_item in pantry_names):
            recommended.append(_row_to_recipe(recipe))

    return recommended


@app.get("/api/recipes/search", response_model=List[Recipe], tags=["Recipes"])
def search_recipes(q: str, db: Session = Depends(get_db)) -> List[Recipe]:
    db.add(RecipesSearchHistory(query=q))
    db.commit()

    rows = (
        db.execute(select(recipes).where(recipes.c.name.ilike(f"%{q}%"))).mappings().all()
    )
    return [_row_to_recipe(dict(row)) for row in rows]


@app.get("/api/recipes/history", tags=["Recipes"])
def get_recipes_history(db: Session = Depends(get_db)):
    return db.query(RecipesSearchHistory).order_by(RecipesSearchHistory.id.desc()).all()

# Favorite Recipes
@app.get("/api/favorites", response_model=List[Favorite], tags=["Favorites"])
def get_favorites(db: Session = Depends(get_db)) -> List[Favorite]:
    rows = db.execute(select(favorites).order_by(favorites.c.id.asc())).mappings().all()
    return [Favorite(**dict(row)) for row in rows]


@app.post(
    "/api/favorites",
    response_model=Favorite,
    status_code=status.HTTP_201_CREATED,
    tags=["Favorites"],
    summary="Add favorite",
)
def add_favorites(payload: FavoriteCreate, db: Session = Depends(get_db)) -> Favorite:
    row = (
        db.execute(
            insert(favorites)
            .values(
                name=payload.name.strip(),
                description=payload.description.strip(),
                ingredients=payload.ingredients.strip(),
                instructions=payload.instructions.strip(),
                prep_time=payload.prep_time,
                cook_time=payload.cook_time,
                servings=payload.servings
            )
            .returning(*favorites.c)
        )
        .mappings()
        .one()
    )
    db.commit()
    return Favorite(**dict(row))


@app.get("/api/favorites/recommend", response_model=List[PantryItem], tags=["Favorites"])
def recommend_favorites(db: Session = Depends(get_db)) -> List[PantryItemDB]:
    history = db.query(FavoritesSearchHistory).all()
    if not history:
        return []

    keywords = [h.query.lower() for h in history]
    query = db.query(PantryItemDB)
    for word in keywords:
        query = query.filter(PantryItemDB.name.ilike(f"%{word}%"))

    return query.all()


@app.get("/api/favorites/search", response_model=List[PantryItem], tags=["Favorites"])
def search_favorites(q: str, db: Session = Depends(get_db)) -> List[PantryItemDB]:
    db.add(FavoritesSearchHistory(query=q))
    db.commit()

    return (
        db.query(PantryItemDB)
        .filter(PantryItemDB.name.ilike(f"%{q}%"))
        .order_by(PantryItemDB.id.asc())
        .all()
    )


@app.get("/api/favorites/history", tags=["Favorites"])
def get_favorites_history(db: Session = Depends(get_db)):
    return db.query(FavoritesSearchHistory).order_by(FavoritesSearchHistory.id.desc()).all()
