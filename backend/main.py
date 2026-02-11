from typing import List, Optional

from fastapi import FastAPI, HTTPException, Response, status
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field

app = FastAPI(
    title="BetterCook API",
    version="1.1.0",
    description="Simple pantry API with Swagger-ready endpoints for manual testing.",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


class PantryItemCreate(BaseModel):
    name: str = Field(..., examples=["Eggs"])
    quantity: int = Field(1, ge=1, examples=[12])
    unit: str = Field("pcs", examples=["pcs"])


class PantryItem(PantryItemCreate):
    id: int = Field(..., examples=[1])


pantry_items: List[PantryItem] = [PantryItem(id=1, name="Eggs", quantity=12, unit="pcs")]
next_item_id = 2


@app.get("/api/pantry", response_model=List[PantryItem], tags=["Pantry"])
def get_pantry() -> List[PantryItem]:
    return pantry_items

@app.post(
    "/api/pantry",
    response_model=PantryItem,
    status_code=status.HTTP_201_CREATED,
    tags=["Pantry"],
    summary="Add pantry item",
)
def add_pantry_item(payload: PantryItemCreate) -> PantryItem:
    global next_item_id
    item = PantryItem(
        id=next_item_id,
        name=payload.name.strip(),
        quantity=payload.quantity,
        unit=payload.unit.strip(),
    )
    next_item_id += 1
    pantry_items.append(item)
    return item

@app.put(
    "/api/pantry/{item_id}",
    response_model=PantryItem,
    tags=["Pantry"],
    summary="Update pantry item",
)
def update_pantry_item(item_id: int, payload: PantryItemCreate) -> PantryItem:
    for index, item in enumerate(pantry_items):
        if item.id == item_id:
            updated = PantryItem(
                id=item.id,
                name=payload.name.strip(),
                quantity=payload.quantity,
                unit=payload.unit.strip(),
            )
            pantry_items[index] = updated
            return updated

    raise HTTPException(status_code=404, detail="Pantry item not found")


@app.delete(
    "/api/pantry/{item_id}",
    status_code=status.HTTP_204_NO_CONTENT,
    tags=["Pantry"],
    summary="Remove pantry item",
)
def remove_pantry_item(item_id: int) -> Response:
    item_index: Optional[int] = None
    for index, item in enumerate(pantry_items):
        if item.id == item_id:
            item_index = index
            break

    if item_index is None:
        raise HTTPException(status_code=404, detail="Pantry item not found")

    pantry_items.pop(item_index)
    return Response(status_code=status.HTTP_204_NO_CONTENT)



class RecipesCreate(BaseModel):
    name: str = Field(..., examples=["Eggs"])
    quantity: int = Field(1, ge=1, examples=[12])
    unit: str = Field("pcs", examples=["pcs"])


class PantryItem(PantryItemCreate):
    id: int = Field(..., examples=[1])


RecipesCreate_items: List[PantryItem] = [PantryItem(id=1, name="Eggs", quantity=12, unit="pcs")]
next_item_id = 2

@app.get("/api/pantry", response_model=List[PantryItem], tags=["Pantry"])
def get_pantry() -> List[PantryItem]:
    return pantry_items

@app.post(
    "/api/recipes",
    response_model=PantryItem,
    status_code=status.HTTP_201_CREATED,
    tags=["Recipes"],
    summary="Add pantry item",
)
def update_pantry_item(item_id: int, payload: RecipesCreate) -> PantryItem: RecipesCreate_items