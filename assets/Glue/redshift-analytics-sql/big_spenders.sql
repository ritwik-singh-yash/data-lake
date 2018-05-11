create table big_spenders as
select cast((cust.first_name || cust.last_name) as varchar(255)) as customer_name, 
cast(ord_num.total_amt_spent as float) as total_amt_spent, cast(ord_num.avg_amt_spent as float) as avg_amt_spent, 
ord_num.number_of_orders 
from 
(select customer_id , (cast(sum(amount_spent) as float)) as total_amt_spent , (cast (avg(amount_spent) as float)) as avg_amt_spent,
count(*) as number_of_orders from orders 
group by customer_id
order by sum(amount_spent) desc) ord_num
join customers cust
on ord_num.customer_id = cust.customer_id 
order by ord_num.number_of_orders desc;