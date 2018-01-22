app.controller('wizardController', function($scope, $http, $interval) {
var lambda_api = _config.api.Value;
var userPoolProviderName = _config.userPoolProviderName;
var obj = {
  [userPoolProviderName]: localStorage.getItem("CognitoIdentityServiceProvider."+clientAppId+"."+localStorage.getItem('username')+".idToken")
};
console.log('localStorage.getIte',localStorage.getItem("CognitoIdentityServiceProvider."+clientAppId+"."+localStorage.getItem('username')+".idToken"))
var crawler_lambda_api = lambda_api + "crawler";
var redshift_crawler_lambda_api = lambda_api + "runredshiftcrawler";
var publish_crawler_lambda_api = lambda_api + "create_run_publish_crawler";
var transform_redshift_crawler_lambda_api = lambda_api + "run_crawler";
var transform_crawler_lambda_api = lambda_api + "transformcrawler";
var redshift_raw_to_transform_ETL = lambda_api + "transformedredshift";
var redshift_spectrum = lambda_api + "redshift";
var props = lambda_api + "prop";
$scope.kibanaUrl = _config.KibanaURL
$scope.athenaLink = "https://"+_config.region.Value+".console.aws.amazon.com/athena/home?region="+_config.region.Value+"#query"
$scope.isRedshiftNext = true
$scope.isRedshifttransform = true
$scope.isQuickSight = true
$scope.enableStep3ANext = true
$scope.enableStep3BNext = true
$scope.enableStep3CNext =  true
AWS.config.region = _config.region.Value
$scope.isCrawlerCreated = false
$scope.checkCrawlerStatus = false
$scope.show = {
  loader: false
}
 $scope.enableStep2Next = true
var CognitoidToken = _getToken.idToken;
console.log('COgnitoIDTOken From GetToken MEthod',CognitoidToken);
$scope.selected = 0
$scope.subSelected = 0
$scope.subRedshift = 0
$scope.subQuickSight = 0
var streamName =_config.firehose1,
  streamType = "firehose",
  rate = 500,
  sendDataHandle,
  totalRecordsSent = 0,
  cognitoRegion = "us-east-1",
  template =
  "{{name.customerID}},{{name.sku}},{{name.orderDate}},{{name.randomNumber(9)}},{{name.amountSpent}},{{name.latLong}},{{name.paymentMode}}";
$scope.stepper = {
  step1: false,
  step2: false,
  step3: false,
  step4: false,
  step5: false,
  step6: false,
  step7: false,
  step8: false
}
$scope.subStepper = {
  stepA: false,
  stepB: false,
  stepC: false
}
$scope.redshiftStepper = {
  stepA: false,
  stepB: false
}
$scope.quickSightStepper = {
  stepA: false,
  stepB: false
}
$scope.btn1 = false
$scope.btn2 = false
$scope.enableStreamNext = true
$scope.enableStartStream = true
console.log('aws', AWS)

$scope.nextStep = function(type,step) {
  console.log('nextStep', type, step)
  if(type == 'outer') {
    $scope.selected = step
      if(step == 2) {
        console.log('in if step 2')
        $scope.subSelected = 0
      }
  } 
  if(type == 'redshift') {
     $scope.subRedshift = 1
  } 

  if(type == 'quicksight') {
     $scope.subQuickSight = 1
  }

  if (type == 'inner') {
     console.log('else in')
    $scope.subSelected = step
  }
}

$scope.createProp = function() {
  $http({
    method: 'GET',
    url: props,
    headers: {
      'Authorization': localStorage.getItem("CognitoIdentityServiceProvider."+clientAppId+"."+localStorage.getItem('username')+".idToken")
    }
  }).then(function mySuccess(response) {
    $scope.selected = 1
    console.log('properties', response)
  }, function myError(response) {
    console.log('response', response)
  });
}

$scope.createCrawler = function() {
  console.log('createCrawler')
  $scope.show.loader = true
  $scope.btn1 = true
  $http({
    method: 'GET',
    url: crawler_lambda_api,
    headers: {
      'Authorization': localStorage.getItem("CognitoIdentityServiceProvider."+clientAppId+"."+localStorage.getItem('username')+".idToken")
    }
  }).then(function mySuccess(response) {
    $scope.checkCrawlerStatus = true
    var res1 = JSON.stringify(response);
    $scope.crawler = response.data['Crawler_Name']
    console.log('crawler name', $scope.crawler)
    $scope.show.loader = true
    $scope.stopTime = $interval($scope.getCrawlerStatus, 10000);
    console.log('Response received from API: ', response);
  }, function myError(response) {
    console.log('response', response)
    $scope.show.loader = false
    $scope.crawlerState = 'Identity token has expired'
  });
}

$scope.$watch('isCrawlerCreated', function() {
  console.log('watch', $scope.isCrawlerCreated)
});

$scope.getCrawlerStatus = function() {
  console.log('getCrawlerStatus')
  $scope.jobState = ''
  AWS.config.region = _config.region.Value
  AWS.config.credentials = new AWS.CognitoIdentityCredentials({
    IdentityPoolId: _config.identityPoolId, // your identity pool id here
    Logins: obj
  });
  AWS.config.credentials.get(function(err) {
    if (err) {
      console.log(err);
    }
    AWS.config.update({
      region: _config.region.Value
    });
    var glue = new AWS.Glue({
        apiVersion: '2017-03-31'
      }, region = _config.region.Value, endpoint = 'https://glue.' + _config.region.Value +
      '.amazonaws.com');
    console.log("in glue")
    var params = {
      Name: $scope.crawler /* required */
    };
    glue.getCrawler(params, function(err, data) {
      if (err) console.log(err, err.stack); // an error occurred
      else {
        console.log('getCrawler', data);
        var status = JSON.stringify(data);
        var obj1 = obj.Crawler;
        $scope.checkCrawlerStatus = false
        console.log(JSON.stringify(data.Crawler.State))
        $scope.crawlerState = data.Crawler.State
        if (data.Crawler.State == 'READY') {
          $scope.show.loader = false
          console.log('inside')
          toastr.success('Crawler Created successfully!')
          if ($scope.selected == 1) {
            console.log('selected = 1')
            //$scope.stepper.step2 = true
            //$scope.stepper.step3 = false
            //$scope.selected = 2
            $scope.enableStep2Next = false
            $scope.subSelected = 0
          }
          if ($scope.selected == 8 && $scope.subQuickSight == 0) {
            $scope.subQuickSight = 1
           } 
          if ($scope.selected == 6 && $scope.subRedshift == 0) {
            $scope.subRedshift = 1
           } else if ($scope.selected == 6 && $scope.subRedshift == 1) {
            $scope.selected = 7
           } else if($scope.selected == 2) {
            console.log('selected = else')
            //$scope.subStepper.stepB = true
            //$scope.subStepper.stepC = false
            $scope.enableStep3BNext = false
            //$scope.subSelected = 2
            $scope.jobName = ''
            $scope.jobState = ''
          }
          $scope.show.loader = false
          $interval.cancel($scope.stopTime);
        }
        $scope.$apply()
      }
    });
  });
}
$scope.jobsArr = []
/*Step 2 start*/
$scope.createETL = function() {

  $scope.jobsArr = []
  $scope.show.loader = true
  var raw_to_transform_ETL = lambda_api + "rawtransformetl";
  $http({
    method: 'GET',
    url: raw_to_transform_ETL,
    headers: {
      'Authorization': localStorage.getItem("CognitoIdentityServiceProvider."+clientAppId+"."+localStorage.getItem('username')+".idToken")
    }
  }).then(function mySuccess(res) {
    console.log('resu data', res.data)
    var response = res.data
    response.job_name_and_id.isSucceeded = false
    $scope.jobsArr.push(response.job_name_and_id)
    $scope.stopJobStatus = $interval($scope.getJobStatus, 120000);
    console.log(' success result', response)
    console.log(' $scope.jobsArr', $scope.jobsArr)
  }, function myError(jqXHR, textStatus, errorThrown) {
    console.error('Error requesting ride: ', textStatus, ', Details: ', errorThrown);
    console.error('Response: ', jqXHR.responseText);
  });
}
$scope.getJobStatus = function() {
  $scope.index = 0;
  $scope.crawlerState = ''
  function next() {
    console.log('next', $scope.index, $scope.jobsArr.length)
    if ($scope.index < $scope.jobsArr.length) {
      console.log('i========', $scope.index)
      AWS.config.region = _config.region.Value;
      AWS.config.credentials = new AWS.CognitoIdentityCredentials({
        IdentityPoolId: _config.identityPoolId, // your identity pool id here
        Logins: obj
      });
      AWS.config.credentials.get(function(err) {
        if (err) {
          console.log(err);
        }
        AWS.config.update({
          region: _config.region.Value
        });
        var glue = new AWS.Glue({
            apiVersion: '2017-03-31'
          }, region = _config.region.Value, endpoint = 'https://glue.' + _config.region.Value +
          '.amazonaws.com');
        var params = {
          JobName: $scope.jobsArr[$scope.index].Jobname,
          RunId: $scope.jobsArr[$scope.index].jobID,
          PredecessorsIncluded: true || false
        };
        if (!$scope.jobsArr[$scope.index].isSucceeded) {
          glue.getJobRun(params, function(err, data) {
            if (err) console.log(err, err.stack); // an error occurred
            else {
              $scope.jobState = data.JobRun.JobRunState
              $scope.jobName = data.JobRun.JobName
              var status = JSON.stringify(data);
              var obj = JSON.parse(status);
              if (obj.JobRun.JobRunState == 'SUCCEEDED') {
                console.log('$scope.jobsArr[i]', obj)
                $scope.jobsArr[$scope.index].isSucceeded = true
              }
              if (obj.JobRun.JobRunState == 'FAILED') {
                $scope.jobState = obj.JobRun.JobRunState
                $scope.show.loader = false
                toastr.error(obj.JobRun.ErrorMessage)
                return
              }
              $scope.$apply()
              $scope.index++
                next()
            }
          });
        } else {
          $scope.index++
            next()
        }
      });
    } else {
      console.log('else')
      var flag = false
      for (var i = 0; i < $scope.jobsArr.length; i++) {
        if ($scope.jobsArr[i].isSucceeded) {
          flag = true
        } else {
          flag = false
        }
      }
      if (flag) {
        console.log('in')
        $interval.cancel($scope.stopJobStatus);
        $scope.show.loader = false
        if ($scope.subSelected == 0) {
          $scope.crawler = ''
          console.log('subSelected =0')
         // $scope.subStepper.stepA = true
          //$scope.subStepper.stepB = false
          $scope.enableStep3ANext = false
          //$scope.subSelected = 1
        }
        if ($scope.subSelected == 2) {
          $scope.jobName = ''
          $scope.jobState = ''
          console.log('subSelected =2')
          //$scope.subStepper.stepC = true
          $scope.enableStep3CNext =  false
          //$scope.selected = 3
        } if($scope.selected == 6) {
          $scope.isRedshiftNext = false
        }
        if($scope.selected == 6 && $scope.subRedshift == 1) {
          $scope.isRedshifttransform = false
        }
        if($scope.selected == 8 &&  $scope.subQuickSight == 0) {
          $scope.isQuickSight = false
        }
        $scope.$apply()
        toastr.success('Jobs Created successfully!')
      }
    }
  }
  next()
}

$scope.redShiftJobArr = []
$scope.createRedshiftJob = function() {
  $scope.jobsArr = []
  $scope.show.loader = true
  $http({
    method: 'GET',
    url: redshift_raw_to_transform_ETL,
    headers: {
      'Authorization': localStorage.getItem("CognitoIdentityServiceProvider."+clientAppId+"."+localStorage.getItem('username')+".idToken")
    }
  }).then(function mySuccess(res) {
    console.log('resu', res)
    console.log('resu data', res.data)
    var response = res.data
    response.job_name_and_id.isSucceeded = false
    $scope.jobsArr.push(response.job_name_and_id)
   /* $scope.jobsArr = [{
      Jobname: res.data.customer_job[0],
      jobID: res.data.customer_job[1],
      isSucceeded: false
    }, {
      Jobname: res.data.order_job[0],
      jobID: res.data.order_job[1],
      isSucceeded: false
    }]
    $scope.stopJobStatus = $interval($scope.getJobStatus, 120000);*/
  }, function myError(jqXHR, textStatus, errorThrown) {
    console.error('Error requesting ride: ', textStatus, ', Details: ', errorThrown);
    console.error('Response: ', jqXHR);
  });
}
$scope.createRedShiftSpectrum = function() {
  $http({
    method: 'GET',
    url: redshift_spectrum,
    headers: {
      'Authorization': localStorage.getItem("CognitoIdentityServiceProvider."+clientAppId+"."+localStorage.getItem('username')+".idToken")
    }
  }).then(function mySuccess(res) {
    console.log('resu', res)
    var response = res.data
    response.job_name_and_id.isSucceeded = false
    $scope.jobsArr.push(response.job_name_and_id)
    $scope.stopJobStatus = $interval($scope.getJobStatus, 120000);
  }, function myError(jqXHR, textStatus, errorThrown) {
    console.error('Error requesting ride: ', textStatus, ', Details: ', errorThrown);
    console.error('Response: ', jqXHR.responseText);
  });
}
$scope.createTrCrawler = function() {
  $scope.jobsArr = []
  console.log('createTrCrawler')
  $scope.show.loader = true
  $http({
    method: 'GET',
    url: transform_crawler_lambda_api,
    headers: {
      'Authorization': localStorage.getItem("CognitoIdentityServiceProvider."+clientAppId+"."+localStorage.getItem('username')+".idToken")
    }
  }).then(function mySuccess(response) {
    var res1 = JSON.stringify(response);
    $scope.crawler = response.data['Crawler_Name']
    console.log('crawler name', res1)
    $scope.stopTime = $interval($scope.getCrawlerStatus, 10000);
    console.log('Response received from API: ', response);
  }, function myError(response) {
    console.log('response', response)
    $scope.show.loader = false
    $scope.crawlerState = 'Identity token has expired'
  });
}
$scope.startDataStream = function() {
  console.log("Inside STart");
  $scope.enableStartStream = false
  //$scope.show.loader = true
  $scope.show_text = true
  rate = 500;
  streamType = "firehose";
  var params = {
    IdentityPoolId: _config.identityPoolId,
    Logins: obj
  };
  AWS.config.credentials = new AWS.CognitoIdentityCredentials({
    IdentityPoolId: _config.identityPoolId, // your identity pool id here
    Logins: obj
  });
  AWS.config.credentials.get(function(err) {
    if (err) {
      console.log(err);
    }
    AWS.config.update({
      region: _config.region.Value
    });
  })
  // $scope.createData()
  $scope.sendDataHandle = $interval($scope.createData, 5000);
}
$scope.stopDataStream = function() {
  $interval.cancel($scope.sendDataHandle);
  $scope.show_text = false
  totalRecordsSent = 0;
  //$scope.selected = 4
}
$scope.createData = function() {
  console.log("Inside create data");
  var maxRecordsTotal = 500;
  var records = [];
  console.log('IDToken For Authorizer:',localStorage.getItem("CognitoIdentityServiceProvider."+clientAppId+"."+localStorage.getItem('username')+".idToken"));
  //clean up line breaks, and a handle older timestamp template format
  var template = getCleanedTemplate();
  console.log("Template:"+template);
  console.log("Rate:"+rate);
  for (var n = 0; n < rate; n++) {
    var data = faker.fake(template);
    var record = {
      "Data": data + '\n'
    };
    if (streamType === "stream") {
      record.PartitionKey = (Math.floor(Math.random() * (10000000000))).toString();
    }
    records.push(record);
    if (records.length === maxRecordsTotal) {
      sendToKinesis(records);
      records = [];
    }
  }
  if (records.length > 0) {
    sendToKinesis(records);
  }
}

function getCleanedTemplate() {
  return template.trim().replace(/\n/g, "").replace("{{current.timestamp}}", "{{date.now}}");
}
function sendToKinesis(data) {
  if (streamType === "stream") {
    var payload = {
      "Records": data,
      "StreamName": streamName
    };
    kinesis.putRecords(payload, function(err, data) {
      if (err) {
        console.log(err, err.stack);
      } else {
        console.log(data);
      }
    });
  } else {
    payload = {
      "Records": data,
      "DeliveryStreamName": streamName
    };
    var firehose = new AWS.Firehose({region :_config.region.Value});
    firehose.putRecordBatch(payload, function(err, data) {
      if (err) {
        console.log(err, err.stack);
      } else {
        console.log('kinesiss',data);
      }
    });
  }
  totalRecordsSent += data.length;
}
var kinesisApplication1Name = '';
var kinesisApplication2Name = '';
var kinesisApp1Id;

$scope.appInfo = [_config.kinesisapplicationname1,_config.kinesisapplicationname2]
$scope.startKinesisApp = function() {
  var params = {
    IdentityPoolId: _config.identityPoolId,
    Logins: obj
  };
  AWS.config.credentials = new AWS.CognitoIdentityCredentials({
    IdentityPoolId: _config.identityPoolId, // your identity pool id here
    Logins: obj
  });
  AWS.config.update({
    region: _config.region.Value
  });
  var kinesisanalytics = new AWS.KinesisAnalytics({
      apiVersion: '2015-08-14'
    }, region = _config.region.Value, endpoint = 'https://kinesisanalytics.' + _config.region.Value +
    'amazonaws.com');

 var i = 0;
  function next() {
    if(i< $scope.appInfo.length) {
        var describekinesisAppParam = {
          ApplicationName: $scope.appInfo[i] /* required */
        };
    kinesisanalytics.describeApplication(describekinesisAppParam, function(err, data) {
      if (err) console.log("Error Occured" + err.stack); // an error occurred
      else {
        kinesisApp1Id = data.ApplicationDetail.InputDescriptions[0].InputId;
        var StartKinesisAppparams = {
          ApplicationName: $scope.appInfo[i],
          InputConfigurations: [{
            Id: kinesisApp1Id,
            InputStartingPositionConfiguration: {
              InputStartingPosition: 'LAST_STOPPED_POINT'
            }
          }, ]
        };
        kinesisanalytics.startApplication(StartKinesisAppparams, function(err, data) {
          if (err) console.log(err, err.stack); // an error occurred
          else {
            i++
            next()
            $scope.appStarted = 'Application started'
            $scope.enableStreamNext = false
          }
        });
      }
    });
    }
  }
  next()

/*  for(var i = 0; i<$scope.appInfo.length; i++) {
    console.log('i<$scope.appInfo.length;', i,$scope.appInfo.length,i<$scope.appInfo.length)
    var describekinesisAppParam = {
      ApplicationName: $scope.appInfo[i] 
  };
    kinesisanalytics.describeApplication(describekinesisAppParam, function(err, data) {
      if (err) console.log("Error Occured" + err.stack); // an error occurred
      else {
        console.log("Describe application::: outer" +  $scope.appInfo.length, i, $scope.appInfo[i]);
        kinesisApp1Id = data.ApplicationDetail.InputDescriptions[0].InputId;
        console.log("Describe application:::", kinesisApp1Id);
        var StartKinesisAppparams = {
          ApplicationName: $scope.appInfo[i],
          InputConfigurations: [{
            Id: kinesisApp1Id,
            InputStartingPositionConfiguration: {
              InputStartingPosition: 'LAST_STOPPED_POINT'
            }
          }, ]
        };
        kinesisanalytics.startApplication(StartKinesisAppparams, function(err, data) {
          if (err) console.log(err, err.stack); // an error occurred
          else {
            console.log("kinesis start app response" + JSON.stringify(data));
            $scope.appStarted = 'Application started'
            $scope.enableStreamNext = false
          }
        });
      }
    });

  }*/
}

$scope.stopKinesisApp = function() {
  var params = {
    IdentityPoolId: _config.identityPoolId,
    Logins: obj
  };
  AWS.config.credentials = new AWS.CognitoIdentityCredentials({
    IdentityPoolId: _config.identityPoolId, // your identity pool id here
    Logins: obj
  });
  AWS.config.update({
    region: _config.region.Value
  });
  AWS.config.credentials.get(function(err){
       if (err) {
      alert(err);
      }
      else{
        for(var i = 0; i<$scope.appInfo.length; i++) {
           AWS.config.update({region:_config.region.Value});
            var kinesisanalytics = new AWS.KinesisAnalytics({
            apiVersion: '2015-08-14'
          }, region = _config.region.Value, endpoint = 'https://kinesisanalytics.' + _config.region.Value +
          'amazonaws.com');
            var params = {
            ApplicationName: $scope.appInfo[i] /* required */
                };
            kinesisanalytics.stopApplication(params, function(err, data) {
            if (err) console.log(err, err.stack); // an error occurred
            else     console.log("Stop Application Responce ::"+data);           // successful response
            });
        }
  } 
    });
}


/*Step 7 start*/
 $scope.runRedshiftAnalytics = function() {
   $scope.show.loader = true
    var run_analytics_queries_job = lambda_api + "redshiftanalyticsqueries";
    $http({
      method: 'GET',
      url: run_analytics_queries_job,
      headers: {
        'Authorization': localStorage.getItem("CognitoIdentityServiceProvider."+clientAppId+"."+localStorage.getItem('username')+".idToken")
      }
    }).then(function mySuccess(res) {
      $scope.jobsArr = []
      console.log('resu data', res.data)
      var response = res.data
      response.job_name_and_id.isSucceeded = false
      $scope.jobsArr.push(response.job_name_and_id)
      $scope.stopJobStatus = $interval($scope.getJobStatus, 120000);
      console.log(' success result', response)
      console.log(' $scope.jobsArr', $scope.jobsArr)
    }, function myError(jqXHR, textStatus, errorThrown) {
      console.error('Error requesting ride: ', textStatus, ', Details: ', errorThrown);
      console.error('Response: ', jqXHR.responseText);
    });
 }
 $scope.createRedshiftCrawler = function() {
   $scope.show.loader = true
  $scope.btn1 = true
  $http({
    method: 'GET',
    url: redshift_crawler_lambda_api,
    headers: {
      'Authorization': localStorage.getItem("CognitoIdentityServiceProvider."+clientAppId+"."+localStorage.getItem('username')+".idToken")
    }
  }).then(function mySuccess(response) {
    $scope.checkCrawlerStatus = true
    var res1 = JSON.stringify(response);
    $scope.crawler = response.data['Crawler_Name']
    console.log('crawler name', $scope.crawler)
    $scope.show.loader = true
    //$scope.getCrawlerStatus()
    $scope.stopTime = $interval($scope.getCrawlerStatus, 10000);
    console.log('Response received from API: ', response);
  }, function myError(response) {
    console.log('response', response)
    $scope.show.loader = false
    $scope.crawlerState = 'Identity token has expired'
  });
 }

 $scope.redShiftToTransformCopy = function() {
   $scope.show.loader = true
    var redshift_transform_copy = lambda_api + "redshifttotransformcopy";
    $http({
      method: 'GET',
      url: redshift_transform_copy,
      headers: {
        'Authorization': localStorage.getItem("CognitoIdentityServiceProvider."+clientAppId+"."+localStorage.getItem('username')+".idToken")
      }
    }).then(function mySuccess(res) {
      $scope.jobsArr = []
      console.log('resu data', res.data)
      var response = res.data
      response.job_name_and_id.isSucceeded = false
      $scope.jobsArr.push(response.job_name_and_id)
      $scope.stopJobStatus = $interval($scope.getJobStatus, 120000);
      console.log(' success result', response)
      console.log(' $scope.jobsArr', $scope.jobsArr)
    }, function myError(jqXHR, textStatus, errorThrown) {
      console.error('Error requesting ride: ', textStatus, ', Details: ', errorThrown);
      console.error('Response: ', jqXHR.responseText);
    });
 }

 $scope.runTransformBucketCrawler = function() {
   $http({
    method: 'GET',
    url: transform_redshift_crawler_lambda_api,
    headers: {
      'Authorization': localStorage.getItem("CognitoIdentityServiceProvider."+clientAppId+"."+localStorage.getItem('username')+".idToken")
    }
  }).then(function mySuccess(response) {
    $scope.checkCrawlerStatus = true
    var res1 = JSON.stringify(response);
    $scope.crawler = response.data['Crawler_Name']
    console.log('crawler name', $scope.crawler)
    $scope.show.loader = true
    //$scope.getCrawlerStatus()
    $scope.stopTime = $interval($scope.getCrawlerStatus, 10000);
    console.log('Response received from API: ', response);
  }, function myError(response) {
    console.log('response', response)
    $scope.show.loader = false
    $scope.crawlerState = 'Identity token has expired'
  });
 }
/*Step 9 start*/
 $scope.runTransformToPublishJob = function() {
   $scope.show.loader = true
    var run_transform_to_publish_job = lambda_api + "run_transform_to_publish_job";
    $http({
      method: 'GET',
      url: run_transform_to_publish_job,
      headers: {
        'Authorization': localStorage.getItem("CognitoIdentityServiceProvider."+clientAppId+"."+localStorage.getItem('username')+".idToken")
      }
    }).then(function mySuccess(res) {
      $scope.jobsArr = []
      console.log('resu data', res.data)
      var response = res.data
      response.job_name_and_id.isSucceeded = false
      $scope.jobsArr.push(response.job_name_and_id)
      $scope.stopJobStatus = $interval($scope.getJobStatus, 120000);
      console.log(' success result', response)
      console.log(' $scope.jobsArr', $scope.jobsArr)
    }, function myError(jqXHR, textStatus, errorThrown) {
      console.error('Error requesting ride: ', textStatus, ', Details: ', errorThrown);
      console.error('Response: ', jqXHR.responseText);
    });
 }

 $scope.createRunPublishCrawler = function() {
   $http({
    method: 'GET',
    url: publish_crawler_lambda_api,
    headers: {
      'Authorization': localStorage.getItem("CognitoIdentityServiceProvider."+clientAppId+"."+localStorage.getItem('username')+".idToken")
    }
  }).then(function mySuccess(response) {
    $scope.checkCrawlerStatus = true
    var res1 = JSON.stringify(response);
    $scope.crawler = response.data['Crawler_Name']
    console.log('crawler name', $scope.crawler)
    $scope.show.loader = true
    //$scope.getCrawlerStatus()
    $scope.stopTime = $interval($scope.getCrawlerStatus, 10000);
    console.log('Response received from API: ', response);
  }, function myError(response) {
    console.log('response', response)
    $scope.show.loader = false
    $scope.crawlerState = 'Identity token has expired'
  });
 }
  /*$scope.refreshToken = function() {
      AWS.config.credentials.get(function(err){
       if (err) {
      alert(err);
      }
      else{
      AWS.config.update({region:_config.region.Value});
      AWS.config.credentials.refresh((error) => {
            if (error) {
                console.error(error);
            } else {
                console.log('inside refresh token ');
            }
        });
      }
    }); 
  }*/
  
   $scope.refreshToken = function() {
    var encryptedAES = localStorage.getItem('secretKey')
    var decryptedBytes = window.CryptoJS.AES.decrypt(encryptedAES, "My Secret Passphrase");
    var pass = decryptedBytes.toString(window.CryptoJS.enc.Utf8);
    var authData = {
      UserName: _getToken.username,
      Password: pass
        };
    var authDetails = new AmazonCognitoIdentity.AuthenticationDetails(authData);    
    var poolData = {
            UserPoolId: window._config.userPoolId,
            ClientId:window._config.userPoolClientId
        };

        var userPool = new AmazonCognitoIdentity.CognitoUserPool(poolData);
            var userData = {
            Username: window._getToken.username,
            Pool: userPool
        };
          cognitoUser = new AmazonCognitoIdentity.CognitoUser(userData);
             cognitoUser.authenticateUser( authDetails, {
            onSuccess: function(result) {
                var logins = {};
        var userPoolProviderName = _config.userPoolProviderName;
        var obj_refresh = {
          [userPoolProviderName]: result.getIdToken().getJwtToken()
        };           
                //logins["cognito-idp." + window._config.region.Value + ".amazonaws.com/" + window._config.userPoolId] = result.getIdToken().getJwtToken();

                var params = {
                    //IdentityPoolId: "us-west-2:c7dba9fa-7110-48a0-8aeb-541f38d3dd67",
                     IdentityPoolId: _config.identityPoolId, 
                    Logins:obj_refresh
                }
                AWS.config.region = window._config.region.Value;
                AWSCognito.config.region = window._config.region.Value;

                AWS.config.credentials = new AWS.CognitoIdentityCredentials(params);

                AWS.config.credentials.get(function(refreshErr) {
                    if(refreshErr) {
                        console.error(refreshErr);
                    }
                    else {
                      obj = {
                        [userPoolProviderName]: localStorage.getItem("CognitoIdentityServiceProvider."+clientAppId+"."+localStorage.getItem('username')+".idToken")
                      };
                      console.log("inside AWS.config.credentials in refresh");
                  AWS.config.credentials.refresh((error) => {
              if (error) {
                console.error(error);
            } else {
              console.log('inside refresh token ');
              }
          });

                    }
                 });
            },
            onFailure: function(err) {
               alert(err);
            }
       });
  }
  $scope.resfresh = $interval($scope.refreshToken, 900000);
});


