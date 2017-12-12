import boto3
import string

def createConnection(region,endpoint,jdbcurl,username,password):
		glue = boto3.client(service_name='glue', region_name=region, endpoint_url=endpoint)

		ConnectionInput = {"Name": "yash-datalake-redshift-connection", "ConnectionType":"JDBC",
					   "ConnectionProperties":{'Name':'yash-datalake-redshift-connection', 'Type':'Amazon Redshift', 'USERNAME': username, 'JDBC_CONNECTION_URL':jdbcurl , 'PASSWORD':password}
					   }

		# create a connection  using above dictionary
		createconn = glue.create_connection(ConnectionInput=ConnectionInput)
		

		
   
def createjob(jobName,s3path,region,endpoint,iam_role,tempDir):
    glue = boto3.client(service_name='glue', region_name=region,endpoint_url=endpoint)

    response = glue.create_job(Name=jobName,Role=iam_role,Command={
        'Name': 'glueetl',
        'ScriptLocation': s3path
    },
    DefaultArguments={
                                   '--job-bookmark-option': 'job-bookmark-enable',
                                   '--TempDir': tempDir
    }

    )
    print ("job created",response)
    myNewJobRun = glue.start_job_run(JobName=jobName)
    print ("Job Started:",jobName)
    print ("Job Run ID:",myNewJobRun['JobRunId'])
    print ("--------------------------------")
    return jobName,myNewJobRun['JobRunId']