from __future__ import annotations

import streamlit as st

DASHBOARD_CSS = """
<style>
  .stApp { background-color: #0A0A0A; color: #F5F0E8; }
  section[data-testid="stSidebar"] { background-color: #141414; border-right: 1px solid rgba(201,168,76,0.2); }

  [data-testid="stMetric"] {
    background: rgba(201,168,76,0.06);
    border: 1px solid rgba(201,168,76,0.2);
    border-radius: 4px;
    padding: 1rem;
  }
  [data-testid="stMetricLabel"] {
    font-family: Georgia, serif;
    letter-spacing: 0.08em;
    color: rgba(245,240,232,0.6);
    font-size: 0.7rem;
    text-transform: uppercase;
  }
  [data-testid="stMetricValue"] { color: #C9A84C; font-size: 1.8rem; font-weight: 600; }

  h2 {
    font-family: Georgia, serif;
    color: #C9A84C;
    letter-spacing: 0.06em;
    border-bottom: 1px solid rgba(201,168,76,0.2);
    padding-bottom: 0.5rem;
  }
  h3 {
    color: rgba(245,240,232,0.8);
    font-size: 0.85rem;
    letter-spacing: 0.12em;
    text-transform: uppercase;
  }

  .stDataFrame { border: 1px solid rgba(201,168,76,0.15); }
  hr { border-color: rgba(201,168,76,0.2); }

  .sidebar-footer {
    position: fixed;
    bottom: 1rem;
    font-size: 0.65rem;
    color: rgba(201,168,76,0.4);
    font-family: Georgia, serif;
    letter-spacing: 0.2em;
    text-transform: uppercase;
  }
</style>
"""

PLOTLY_LAYOUT = {
    "plot_bgcolor": "#141414",
    "paper_bgcolor": "#0A0A0A",
    "font": {"color": "#F5F0E8", "family": "Georgia, serif"},
    "title": {"font": {"color": "#C9A84C", "size": 16, "family": "Georgia, serif"}},
    "xaxis": {"gridcolor": "rgba(201,168,76,0.1)", "linecolor": "rgba(201,168,76,0.2)"},
    "yaxis": {"gridcolor": "rgba(201,168,76,0.1)", "linecolor": "rgba(201,168,76,0.2)"},
    "legend": {
        "bgcolor": "rgba(20,20,20,0.8)",
        "bordercolor": "rgba(201,168,76,0.2)",
        "borderwidth": 1,
    },
    "colorway": ["#C9A84C", "#E8C97A", "#8B6914", "#F5F0E8", "#666660", "#A0896A"],
}


def apply_theme(fig):
    fig.update_layout(**PLOTLY_LAYOUT)
    return fig


def apply_global_style() -> None:
    st.markdown(DASHBOARD_CSS, unsafe_allow_html=True)


def format_inr(amount: float) -> str:
    """Format number in Indian numbering system (lakhs, crores)."""
    if amount >= 10_000_000:
        return f"₹{amount / 10_000_000:.1f}Cr"
    if amount >= 100_000:
        return f"₹{amount / 100_000:.1f}L"
    if amount >= 1000:
        return f"₹{amount / 1000:.1f}K"
    return f"₹{amount:,.0f}"


def stock_badge(qty: int) -> str:
    if qty <= 3:
        return "🔴 Critical"
    if qty <= 7:
        return "🟡 Low"
    return "🟢 Healthy"


def tier_badge(tier: str) -> str:
    return {"Gold": "🥇 Gold", "Silver": "🥈 Silver", "Bronze": "🥉 Bronze"}.get(tier, tier)


def mask_email(email: str) -> str:
    if not isinstance(email, str) or "@" not in email:
        return "***"
    local, domain = email.split("@", 1)
    prefix = local[:1] if local else "*"
    return f"{prefix}***@{domain}"


def render_footer() -> None:
    st.divider()
    st.markdown(
        """
<div style='text-align:center; color:rgba(201,168,76,0.4); font-size:0.7rem; letter-spacing:0.15em; font-family:Georgia,serif;'>
  AURA JEWELLERY HQ · INVESTOR RELATIONS PORTAL · LIVE DATA · CONFIDENTIAL
  <br/>Data sourced directly from Neon PostgreSQL production database · Refresh every 5 minutes
</div>
""",
        unsafe_allow_html=True,
    )
