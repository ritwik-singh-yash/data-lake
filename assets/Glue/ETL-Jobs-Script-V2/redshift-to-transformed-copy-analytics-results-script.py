import sys
from awsglue.transforms import *
from awsglue.utils import getResolvedOptions
from pyspark.context import SparkContext
from awsglue.context import GlueContext
from awsglue.job import Job

## @params: [TempDir, JOB_NAME]
args = getResolvedOptions(
    sys.argv,
    [
        'JOB_NAME',
		'TempDir',
		'datalake_redshift_database_name',
		'datalake_transformed_bucket_name',
		'redshift_cluster_database_name'
        
		
    ]
)

sc = SparkContext()
glueContext = GlueContext(sc)
spark = glueContext.spark_session
job = Job(glueContext)
job.init(args['JOB_NAME'], args)

# payment_type table in redshift
datasource0 = glueContext.create_dynamic_frame.from_catalog(database = args["datalake_redshift_database_name"], table_name = args['redshift_cluster_database_name']+"_public_payment_type", redshift_tmp_dir = args["TempDir"], transformation_ctx = "datasource0")
customDFpayment_type = datasource0.toDF()
customDFpayment_type.write.parquet('s3://{}/analytics-queries-result/payment_type'.format(args['datalake_transformed_bucket_name']) ,mode='overwrite')

# order_distribution_by_day_of_week table in redshift
datasource1 = glueContext.create_dynamic_frame.from_catalog(database = args["datalake_redshift_database_name"], table_name = args['redshift_cluster_database_name']+"_public_order_distribution_by_day_of_week", redshift_tmp_dir = args["TempDir"], transformation_ctx = "datasource1")
customDForder_distribution_by_day_of_week = datasource1.toDF()
customDForder_distribution_by_day_of_week.write.parquet('s3://{}/analytics-queries-result/order_distribution_by_day_of_week'.format(args['datalake_transformed_bucket_name']),mode='overwrite')

# loyal_customer table in redshift
datasource2 = glueContext.create_dynamic_frame.from_catalog(database =args["datalake_redshift_database_name"], table_name = args['redshift_cluster_database_name']+"_public_loyal_customer", redshift_tmp_dir = args["TempDir"], transformation_ctx = "datasource2")
customDFloyal_customer = datasource2.toDF()
customDFloyal_customer.write.parquet('s3://{}/analytics-queries-result/loyal_customer'.format(args['datalake_transformed_bucket_name']),mode='overwrite')

# state_wise_order_distribution table in redshift
datasource3 = glueContext.create_dynamic_frame.from_catalog(database = args["datalake_redshift_database_name"], table_name = args['redshift_cluster_database_name']+"_public_state_wise_order_distribution", redshift_tmp_dir = args["TempDir"], transformation_ctx = "datasource3")
customDFstate_wise_order_distribution = datasource3.toDF()
customDFstate_wise_order_distribution.write.parquet('s3://{}/analytics-queries-result/state_wise_order_distribution'.format(args['datalake_transformed_bucket_name']),mode='overwrite')

# gender_product_category_count table in redshift
datasource4 = glueContext.create_dynamic_frame.from_catalog(database = args["datalake_redshift_database_name"], table_name = args['redshift_cluster_database_name']+"_public_gender_product_category_count", redshift_tmp_dir = args["TempDir"], transformation_ctx = "datasource4")
customDFgender_product_category_count = datasource4.toDF()
customDFgender_product_category_count.write.parquet('s3://{}/analytics-queries-result/gender_product_category_count'.format(args['datalake_transformed_bucket_name']),mode='overwrite')

# house_hold_income_distribution table in redshift
datasource5 = glueContext.create_dynamic_frame.from_catalog(database =args["datalake_redshift_database_name"], table_name = args['redshift_cluster_database_name']+"_public_house_hold_income_distribution", redshift_tmp_dir = args["TempDir"], transformation_ctx = "datasource5")
customDFhouse_hold_income_distribution = datasource5.toDF()
customDFhouse_hold_income_distribution.write.parquet('s3://{}/analytics-queries-result/house_hold_income_distribution'.format(args['datalake_transformed_bucket_name']),mode='overwrite')

# age_wise_expenditure_distribution table in redshift
datasource6 = glueContext.create_dynamic_frame.from_catalog(database = args["datalake_redshift_database_name"], table_name = args['redshift_cluster_database_name']+"_public_age_wise_expenditure_distribution", redshift_tmp_dir = args["TempDir"], transformation_ctx = "datasource6")
customDFage_wise_expenditure_distribution = datasource6.toDF()
customDFage_wise_expenditure_distribution.write.parquet('s3://{}/analytics-queries-result/age_wise_expenditure_distribution'.format(args['datalake_transformed_bucket_name']),mode='overwrite')

# big_spenders table in redshift
datasource7 = glueContext.create_dynamic_frame.from_catalog(database = args["datalake_redshift_database_name"], table_name = args['redshift_cluster_database_name']+"_public_big_spenders", redshift_tmp_dir = args["TempDir"], transformation_ctx = "datasource7")
customDFbig_spenders = datasource7.toDF()
customDFbig_spenders.write.parquet('s3://{}/analytics-queries-result/big_spenders'.format(args['datalake_transformed_bucket_name']),mode='overwrite')

# gender_orders_by_month
datasource8 = glueContext.create_dynamic_frame.from_catalog(database = args["datalake_redshift_database_name"], table_name = args['redshift_cluster_database_name']+"_public_gender_orders_by_month", redshift_tmp_dir = args["TempDir"], transformation_ctx = "datasource8")
customDFgender_orders_by_month = datasource8.toDF()
customDFgender_orders_by_month.write.parquet('s3://{}/analytics-queries-result/gender_orders_by_month'.format(args['datalake_transformed_bucket_name']),mode='overwrite')

job.commit()