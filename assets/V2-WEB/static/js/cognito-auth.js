/*global WildRydes _config AmazonCognitoIdentity AWSCognito*/

var application = window.DataLake || {};

(function scopeWrapper($) {
    var signinUrl = 'login.html';

    var poolData = {
        UserPoolId: _config.userPoolId,
        ClientId: _config.userPoolClientId
    };

    var userPool;

    if (!(_config.userPoolId &&
          _config.userPoolClientId &&
          _config.region.Value)) {
        $('#noCognitoMessage').show();
        return;
    }

    userPool = new AmazonCognitoIdentity.CognitoUserPool(poolData);

    if (typeof AWSCognito !== 'undefined') {
        AWSCognito.config.region = _config.region.Value;
    }

    application.signOut = function signOut() {
        userPool.getCurrentUser().signOut();
    };

    application.authToken = new Promise(function fetchCurrentAuthToken(resolve, reject) {
        var cognitoUser = userPool.getCurrentUser();

        if (cognitoUser) {
             localStorage.setItem('username',cognitoUser.getUsername());
            cognitoUser.getSession(function sessionCallback(err, session) {
                if (err) {
                    reject(err);
                } else if (!session.isValid()) {
                    resolve(null);
                } else {
                    resolve(session.getIdToken().getJwtToken());
                }
            });
        } else {
            resolve(null);
        }
    });


    /*
     * Cognito User Pool functions
     */

    function register(email, password, onSuccess, onFailure) {
        var dataEmail = {
            Name: 'email',
            Value: email
        };
        var attributeEmail = new AmazonCognitoIdentity.CognitoUserAttribute(dataEmail);

        userPool.signUp(email, password, [attributeEmail], null,
            function signUpCallback(err, result) {
                if (!err) {
                    onSuccess(result);
                } else {
                    onFailure(err);
                }
            }
        );
    }

    function signin(email, password, onSuccess, onFailure) {
        console.log('signin')
        var authenticationDetails = new AmazonCognitoIdentity.AuthenticationDetails({
            Username: email,
            Password: password
        });

        var cognitoUser = createCognitoUser(email);
        cognitoUser.authenticateUser(authenticationDetails, {
            onSuccess: onSuccess,
            onFailure: onFailure
        });
    }

    function verify(email, code, onSuccess, onFailure) {
        createCognitoUser(email).confirmRegistration(code, true, function confirmCallback(err, result) {
            if (!err) {
                onSuccess(result);
            } else {
                onFailure(err);
            }
        });
    }

    function createCognitoUser(email) {
        return new AmazonCognitoIdentity.CognitoUser({
            Username: email,
            Pool: userPool
        });
    }


    /*
     *  Event Handlers
     */

    $(function onDocReady() {
        $('#signinForm').submit(handleSignin);
        $('#registrationForm').submit(handleRegister);
        $('#verifyForm').submit(handleVerify);
    });

    function handleSignin(event) {
        event.preventDefault();
        var email = $('#emailInputSignin').val();
        var password = $('#passwordInputSignin').val();
         var encryptedAES = CryptoJS.AES.encrypt(password, "My Secret Passphrase");
         console.log('encryptedAES',encryptedAES)
         localStorage.setItem('secretKey',encryptedAES)
        
        signin(email, password,
            function signinSuccess() {
                toastr.success('Login successful!')
                console.log('Successfully Logged In');
               window.location.href = './angular/views/wizard.html';
        AWS.config.region =_config.region.Value; 

         var userPoolProviderName = _config.userPoolProviderName.Value;
           var obj = {
                [userPoolProviderName]: _getToken.idToken
            };           
        AWS.config.credentials = new AWS.CognitoIdentityCredentials({
        IdentityPoolId : _config.identityPoolId, // your identity pool id here
        //providerName=_config.userPoolProviderName.Value,
        //console.log('Provider Name: '+providerName);
        /*Logins : {
          'cognito-idp.us-west-2.amazonaws.com/us-west-2_2h1m38TGE':_getToken.idToken 
        }*/
        Logins : obj
    });

                
            },
            function signinError(err) {
                console.log('err', err, toastr);
                toastr.error(err)
            }
        );
    }

    function handleRegister(event) {
        var email = $('#emailInputRegister').val();
        var password = $('#passwordInputRegister').val();
        var password2 = $('#password2InputRegister').val();

        var onSuccess = function registerSuccess(result) {
            var cognitoUser = result.user;
            console.log('user name is ' + cognitoUser.getUsername());
            var confirmation = ('Registration successful. Please check your email inbox or spam folder for your verification code.');
            if (confirmation) {
                window.location.href = 'verify.html';
            }
        };
        var onFailure = function registerFailure(err) {
            toastr.error(err)
            //alert(err);
        };
        event.preventDefault();

        if (password === password2) {
            register(email, password, onSuccess, onFailure);
        } else {
             toastr.error('Passwords do not match')
            //alert('Passwords do not match');
        }
    }

    function handleVerify(event) {
        var email = $('#emailInputVerify').val();
        var code = $('#codeInputVerify').val();
        event.preventDefault();
        verify(email, code,
            function verifySuccess(result) {
                console.log('call result: ' + result);
                console.log('Successfully verified');
                toastr.success('Verification successful.', 'You will now be redirected to the login page.')
                window.location.href = 'login.html';
            },
            function verifyError(err) {
                alert(err);
            }
        );
    }
}(jQuery));
