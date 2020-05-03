function toCamelCase(text) {
    let result = "";
    for (let index = 0, len = text.length; index < len; index++) {
        let currentStr = text[index];
        let tempStr = currentStr.toUpperCase();
        if (index !== 0) {
            tempStr = tempStr.substr(0, 1).toLowerCase() + tempStr.substr(1);
        }
        result += tempStr;
    }
    return result;
}

const urlOpinions = "https://parseapi.back4app.com/classes/opinions";

function processOpnFrmData(event) {
    event.preventDefault();
    const opinionForm = document.getElementById("opinionForm");
    const opinionInputs = opinionForm.elements;
    const name = opinionInputs["name"].value.trim();
    const email = opinionInputs["email"].value.trim();
    const pictureProfile = opinionInputs["pictureProfile"].value.trim();
    const preferencesToWatch = opinionInputs["preferToWatch"];
    let preferToWatch;
    for (let i = 0; i < preferencesToWatch.length; i++) {
        if (preferencesToWatch[i].checked) {
            preferToWatch = toCamelCase(preferencesToWatch[i].value);
            break;
        }
    }
    const keyword = opinionInputs["keyword"].value.trim();
    const willReturn = opinionInputs["willReturn"].checked;
    const comment = opinionInputs["comment"].value;

    const newOpinion = {
        name: name,
        email: email,
        pictureProfile: pictureProfile,
        preferToWatch: preferToWatch,
        keyword: keyword,
        willReturn: willReturn,
        comment: comment
    };

    const postReqSettings = //an object wih settings of the request
        {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json;charset=utf-8',
                'X-Parse-Application-Id': 'gWQviEB1U8Z5yGFFdY73EoHEmJAQRXFH4Lzmkt1Q',
                'X-Parse-REST-API-Key': 'uQ8jmaqknb54YULZ57ckCPB9Ia0ZmP4nGBkHq7I4'
            },
            body: JSON.stringify(newOpinion)
        };
    fetch(urlOpinions, postReqSettings)
        .then(response => {
            if (response.ok) {    //successful execution includes an error response from the server. So we have to check the return status of the response here.
                return Promise.resolve(); //we return a new promise with the response data in JSON to be processed
            } else { //if we get server error
                return Promise.reject(new Error(`Server answered with ${response.status}: ${response.statusText}.`)); //we return a rejected promise to be catched later
            }
        })
        .then(() => {
            window.router.operationType = 1;
            return Promise.resolve();
        })
        .catch(error => {
            window.router.operationType = 4;
            window.router.operationMessage = error;
        })
        .finally(()=>{
            window.location.hash = "#opinions";
        });
}


