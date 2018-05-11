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
		'redshift_password'
		
    ]
)

sc = SparkContext()
glueContext = GlueContext(sc)
spark = glueContext.spark_session
job = Job(glueContext)
job.init(args['JOB_NAME'], args)


def connect_redshift(file_name):
    try:
        con = dbapi.connect(database=args["redshift_cluster_database_name"], host=args["redshift_cluster_host"],port=5439,user=args["redshift_username"],password=args["redshift_password"],ssl=True)
        curr = con.cursor()
        #curr.execute('select * from orders limit 5;')
        sqlfile = open(file_name, 'r')
        curr.execute(sqlfile.read())
        con.commit()
        curr.close()
        con.close()
    except Exception as err:
        print(err)

connect_redshift('payment_type.sql')
connect_redshift('age_wise_expenditure_distribution.sql')
connect_redshift('gender_product_category_count.sql')
connect_redshift('order_distribution_by_day_of_week.sql')
connect_redshift('state_wise_order_distribution.sql')
connect_redshift('house_hold_income_distribution.sql')
connect_redshift('big_spenders.sql')
connect_redshift('loyal_customer.sql')
connect_redshift('gender_orders_by_month.sql')
job.commit()

