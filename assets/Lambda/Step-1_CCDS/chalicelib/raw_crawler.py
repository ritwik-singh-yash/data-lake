import boto3


def createcrawler(dbName,s3path,crawName,region,endpoint):

    #dbName = "yash-quickstart-datalake-raw-bucket-db"
    #s3path = "s3://yash-quickstart-datalake-raw-us-west-2/"
    #crawName = "yash-quickstart-datalake-raw-bucket-crawler"
    #region = "us-west-2"
    #endpoint = "https://glue.us-west-2.amazonaws.com"

    try:
        glue = boto3.client(service_name='glue', region_name=region, endpoint_url=endpoint)

        Input={'Name': dbName};

        dbList = glue.get_databases()
        name = [d['Name'] for d in dbList['DatabaseList']]
        if(Input['Name'] not in name):
            glue.create_database(DatabaseInput=Input)

        Targets = {'S3Targets':[{'Path': s3path,'Exclusions': [
            '*/_common_metadata','*/_metadata'
            ]},]}

        crawNameInput=crawName
        # Get the list of current crawlers
        crawList=glue.get_crawlers()
        crawNameList = [d['Name'] for d in crawList['Crawlers']]
        #print (crawNameList)
        if(crawNameInput not in crawNameList):
            createcraw = glue.create_crawler(Name=crawNameInput, Role='arn:aws:iam::754307369999:role/AWSGlueServiceRoleDefault', DatabaseName=Input['Name'], Targets=Targets)

        response = glue.start_crawler(Name=crawNameInput)
        return {'Crawler Name':crawNameInput}
    except Exception as e:
	return {'Exception occured because of':e}	
        

