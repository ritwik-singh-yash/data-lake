
import boto3


def createjob(jobName,s3path,region,endpoint,iam_role,tempDir):
    glue = boto3.client(service_name='glue', region_name=region,endpoint_url=endpoint)



    #response = glue.create_job(Name=jobName,Role=iam_role,Command={
    #    'Name': 'glueetl',
    #    'ScriptLocation': s3path
    #},
    #DefaultArguments={
    #                               '--job-bookmark-option': 'job-bookmark-enable',
    #                               '--TempDir': tempDir
    #}

    #)
    #print ("Job Created",response)
    #myNewJobRun = glue.start_job_run(JobName=jobName)
    #print ("Job Started:",jobName)
    #print ("Job Run ID:",myNewJobRun['JobRunId'])
    print ("--------------------------------")
    return 'success'