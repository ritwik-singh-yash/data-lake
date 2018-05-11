create table house_hold_income_distribution as
SELECT CASE 
WHEN household_income < 50000 THEN 'Under 50K'
WHEN household_income >= 50000 AND household_income < 100000 THEN '50k-100k'
WHEN household_income >= 100000 AND household_income < 200000 THEN '100k-200k'
WHEN household_income >= 200000 THEN 'Above 200k'
END AS household_income_category,count(*) as family_count
from yash_quickstart_datalake_transformed_spectrum_schema.demographics
where household_income is not null
group by household_income_category;