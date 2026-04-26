from __future__ import annotations

KPI_SQL = {
    "gross_revenue": "SELECT ROUND(COALESCE(SUM(total_amount), 0)::numeric, 2) AS value FROM orders",
    "order_count": "SELECT COUNT(*) AS value FROM orders",
    "avg_order_value": "SELECT ROUND(COALESCE(AVG(total_amount), 0)::numeric, 2) AS value FROM orders",
    "total_customers": "SELECT COUNT(*) AS value FROM customers",
    "delivered_rate": """
        SELECT ROUND(
            100.0 * COALESCE(SUM(CASE WHEN status='delivered' THEN 1 ELSE 0 END), 0) / NULLIF(COUNT(*), 0),
            1
        ) AS value
        FROM orders
    """,
    "purchasing_rate": """
        SELECT ROUND(
            100.0 * COUNT(DISTINCT o.customer_id) / NULLIF((SELECT COUNT(*) FROM customers), 0),
            1
        ) AS value
        FROM orders o
    """,
    "last_txn": "SELECT MAX(order_date) AS value FROM orders",
}

CATEGORY_REVENUE_SQL = """
SELECT c.name AS category,
       ROUND(SUM(oi.quantity * oi.unit_price)::numeric, 2) AS revenue
FROM order_items oi
JOIN products p ON p.id = oi.product_id
JOIN categories c ON c.id = p.category_id
GROUP BY c.name
ORDER BY revenue DESC
"""

CHANNEL_SQL = """
SELECT COALESCE(sales_channel, 'unknown') AS channel,
       COUNT(*) AS orders,
       ROUND(SUM(total_amount)::numeric, 2) AS revenue
FROM orders
GROUP BY 1
ORDER BY revenue DESC
"""

FUNNEL_SQL = """
SELECT status,
       COUNT(*) AS count,
       ROUND(SUM(total_amount)::numeric, 2) AS revenue
FROM orders
GROUP BY status
ORDER BY CASE status
  WHEN 'pending' THEN 1
  WHEN 'confirmed' THEN 2
  WHEN 'shipped' THEN 3
  WHEN 'delivered' THEN 4
  WHEN 'cancelled' THEN 5
  ELSE 6
END
"""

TOP_PRODUCTS_SQL = """
SELECT p.name,
       p.sku,
       SUM(oi.quantity) AS units_sold,
       ROUND(SUM(oi.quantity * oi.unit_price)::numeric, 2) AS revenue,
       p.stock_quantity
FROM order_items oi
JOIN products p ON p.id = oi.product_id
GROUP BY p.id, p.name, p.sku, p.stock_quantity
ORDER BY revenue DESC
LIMIT 5
"""

DAILY_REVENUE_SQL = """
SELECT DATE(order_date AT TIME ZONE 'Asia/Kolkata') AS day,
       COUNT(*) AS orders,
       ROUND(SUM(total_amount)::numeric, 2) AS revenue,
       ROUND(AVG(total_amount)::numeric, 2) AS aov
FROM orders
WHERE order_date >= NOW() - INTERVAL '90 days'
GROUP BY 1
ORDER BY 1
"""

PRODUCT_TREEMAP_SQL = """
SELECT c.name AS category,
       p.name AS product,
       ROUND(SUM(oi.quantity * oi.unit_price)::numeric, 2) AS revenue,
       SUM(oi.quantity) AS units_sold
FROM order_items oi
JOIN products p ON p.id = oi.product_id
JOIN categories c ON c.id = p.category_id
GROUP BY c.name, p.name
"""

AOV_CHANNEL_SQL = """
SELECT sales_channel,
       total_amount
FROM orders
WHERE sales_channel IS NOT NULL
"""

PARETO_SQL = """
SELECT p.name,
       ROUND(SUM(oi.quantity * oi.unit_price)::numeric, 2) AS revenue
FROM order_items oi
JOIN products p ON p.id = oi.product_id
GROUP BY p.name
ORDER BY revenue DESC
"""

MOM_SQL = """
SELECT
  DATE_TRUNC('month', order_date AT TIME ZONE 'Asia/Kolkata') AS month_start,
  TO_CHAR(DATE_TRUNC('month', order_date AT TIME ZONE 'Asia/Kolkata'), 'Mon YYYY') AS month,
  COUNT(*) AS orders,
  ROUND(SUM(total_amount)::numeric, 2) AS revenue
FROM orders
GROUP BY DATE_TRUNC('month', order_date AT TIME ZONE 'Asia/Kolkata')
ORDER BY DATE_TRUNC('month', order_date AT TIME ZONE 'Asia/Kolkata')
"""

CLV_TIER_SQL = """
WITH customer_stats AS (
  SELECT c.id,
         c.name,
         c.country,
         COUNT(o.id) AS frequency,
         ROUND(SUM(o.total_amount)::numeric, 2) AS monetary,
         ROUND(AVG(o.total_amount)::numeric, 2) AS avg_order_value
  FROM customers c
  JOIN orders o ON o.customer_id = c.id
  GROUP BY c.id, c.name, c.country
),
percentiles AS (
  SELECT PERCENTILE_CONT(0.33) WITHIN GROUP (ORDER BY monetary) AS p33,
         PERCENTILE_CONT(0.66) WITHIN GROUP (ORDER BY monetary) AS p66
  FROM customer_stats
)
SELECT CASE WHEN cs.monetary >= p.p66 THEN 'Gold'
            WHEN cs.monetary >= p.p33 THEN 'Silver'
            ELSE 'Bronze' END AS tier,
       COUNT(*) AS customers,
       ROUND(SUM(cs.monetary)::numeric, 2) AS total_clv,
       ROUND(AVG(cs.monetary)::numeric, 2) AS avg_clv,
       ROUND(AVG(cs.frequency)::numeric, 1) AS avg_orders,
       ROUND(AVG(cs.avg_order_value)::numeric, 2) AS avg_order_value
FROM customer_stats cs, percentiles p
GROUP BY 1
ORDER BY avg_clv DESC
"""

