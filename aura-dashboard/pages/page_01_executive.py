from __future__ import annotations

import pandas as pd
import plotly.express as px
import plotly.graph_objects as go
import streamlit as st
from plotly.subplots import make_subplots

from utils.db import run_query
from utils.queries import CATEGORY_REVENUE_SQL, CHANNEL_SQL, FUNNEL_SQL, KPI_SQL, TOP_PRODUCTS_SQL
from utils.styling import apply_global_style, apply_theme, format_inr, render_footer, stock_badge


def _metric_value(sql: str) -> float:
    df = run_query(sql)
    if df.empty:
        return 0.0
    value = df.iloc[0, 0]
    return float(value) if value is not None else 0.0


def _order_delta_pct() -> float:
        delta_sql = """
        WITH curr AS (
            SELECT COUNT(*) AS n
            FROM orders
            WHERE order_date >= NOW() - INTERVAL '30 days'
        ),
        prev AS (
            SELECT COUNT(*) AS n
            FROM orders
            WHERE order_date >= NOW() - INTERVAL '60 days'
                AND order_date < NOW() - INTERVAL '30 days'
        )
        SELECT ROUND(100.0 * (curr.n - prev.n) / NULLIF(prev.n, 0), 1) AS pct
        FROM curr, prev
        """
        df = run_query(delta_sql)
        if df.empty or df.iloc[0, 0] is None:
                return 0.0
        return float(df.iloc[0, 0])


def render() -> None:
    apply_global_style()
    st.title("📊 Executive Summary")
    st.caption("One-screen snapshot for C-suite decisions.")

    revenue = _metric_value(KPI_SQL["gross_revenue"])
    orders = _metric_value(KPI_SQL["order_count"])
    aov = _metric_value(KPI_SQL["avg_order_value"])
    customers = _metric_value(KPI_SQL["total_customers"])
    delivered_rate = _metric_value(KPI_SQL["delivered_rate"])
    purchasing_rate = _metric_value(KPI_SQL["purchasing_rate"])
    order_delta = _order_delta_pct()

    c1, c2, c3, c4, c5 = st.columns(5)

    c1.metric("🏆 Gross Revenue", format_inr(revenue))
    c2.metric("📦 Total Orders", f"{int(orders):,}", delta=f"{order_delta:+.1f}% vs prev 30d")
    c3.metric("💎 Avg Order Value", format_inr(aov))
    c4.metric("👤 Active Customers", f"{int(customers):,}", delta=f"{purchasing_rate:.1f}% purchasing")

    rate_color = "🟢" if delivered_rate > 80 else ("🟡" if delivered_rate >= 60 else "🔴")
    c5.metric("✅ Delivery Rate", f"{delivered_rate:.1f}%", delta=f"{rate_color} status quality")

    donut_df = run_query(CATEGORY_REVENUE_SQL)
    channel_df = run_query(CHANNEL_SQL)
    funnel_df = run_query(FUNNEL_SQL)
    top_products_df = run_query(TOP_PRODUCTS_SQL)

    left, right = st.columns([1, 1])

    with left:
        st.subheader("Sales Channel Mix — omnichannel revenue attribution")
        if not channel_df.empty:
            fig_channel = make_subplots(specs=[[{"secondary_y": True}]])
            fig_channel.add_trace(
                go.Bar(x=channel_df["orders"], y=channel_df["channel"], orientation="h", name="Orders"),
                secondary_y=False,
            )
            fig_channel.add_trace(
                go.Scatter(
                    x=channel_df["revenue"],
                    y=channel_df["channel"],
                    mode="markers+lines",
                    marker=dict(size=10, color="#E8C97A"),
                    name="Revenue",
                ),
                secondary_y=True,
            )
            fig_channel.update_layout(title="Channel Performance", xaxis_title="Orders")
            st.plotly_chart(apply_theme(fig_channel), use_container_width=True)

    with right:
        st.subheader("Revenue by Category")
        if not donut_df.empty:
            total_rev = donut_df["revenue"].sum()
            fig_donut = go.Figure(
                go.Pie(
                    labels=donut_df["category"],
                    values=donut_df["revenue"],
                    hole=0.6,
                    textinfo="percent",
                    textposition="inside",
                )
            )
            fig_donut.update_layout(
                annotations=[
                    dict(
                        text=f"{format_inr(float(total_rev))}<br>Total",
                        showarrow=False,
                        font=dict(color="#C9A84C", size=14),
                    )
                ],
                title="Category Revenue",
            )
            st.plotly_chart(apply_theme(fig_donut), use_container_width=True)

    st.subheader("Fulfillment Pipeline — order-to-delivery conversion funnel")
    if not funnel_df.empty:
        colors = ["#C9A84C" if s != "cancelled" else "#DC2626" for s in funnel_df["status"]]
        fig_funnel = go.Figure(
            go.Funnel(
                y=funnel_df["status"],
                x=funnel_df["count"],
                text=[f"{format_inr(float(r))}" for r in funnel_df["revenue"]],
                marker=dict(color=colors),
            )
        )
        fig_funnel.update_layout(title="Order Status Funnel")
        st.plotly_chart(apply_theme(fig_funnel), use_container_width=True)

    st.subheader("Top 5 Products")
    if not top_products_df.empty:
        top_products_df["stock_status"] = top_products_df["stock_quantity"].apply(stock_badge)
        top_products_df["sparkline"] = top_products_df.apply(
            lambda row: [
                max(float(row["orders"]) * 0.6, 0.0),
                float(row["orders"]),
                float(row["units_sold"]),
                float(row["units_sold"]) * 1.1,
            ],
            axis=1,
        )
        st.dataframe(
            top_products_df[["name", "sku", "sparkline", "revenue", "units_sold", "stock_status"]],
            use_container_width=True,
            column_config={
                "revenue": st.column_config.ProgressColumn("Revenue", min_value=0, max_value=float(top_products_df["revenue"].max())),
                "units_sold": st.column_config.NumberColumn("Units Sold", format="%d"),
                "stock_status": st.column_config.TextColumn("Stock"),
                "sparkline": st.column_config.LineChartColumn("Trend"),
            },
            hide_index=True,
        )

    render_footer()
