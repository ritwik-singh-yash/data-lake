var lambda_api = _config.api.Value;
console.log("===============lambda_api "+lambda_api);
var crawler_lambda_api = lambda_api+"redshift";
console.log("lambda_api "+lambda_api+ " "+ crawler_lambda_api);
var CognitoidToken=_getToken.idToken;
$(document).ready(
		function() {
			document.getElementById("next_button").addEventListener("click",
					function(event) {
						event.preventDefault();
						window.location.href = 'ccds.html'
					});
		});
window.onload = function() {
	document
			.getElementById("redshift_queries")
			.addEventListener(
					"click",
					function(event) {
						console.log("In function==="+crawler_lambda_api);
						event.preventDefault();
						$.ajax({
									method : 'GET',
									url : crawler_lambda_api,
									headers: { 'Authorization':CognitoidToken},
									success : completeRequest,
									error : function ajaxError(jqXHR,
											textStatus, errorThrown) {
										console.error(
												'Error requesting ride: ',
												textStatus, ', Details: ',
												errorThrown);
										console.error('Response: ',
												jqXHR.responseText);
										alert('An error occured when requesting your unicorn:\n'
												+ jqXHR.responseText);
									}
								})
					});

	function completeRequest(result) {
		var res1 = JSON.stringify(result);
		console.log(res1)
		$('#lambda_response').append(res1);
	}
}