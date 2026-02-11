from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from typing import Dict, List, Union

app = FastAPI(title="BetterCook API", version="1.0.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/health")
def health() -> Dict[str, str]:
    return {"status": "ok"}


@app.get("/api/pantry")
def get_pantry() -> List[Dict[str, Union[int, str]]]:
    return [{"id": 1, "name": "Eggs", "quantity": 12, "unit": "pcs"}]


# Compatibility endpoint if clients were using the previous .NET template path.
@app.get("/weatherforecast")
def weather_forecast() -> List[Dict[str, Union[int, str]]]:
    return [
        {"date": "2026-02-12", "temperatureC": 12, "summary": "Mild"},
        {"date": "2026-02-13", "temperatureC": 9, "summary": "Cool"},
    ]
