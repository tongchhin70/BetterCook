# Backend (FastAPI + PostgreSQL)

This backend runs in a local virtual environment at:

`/Users/tongchhin/Documents/git_repos/BetterCook/backend/.venv`

## 1) Configure PostgreSQL

Set `DATABASE_URL` before running the API. Example:

```bash
export DATABASE_URL="postgresql+psycopg2://postgres:postgres@localhost:5432/bettercook"
```

Create the DB once (example):

```bash
createdb bettercook
```

## 2) One-time setup

```bash
cd /Users/tongchhin/Documents/git_repos/BetterCook/backend
python3 -m venv .venv
source .venv/bin/activate
python -m pip install -U pip setuptools wheel
pip install -r requirements.txt
```

## 3) Run the API

```bash
cd /Users/tongchhin/Documents/git_repos/BetterCook/backend
source .venv/bin/activate
export DATABASE_URL="postgresql+psycopg2://postgres:postgres@localhost:5432/bettercook"
uvicorn main:app --reload --host 0.0.0.0 --port 8000
```

## 4) Verify

```bash
curl http://localhost:8000/api/pantry
```

Swagger UI:

- [http://localhost:8000/docs](http://localhost:8000/docs)

## 5) Deactivate

```bash
deactivate
```
