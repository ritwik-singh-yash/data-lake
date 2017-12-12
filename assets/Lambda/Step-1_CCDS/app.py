from chalice import Chalice,Response
from chalice import CognitoUserPoolAuthorizer

import os
import boto3
import random
import json
import string
import psycopg2

from chalicelib.raw_crawler import createcrawler
from chalicelib.run_raw_crawler import createjob
from chalicelib.crawler_transformed_bucket import createtransformcrawler
from chalicelib.transformed_redshift_job import *
from chalicelib.run_raw_job import createrawjob

try:
    import ConfigParser as parser
except:
    import  configparser as  parser # In Python 3, ConfigParser has been renamed to configparser for PEP 8 compliance.
    

properties={}
app = Chalice(app_name='AwsDatalakeServerless')
app.debug=True
resource = boto3.resource('s3')
randomnumber=random.randint(1, 10000000000)
strnumber=str(randomnumber)

authorizer = CognitoUserPoolAuthorizer('CognitoAuthorizer', provider_arns=[os.environ['cognitoPoolArn']])



@app.route("/prop",authorizer=authorizer,methods=['GET'],cors=True)
def read_Properties():
    config = parser.ConfigParser()
    bucket_name=os.environ['destination_bucket_name']
    file_name=os.environ['properties_file_name']
    #bucket_name="aws-datalake-47lining"
    #file_name="appconfig.ini"
    print("bucket_name:::::",bucket_name)
    print("file_name::::",file_name)
    try:
        resource.Bucket(bucket_name).download_file(file_name, '/tmp/appconfig.ini')
    except Exception as e:
        print("Something Happened while downloading properties file from s3: ", e)
        return {"error":e,"success":False}
    try:
        config.read('/tmp/appconfig.ini')
        lambda_execution_role=config.get('aws','lambda_execution_role')  
        resource_bucket_name=config.get('aws','resource_bucket_name')
        destination_bucket_name=config.get('aws','destination_bucket_name')
        cognitoPoolName=config.get('aws','aws_cognito_pool_name')
        cognitoPoolArn=config.get('aws','aws_cognito_pool_arn') 
        properties_file_name=config.get('aws','properties_file_name')             
        properties['lambda_execution_role'] = lambda_execution_role
        properties['resource_bucket_name'] = resource_bucket_name
        properties['destination_bucket_name'] = destination_bucket_name
        properties['cognitoPoolName'] = cognitoPoolName
        properties['cognitoPoolArn'] = cognitoPoolArn
        properties['properties_file_name'] = properties_file_name    

        
        #return {"value1 readed from s3":value1}
        return {"lambda_execution_role":lambda_execution_role,"resource_bucket_name":resource_bucket_name,"destination_bucket_name":destination_bucket_name,"cognitoPoolName":cognitoPoolName,"cognitoPoolArn":cognitoPoolArn,"properties_file_name":properties_file_name,"success":True}
    except Exception as e:
        print("Something Happened while reading properties file: ", e)
        return {"error":e,"success":False}


@app.route('/getProperties', methods=['GET'], authorizer=authorizer,cors=True)
def authenticated():
    return {"success": properties}

@app.route('/crawler',methods=['GET'],cors=True,authorizer=authorizer)
def calling_create_crawler():
    dbName = "yash-quickstart-datalake-raw-bucket-db"
    s3path = "s3://yash-quickstart-datalake-raw-us-west-2/"
    crawName = "yash-quickstart-datalake-raw-bucket-crawler"
    region = "us-west-2"
    endpoint = "https://glue.us-west-2.amazonaws.com"
    
    try:

        crawler_name = createcrawler(dbName,s3path,crawName,region,endpoint)
        return Response(body=crawler_name,
            status_code=200,
            headers={'Content-Type': 'text/plain'})
    except Ecxeption as e:
        return Response(body={"Lambda Call Failed because of:":e},
            status_code=500,
            headers={'Content-Type': 'text/plain'})


