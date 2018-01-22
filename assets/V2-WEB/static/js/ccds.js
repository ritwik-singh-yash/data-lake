var lambda_api=_config.api.Value;

window.onload = function() {
	document.getElementById("call_lambda").addEventListener("click", function(event){
		event.preventDefault();
        $.ajax({
            method: 'GET',
            url:  lambda_api,
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
		
/*	       for (var i=0; i<result.length; i++) {
	    	   alert(result[i]);
	    	   var row=$('<p>'+result[i]+'</p>');
	    	   $('#lambda_response').append(row);
	       }*/
		var res1=JSON.stringify(result);
		  $('#lambda_response').append(res1);
		//var res2=result.lambda_execution_role reded from s3
        console.log('Response received from API: ', result);
		
		/* $('#lambda_response').append($('<p>' + result.resource_bucket_name readed from s3 + '</p>');
		 $('#lambda_response').append($('<p>' + result.lambda_execution_role reded from s3 + '</p>');
*/
    }
	
	
	
}