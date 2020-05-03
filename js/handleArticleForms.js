const mainTag = 'MBaAMCaOTVN';

function showFileUpload() {
    let btShowFileUpload = document.getElementById('btShowFileUpload');
    btShowFileUpload.disabled = true;
    let fsetFileUpload = document.getElementById('fsetFileUpload');
    fsetFileUpload.classList.remove("hiddenElm");
    fsetFileUpload.style.display = "flex";
    let flElm = document.getElementById('flElm');
    flElm.addEventListener('change', () => {
        let fileName = flElm.files[0].name;
        let nextSibling = flElm.nextElementSibling
        nextSibling.innerText = fileName
    });
}

function cancelFileUpload() {
    let btShowFileUpload = document.getElementById('btShowFileUpload');
    btShowFileUpload.disabled = false;
    let fsetFileUpload = document.getElementById('fsetFileUpload');
    fsetFileUpload.classList.add("hiddenElm");
    fsetFileUpload.style.display = "none";
}

function uploadImg(serverUrl) {
    const files = document.getElementById("flElm").files;
    if (files.length > 0) {
        const imgLinkElement = document.getElementById("imageLink");
        //1. Gather  the image file data
        let imgData = new FormData();     //obrazok su binarne udaje, preto FormData (pouzitelne aj pri upload-e viac suborov naraz)//and image is binary data, that's why we use FormData (it works for multiple file upload, too)
        imgData.append("file", files[0]); //beriem len prvy obrazok, ved prvok formulara by mal povolit len jeden//takes only the first file (image)
        //2. Set up the request
        const postReqSettings = //an object wih settings of the request
            {
                method: 'POST',
                body: imgData //FormData object, not JSON this time.
            };
        //3. Execute the request
        fetch(`${serverUrl}/fileUpload`, postReqSettings)  //now we need the second parameter, an object wih settings of the request.
            .then(response => {      //fetch promise fullfilled (operation completed successfully)
                if (response.ok) {    //successful execution includes an error response from the server. So we have to check the return status of the response here.
                    return response.json(); //we return a new promise with the response data in JSON to be processed
                } else { //if we get server error
                    return Promise.reject(new Error(`Server answered with ${response.status}: ${response.statusText}.`)); //we return a rejected promise to be catched later
                }
            })
            .then(responseJSON => { //here we process the returned response data in JSON ...
                imgLinkElement.value = responseJSON["fullFileUrl"];
                cancelFileUpload();
            })
            .catch(error => { ////here we process all the failed promises
                window.alert(`Image uploading failed. ${error}.`);
            });
    } else {
        window.alert("Please, choose an image file.");
    }
}

function getDataFrmForm() {
    const articleForm = document.getElementById("articleForm");
    const articleInputs = articleForm.elements;
    const articleData = {
        title: articleInputs["title"].value.trim(),
        content: articleInputs["content"].value.trim(),
        author: articleInputs["author"].value.trim(),
        imageLink: articleInputs["imageLink"].value.trim(),
        tags: articleInputs["tags"].value.trim()
    };
    if (!(articleData.title && articleData.content)) {
        window.alert("Please, enter article title and content");
        return;
    }
    if (!articleData.author) {
        articleData.author = "Anonymous";
    }
    if (!articleData.imageLink) {
        delete articleData.imageLink;
    }
    if (!articleData.tags) {
        delete articleData.tags;
    } else {
        articleData.tags = articleData.tags.split(","); //zmeni retazec s tagmi na pole. Oddelovac poloziek je ciarka.
        //changes the string with tags to array. Comma is the separator
        articleData.tags = articleData.tags.map(tag => tag.trim()); //odstráni prázdne znaky na začiatku a konci každého kľúčového slova
        //deletes white spaces from the beginning and the end of each tag string
        //newArtData.tags=newArtData.tags.map(function(tag) {return tag.trim()}); //alternativny sposob zapisu predch. prikazu
        //an alternative way of writing the previous command
        articleData.tags = articleData.tags.filter(tag => tag); //odstráni tie tagy, ktoré sú teraz len prázdne reťazce
        //removes those tags that are now just empty strings
        if (articleData.tags.length === 0) {
            delete articleData.tags;
        }
    }
    return articleData;
}

function processArtAddFrmData(event, serverUrl) {
    event.preventDefault();
    //1. Gather and check the form data
    const articleData = getDataFrmForm();
    //2. Set up the request
    const postReqSettings = //an object wih settings of the request
        {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json;charset=utf-8'
            },
            body: JSON.stringify(articleData)
        };
    fetch(`${serverUrl}/article/`, postReqSettings)  //now we need the second parameter, an object wih settings of the request.
        .then(response => {      //fetch promise fullfilled (operation completed successfully)
            if (response.ok) {    //successful execution includes an error response from the server. So we have to check the return status of the response here.
                return response.json(); //we return a new promise with the response data in JSON to be processed
            } else { //if we get server error
                return Promise.reject(new Error(`Server answered with ${response.status}: ${response.statusText}.`)); //we return a rejected promise to be catched later
            }
        })
        .then(responseJSON => {
            return Promise.resolve(fetch(`${serverUrl}/article/${responseJSON.id}/tag/${mainTag}`, {method: 'PUT'}));
        })
        .then(() => { //here we process the returned response data in JSON ...
            window.router.operationType = 1;
            return Promise.resolve();
        })
        .catch(error => { ////here we process all the failed promises
            window.router.operationType = 4;
            window.router.operationMessage = error;
        })
        .finally(() => window.location.hash = `#articles/0`);
}

function processArtEditFrmData(event, articleId, currentPage, serverUrl) {
    event.preventDefault();
    //1. Gather and check the form data
    const articleData = getDataFrmForm();
    //2. Set up the request
    const postReqSettings = //an object wih settings of the request
        {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json;charset=utf-8'
            },
            body: JSON.stringify(articleData)
        };
    //3. Execute the request
    fetch(`${serverUrl}/article/${articleId}`, postReqSettings)  //now we need the second parameter, an object wih settings of the request.
        .then(response => {      //fetch promise fullfilled (operation completed successfully)
            if (response.ok) {    //successful execution includes an error response from the server. So we have to check the return status of the response here.
                return response.json(); //we return a new promise with the response data in JSON to be processed
            } else { //if we get server error
                return Promise.reject(new Error(`Server answered with ${response.status}: ${response.statusText}.`)); //we return a rejected promise to be catched later
            }
        })
        .then(responseJSON => {
            return Promise.resolve(fetch(`${serverUrl}/article/${responseJSON.id}/tag/${mainTag}`, {method: 'PUT'}));
        })
        .then(() => { //here we process the returned response data in JSON ...
            window.router.operationType = 2;
        })
        .catch(error => { ////here we process all the failed promises
            window.router.operationType = 4;
            window.router.operationMessage = error;
        })
        .finally(() => window.location.hash = `#article/${articleId}/${currentPage}`);
}