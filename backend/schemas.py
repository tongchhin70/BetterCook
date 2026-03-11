from pydantic import BaseModel


class UserCreate(BaseModel):
    username: str
    password: str


class UserLogin(BaseModel):
    username: str
    password: str

class RecipeCreate(BaseModel):
    name: str
    description: str
    ingredients: str
    instructions: str
    prep_time: int
    cook_time: int
    servings: int


class Recipe(RecipeCreate):
    id: int
