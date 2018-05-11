create table gender_product_category_count as
select cust.gender, prod.product_category, sum(ord.amount_spent) as Amount_Spent,count(*)
from yash_quickstart_datalake_transformed_spectrum_schema.products prod
join orders ord 
on ord.sku = prod.sku
join customers cust
on cust.customer_id = ord.customer_id
group by cust.gender, prod.product_category 
order by prod.product_category;