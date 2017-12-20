/**
 * 
 */
function init(){
	
	var streamName="testKinsesDataGeneratorStream",
        streamType="firehose",
        rate=100,
        sendDataHandle,
        totalRecordsSent = 0,
        cognitoAppClientId= "3s6vasbqqfh3vahf1kehhlrn38",
        cognitoUserPoolId = "us-east-1_XASugwS63",
        cognitoIdentityPoolId = "us-east-1:68d275f6-fa73-4803-a7f9-960b8eab74bd",
        cognitoRegion = "us-east-1",
        cognitoUser,
        template = "{{name.customerID}},{{name.sku}},{{name.orderDate}},{{name.randomNumber(9)}},{{name.amountSpent}},{{name.latLong}},{{name.paymentMode}}";
    
    AWS.config.region = cognitoRegion;
    AWSCognito.config.region = cognitoRegion;
    var kinesis, firehose;
	
    var userName = "akash";
    var password = "123456789";

    var authData = {
        UserName: userName,
        Password: password
    };

    var authDetails = new AmazonCognitoIdentity.AuthenticationDetails(authData);

    var poolData = {
        UserPoolId: cognitoUserPoolId,
        ClientId: cognitoAppClientId
    };

    var userPool = new AmazonCognitoIdentity.CognitoUserPool(poolData);

    var userData = {
        Username: userName,
        Pool: userPool
    };

    cognitoUser = new AmazonCognitoIdentity.CognitoUser(userData);
    console.log(cognitoUser)
    cognitoUser.authenticateUser( authDetails, {
        onSuccess: function(result) {
        	
        	console.log('access token + ' + result.getAccessToken().getJwtToken())
        	var logins = {};
            logins["cognito-idp." + cognitoRegion + ".amazonaws.com/" + cognitoUserPoolId] = result.getIdToken().getJwtToken();
            console.log("LOGINS: " + logins);
            var params = {
                IdentityPoolId: cognitoIdentityPoolId,
                Logins: logins
            };

            AWS.config.region = cognitoRegion;
            AWSCognito.config.region = cognitoRegion;

            AWS.config.credentials = new AWS.CognitoIdentityCredentials(params);

            AWS.config.credentials.get(function(refreshErr) {
                if(refreshErr) {
                    console.error(refreshErr);
                }
                else {
                    var ec2 = new AWS.EC2();
                    ec2.describeRegions({}, function(err, data){
                        if(err){
                            if(err.code === "UnauthorizedOperation"){
                               console.log("Unauthorized Operation");
                            }
                            console.log(err, err.stack);
                        }
                        else {
                            console.log('data.Regions.length', data.Regions.length)
                            for(var i = 0; i < data.Regions.length; i++){
                                var name = data.Regions[i].RegionName;
                                $("#region").append("<option value='" + name + "'>" + name + "</option>");
                                //console.log("Successfully Authenticated");
                            }
                        }
                    });
                }
            });
        },
        onFailure: function(err) {
        	console.log("Authentication Failed");
            console.log(err);
        }
   });

    $("#btnSendData").click(function () {
		console.log('sendData')
        //streamName = $("#streamName").val();
        //rate = $("#putRate").val();
        rate = 100;
        //streamType = $("#streamName :selected").parent().attr("label") === "Kinesis Streams" ? "stream" : "firehose";
        streamType = "firehose";
        sendDataHandle = setInterval(createData, 10000);
    });
    
    $("#btnCancelSendData").click( function() {
        clearInterval(sendDataHandle);
        totalRecordsSent = 0;
        console.log("Data sending stopped");
    });
    
    $("#btnCreateData").click(function () {

        var template = getCleanedTemplate();
        console.log("template: " + template);
        for(var i = 0; i < 5; i++){
            var record = faker.fake(template);
        }
    });
    
    function getCleanedTemplate() {
     return template.trim().replace(/\n/g, "").replace("{{current.timestamp}}", "{{date.now}}");
    }
    
    function createData() {
    	
    	console.log("Inside createData")
        var maxRecordsTotal = 100;
        var records = [];

        //clean up line breaks, and a handle older timestamp template format
        var template = getCleanedTemplate();
        console.log("Template : "+template)
        console.log("Rate : "+rate)

        for(var n = 0; n < rate; n++) {
            var data = faker.fake(template);
            var record = {
                "Data": data + '\n'
            };
            if(streamType === "stream"){
                record.PartitionKey = (Math.floor(Math.random() * (10000000000))).toString();
            }
            records.push(record);
            console.log("record length  : "+records.length);
            if(records.length === maxRecordsTotal){
            	console.log("Inside if....for sendToKinesis")
                sendToKinesis(records);
                records = [];
            }
        }

        if(records.length > 0){
            sendToKinesis(records);
        }

        $("#recordsSentMessage").text(totalRecordsSent.toString() + " records sent to Kinesis.");
    }

    function sendToKinesis(data){
    	
    	console.log("Inside sendToKinesis")
        if(streamType === "stream"){
            var payload = {
                "Records": data,
                "StreamName": streamName
            };

            kinesis.putRecords(payload, function(err, data) {
                if(err){
                    console.log(err, err.stack);
                }
                else{
                    console.log(data);
                }
            });
        } else {
            payload = {
                "Records": data,
                "DeliveryStreamName": streamName
            };

            var firehose = new AWS.Firehose();
            firehose.putRecordBatch(payload, function(err, data) {
                if(err) {
                    console.log(err, err.stack);
                }
                else {
                    console.log(data);
                }
            });
        }
        totalRecordsSent += data.length;
    }

    
}