CUSTOMER_CLV_SQL = """
SELECT c.id,
       c.name,
       c.email,
       c.country,
       COUNT(o.id) AS frequency,
       ROUND(SUM(o.total_amount)::numeric, 2) AS clv,
       ROUND(AVG(o.total_amount)::numeric, 2) AS avg_order_value
FROM customers c
JOIN orders o ON o.customer_id = c.id
GROUP BY c.id, c.name, c.email, c.country
"""

GEO_SQL = """
SELECT c.country,
       COUNT(DISTINCT c.id) AS customers,
       COUNT(o.id) AS orders,
       ROUND(SUM(o.total_amount)::numeric, 2) AS revenue
FROM customers c
JOIN orders o ON o.customer_id = c.id
GROUP BY c.country
ORDER BY revenue DESC
"""

TOP_CUSTOMERS_SQL = """
SELECT c.name,
       c.email,
       c.country,
       COUNT(o.id) AS total_orders,
       ROUND(SUM(o.total_amount)::numeric, 2) AS lifetime_value,
       ROUND(AVG(o.total_amount)::numeric, 2) AS avg_order_value,
       MAX(o.order_date)::date AS last_purchase
FROM customers c
JOIN orders o ON o.customer_id = c.id
GROUP BY c.id, c.name, c.email, c.country
ORDER BY lifetime_value DESC
LIMIT 10
"""

PRODUCT_MATRIX_SQL = """
SELECT p.name,
       p.sku,
       c.name AS category,
       p.price,
       p.stock_quantity,
       COUNT(DISTINCT oi.order_id) AS orders,
       COALESCE(SUM(oi.quantity), 0) AS units_sold,
       ROUND(COALESCE(SUM(oi.quantity * oi.unit_price), 0)::numeric, 2) AS revenue
FROM products p
LEFT JOIN categories c ON c.id = p.category_id
LEFT JOIN order_items oi ON oi.product_id = p.id
GROUP BY p.id, p.name, p.sku, c.name, p.price, p.stock_quantity
"""

CHANNEL_RADAR_SQL = """
SELECT sales_channel,
       COUNT(*) AS orders,
       ROUND(AVG(total_amount)::numeric, 2) AS avg_order_value,
       ROUND(SUM(total_amount)::numeric, 2) AS total_revenue,
       ROUND(100.0 * SUM(CASE WHEN status='delivered' THEN 1 ELSE 0 END) / COUNT(*), 1) AS delivery_rate,
       ROUND(100.0 * SUM(CASE WHEN status='cancelled' THEN 1 ELSE 0 END) / COUNT(*), 1) AS cancel_rate
FROM orders
WHERE sales_channel IS NOT NULL
GROUP BY sales_channel
"""

ORDER_DIST_SQL = "SELECT total_amount, sales_channel FROM orders"

DAILY_ORDERS_SQL = """
SELECT DATE(order_date AT TIME ZONE 'Asia/Kolkata') AS day,
       COUNT(*) AS orders,
       ROUND(SUM(total_amount)::numeric, 2) AS revenue
FROM orders
GROUP BY 1
"""

CANCEL_SQL = """
SELECT sales_channel,
       ROUND(100.0 * SUM(CASE WHEN status='cancelled' THEN 1 ELSE 0 END) / COUNT(*), 1) AS cancel_rate,
       ROUND(SUM(CASE WHEN status='cancelled' THEN total_amount ELSE 0 END)::numeric, 2) AS cancelled_revenue
FROM orders
GROUP BY sales_channel
ORDER BY cancel_rate DESC
"""

SAVED_QUERIES = {
    "Revenue by Category": "SELECT c.name, ROUND(SUM(oi.quantity * oi.unit_price)::numeric,2) AS revenue FROM order_items oi JOIN products p ON p.id=oi.product_id JOIN categories c ON c.id=p.category_id GROUP BY c.name ORDER BY revenue DESC",
    "Customer CLV Ranking": "SELECT c.name, c.country, COUNT(o.id) AS orders, ROUND(SUM(o.total_amount)::numeric,2) AS clv FROM customers c JOIN orders o ON o.customer_id=c.id GROUP BY c.id, c.name, c.country ORDER BY clv DESC",
    "Inventory Risk": "SELECT p.sku, p.name, p.stock_quantity, CASE WHEN p.stock_quantity<=3 THEN 'Critical' WHEN p.stock_quantity<=7 THEN 'Low' ELSE 'Healthy' END AS status FROM products ORDER BY stock_quantity ASC",
    "Order Funnel": "SELECT status, COUNT(*) AS orders, ROUND(SUM(total_amount)::numeric,2) AS revenue FROM orders GROUP BY status ORDER BY CASE status WHEN 'pending' THEN 1 WHEN 'confirmed' THEN 2 WHEN 'shipped' THEN 3 WHEN 'delivered' THEN 4 WHEN 'cancelled' THEN 5 END",
    "Top Products": "SELECT p.name, p.sku, SUM(oi.quantity) AS units, ROUND(SUM(oi.quantity*oi.unit_price)::numeric,2) AS revenue FROM order_items oi JOIN products p ON p.id=oi.product_id GROUP BY p.id, p.name, p.sku ORDER BY revenue DESC",
}
