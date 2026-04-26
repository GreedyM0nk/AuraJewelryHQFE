from __future__ import annotations

import streamlit as st

from pages import (
    page_01_executive,
    page_02_revenue,
    page_03_customers,
    page_04_products,
    page_05_operations,
    page_06_explorer,
)
from utils.db import run_query
from utils.queries import KPI_SQL
from utils.styling import apply_global_style

st.set_page_config(
    page_title="Aura Jewellery Investor Relations",
    page_icon="✦",
    layout="wide",
    initial_sidebar_state="expanded",
)

apply_global_style()

PAGE_MAP = {
    "📊 Executive Summary": page_01_executive.render,
    "💰 Revenue Intelligence": page_02_revenue.render,
    "👥 Customer Analytics": page_03_customers.render,
    "📦 Product & Inventory": page_04_products.render,
    "🔄 Order Operations": page_05_operations.render,
    "⚙️ Data Explorer": page_06_explorer.render,
}

with st.sidebar:
    st.markdown("### ✦ AURA JEWELLERY")
    st.markdown("*Investor Relations Portal*")
    st.divider()

    st.markdown("🟢 **Live Database Connected**")
    last_order_df = run_query(KPI_SQL["last_txn"])
    if not last_order_df.empty and last_order_df.iloc[0, 0] is not None:
        st.caption(f"Last transaction: {last_order_df.iloc[0, 0]}")
    else:
        st.caption("Last transaction: unavailable")
    st.divider()

    page = st.radio("Navigate", list(PAGE_MAP.keys()), label_visibility="collapsed")
    st.divider()

    if st.button("🔄 Refresh Data", use_container_width=True):
        st.cache_data.clear()
        st.rerun()

    st.markdown(
        '<div class="sidebar-footer">© Aura Jewellery HQ · Analytics</div>',
        unsafe_allow_html=True,
    )

PAGE_MAP[page]()
