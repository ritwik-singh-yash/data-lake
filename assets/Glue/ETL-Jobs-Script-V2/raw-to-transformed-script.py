import sys
from awsglue.transforms import *
from awsglue.utils import getResolvedOptions
from pyspark.context import SparkContext
from awsglue.context import GlueContext
from awsglue.job import Job
from pyspark.sql.functions import lit
import datetime

## @params: [JOB_NAME]
args = getResolvedOptions(
    sys.argv,
    [
        'JOB_NAME',
		'TempDir',
        'datalake_raw_datasets_database_name',
        'datalake_transformed_bucket_name'
    ]
)

sc = SparkContext()
glueContext = GlueContext(sc)
spark = glueContext.spark_session
job = Job(glueContext)
job.init(args['JOB_NAME'], args)


now = datetime.datetime.now()
year = str(now.year) 
month = str(now.month)
day = str(now.day)
today = str(now.date())



#customer table

datasource0 = glueContext.create_dynamic_frame.from_catalog(database = args["datalake_raw_datasets_database_name"], table_name = "customers", transformation_ctx = "datasource0")
applymapping1 = ApplyMapping.apply(frame = datasource0, mappings = [("customer_id", "string", "customer_id", "string"), ("first_name", "string", "first_name", "string"), ("last_name", "string", "last_name", "string"), ("region", "string", "region", "string"), ("state", "string", "state", "string"), ("cbgid", "long", "cbgid", "long"), ("marital_status", "string", "marital_status", "string"), ("education_level", "string", "education_level", "string"), ("age", "long", "age", "long"), ("gender", "string", "gender", "string")], transformation_ctx = "applymapping1")
resolvechoice2 = ResolveChoice.apply(frame = applymapping1, choice = "make_struct", transformation_ctx = "resolvechoice2")
dropnullfields3 = DropNullFields.apply(frame = resolvechoice2, transformation_ctx = "dropnullfields3")

## YASH's SCRIPT ###
##----------------------------------
#convert to a Spark DataFrame...
customDF = dropnullfields3.toDF()
#add 3 new columns
customDF = customDF.withColumn("year", lit(year))
customDF = customDF.withColumn("month", lit(month))
customDF = customDF.withColumn("day", lit(day))
customDF.write.parquet('s3://{}/customers'.format(args['datalake_transformed_bucket_name']),partitionBy=['year','month','day'], mode='overwrite')


#order table

datasource4 = glueContext.create_dynamic_frame.from_catalog(database = args["datalake_raw_datasets_database_name"], table_name = "orders", transformation_ctx = "datasource4")
applymapping5 = ApplyMapping.apply(frame=datasource4, mappings = [("customer_id", "string", "customer_id", "string"),("sku", "string", "sku", "string"),("order_date", "string", "order_date", "string"), ("product_quantity", "double", "product_quantity","double"),("amount_spent", "double", "amount_spent", "double"),("latitude", "double", "latitude", "double"),("longitude", "double", "longitude", "double"),("payment_mode", "string", "payment_mode", "string")], transformation_ctx = "applymapping5")
resolvechoice6 = ResolveChoice.apply(frame = applymapping5, choice = "make_struct", transformation_ctx = "resolvechoice6")
dropnullfields7 = DropNullFields.apply(frame = resolvechoice6, transformation_ctx = "dropnullfields7")

## YASH's SCRIPT ###
##----------------------------------
#convert to a Spark DataFrame...
customDF = dropnullfields7.toDF()
 #add 3 new columns

customDF = customDF.withColumn("year", lit(year))
customDF = customDF.withColumn("month", lit(month))
customDF = customDF.withColumn("day", lit(day))
customDF.write.parquet('s3://{}/orders'.format(args['datalake_transformed_bucket_name']),partitionBy=['year','month','day'], mode='overwrite')



#demographics table 

datasource8 = glueContext.create_dynamic_frame.from_catalog(database = args["datalake_raw_datasets_database_name"], table_name = "demographics", redshift_tmp_dir = args["TempDir"], transformation_ctx = "datasource8")
applymapping9 = ApplyMapping.apply(frame = datasource8, mappings = [("col0", "long", "geoid", "string"), ("col1", "string", "state", "string"), ("col2", "long", "population", "long"), ("col3", "string", "population_density", "double"), ("col4", "long", "households", "long"), ("col5", "long", "middle_aged_people", "long"), ("col6", "double", "household_income", "double"), ("col7", "long", "bachelors_degrees", "long"), ("col8", "long", "families_with_children", "long"), ("col9", "long", "children_under_5", "long"), ("col10", "long", "owner_occupied", "long"), ("col11", "long", "marriedcouple_family", "long")], transformation_ctx = "applymapping9")
resolvechoice10 = ResolveChoice.apply(frame = applymapping9, choice = "make_struct", transformation_ctx = "resolvechoice10")
dropnullfields11 = DropNullFields.apply(frame = resolvechoice10, transformation_ctx = "dropnullfields11")

## YASH's SCRIPT ###
##----------------------------------
#convert to a Spark DataFrame...
customDF = dropnullfields11.toDF()
customDF = customDF.withColumn("year", lit(year))
customDF = customDF.withColumn("month", lit(month))
customDF = customDF.withColumn("day", lit(day))
customDF.write.parquet('s3://{}/demographics'.format(args['datalake_transformed_bucket_name']),partitionBy=['year','month','day'], mode='overwrite')



#products table 

datasource12 = glueContext.create_dynamic_frame.from_catalog(database = args["datalake_raw_datasets_database_name"], table_name = "products", redshift_tmp_dir = args["TempDir"], transformation_ctx = "datasource12")
applymapping13 = ApplyMapping.apply(frame = datasource12, mappings = [("col0", "string", "sku", "string"), ("col1", "string", "product_category", "string"), ("col2", "string", "link", "string"), ("col3", "string", "company", "string"), ("col4", "double", "price", "double"), ("col5", "string", "release_date", "string")], transformation_ctx = "applymapping13")
resolvechoice14 = ResolveChoice.apply(frame = applymapping13, choice = "make_struct", transformation_ctx = "resolvechoice14")
dropnullfields15 = DropNullFields.apply(frame = resolvechoice14, transformation_ctx = "dropnullfields15")
## YASH's SCRIPT ###
##----------------------------------
#convert to a Spark DataFrame...
customDF = dropnullfields15.toDF()
 #add 3 new columns

customDF = customDF.withColumn("year", lit(year))
customDF = customDF.withColumn("month", lit(month))
customDF = customDF.withColumn("day", lit(day))
customDF.write.parquet('s3://{}/products'.format(args['datalake_transformed_bucket_name']),partitionBy=['year','month','day'], mode='overwrite')



job.commit()