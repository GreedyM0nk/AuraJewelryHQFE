# Aura Jewellery Investor Relations Dashboard

Executive-grade Streamlit analytics portal connected to the live Neon PostgreSQL database used by Aura Jewellery HQ.

## Features

- 6-page analytics app:
  - Executive Summary
  - Revenue Intelligence
  - Customer Analytics
  - Product and Inventory
  - Order Operations
  - Data Explorer
- Live SQL-backed visualizations (Plotly)
- 5-minute data cache (`st.cache_data(ttl=300)`)
- Dark luxury UI theme
- SQL Data Explorer with CSV download
- Email masking in displayed analyst tables

## Project Structure

```text
aura-dashboard/
├── .streamlit/
│   ├── config.toml
│   └── secrets.toml            # local-only (gitignored)
├── app.py
├── pages/
│   ├── page_01_executive.py
│   ├── page_02_revenue.py
│   ├── page_03_customers.py
│   ├── page_04_products.py
│   ├── page_05_operations.py
│   └── page_06_explorer.py
├── utils/
│   ├── db.py
│   ├── queries.py
│   └── styling.py
└── requirements.txt
```

## Local Run

```bash
cd aura-dashboard
python3 -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
# set DATABASE_URL in .streamlit/secrets.toml
streamlit run app.py
```

## Deployment

### Local

```bash
pip install -r requirements.txt
# Add DATABASE_URL to .streamlit/secrets.toml
streamlit run app.py
```

### Streamlit Community Cloud

1. Push repo to GitHub (ensure `secrets.toml` is in `.gitignore`)
2. Go to `share.streamlit.io` and create a new app from this repository
3. Add `DATABASE_URL` in App Settings -> Secrets
4. Deploy (public URL is typically live in 1-2 minutes)
