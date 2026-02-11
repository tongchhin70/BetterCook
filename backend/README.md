# Backend (FastAPI)

This backend is localized to a project virtual environment at:

`/Users/tongchhin/Documents/git_repos/BetterCook/backend/.venv`

## One-time setup

```bash
cd /Users/tongchhin/Documents/git_repos/BetterCook/backend
python3 -m venv .venv
source .venv/bin/activate
python -m pip install -U pip setuptools wheel
pip install -r requirements.txt
```

## Run the API

```bash
cd /Users/tongchhin/Documents/git_repos/BetterCook/backend
source .venv/bin/activate
uvicorn main:app --reload --host 0.0.0.0 --port 8000
```

## Verify

```bash
curl http://localhost:8000/health
curl http://localhost:8000/api/pantry
```

## Deactivate

```bash
deactivate
```
