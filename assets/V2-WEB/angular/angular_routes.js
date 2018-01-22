var app = angular.module('myApp',['toastr','ngMaterial', 'md-steppers'])
console.log('routes', app.name)
/*app.config(
  ["$stateProvider","$urlRouterProvider", "$locationProvider",
    function($stateProvider, $urlRouterProvider, $locationProvider) {
      //$locationProvider.hashPrefix(""); // by default '!'
      
 
      $stateProvider
        .state("home", {
          //url: "/",
         // parent: 'common',
          templateUrl: "test.html",
         // controller: "authController",
          abstract: true
        }).state('crm', { 
        url: '/crm',
        parent: 'home',
        //templateUrl: '/app/crm/crm.html',
        template: '<div><h4>CRM</h4></div>',
        //controller: 'CrmCtrl'
      })
        $urlRouterProvider.otherwise('/crm');
    }
])*/