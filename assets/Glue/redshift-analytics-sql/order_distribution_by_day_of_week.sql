create table order_distribution_by_day_of_week as
select 
case
when extract(dayofweek from ord_dt.updated_order_date) = 0 then 'SUNDAY'
when extract(dayofweek from ord_dt.updated_order_date) = 1 then 'MONDAY'
when extract(dayofweek from ord_dt.updated_order_date) = 2 then 'TUESDAY'
when extract(dayofweek from ord_dt.updated_order_date) = 3 then 'WEDNESDAY'
when extract(dayofweek from ord_dt.updated_order_date) = 4 then 'THURSDAY'
when extract(dayofweek from ord_dt.updated_order_date) = 5 then 'FRIDAY'
when extract(dayofweek from ord_dt.updated_order_date) = 6 then 'SATURDAY'
Else 'Not a valid day' 
END as DayOfWeek, 
count(*) as order_distribution 
from
(select
cast((ord.order_date) as timestamp) AS updated_order_date
from orders ord ) ord_dt
group by extract(dayofweek from ord_dt.updated_order_date)
order by extract(dayofweek from ord_dt.updated_order_date) asc limit 100;