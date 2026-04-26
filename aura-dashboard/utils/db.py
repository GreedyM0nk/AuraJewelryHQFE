from __future__ import annotations

import time
from typing import Any

import pandas as pd
import streamlit as st
from sqlalchemy import create_engine, text
from sqlalchemy.engine import Engine


@st.cache_resource
def get_engine() -> Engine:
    # DATABASE_URL is expected in .streamlit/secrets.toml for local and Streamlit Cloud.
    return create_engine(st.secrets["DATABASE_URL"])


@st.cache_data(ttl=300)
def run_query(sql: str, params: dict[str, Any] | None = None) -> pd.DataFrame:
    """Execute a SQL query with 5-minute caching for near-live dashboard responsiveness."""
    try:
        with get_engine().connect() as conn:
            return pd.read_sql(text(sql), conn, params=params)
    except Exception as exc:  # pragma: no cover - UI fallback path
        st.error(f"Database query failed: {exc}")
        return pd.DataFrame()


@st.cache_data(ttl=300)
def run_query_with_timing(sql: str, params: dict[str, Any] | None = None) -> tuple[pd.DataFrame, float]:
    start = time.perf_counter()
    df = run_query(sql, params=params)
    elapsed_ms = (time.perf_counter() - start) * 1000
    return df, elapsed_ms
