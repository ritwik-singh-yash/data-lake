create table age_wise_expenditure_distribution as
select cast(cust.customer_name as varchar(255)) as customer_name,cust.gender, cust.age_grp_category, sum(ord.amount_spent) as expenditure
from
(SELECT age_grp.customer_id,(age_grp.first_name || age_grp.last_name) as customer_name, age_grp.gender,
CASE 
WHEN age_grp.age>= 18 AND age_grp.age < 30 THEN '18-29'
WHEN age_grp.age>= 30 AND age_grp.age < 50 THEN '30-49'
WHEN age_grp.age>= 50 AND age_grp.age < 65 THEN '50-64'
WHEN age_grp.age>= 65 AND age_grp.age < 80 THEN '65-older'
END AS age_grp_category
FROM (SELECT * FROM customers) age_grp
group by age_grp.gender, age_grp.age, age_grp.customer_id, age_grp.first_name, age_grp.last_name) cust
join orders ord
on ord.customer_id = cust.customer_id
group by cust.customer_name,cust.gender, cust.age_grp_category
order by cust.customer_name;