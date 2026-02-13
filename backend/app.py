from fastapi import Depends, FastAPI, HTTPException, status
from pydantic import BaseModel
from sqlalchemy import insert, select
from sqlalchemy.orm import Session

from db import engine, get_db
from model import users
from schemas import UserCreate, UserLogin

app = FastAPI(title="BetterCook Auth API")


class AuthResponse(BaseModel):
    message: str
    username: str


@app.on_event("startup")
def on_startup() -> None:
    users.metadata.create_all(bind=engine)


@app.post("/register", response_model=AuthResponse, tags=["Auth"])
def register(payload: UserCreate, db: Session = Depends(get_db)) -> AuthResponse:
    username = payload.username.strip()
    password = payload.password

    existing_user = db.execute(
        select(users.c.id).where(users.c.username == username)
    ).first()
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
