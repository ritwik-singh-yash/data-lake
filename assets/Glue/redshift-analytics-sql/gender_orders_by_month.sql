CREATE TABLE gender_orders_by_month AS (
  WITH male_orders AS (
    SELECT DATE_PART('year', cast((orders.order_date) as timestamp)) AS years, 
    DATE_PART('month', cast((orders.order_date) as timestamp)) AS months, 
    COUNT(*) AS male_orders
    FROM orders JOIN customers ON orders.customer_id = customers.customer_id WHERE customers.gender = 'M' 
    GROUP BY years, months
  ),
  female_orders AS (
    SELECT DATE_PART('year', cast((orders.order_date) as timestamp)) AS years, 
    DATE_PART('month', cast((orders.order_date) as timestamp)) AS months, 
    COUNT(*) AS female_orders
    FROM orders JOIN customers ON orders.customer_id = customers.customer_id WHERE customers.gender = 'F' 
    GROUP BY years, months
  ),
  total_orders AS (
    SELECT DATE_PART('year', cast((orders.order_date) as timestamp)) AS years, 
    DATE_PART('month', cast((orders.order_date) as timestamp)) AS months, 
    COUNT(*) AS total_orders
    FROM orders JOIN customers ON orders.customer_id = customers.customer_id 
    GROUP BY years, months
  )
  SELECT
    (male_orders.years || '-' || LPAD(male_orders.months, 2, '0') || '-01') AS month_date,
    male_orders,
    female_orders,
    total_orders
  FROM male_orders
  JOIN female_orders
  ON male_orders.years = female_orders.years AND male_orders.months = female_orders.months
  JOIN total_orders
  ON male_orders.years = total_orders.years AND male_orders.months = total_orders.months
  ORDER BY male_orders.years, male_orders.months);
  
  
  
  
  
  
  
  
  