import boto3

def createrawjob(jobName, s3path, region, endpoint, iam_role, tempDir):
    try:
	    glue = boto3.client(service_name='glue', region_name=region, endpoint_url=endpoint)

            response = glue.create_job(Name=jobName, Role=iam_role, Command={	'Name': 'glueetl',	'ScriptLocation': s3path},   DefaultArguments={   '--job-bookmark-option': 'job-bookmark-enable',   '--TempDir': tempDir   }   )

	    Dict = glue.start_job_run(JobName=jobName)
            #Dict={'JobRunId':'jobid'}
		#return Dict.get("JobRunId")
	    return {'Jobname':jobName,'jobID':Dict.get('JobRunId')}
    except Exception as e:
	    return {'excption occured due to ':e}
