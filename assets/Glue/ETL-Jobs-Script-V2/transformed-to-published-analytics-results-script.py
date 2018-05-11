import sys
from awsglue.transforms import *
from awsglue.utils import getResolvedOptions
from pyspark.context import SparkContext
from awsglue.context import GlueContext
from awsglue.job import Job

## @params: [JOB_NAME]
args = getResolvedOptions(
    sys.argv,
    [
        'JOB_NAME',
		'TempDir',
		'datalake_transformed_bucket_database_name',
		'datalake_published_bucket_name'
        
		
    ]
)

sc = SparkContext()
glueContext = GlueContext(sc)
spark = glueContext.spark_session
job = Job(glueContext)
job.init(args['JOB_NAME'], args)

#age_wise_expenditure_distribution

datasource0 = glueContext.create_dynamic_frame.from_catalog(database = args["datalake_transformed_bucket_database_name"], table_name = "age_wise_expenditure_distribution", transformation_ctx = "datasource0")
df = datasource0.toDF()
df.write.parquet('s3://{}/age_wise_expenditure_distribution'.format(args['datalake_published_bucket_name']), mode='overwrite')

#payment_type

datasource1 = glueContext.create_dynamic_frame.from_catalog(database =args["datalake_transformed_bucket_database_name"], table_name = "payment_type", redshift_tmp_dir = args["TempDir"], transformation_ctx = "datasource0")
df = datasource1.toDF()
df.write.parquet('s3://{}/payment_type'.format(args['datalake_published_bucket_name']), mode='overwrite')



#order_distribution_by_day_of_week

datasource2 = glueContext.create_dynamic_frame.from_catalog(database = args["datalake_transformed_bucket_database_name"], table_name = "order_distribution_by_day_of_week", redshift_tmp_dir = args["TempDir"], transformation_ctx = "datasource4")
df = datasource2.toDF()
df.write.parquet('s3://{}/order_distribution_by_day_of_week'.format(args['datalake_published_bucket_name']), mode='overwrite')



#loyal_customer
datasource3 = glueContext.create_dynamic_frame.from_catalog(database =args["datalake_transformed_bucket_database_name"], table_name = "loyal_customer", redshift_tmp_dir = args["TempDir"], transformation_ctx = "datasource8")
df = datasource3.toDF()
df.write.parquet('s3://{}/loyal_customer'.format(args['datalake_published_bucket_name']), mode='overwrite')


#state_wise_order_distribution

datasource4 = glueContext.create_dynamic_frame.from_catalog(database =args["datalake_transformed_bucket_database_name"], table_name = "state_wise_order_distribution", redshift_tmp_dir = args["TempDir"], transformation_ctx = "datasource12")
df = datasource4.toDF()
df.write.parquet('s3://{}/state_wise_order_distribution'.format(args['datalake_published_bucket_name']), mode='overwrite')


#gender_product_category_count
datasource5 = glueContext.create_dynamic_frame.from_catalog(database = args["datalake_transformed_bucket_database_name"], table_name = "gender_product_category_count", redshift_tmp_dir = args["TempDir"], transformation_ctx = "datasource16")
df = datasource5.toDF()
df.write.parquet('s3://{}/gender_product_category_count'.format(args['datalake_published_bucket_name']), mode='overwrite')



#big_spenders
datasource6 = glueContext.create_dynamic_frame.from_catalog(database = args["datalake_transformed_bucket_database_name"], table_name = "big_spenders", redshift_tmp_dir = args["TempDir"], transformation_ctx = "datasource28")
df = datasource6.toDF()
df.write.parquet('s3://{}/big_spenders'.format(args['datalake_published_bucket_name']), mode='overwrite')



#house_hold_income_distribution

datasource7 = glueContext.create_dynamic_frame.from_catalog(database = args["datalake_transformed_bucket_database_name"], table_name = "house_hold_income_distribution", redshift_tmp_dir = args["TempDir"], transformation_ctx = "datasource20")
df = datasource7.toDF()
df.write.parquet('s3://{}/house_hold_income_distribution'.format(args['datalake_published_bucket_name']), mode='overwrite')



#gender_orders_by_month

datasource8 = glueContext.create_dynamic_frame.from_catalog(database =args["datalake_transformed_bucket_database_name"], table_name = "gender_orders_by_month", redshift_tmp_dir = args["TempDir"], transformation_ctx = "datasource32")
df = datasource8.toDF()
df.write.parquet('s3://{}/gender_orders_by_month'.format(args['datalake_published_bucket_name']), mode='overwrite')


job.commit()