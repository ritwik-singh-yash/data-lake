create table loyal_customer as
select cast((cust.first_name || cust.last_name) as varchar(255)) as customer_name, updt_ord_dt.first_order_date, updt_ord_dt.latest_order_Date,DATEDIFF(d, updt_ord_dt.first_order_date, updt_ord_dt.latest_order_Date) as DaysAsCustomer from 
(select updt_ord.customer_id, min(updt_ord.formatted_order_date) as first_order_date, max(updt_ord.formatted_order_date) as latest_order_Date from
(select ord.customer_id,
cast((ord.order_date) as timestamp) as formatted_order_date
from orders ord
group by ord.customer_id, ord.order_date)updt_ord
group by updt_ord.customer_id)updt_ord_dt
join customers cust
on cust.customer_id = updt_ord_dt.customer_id
group by cust.first_name,cust.last_name,updt_ord_dt.first_order_date, updt_ord_dt.latest_order_Date
order by DATEDIFF(d, updt_ord_dt.first_order_date, updt_ord_dt.latest_order_Date) desc;