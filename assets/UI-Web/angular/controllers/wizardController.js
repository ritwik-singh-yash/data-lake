app.controller('wizardController', function($scope, $http, $interval) {
  var lambda_api = _config.api.Value;
  var userPoolProviderName = _config.userPoolProviderName.Value;
  var obj = {
    [userPoolProviderName]: window._getToken.idToken
  };
  var crawler_lambda_api = lambda_api + "crawler";
  var transform_crawler_lambda_api = lambda_api + "transformcrawler";
  var redshift_raw_to_transform_ETL = lambda_api + "transformedredshift";
  var redshift_spectrum = lambda_api + "redshift";
  $scope.isCrawlerCreated = false
  $scope.checkCrawlerStatus = false
  $scope.show = {
    loader: false
  }
  var CognitoidToken = _getToken.idToken;
  $scope.selected = 0
  $scope.subSelected = 0
  $scope.stepper = {
    step1: false,
    step2: false,
    step3: false,
    step4: false,
    step5: true,
    step6: true,
    step7: true,
    step8: true
  }

  $scope.subStepper = {
    stepA: false,
    stepB: false,
    stepC: false
  }

  $scope.btn1 = false
  $scope.createCrawler = function() {
    console.log('createCrawler')
    $scope.show.loader = true
    $scope.btn1 = true
    $http({
      method: 'GET',
      url: crawler_lambda_api,
      headers: {
        'Authorization': CognitoidToken
      }
    }).then(function mySuccess(response) {
      $scope.checkCrawlerStatus = true
      var res1 = JSON.stringify(response);
      $scope.crawler = response.data['Crawler Name']
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
  $scope.$watch('isCrawlerCreated', function() {
    console.log('watch', $scope.isCrawlerCreated)
  });
  $scope.getCrawlerStatus = function() {
    console.log('getCrawlerStatus')
    AWS.config.region = _config.region.Value
    /*  var obj = {
          [userPoolProviderName]: window._getToken.idToken
      };*/
    AWS.config.credentials = new AWS.CognitoIdentityCredentials({
      IdentityPoolId: _config.identityPoolId, // your identity pool id here
      /* Logins: {
        
         'cognito-idp.us-east-1.amazonaws.com/us-east-1_XASugwS63': window._getToken.idToken
       } */
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
            if($scope.selected == 0) {
              $scope.stepper.step1 = true
              $scope.stepper.step2 = false
              $scope.selected = 1
            } if($scope.selected == 1) {
              $scope.subStepper.stepB = true
              $scope.subStepper.stepC = false
              $scope.subSelected = 2
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
    $scope.show.loader = true
    var raw_to_transform_ETL = lambda_api + "rawtransformetl";
    $http({
      method: 'GET',
      url: raw_to_transform_ETL,
      headers: {
        'Authorization': CognitoidToken
      }
    }).then(function mySuccess(res) {
      console.log('resu', res)
      console.log('resu data', res.data)
      var response = res.data
      response.customer.isSucceeded = false
      $scope.jobsArr.push(response.customer)
      response.product.isSucceeded = false
      $scope.jobsArr.push(response.product)
      response.Demographic.isSucceeded = false
      $scope.jobsArr.push(response.Demographic)
      response.order.isSucceeded = false
      $scope.jobsArr.push(response.order)
      $scope.stopJobStatus= $interval($scope.getJobStatus, 120000);
      //$scope.getJobStatus()
      console.log(' success result', response)
      console.log(' $scope.jobsArr', $scope.jobsArr)
    }, function myError(jqXHR, textStatus, errorThrown) {
      console.error('Error requesting ride: ', textStatus, ', Details: ', errorThrown);
      console.error('Response: ', jqXHR.responseText);
    });
  }
  $scope.getJobStatus = function() {
     $scope.index = 0;
    function next() {
      console.log('next', $scope.index , $scope.jobsArr.length)
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
          if(!$scope.jobsArr[$scope.index].isSucceeded) {
            glue.getJobRun(params, function(err, data) {
            if (err) console.log(err, err.stack); // an error occurred
            else {
              $scope.jobState = data.JobRun.JobRunState
              $scope.jobName = data.JobRun.JobName
              var status = JSON.stringify(data);
              var obj = JSON.parse(status);
              if(obj.JobRun.JobRunState == 'SUCCEEDED') {
                console.log('$scope.jobsArr[i]',obj)
                $scope.jobsArr[$scope.index].isSucceeded = true
              }
              if(obj.JobRun.JobRunState == 'FAILED') {
                $scope.jobState = obj.JobRun.JobRunState
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
          for(var i=0; i< $scope.jobsArr.length; i++) {
            if($scope.jobsArr[i].isSucceeded) {
              flag = true
            } else {
              flag = false
            }
          }
          if(flag) {
            console.log('in')
            $interval.cancel($scope.stopJobStatus);
            $scope.show.loader = false
             if($scope.subSelected == 0) {
              $scope.crawler = ''
              console.log('subSelected =0')
            $scope.subStepper.stepA = true
            $scope.subStepper.stepB = false
            $scope.subSelected = 1
          }
            if($scope.subSelected == 2) {
              $scope.jobName = ''
              $scope.jobState = ''
              console.log('subSelected =2')
                $scope.subStepper.stepC = true
                $scope.selected = 2
            }
            toastr.success('Jobs Created successfully!')
          }
      }
    }
    next()
  }
  $scope.redShiftJobArr = []
  $scope.createRedshiftJob = function() {
    $scope.show.loader = true
    
    $http({
      method: 'GET',
      url: redshift_raw_to_transform_ETL,
      headers: {
        'Authorization': CognitoidToken
      }
    }).then(function mySuccess(res) {
      console.log('resu', res)
      console.log('resu data', res.data)
      $scope.jobsArr = [{
        Jobname: res.data.customer_job[0],
        jobID: res.data.customer_job[1],
        isSucceeded: false
      },{
        Jobname: res.data.order_job[0],
        jobID: res.data.order_job[1],
        isSucceeded: false
      }]
      $scope.stopJobStatus= $interval($scope.getJobStatus, 120000);
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
        'Authorization': CognitoidToken
      }
    }).then(function mySuccess(res) {
      console.log('resu', res)
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
        'Authorization': CognitoidToken
      }
    }).then(function mySuccess(response) {
      var res1 = JSON.stringify(response);
      $scope.crawler = response.data[' crawler name :']
      console.log('crawler name', res1)
      $scope.stopTime = $interval($scope.getCrawlerStatus, 10000);
      console.log('Response received from API: ', response);
    }, function myError(response) {
      console.log('response', response)
      $scope.show.loader = false
      $scope.crawlerState = 'Identity token has expired'
    });
  }
  // $scope.stopJobStatus= $interval($scope.getJobStatus, 60000);
})