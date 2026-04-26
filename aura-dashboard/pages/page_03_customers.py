from __future__ import annotations

import numpy as np
import pandas as pd
import plotly.express as px
import plotly.graph_objects as go
import streamlit as st

from utils.db import run_query
from utils.queries import CLV_TIER_SQL, CUSTOMER_CLV_SQL, GEO_SQL, TOP_CUSTOMERS_SQL
from utils.styling import apply_global_style, apply_theme, format_inr, mask_email, render_footer, tier_badge

TIER_COLORS = {"Gold": "#C9A84C", "Silver": "#C0C0C0", "Bronze": "#CD7F32"}


def _assign_tier(clv: float, p33: float, p66: float) -> str:
    if clv >= p66:
        return "Gold"
    if clv >= p33:
        return "Silver"
    return "Bronze"


def render() -> None:
    apply_global_style()
    st.title("👥 Customer Analytics")
    st.markdown("### Customer Lifetime Value (CLV) — net present value of the customer relationship")

    tier_df = run_query(CLV_TIER_SQL)
    if not tier_df.empty:
        cols = st.columns(3)
        total_clv = tier_df["total_clv"].sum()
        for i, tier in enumerate(["Gold", "Silver", "Bronze"]):
            row = tier_df[tier_df["tier"] == tier]
            with cols[i]:
                if not row.empty:
                    r = row.iloc[0]
                    card_style = {
                        "Gold": ("rgba(201,168,76,0.15)", "#C9A84C"),
                        "Silver": ("rgba(192,192,192,0.10)", "#C0C0C0"),
                        "Bronze": ("rgba(205,127,50,0.10)", "#CD7F32"),
                    }
                    bg, border = card_style[tier]
                    st.markdown(
                        f"""
                        <div style='background:{bg}; border:1px solid {border}; border-radius:10px; padding:14px;'>
                          <div style='font-size:1rem; color:{border};'>{tier_badge(tier)}</div>
                          <div style='font-size:1.8rem; color:#F5F0E8; font-weight:600;'>{format_inr(float(r['avg_clv']))}</div>
                          <div style='font-size:0.85rem; color:rgba(245,240,232,0.8);'>Customers: {int(r['customers'])}</div>
                          <div style='font-size:0.85rem; color:rgba(245,240,232,0.8);'>Avg Orders: {r['avg_orders']}</div>
                          <div style='font-size:0.85rem; color:rgba(245,240,232,0.8);'>Avg AOV: {format_inr(float(r['avg_order_value']))}</div>
                        </div>
                        """,
                        unsafe_allow_html=True,
                    )
                else:
                    st.metric(tier_badge(tier), "₹0")

        gold = tier_df[tier_df["tier"] == "Gold"]
        if not gold.empty and total_clv > 0:
            contribution = float(gold.iloc[0]["total_clv"]) / float(total_clv) * 100
            st.caption(f"Gold tier customers contribute {contribution:.1f}% of total revenue.")

    clv_df = run_query(CUSTOMER_CLV_SQL)
    if not clv_df.empty:
        clv_df["email_masked"] = clv_df["email"].apply(mask_email)
        p33, p66 = clv_df["clv"].quantile([0.33, 0.66]).tolist()
        clv_df["tier"] = clv_df["clv"].apply(lambda v: _assign_tier(float(v), float(p33), float(p66)))

        st.subheader("CLV Distribution")
        fig_violin = go.Figure()
        for tier in ["Gold", "Silver", "Bronze"]:
            data = clv_df[clv_df["tier"] == tier]
            fig_violin.add_trace(
                go.Violin(
                    y=data["clv"],
                    name=tier,
                    box_visible=True,
                    meanline_visible=True,
                    points="all",
                    marker_color=TIER_COLORS[tier],
                )
            )
        st.plotly_chart(apply_theme(fig_violin), use_container_width=True)

        st.subheader("RFM Matrix — Recency, Frequency, Monetary Segmentation")
        fig_rfm = px.scatter(
            clv_df,
            x="frequency",
            y="clv",
            size="avg_order_value",
            color="tier",
            color_discrete_map=TIER_COLORS,
            hover_data=["name", "country", "email_masked"],
            title="RFM Segmentation — Frequency vs Monetary",
        )
        median_f = clv_df["frequency"].median()
        median_m = clv_df["clv"].median()
        fig_rfm.add_vline(x=median_f, line_dash="dash")
        fig_rfm.add_hline(y=median_m, line_dash="dash")
        fig_rfm.add_annotation(x=median_f * 1.2, y=median_m * 1.2, text="Champions")
        fig_rfm.add_annotation(x=median_f * 0.7, y=median_m * 1.2, text="Big Spenders")
        fig_rfm.add_annotation(x=median_f * 1.2, y=median_m * 0.7, text="Loyal Regulars")
        fig_rfm.add_annotation(x=median_f * 0.7, y=median_m * 0.7, text="At Risk")
        st.plotly_chart(apply_theme(fig_rfm), use_container_width=True)

    st.subheader("Global Revenue Distribution")
    geo_df = run_query(GEO_SQL)
    if not geo_df.empty:
        geo_df = geo_df.dropna(subset=["country"])
        fig_geo = px.choropleth(
            geo_df,
            locations="country",
            locationmode="country names",
            color="revenue",
            hover_name="country",
            color_continuous_scale=["#141414", "#C9A84C"],
        )
        st.plotly_chart(apply_theme(fig_geo), use_container_width=True)

    st.subheader("Top 10 Customers")
    top_df = run_query(TOP_CUSTOMERS_SQL)
    if not top_df.empty:
        medals = {1: "🥇", 2: "🥈", 3: "🥉"}
        top_df.insert(0, "rank", range(1, len(top_df) + 1))
        top_df["rank"] = top_df["rank"].map(lambda x: f"{medals.get(x, '')} {x}")
        top_df["email"] = top_df["email"].apply(mask_email)
        st.dataframe(
            top_df,
            use_container_width=True,
            hide_index=True,
            column_config={
                "lifetime_value": st.column_config.ProgressColumn("Lifetime Value", min_value=0, max_value=float(top_df["lifetime_value"].max())),
                "total_orders": st.column_config.NumberColumn("Total Orders", format="%d"),
            },
        )

    render_footer()