@app.route('/rawtransformetl',methods=['GET'], cors=True,authorizer=authorizer)
def RawDatajob():
    try:
	#print strnumber
        #customer_job = {'1':1,'2':2} 
        customer_job = createrawjob("raw-to-transformed-customer-job"+strnumber,"s3://yash-quickstart-datalake-reference-us-west-2/Glue/ETL-Jobs-Script/raw-to-transformed/raw-to-transformed-customer.py","us-west-2","https://glue.us-west-2.amazonaws.com","AWSGlueServiceRoleDefault","s3://yash-quickstart-datalake-reference-us-west-2/Glue/temp-dir");
        Order_job = createrawjob("raw-to-transformed-order-job"+strnumber,"s3://yash-quickstart-datalake-reference-us-west-2/Glue/ETL-Jobs-Script/raw-to-transformed/raw-to-transformed-order.py","us-west-2","https://glue.us-west-2.amazonaws.com","AWSGlueServiceRoleDefault","s3://yash-quickstart-datalake-reference-us-west-2/Glue/temp-dir");
        product_job = createrawjob("raw-to-transformed-product-job"+strnumber,"s3://yash-quickstart-datalake-reference-us-west-2/Glue/ETL-Jobs-Script/raw-to-transformed/raw-to-transformed-product.py","us-west-2","https://glue.us-west-2.amazonaws.com","AWSGlueServiceRoleDefault","s3://yash-quickstart-datalake-reference-us-west-2/Glue/temp-dir");
        #Demographic_job = 'not runing'        
        Demographic_job = createrawjob("raw-to-transformed-demographic-job"+strnumber,"s3://yash-quickstart-datalake-reference-us-west-2/Glue/ETL-Jobs-Script/raw-to-transformed/raw-to-transformed-demographic.py","us-west-2","https://glue.us-west-2.amazonaws.com","AWSGlueServiceRoleDefault","s3://yash-quickstart-datalake-reference-us-west-2/Glue/temp-dir");
#return {"Job_Id": {"Customer_job_": customer_job,"Order_job_id": order_job_id,"product_job_id": product_job_id,"Demographic_job_id": demographic_job_id}}
    
        return Response(body={'customer':customer_job,'order':Order_job,'product':product_job,'Demographic':Demographic_job},
                status_code=200,
                headers={'Content-Type': 'text/plain'})
        
    except Exception as e:
        return Response(body={"Lambda Call Failed":e},
                status_code=500,
                headers={'Content-Type': 'text/plain'})


@app.route('/transformcrawler',methods=['GET'], cors=True,authorizer=authorizer)
def crawler_on_transformed():
    try:
        crawler = createtransformcrawler("yash-quickstart-datalake-transformed-bucket-db","s3://yash-quickstart-datalake-transformed-us-west-2/","yash-quickstart-datalake-transformed-bucket-crawler","us-west-2","https://glue.us-west-2.amazonaws.com")
        
        return Response(body={" crawler name :":crawler},
                    status_code=200,
                    headers={'Content-Type': 'text/plain'})
    except Ecxeption as e:
        return Response(body={"Lambda Call Failed because of:":e},
                status_code=500,
                headers={'Content-Type': 'text/plain'})


 
@app.route('/transformedredshift',methods=['GET'], cors=True,authorizer=authorizer)
def run_redshift_jobs():
    try:
        # Create Redshift Connection
        createConnection("us-west-2","https://glue.us-west-2.amazonaws.com","jdbc:redshift://yash-data-lake-rnd.cpeozvswrmel.us-west-2.redshift.amazonaws.com:5439/yashdatalakedb","admin","Yash1234")
        
	customer_result = createjob("transformed-to-redshift-customer-job"+strnumber,"s3://yash-quickstart-datalake-reference-us-west-2/Glue/ETL-Jobs-Script/transformed-to-redshift/transformed-to-redshift-customer.py","us-west-2","https://glue.us-west-2.amazonaws.com","AWSGlueServiceRoleDefault","s3://yash-quickstart-datalake-reference-us-west-2/Glue/temp-dir")
	order_result = createjob("transformed-to-redshift-order-job"+strnumber,"s3://yash-quickstart-datalake-reference-us-west-2/Glue/ETL-Jobs-Script/transformed-to-redshift/transformed-to-redshift-order.py","us-west-2","https://glue.us-west-2.amazonaws.com","AWSGlueServiceRoleDefault","s3://yash-quickstart-datalake-reference-us-west-2/Glue/temp-dir")
		
        final_result = {'customer_job':customer_result,'order_job':order_result}
		
 	return Response(body=json.dumps(final_result),
						status_code=200,
						headers={'Content-Type': 'text/plain'})
    
    except Exception as e:
	return Response(body={"Lambda Call Failed because of:":e},
		status_code=500,
		headers={'Content-Type': 'text/plain'})

@app.route('/redshift',methods=['GET'], cors=True,authorizer=authorizer)
def run_redshift_commands():
    try:
        con = psycopg2.connect(dbname='yashdatalakedb',
                           host='yash-data-lake-rnd.cpeozvswrmel.us-west-2.redshift.amazonaws.com',
                           port='5439', user='admin', password='Yash1234')
        cur = con.cursor()
        cur.execute("create external schema if not exists yash_quickstart_datalake_transformed_spectrum_schema from data catalog database 'yash-quickstart-datalake-transformed-bucket-db' iam_role 'arn:aws:iam::754307369999:role/RedshiftSpectrumWithGlueRole'create external database if not exists;")
        con.commit()
        cur.close()
        con.close()
        return Response(body='success',status_code=200,headers={'Content-Type': 'text/plain'})
    except Exception as e:
        return Response(body={"Lambda Call Failed because of:":e},status_code=500,headers={'Content-Type': 'text/plain'})

