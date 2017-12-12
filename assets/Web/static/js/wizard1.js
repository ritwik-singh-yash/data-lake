var lambda_api=_config.api.Value;
var crawler_lambda_api=lambda_api+"crawler";
var CognitoidToken=_getToken.idToken;
console.log(lambda_api);
console.log(crawler_lambda_api);
$(document).ready(function() {
document.getElementById("navigate_to_ccds").addEventListener("click", function(event){
	event.preventDefault();
	window.location.href = 'rawtotransformETL.html'
	});    

});
window.onload = function() {
	document.getElementById("create_raw_crawler").addEventListener("click", function(event){
		event.preventDefault();
        $.ajax({
            method: 'GET',
            url: crawler_lambda_api,
			headers: { 'Authorization':CognitoidToken},
            success: completeRequest,
            error: function ajaxError(jqXHR, textStatus, errorThrown) {
                console.error('Error requesting ride: ', textStatus, ', Details: ', errorThrown);
                console.error('Response: ', jqXHR.responseText);
                alert('An error occured when requesting your unicorn:\n' + jqXHR.responseText);
            }
        })
		
		
		});    
		
function completeRequest(result) {
	alert("Inside complete request");
	var res1=JSON.stringify(result);
		  $('#lambda_response').append(res1);
		//var res2=result.lambda_execution_role reded from s3
        console.log('Response received from API: ', result);
}
}