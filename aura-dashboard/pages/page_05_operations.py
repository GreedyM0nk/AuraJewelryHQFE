from __future__ import annotations

import numpy as np
import pandas as pd
import plotly.express as px
import plotly.graph_objects as go
import streamlit as st
from plotly.subplots import make_subplots
from scipy.stats import gaussian_kde

from utils.db import run_query
from utils.queries import CANCEL_SQL, CHANNEL_RADAR_SQL, DAILY_ORDERS_SQL, FUNNEL_SQL, ORDER_DIST_SQL
from utils.styling import apply_global_style, apply_theme, format_inr, render_footer


STATUS_ORDER = ["pending", "confirmed", "shipped", "delivered", "cancelled"]


def render() -> None:
    apply_global_style()
    st.title("🔄 Order Operations")

    st.subheader("Order Fulfillment Flow — End-to-End Pipeline")
    funnel_df = run_query(FUNNEL_SQL)
    if not funnel_df.empty:
        counts = {row["status"]: int(row["count"]) for _, row in funnel_df.iterrows()}
        total_orders = int(sum(counts.values()))
        links = [
            ("placed", "confirmed", min(total_orders, counts.get("confirmed", 0))),
            ("confirmed", "shipped", min(counts.get("confirmed", 0), counts.get("shipped", 0))),
            ("shipped", "delivered", min(counts.get("shipped", 0), counts.get("delivered", 0))),
            ("confirmed", "cancelled", counts.get("cancelled", 0)),
        ]
        nodes = ["placed", "confirmed", "shipped", "delivered", "cancelled"]
        idx = {n: i for i, n in enumerate(nodes)}
        sankey = go.Figure(
            go.Sankey(
                node=dict(label=nodes, color=["#C9A84C", "#C9A84C", "#C9A84C", "#E8C97A", "#DC2626"]),
                link=dict(
                    source=[idx[s] for s, _, _ in links],
                    target=[idx[t] for _, t, _ in links],
                    value=[v for _, _, v in links],
                    color=["rgba(201,168,76,0.6)", "rgba(201,168,76,0.6)", "rgba(201,168,76,0.6)", "rgba(220,38,38,0.7)"],
                ),
            )
        )
        st.plotly_chart(apply_theme(sankey), use_container_width=True)

    st.subheader("Channel Performance Comparison")
    radar_df = run_query(CHANNEL_RADAR_SQL)
    if not radar_df.empty:
        metrics = ["orders", "avg_order_value", "total_revenue", "delivery_rate", "cancel_rate"]
        norm = radar_df.copy()
        for m in metrics:
            max_v = max(float(norm[m].max()), 1.0)
            norm[m] = (norm[m] / max_v) * 100
        norm["cancel_rate"] = 100 - norm["cancel_rate"]

        fig_radar = go.Figure()
        for _, row in norm.iterrows():
            fig_radar.add_trace(
                go.Scatterpolar(
                    r=[row[m] for m in metrics],
                    theta=["Order Volume", "Avg Order Value", "Revenue Share", "Delivery Rate", "Low Cancellation"],
                    fill="toself",
                    name=row["sales_channel"],
                )
            )
        fig_radar.update_layout(polar=dict(radialaxis=dict(visible=True, range=[0, 100])))
        st.plotly_chart(apply_theme(fig_radar), use_container_width=True)

    st.subheader("Order Value Distribution")
    dist_df = run_query(ORDER_DIST_SQL)
    if not dist_df.empty:
        dist_df = dist_df.dropna(subset=["sales_channel", "total_amount"]).copy()
        channels = sorted(dist_df["sales_channel"].astype(str).unique().tolist())
        fig_hist = make_subplots(rows=1, cols=max(len(channels), 1), subplot_titles=channels)
        for idx, channel in enumerate(channels, start=1):
            channel_vals = dist_df.loc[dist_df["sales_channel"] == channel, "total_amount"].astype(float).to_numpy()
            fig_hist.add_trace(
                go.Histogram(x=channel_vals, nbinsx=20, name=f"{channel} hist", marker_color="#8B6914", opacity=0.65, showlegend=False),
                row=1,
                col=idx,
            )
            if len(channel_vals) > 1:
                x_grid = np.linspace(channel_vals.min(), channel_vals.max(), 200)
                kde = gaussian_kde(channel_vals)
                y_kde = kde(x_grid)
                max_hist = np.histogram(channel_vals, bins=20)[0].max()
                if y_kde.max() > 0:
                    y_kde = y_kde / y_kde.max() * max_hist
                fig_hist.add_trace(
                    go.Scatter(x=x_grid, y=y_kde, mode="lines", name=f"{channel} KDE", line=dict(color="#C9A84C", width=2), showlegend=False),
                    row=1,
                    col=idx,
                )
        fig_hist.update_layout(barmode="overlay")
        st.plotly_chart(apply_theme(fig_hist), use_container_width=True)

    st.subheader("Daily Order Volume — Calendar Heatmap")
    daily_df = run_query(DAILY_ORDERS_SQL)
    if not daily_df.empty:
        daily_df["day"] = pd.to_datetime(daily_df["day"])
        daily_df["day_of_week"] = daily_df["day"].dt.dayofweek
        daily_df["week"] = daily_df["day"].dt.isocalendar().week.astype(int)
        pivot = daily_df.pivot(index="day_of_week", columns="week", values="orders").fillna(0)
        heat = go.Figure(go.Heatmap(z=pivot.values, x=pivot.columns, y=["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"], colorscale=[[0, "#141414"], [1, "#C9A84C"]]))
        st.plotly_chart(apply_theme(heat), use_container_width=True)

    st.subheader("Cancellation Analysis")
    cancel_df = run_query(CANCEL_SQL)
    if not cancel_df.empty:
        st.dataframe(cancel_df, use_container_width=True, hide_index=True)

    pending_df = run_query("SELECT ROUND(COALESCE(SUM(total_amount),0)::numeric,2) AS pending_value FROM orders WHERE status='pending'")
    pending_value = float(pending_df.iloc[0, 0]) if not pending_df.empty else 0.0
    st.metric("Revenue at risk from pending orders", format_inr(pending_value))

    render_footer()
