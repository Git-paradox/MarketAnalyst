from __future__ import annotations

import os
from pathlib import Path

from sqlalchemy import create_engine
from sqlalchemy.orm import Session, declarative_base, sessionmaker

BASE_DIR = Path(__file__).resolve().parents[1]


def _build_database_url() -> str:
    """
    Build SQLite URL from DATABASE_PATH (optional) or fall back to app.db
    inside the project root.
    """

    db_path = os.environ.get("DATABASE_PATH", str(BASE_DIR / "app.db"))
    # SQLite URL must use forward slashes.
    return f"sqlite:///{Path(db_path).as_posix()}"


DATABASE_URL = _build_database_url()

engine = create_engine(
    DATABASE_URL,
    connect_args={"check_same_thread": False},
)

SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

Base = declarative_base()


def get_db() -> Session:
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

