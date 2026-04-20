# Compatibility entrypoint.
# Keep this so existing commands like `uvicorn app:app` still work.
from main import app
