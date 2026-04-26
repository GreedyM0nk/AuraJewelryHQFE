from __future__ import annotations

import numpy as np
import pandas as pd
import plotly.express as px
import plotly.graph_objects as go
import streamlit as st
from plotly.subplots import make_subplots

from utils.db import run_query
from utils.queries import AOV_CHANNEL_SQL, DAILY_REVENUE_SQL, MOM_SQL, PARETO_SQL, PRODUCT_TREEMAP_SQL
from utils.styling import apply_global_style, apply_theme, format_inr, render_footer


def render() -> None:
    apply_global_style()
    st.title("💰 Revenue Intelligence")

    daily_df = run_query(DAILY_REVENUE_SQL)
    st.subheader("Revenue Over Time")
    if not daily_df.empty:
        daily_df["day"] = pd.to_datetime(daily_df["day"])
        daily_df = daily_df.sort_values("day")
        daily_df["revenue_7d_ma"] = daily_df["revenue"].rolling(7, min_periods=1).mean()

        window = st.segmented_control("Window", ["1W", "1M", "3M", "All"], default="3M")
        if window == "1W":
            daily_df = daily_df.tail(7)
        elif window == "1M":
            daily_df = daily_df.tail(30)
        elif window == "3M":
            daily_df = daily_df.tail(90)

        fig = make_subplots(specs=[[{"secondary_y": True}]])
        fig.add_trace(go.Scatter(x=daily_df["day"], y=daily_df["revenue"], fill="tozeroy", name="Revenue"), secondary_y=False)
        fig.add_trace(go.Scatter(x=daily_df["day"], y=daily_df["aov"], mode="lines", name="AOV"), secondary_y=True)
        fig.add_trace(go.Scatter(x=daily_df["day"], y=daily_df["revenue_7d_ma"], mode="lines", name="7D MA", line=dict(dash="dash")), secondary_y=False)
        fig.update_layout(title="Revenue and AOV Trend")
        st.plotly_chart(apply_theme(fig), use_container_width=True)

    st.subheader("Revenue by Product — Treemap")
    tree_df = run_query(PRODUCT_TREEMAP_SQL)
    if not tree_df.empty:
        fig_tree = px.treemap(
            tree_df,
            path=["category", "product"],
            values="revenue",
            color="units_sold",
            color_continuous_scale=["#141414", "#C9A84C", "#F5F0E8"],
        )
        st.plotly_chart(apply_theme(fig_tree), use_container_width=True)

    st.subheader("Average Order Value by Channel")
    aov_df = run_query(AOV_CHANNEL_SQL)
    if not aov_df.empty:
        fig_box = px.box(aov_df, x="sales_channel", y="total_amount", points="all", color="sales_channel")
        fig_box.add_hline(y=float(aov_df["total_amount"].mean()), line_dash="dot", annotation_text="Mean")
        st.plotly_chart(apply_theme(fig_box), use_container_width=True)

    st.subheader("Pareto Analysis — identifying the 20% of products driving 80% of revenue")
    pareto_df = run_query(PARETO_SQL)
    if not pareto_df.empty:
        pareto_df["cum_revenue_pct"] = pareto_df["revenue"].cumsum() / pareto_df["revenue"].sum() * 100
        cutoff_rows = pareto_df[pareto_df["cum_revenue_pct"] >= 80]
        cutoff_product = cutoff_rows.iloc[0]["name"] if not cutoff_rows.empty else pareto_df.iloc[-1]["name"]
        cutoff_value = float(cutoff_rows.iloc[0]["cum_revenue_pct"]) if not cutoff_rows.empty else 100.0
        fig_p = make_subplots(specs=[[{"secondary_y": True}]])
        fig_p.add_trace(go.Bar(x=pareto_df["name"], y=pareto_df["revenue"], name="Revenue"), secondary_y=False)
        fig_p.add_trace(go.Scatter(x=pareto_df["name"], y=pareto_df["cum_revenue_pct"], name="Cumulative %", mode="lines+markers"), secondary_y=True)
        fig_p.add_hline(y=80, line_dash="dash", line_color="#DC2626", secondary_y=True)
        fig_p.add_annotation(
            x=cutoff_product,
            y=cutoff_value,
            text=f"80% cutoff: {cutoff_product}",
            showarrow=True,
            arrowcolor="#C9A84C",
            bgcolor="rgba(20,20,20,0.7)",
            bordercolor="#C9A84C",
        )
        fig_p.update_layout(title="Revenue Concentration Risk")
        st.plotly_chart(apply_theme(fig_p), use_container_width=True)

    st.subheader("Month-over-Month Growth")
    mom_df = run_query(MOM_SQL)
    if not mom_df.empty:
        mom_df["mom_growth_pct"] = mom_df["revenue"].pct_change() * 100
        mom_df["cumulative_revenue"] = mom_df["revenue"].cumsum()
        styled = mom_df[["month", "orders", "revenue", "mom_growth_pct", "cumulative_revenue"]].style.map(
            lambda v: "color: #22C55E;" if pd.notna(v) and v > 0 else ("color: #EF4444;" if pd.notna(v) and v < 0 else ""),
            subset=["mom_growth_pct"],
        )
        st.dataframe(
            styled,
            use_container_width=True,
            hide_index=True,
            column_config={
                "revenue": st.column_config.NumberColumn("Revenue", format="₹ %.2f"),
                "mom_growth_pct": st.column_config.NumberColumn("MoM %", format="%.2f%%"),
                "cumulative_revenue": st.column_config.NumberColumn("Cumulative", format="₹ %.2f"),
            },
        )

    render_footer()
