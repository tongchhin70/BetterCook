import os

from fastapi import Depends, FastAPI, HTTPException, Response, status
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, ConfigDict, Field
from sqlalchemy import Integer, String, create_engine
from sqlalchemy.orm import Mapped, Session, declarative_base, mapped_column, sessionmaker

DATABASE_URL = os.getenv(
    "DATABASE_URL",
    "postgresql+psycopg2://postgres:postgres@localhost:5432/bettercook",
)

engine = create_engine(DATABASE_URL, pool_pre_ping=True)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
Base = declarative_base()


class PantryItemDB(Base):
    __tablename__ = "pantry_items"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, index=True)
    name: Mapped[str] = mapped_column(String(255), nullable=False)
    quantity: Mapped[int] = mapped_column(Integer, nullable=False)
    unit: Mapped[str] = mapped_column(String(50), nullable=False)


class PantryItemCreate(BaseModel):
    name: str = Field(..., examples=["Eggs"])
    quantity: int = Field(1, ge=1, examples=[12])
    unit: str = Field("pcs", examples=["pcs"])


class PantryItem(PantryItemCreate):
    id: int = Field(..., examples=[1])

    model_config = ConfigDict(from_attributes=True)


app = FastAPI(
    title="BetterCook API",
    version="1.2.0",
    description="Pantry API backed by PostgreSQL.",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.on_event("startup")
def on_startup() -> None:
    Base.metadata.create_all(bind=engine)


def get_db() -> Session:
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


@app.get("/api/pantry", response_model=list[PantryItem], tags=["Pantry"])
def get_pantry(db: Session = Depends(get_db)) -> list[PantryItemDB]:
    return db.query(PantryItemDB).order_by(PantryItemDB.id.asc()).all()


@app.post(
    "/api/pantry",
    response_model=PantryItem,
    status_code=status.HTTP_201_CREATED,
    tags=["Pantry"],
    summary="Add pantry item",
)
def add_pantry_item(payload: PantryItemCreate, db: Session = Depends(get_db)) -> PantryItemDB:
    item = PantryItemDB(
        name=payload.name.strip(),
        quantity=payload.quantity,
        unit=payload.unit.strip(),
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
    item_id: int, payload: PantryItemCreate, db: Session = Depends(get_db)
) -> PantryItemDB:
    item = db.get(PantryItemDB, item_id)
    if item is None:
        raise HTTPException(status_code=404, detail="Pantry item not found")

    item.name = payload.name.strip()
    item.quantity = payload.quantity
    item.unit = payload.unit.strip()

    db.commit()
    db.refresh(item)
    return item


@app.delete(
    "/api/pantry/{item_id}",
    status_code=status.HTTP_204_NO_CONTENT,
    tags=["Pantry"],
    summary="Remove pantry item",
)
def remove_pantry_item(item_id: int, db: Session = Depends(get_db)) -> Response:
    item = db.get(PantryItemDB, item_id)
    if item is None:
        raise HTTPException(status_code=404, detail="Pantry item not found")

    db.delete(item)
    db.commit()
    return Response(status_code=status.HTTP_204_NO_CONTENT)
