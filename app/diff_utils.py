from __future__ import annotations

import re
from functools import lru_cache
from typing import Any, Dict, List, Optional

import numpy as np
from difflib import SequenceMatcher
from sentence_transformers import SentenceTransformer


EMBEDDING_MODEL_NAME = "sentence-transformers/all-MiniLM-L6-v2"


def _split_into_sentences(text: str) -> List[str]:
    text = (text or "").strip()
    if not text:
        return []

    # Simple heuristic: split on sentence-ending punctuation followed by whitespace.
    parts = re.split(r"(?<=[.!?])\s+|\n+", text)
    sentences = [p.strip() for p in parts if p.strip()]
    return sentences


@lru_cache(maxsize=1)
def _get_embedder() -> SentenceTransformer:
    # Cached to avoid re-downloading/loading the model.
    return SentenceTransformer(EMBEDDING_MODEL_NAME)


def _cosine_similarity(a: np.ndarray, b: np.ndarray) -> float:
    a = a.astype(np.float64, copy=False)
    b = b.astype(np.float64, copy=False)
    denom = (np.linalg.norm(a) * np.linalg.norm(b))
    if denom == 0.0:
        return 0.0
    return float(np.dot(a, b) / denom)


def diff_strings(
    text_a: str,
    text_b: str,
    *,
    embedder: Optional[SentenceTransformer] = None,
    embedding_model_name: str = EMBEDDING_MODEL_NAME,
) -> Dict[str, Any]:
    """
    Compare two strings by sentence-level diff + semantic cosine similarity.

    Returns:
      - changed_sentences: list of change records (insert/delete/replace)
      - similarity_score: cosine similarity of MiniLM embeddings
    """

    sentences_a = _split_into_sentences(text_a)
    sentences_b = _split_into_sentences(text_b)

    changed: List[Dict[str, str]] = []
    matcher = SequenceMatcher(a=sentences_a, b=sentences_b, autojunk=False)

    for tag, i1, i2, j1, j2 in matcher.get_opcodes():
        if tag == "equal":
            continue

        if tag in {"replace", "delete", "insert"}:
            max_len = max(i2 - i1, j2 - j1)
            for k in range(max_len):
                old_sent = sentences_a[i1 + k] if (i1 + k) < i2 else ""
                new_sent = sentences_b[j1 + k] if (j1 + k) < j2 else ""

                if tag == "delete":
                    if old_sent:
                        changed.append({"type": "delete", "from": old_sent, "to": ""})
                elif tag == "insert":
                    if new_sent:
                        changed.append({"type": "insert", "from": "", "to": new_sent})
                else:  # replace
                    if old_sent or new_sent:
                        changed.append({"type": "replace", "from": old_sent, "to": new_sent})

    # Semantic similarity on whole-text embeddings.
    if embedder is None:
        # Allow overriding model name while still caching by using a separate embedder
        # only when a custom name is provided.
        if embedding_model_name == EMBEDDING_MODEL_NAME:
            embedder = _get_embedder()
        else:
            embedder = SentenceTransformer(embedding_model_name)

    if not (text_a or "").strip() and not (text_b or "").strip():
        similarity = 1.0
    elif not (text_a or "").strip() or not (text_b or "").strip():
        similarity = 0.0
    else:
        emb_a = embedder.encode([text_a], normalize_embeddings=False)[0]
        emb_b = embedder.encode([text_b], normalize_embeddings=False)[0]
        similarity = _cosine_similarity(np.asarray(emb_a), np.asarray(emb_b))

    return {"changed_sentences": changed, "similarity_score": similarity}

