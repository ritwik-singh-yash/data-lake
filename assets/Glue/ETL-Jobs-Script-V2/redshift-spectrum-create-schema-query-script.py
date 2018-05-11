import sys
import pg8000 as dbapi
from awsglue.transforms import *
from awsglue.utils import getResolvedOptions
from pyspark.context import SparkContext
from awsglue.context import GlueContext
from awsglue.job import Job

args = getResolvedOptions(
    sys.argv,
    [
        'JOB_NAME',
        'redshift_cluster_database_name',
        'redshift_cluster_host',
        'redshift_username',
        'redshift_password',
        'transformed_bucket_db_name',
        'redshift_role'

    ]
)

sc = SparkContext()
glueContext = GlueContext(sc)
spark = glueContext.spark_session
job = Job(glueContext)
job.init(args['JOB_NAME'], args)


def connect_redshift():
    try:
        con = dbapi.connect(database=args["redshift_cluster_database_name"], host=args["redshift_cluster_host"],
                            port=5439, user=args["redshift_username"], password=args["redshift_password"], ssl=True)
        curr = con.cursor()
        # curr.execute('select * from orders limit 5;')

        curr.execute("create external schema if not exists yash_quickstart_datalake_transformed_spectrum_schema from data catalog database"+" "+"'"+args['transformed_bucket_db_name']+"'"+" "+"iam_role"+" "+"'"+args['redshift_role']+"'"+" "+"create external database if not exists;")
        con.commit()
        curr.close()
        con.close()
    except Exception as err:
        print(err)


connect_redshift()

job.commit()
