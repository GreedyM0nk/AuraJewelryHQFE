from __future__ import annotations

import re

import pandas as pd
import plotly.express as px
import plotly.graph_objects as go
import streamlit as st
from plotly.subplots import make_subplots

from utils.db import run_query
from utils.queries import PRODUCT_MATRIX_SQL
from utils.styling import apply_global_style, apply_theme, render_footer, stock_badge


def render() -> None:
    apply_global_style()
    st.title("📦 Product & Inventory")

    df = run_query(PRODUCT_MATRIX_SQL)
    if df.empty:
        st.warning("No product performance data available.")
        render_footer()
        return

    df["stock_status"] = df["stock_quantity"].apply(lambda x: stock_badge(int(x)))

    st.subheader("Product Performance Matrix")
    fig_matrix = px.scatter(
        df,
        x="units_sold",
        y="revenue",
        size="price",
        color="category",
        text="sku",
        hover_data=["name", "orders", "stock_quantity"],
        title="Product Performance Matrix",
    )
    median_units = df["units_sold"].median()
    median_revenue = df["revenue"].median()
    fig_matrix.add_vline(x=median_units, line_dash="dash")
    fig_matrix.add_hline(y=median_revenue, line_dash="dash")
    fig_matrix.add_annotation(x=median_units * 1.2, y=median_revenue * 1.2, text="Stars ⭐", showarrow=False)
    fig_matrix.add_annotation(x=median_units * 0.7, y=median_revenue * 1.2, text="Premium Niche 💎", showarrow=False)
    fig_matrix.add_annotation(x=median_units * 1.2, y=median_revenue * 0.7, text="Volume Drivers 📦", showarrow=False)
    fig_matrix.add_annotation(x=median_units * 0.7, y=median_revenue * 0.7, text="Review Needed ⚠️", showarrow=False)
    st.plotly_chart(apply_theme(fig_matrix), use_container_width=True)

    st.subheader("Inventory Risk Heatmap")
    row_colors = []
    for status in df["stock_status"]:
        if "Critical" in status:
            row_colors.append("rgba(220,38,38,0.2)")
        elif "Low" in status:
            row_colors.append("rgba(245,158,11,0.2)")
        else:
            row_colors.append("rgba(34,197,94,0.2)")

    fig_table = go.Figure(
        data=[
            go.Table(
                header=dict(values=["SKU", "Product", "Category", "Price", "Stock", "Units Sold", "Revenue", "Status"]),
                cells=dict(
                    values=[
                        df["sku"],
                        df["name"],
                        df["category"],
                        df["price"],
                        df["stock_quantity"],
                        df["units_sold"],
                        df["revenue"],
                        df["stock_status"],
                    ],
                    fill_color=[row_colors],
                ),
            )
        ]
    )
    st.plotly_chart(apply_theme(fig_table), use_container_width=True)

    critical_count = int((df["stock_quantity"] <= 3).sum())
    if critical_count > 0:
        st.warning(f"⚠️ {critical_count} products at critical stock levels. Restock recommended.")

    st.subheader("Category Revenue vs Units")
    cat_df = df.groupby("category", as_index=False).agg(revenue=("revenue", "sum"), units_sold=("units_sold", "sum"))
    fig_dual = make_subplots(specs=[[{"secondary_y": True}]])
    fig_dual.add_trace(go.Bar(x=cat_df["category"], y=cat_df["revenue"], name="Revenue", marker_color="#C9A84C"), secondary_y=False)
    fig_dual.add_trace(go.Scatter(x=cat_df["category"], y=cat_df["units_sold"], name="Units Sold", marker_color="#F5F0E8"), secondary_y=True)
    st.plotly_chart(apply_theme(fig_dual), use_container_width=True)

    st.subheader("Price Sensitivity Analysis — Demand vs. List Price")
    fig_elasticity = px.scatter(df, x="price", y="units_sold", color="category", trendline="ols", trendline_color_override="#C9A84C")
    trend_results = px.get_trendline_results(fig_elasticity)
    if not trend_results.empty:
        model = trend_results.iloc[0]["px_fit_results"]
        summary = str(model.summary())
        match = re.search(r"R-squared:\s+([0-9.]+)", summary)
        if match:
            fig_elasticity.add_annotation(
                xref="paper",
                yref="paper",
                x=0.99,
                y=0.99,
                text=f"R² = {match.group(1)}",
                showarrow=False,
                font=dict(color="#C9A84C"),
            )
    st.plotly_chart(apply_theme(fig_elasticity), use_container_width=True)

    st.subheader("Inventory Velocity — sell-through rate relative to remaining stock")
    df["sell_through"] = (df["units_sold"] / (df["units_sold"] + df["stock_quantity"].replace(0, 1))) * 100
    fig_velocity = px.bar(df.sort_values("sell_through", ascending=False), x="sell_through", y="name", color="stock_status", orientation="h")
    st.plotly_chart(apply_theme(fig_velocity), use_container_width=True)

    render_footer()
