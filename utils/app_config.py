"""Mirror of `utils/appConfig.ts` for Python subprocesses (invoice Excel writer)."""

from __future__ import annotations

import os


def _normalize_base_url_candidate(raw: str) -> str | None:
    normalized = raw.strip().strip("'\"").rstrip("/")
    if not normalized or normalized.lower() in ("undefined", "null"):
        return None
    if not normalized.lower().startswith(("http://", "https://")):
        return None
    return normalized


def resolve_base_url(raw: str | None = None) -> str:
    if raw is not None:
        from_arg = _normalize_base_url_candidate(raw)
        if from_arg:
            return from_arg

    from_env = _normalize_base_url_candidate(os.environ.get("BASE_URL", ""))
    if from_env:
        return from_env

    raise RuntimeError(
        "BASE_URL is required. Set the BASE_URL environment variable in `.env`."
    )