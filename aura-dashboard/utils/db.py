from __future__ import annotations

import time
from typing import Any

import pandas as pd
import streamlit as st
from sqlalchemy import create_engine, text
from sqlalchemy.engine import Engine

from utils import queries as query_catalog


@st.cache_resource
def get_engine() -> Engine:
    # DATABASE_URL is expected in .streamlit/secrets.toml for local and Streamlit Cloud.
    return create_engine(st.secrets["DATABASE_URL"])


def _normalize_sql(sql: str) -> str:
    return " ".join(sql.strip().rstrip(";").split()).lower()


@st.cache_resource
def _allowed_sql_lookup() -> dict[str, str]:
    allowed: dict[str, str] = {}
    for name, value in vars(query_catalog).items():
        if name.endswith("_SQL") and isinstance(value, str):
            allowed[_normalize_sql(value)] = value

    for bundle_name in ("KPI_SQL", "SAVED_QUERIES"):
        bundle = getattr(query_catalog, bundle_name, {})
        if isinstance(bundle, dict):
            for sql in bundle.values():
                if isinstance(sql, str):
                    allowed[_normalize_sql(sql)] = sql

    return allowed


def _resolve_allowed_sql(sql: str) -> str:
    normalized = _normalize_sql(sql)
    lookup = _allowed_sql_lookup()
    if normalized in lookup:
        return lookup[normalized]
    raise ValueError(
        "Query blocked by security policy. Only approved read-only SQL templates are allowed."
    )


@st.cache_data(ttl=300)
def run_query(sql: str, params: dict[str, Any] | None = None) -> pd.DataFrame:
    """Execute a SQL query with 5-minute caching for near-live dashboard responsiveness."""
    try:
        safe_sql = _resolve_allowed_sql(sql)
        with get_engine().connect() as conn:
            # lgtm[py/sql-injection] safe_sql is resolved from a static allowlist in _resolve_allowed_sql
            return pd.read_sql(text(safe_sql), conn, params=params)
    except Exception as exc:  # pragma: no cover - UI fallback path
        st.error(f"Database query failed: {exc}")
        return pd.DataFrame()


@st.cache_data(ttl=300)
def run_query_with_timing(sql: str, params: dict[str, Any] | None = None) -> tuple[pd.DataFrame, float]:
    start = time.perf_counter()
    df = run_query(sql, params=params)
    elapsed_ms = (time.perf_counter() - start) * 1000
    return df, elapsed_ms
