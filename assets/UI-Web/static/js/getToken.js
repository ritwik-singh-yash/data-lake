var username=localStorage.getItem('username');	
var clientAppId=window._config.userPoolClientId;
var idTokenStr="CognitoIdentityServiceProvider."+clientAppId+"."+username+".idToken";
var idToken=localStorage.getItem(idTokenStr);
console.log("username::"+username);
console.log("clientAppId::"+clientAppId);
console.log("idTokenStr::"+idTokenStr);

window._getToken = {
	"username":username ,
	"clientAppId": clientAppId ,
	"idToken":idToken
		
		};