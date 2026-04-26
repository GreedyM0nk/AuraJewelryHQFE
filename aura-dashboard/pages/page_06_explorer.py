from __future__ import annotations

import streamlit as st

from utils.db import run_query_with_timing
from utils.queries import SAVED_QUERIES
from utils.styling import apply_global_style, mask_email, render_footer


def _mask_email_columns(df):
    out = df.copy()
    for col in out.columns:
        if "email" in str(col).lower():
            out[col] = out[col].astype(str).map(mask_email)
    return out


def render() -> None:
    apply_global_style()
    st.title("⚙️ Data Explorer")
    st.caption("Analyst workspace for ad-hoc SQL with CSV export.")

    selected = st.selectbox("Saved Query", options=list(SAVED_QUERIES.keys()))
    sql = st.text_area("SQL", value=SAVED_QUERIES[selected], height=220)

    if st.button("Run Query", type="primary"):
        df, elapsed_ms = run_query_with_timing(sql)
        if df.empty:
            st.info("No rows returned or query failed.")
        else:
            display_df = _mask_email_columns(df)
            st.success(f"Returned {len(df):,} rows in {elapsed_ms:.1f} ms")
            st.dataframe(display_df, use_container_width=True, hide_index=True)
            st.download_button(
                "Download CSV",
                data=display_df.to_csv(index=False).encode("utf-8"),
                file_name="query_results.csv",
                mime="text/csv",
            )

    render_footer()
