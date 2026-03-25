from __future__ import annotations

import os
from datetime import datetime
from functools import lru_cache

import requests
from sqlalchemy.orm import Session

from . import crud, models, schemas


FIRECRAWL_SCRAPE_URL = "https://api.firecrawl.dev/v1/scrape"
EMBEDDING_MODEL_NAME = "sentence-transformers/all-MiniLM-L6-v2"


@lru_cache(maxsize=1)
def _get_embedder():
    # Import inside the function so the rest of the app can start
    # without downloading large ML artifacts immediately.
    from sentence_transformers import SentenceTransformer

    return SentenceTransformer(EMBEDDING_MODEL_NAME)


def fetch_firecrawl_markdown_and_embed_and_save_snapshot(url: str, db: Session) -> models.Snapshot:
    """
    Fetch a page's markdown via Firecrawl, compute a MiniLM embedding,
    and save both to the `snapshots` table.
    """

    api_key = os.environ.get("FIRECRAWL_API_KEY")
    if not api_key:
        raise RuntimeError("Missing FIRECRAWL_API_KEY environment variable")

    resp = requests.post(
        FIRECRAWL_SCRAPE_URL,
        headers={"Authorization": f"Bearer {api_key}"},
        json={"url": url, "formats": ["markdown"]},
        timeout=60,
    )
    resp.raise_for_status()
    payload = resp.json()
    if not payload.get("success"):
        raise RuntimeError(f"Firecrawl scrape failed: {payload}")

    markdown = (payload.get("data") or {}).get("markdown")
    if markdown is None:
        raise RuntimeError(f"Firecrawl scrape returned no markdown: {payload}")

    # Compute embedding using sentence-transformers.
    embedder = _get_embedder()
    embedding_np = embedder.encode([markdown])  # ndarray of shape (1, dim)
    embedding_list = [float(x) for x in embedding_np[0].tolist()]

    snapshot_payload = schemas.SnapshotCreate(
        url=url,
        timestamp=datetime.utcnow(),
        text=markdown,
        embedding=embedding_list,
    )
    return crud.create_snapshot(db, snapshot_payload)

