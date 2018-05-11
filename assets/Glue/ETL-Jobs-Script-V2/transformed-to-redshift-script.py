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
        'datalake_transformed_bucket_database_name',
        'datalake_redshift_connection_name',
		'redshift_cluster_database_name'
    ]
)

sc = SparkContext()
glueContext = GlueContext(sc)
spark = glueContext.spark_session
job = Job(glueContext)
job.init(args['JOB_NAME'], args)

# customers table

datasource0 = glueContext.create_dynamic_frame.from_catalog(database=args["datalake_transformed_bucket_database_name"],table_name="customers", transformation_ctx="datasource0")

# customDF = datasource0.toDF()

datasink4 = glueContext.write_dynamic_frame.from_jdbc_conf(frame=datasource0,catalog_connection=args["datalake_redshift_connection_name"],connection_options={"dbtable": "customers", "database": args["redshift_cluster_database_name"]}, redshift_tmp_dir=args["TempDir"], transformation_ctx="datasink4")

# orders table

datasource1 = glueContext.create_dynamic_frame.from_catalog(database=args["datalake_transformed_bucket_database_name"],table_name="orders", transformation_ctx="datasource1")

# customDF = datasource1.toDF()

datasink4 = glueContext.write_dynamic_frame.from_jdbc_conf(frame=datasource1, catalog_connection=args["datalake_redshift_connection_name"], connection_options={"dbtable": "orders","database": args["redshift_cluster_database_name"]},redshift_tmp_dir=args["TempDir"],transformation_ctx="datasink4")

job.commit()