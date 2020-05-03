function getDataFrmComment() {
    const commentForm = document.getElementById("commentForm");
    const commentInputs = commentForm.elements;
    const commentData = {
        author: commentInputs["authorComment"].value.trim(),
        text: commentInputs["contentComment"].value.trim()
    };
    if (!commentData.text) {
        window.alert("Please, enter comment content");
        return;
    }
    if (!commentData.author) {
        commentData.author = "Anonymous";
    }
    return commentData;
}

const serverUrl = "https://wt.kpi.fei.tuke.sk/api";

function edit(event) {
    event.preventDefault();
    let commentForm = document.getElementById("commentForm");
    let articleId = commentForm.articleId;
    let commentId = commentForm.commentId;
    let commentData = getDataFrmComment(commentForm);
    const putReqSettings = //an object wih settings of the request
        {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json;charset=utf-8'
            },
            body: JSON.stringify(commentData)
        };
    fetch(`${serverUrl}/comment/${commentId}`, putReqSettings)  //now we need the second parameter, an object wih settings of the request.
        .then(response => {      //fetch promise fullfilled (operation completed successfully)
            if (response.ok) {    //successful execution includes an error response from the server. So we have to check the return status of the response here.
                return response.json(); //we return a new promise with the response data in JSON to be processed
            } else { //if we get server error
                return Promise.reject(new Error(`Server answered with ${response.status}: ${response.statusText}.`)); //we return a rejected promise to be catched later
            }
        })
        .then(() => { //here we process the returned response data in JSON ...
            window.router.operationType = 2;
            return Promise.resolve();
        })
        .catch(error => { ////here we process all the failed promises
            window.router.operationType = 4;
            window.router.operationMessage = error;
        })
        .finally(() => {
            window.location.hash = `#artComment/${articleId}/0`;
            backToComments();
        });
}

function add(event) {
    event.preventDefault();
    let commentForm = document.getElementById("commentForm");
    let articleId = commentForm.articleId;
    let commentData = getDataFrmComment(commentForm);
    const postReqSettings = //an object wih settings of the request
        {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json;charset=utf-8'
            },
            body: JSON.stringify(commentData)
        };
    fetch(`${serverUrl}/article/${articleId}/comment`, postReqSettings)  //now we need the second parameter, an object wih settings of the request.
        .then(response => {      //fetch promise fullfilled (operation completed successfully)
            if (response.ok) {    //successful execution includes an error response from the server. So we have to check the return status of the response here.
                return response.json(); //we return a new promise with the response data in JSON to be processed
            } else { //if we get server error
                return Promise.reject(new Error(`Server answered with ${response.status}: ${response.statusText}.`)); //we return a rejected promise to be catched later
            }
        })
        .then(() => { //here we process the returned response data in JSON ...
            window.router.operationType = 1;
            return Promise.resolve();
        })
        .catch(error => { ////here we process all the failed promises
            window.router.operationType = 4;
            window.router.operationMessage = error;
        })
        .finally(() => {
            window.location.hash = `#artComment/${articleId}/0`;
            backToComments();
        });
}

function showForm(commentForm) {
    let comments = document.getElementById("comments");
    comments.classList.add("hiddenElm");
    let btShowAddCommentForm = document.getElementById("btShowAddCommentForm");
    btShowAddCommentForm.classList.add("hiddenElm");
    commentForm.classList.remove("hiddenElm");
}

function editComment(event, commentId, articleId) {
    event.preventDefault();
    let commentForm = document.getElementById("commentForm");
    let commentChildren = event.target.parentNode.parentNode.children;
    showForm(commentForm);
    let authorComment = document.getElementById("authorComment");
    let user = isSignedIn();
    if(user){
        authorComment.defaultValue = auth2.currentUser.get().getBasicProfile().getName();
    }
    else{
        authorComment.defaultValue = commentChildren[0].innerText;
    }
    let contentComment = document.getElementById("contentComment");
    contentComment.defaultValue = commentChildren[1].innerText;
    let submitComment = document.getElementById("submitComment");
    submitComment.innerText = "Edit Comment";
    commentForm.addEventListener("submit", edit);
    commentForm.articleId = articleId;
    commentForm.commentId = commentId;
}

function addComment(event, articleId) {
    event.preventDefault();
    let commentForm = document.getElementById("commentForm");
    showForm(commentForm);
    let authorComment = document.getElementById("authorComment");
    let user = isSignedIn();
    if(user){
        authorComment.value = auth2.currentUser.get().getBasicProfile().getName();
    }
    else{
        authorComment.value = "";
    }
    let submitComment = document.getElementById("submitComment");
    submitComment.innerText = "Add Comment";
    commentForm.addEventListener("submit", add);
    commentForm.articleId = articleId;
}

function deleteComment(event, idComment, idArticle) {
    event.preventDefault();
    const deleteReqSettings = //an object wih settings of the request
        {
            method: 'DELETE',
            headers: {
                'Content-Type': 'application/json;charset=utf-8'
            }
        };
    fetch(`${serverUrl}/comment/${idComment}`, deleteReqSettings)  //now we need the second parameter, an object wih settings of the request.
        .then(response => {      //fetch promise fullfilled (operation completed successfully)
            if (response.ok) {    //successful execution includes an error response from the server. So we have to check the return status of the response here.
                return Promise.resolve(); //we return a new promise with the response data in JSON to be processed
            } else { //if we get server error
                return Promise.reject(new Error(`Server answered with ${response.status}: ${response.statusText}.`)); //we return a rejected promise to be catched later
            }
        })
        .then(() => { //here we process the returned response data in JSON ...
            window.router.operationType = 3;
            return Promise.resolve();
        })
        .catch(error => { ////here we process all the failed promises
            window.router.operationType = 4;
            window.router.operationMessage = error;
        })
        .finally(()=>window.location.hash = `#artComment/${idArticle}/0`);
}

function backToComments() {
    let comments = document.getElementById("comments");
    comments.classList.remove("hiddenElm");
    let btShowAddCommentForm = document.getElementById("btShowAddCommentForm");
    btShowAddCommentForm.classList.remove("hiddenElm");
    let commentForm = document.getElementById("commentForm");
    commentForm.removeEventListener("submit", add);
    commentForm.removeEventListener("submit", edit);
    commentForm.reset();
    commentForm.classList.add("hiddenElm");
}