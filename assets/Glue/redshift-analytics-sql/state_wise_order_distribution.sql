create table state_wise_order_distribution as
select cust.state,cust.Gender, sum(updt_ord.number_of_orders) as number_of_orders_by_state
from
(select ord.customer_id as customer_id,count(*) as number_of_orders 
from orders ord
Group By ord.customer_id)updt_ord
join customers cust
on updt_ord.customer_id = cust.customer_id
GROUP BY cust.state,cust.gender
ORDER BY sum(updt_ord.number_of_orders), cust.state,cust.gender desc;
