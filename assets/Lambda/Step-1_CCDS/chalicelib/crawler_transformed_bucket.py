import boto3
import string

def createtransformcrawler(dbName,s3path,crawName,region,endpoint):
    Input={'Name': dbName};

    try:
        glue = boto3.client(service_name='glue', region_name=region, endpoint_url=endpoint)    
        dbList = glue.get_databases()
        name = [d['Name'] for d in dbList['DatabaseList']]
        print (name)
        if(Input['Name'] not in name):
            glue.create_database(DatabaseInput=Input)

        Targets = {'S3Targets':[{'Path': s3path,'Exclusions': [
                        '*/_common_metadata','*/_metadata'
                    ]},]}

        crawNameInput=crawName
        # Get the list of current crawlers
        crawList=glue.get_crawlers();
        crawNameList = [d['Name'] for d in crawList['Crawlers']]
        if(crawNameInput not in crawNameList):
            createcraw = glue.create_crawler(Name=crawNameInput, Role='arn:aws:iam::754307369999:role/AWSGlueServiceRoleDefault', DatabaseName=Input['Name'], Targets=Targets)

        response = glue.start_crawler(Name=crawNameInput)
        #print(craw)
        return crawNameInput
    except Exception as e:
        print 'exception found in crawler transformed bucket'+e
        return {"failure in creatin crawler":e}