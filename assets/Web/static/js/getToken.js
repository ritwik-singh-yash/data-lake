var username=localStorage.getItem('username');	
var clientAppId=_config.userPoolClientId;
var idTokenStr="CognitoIdentityServiceProvider."+clientAppId+"."+username+".idToken";
var accessTokenStr="CognitoIdentityServiceProvider."+clientAppId+"."+username+".accessToken";
var idToken=localStorage.getItem(idTokenStr);
var accessToken=localStorage.getItem(accessTokenStr);
console.log("username::"+username);
console.log("clientAppId::"+clientAppId);
console.log("idTokenStr::"+idTokenStr);

window._getToken = {
	"username":username ,
	"clientAppId": clientAppId ,
	"idToken":idToken,
	"accessToken":accessToken
		
		};