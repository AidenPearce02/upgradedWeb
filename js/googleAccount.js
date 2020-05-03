let auth2 = {};

function signOut() {
    if (auth2.signOut) auth2.signOut();
    if (auth2.disconnect) auth2.disconnect();

}

function isSignedIn() {
    if(auth2.isSignedIn!==undefined) return auth2.isSignedIn.get();
    return false;
}

function userChanged(user) {
    document.getElementById("userImage").src = user.getBasicProfile().getImageUrl();
    let opinionAuthor = document.getElementById("name");
    let opinionEmail = document.getElementById("email");
    let articleAuthor = document.getElementById("author");
    let commentAuthor = document.getElementById("authorComment");
    if (opinionAuthor) {
        opinionAuthor.value = user.getBasicProfile().getName();
    }
    if(opinionEmail) {
        opinionEmail.value = user.getBasicProfile().getEmail();
    }
    if (articleAuthor) {
        articleAuthor.value = user.getBasicProfile().getName();
    }
    if (commentAuthor) {
        commentAuthor.value = user.getBasicProfile().getName();
    }
}


let updateSignIn = function () {
    let sgnd = isSignedIn();
    if (sgnd) {
        document.getElementById("SignInButton").classList.add("hiddenElm");
        document.getElementById("SignedIn").classList.remove("hiddenElm");
        document.getElementById("userImage").src = auth2.currentUser.get().getBasicProfile().getImageUrl();
    } else {
        document.getElementById("SignInButton").classList.remove("hiddenElm");
        document.getElementById("SignedIn").classList.add("hiddenElm");
    }
    let opinionAuthor = document.getElementById("name");
    let opinionEmail = document.getElementById("email");
    let articleAuthor = document.getElementById("author");
    let commentAuthor = document.getElementById("authorComment");
    if (opinionAuthor) {
        opinionAuthor.value = auth2.currentUser.get().getBasicProfile().getName();
    }
    if(opinionEmail) {
        opinionEmail.value = auth2.currentUser.get().getBasicProfile().getEmail();
    }
    if (articleAuthor) {
        articleAuthor.value = auth2.currentUser.get().getBasicProfile().getName();
    }
    if (commentAuthor) {
        commentAuthor.value = auth2.currentUser.get().getBasicProfile().getName();
    }
}

function startGSingIn() {
    gapi.load('auth2', function () {
        gapi.signin2.render('SignInButton', {
            'width': 120,
            'height': 40,
            'longtitle': false,
            'theme': 'dark',
            'onsuccess': onSuccess,
            'onfailure': onFailure
        });
        gapi.auth2.init().then( // called after OAuth 2.0 initialisation
            function () {
                console.log('init');
                auth2 = gapi.auth2.getAuthInstance();
                auth2.currentUser.listen(userChanged);
                auth2.isSignedIn.listen(updateSignIn);
                auth2.then(updateSignIn); //later after initialisation
            });
    });

}

function onSuccess(googleUser) {
    console.log('Logged in as: ' + googleUser.getBasicProfile().getName());
}

function onFailure(error) {
    console.log(error);
}