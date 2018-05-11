create table payment_type as
select ord.payment_mode, cast (sum(ord.amount_spent)/1000 as float) as amount_spent, count(*) as number_of_orders 
from orders ord
Group By ord.payment_mode;