

var lambda_api=_config.api.Value;
console.log("===============lambda_api"+lambda_api);
var raw_to_transform_ETL = lambda_api+"rawtransformetl";

var CognitoidToken=_getToken.idToken;
$(document).ready(function() {
document.getElementById("next_button").addEventListener("click", function(event){
	event.preventDefault();
	window.location.href = 'transformcrawler.html'
	});    

});
window.onload = function() {
	document.getElementById("ETL_transform").addEventListener("click", function(event){
		event.preventDefault();
        $.ajax({
            method: 'GET',
            url: raw_to_transform_ETL,
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
		var res1=JSON.stringify(result);
		$('#lambda_response').append(res1);  
    }
}