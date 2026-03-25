# FastAPI SQLite CRUD

FastAPI app using SQLite + SQLAlchemy with CRUD endpoints for:
- `snapshots` (`url`, `timestamp`, `text`, `embedding`)
- `insights` (`signal`, `source`, `confidence`)
- `signals` (`type`, `company`, `weight`)
- `jobs` (`title`, `company`, `intent`)

## Run

```powershell
cd fastapi_sqlite_crud
python -m pip install -r requirements.txt
python run.py
```

API docs:
- `http://127.0.0.1:8000/docs`

## Database

SQLite database file is `app.db` in the project root by default.
Override with `DATABASE_PATH` environment variable.

