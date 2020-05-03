//an array, defining the routes
export default [
    {
        hash: "welcome",
        target: "router-view",
        getTemplate: createHTML4Welcome
    },
    {
        hash: "opinions",
        target: "router-view",
        getTemplate: createHTML4Opinions
    },
    {
        hash: "addOpinion",
        target: "router-view",
        getTemplate: createHTML4AddOpinion

    },
    {
        hash: "articles",
        target: "router-view",
        getTemplate: fetchAndDisplayArticles
    },
    {
        hash: "article",
        target: "router-view",
        getTemplate: fetchAndDisplayArticleDetail
    },
    {
        hash: "artEdit",
        target: "router-view",
        getTemplate: editArticle
    },
    {
        hash: "artDelete",
        target: "router-view",
        getTemplate: deleteArticle
    },
    {
        hash: "artInsert",
        target: "router-view",
        getTemplate: addArticle
    },
    {
        hash: "artComment",
        target: "comments",
        getTemplate: showComments
    },
    {
        hash: "404",
        target: "router-view",
        getTemplate: show404
    }
];

const keywords = ['Anime', 'Movies', 'Cartoons'];
const urlBase = "https://wt.kpi.fei.tuke.sk/api";
const articlesPerPage = 20;
const commentsPerPage = 10;
const mainTag = 'MBaAMCaOTVN';
const OperationType = {
    NONE: 0,
    ADD: 1,
    EDIT: 2,
    DELETE: 3,
    ERROR: 4
};

function controlActiveTab(targetName) {
    let linksContainer = document.getElementById("navbarSupportedContent");
    let links = linksContainer.getElementsByClassName("nav-link");
    let target;
    for(let i=0;i<links.length;i++){
        if(links[i].getAttribute("href") === targetName){
            target = links[i];
            break;
        }
    }
    let current = document.getElementsByClassName("active");
    current[0].className = current[0].className.replace(" active", "");
    target.className += " active";
}

function controlIgnoredDiv(ignoredDivName) {
    let ignoredDiv = document.getElementById(ignoredDivName);
    if (ignoredDiv) {
        ignoredDiv.style.display = "none";
    }
}

function controlAlert(idDiv) {
    let alerts = document.getElementsByClassName("my-alert");
    let div = document.getElementById(idDiv);
    for(let i = 0; i < alerts.length; i++){
        if(alerts[i] && alerts[i].parentElement===div) {
            setTimeout(()=>{
                let fadeEffect = setInterval(function () {
                    if(alerts[i] !== undefined && alerts[i].parentElement===div){
                        if (!alerts[i].style.opacity) {
                            alerts[i].style.opacity = "1";
                        }
                        if (alerts[i].style.opacity > 0) {
                            alerts[i].style.opacity -= "0.0125";
                        } else {
                            alerts[i].style.display = "none";
                            clearInterval(fadeEffect);
                        }
                    }
                }, 20);
            }, 1000);
        }
    }
}

function show404(targetElm) {
    let main = document.getElementById(targetElm);
    main.innerHTML =
        document.getElementById("template-404").innerHTML;
}

function createHTML4Welcome(targetElm) {
    let main = document.getElementById(targetElm);
    let promise = new Promise(function (resolve) {
        resolve(main.innerHTML = document.getElementById("template-welcome").innerHTML);
    });
    promise.then(() => {
        let hero = document.getElementById("hero");
        let anthem = document.getElementById("anthem");
        let audio = document.getElementById("mad_scientist");
        let anthem_ukraine = document.getElementById("anthem_ukraine");
        if (hero) {
            hero.addEventListener("click", () => {
                audio.play();
                audio.volume = 0.2;
            });
        }
        if(anthem) {
            anthem.addEventListener("mouseover", () => {
                anthem_ukraine.muted = false;
            });
            anthem.addEventListener("mouseout", () => {
                anthem_ukraine.muted = true;
                anthem_ukraine.currentTime = 0;
            });
        }
        return Promise.resolve();
    });
}

function createHTML4AddOpinion(targetElm) {
    let main = document.getElementById(targetElm);
    let user = isSignedIn();
    let data = {
        author: "",
        email: ""
    };
    if (user) {
        data.author = auth2.currentUser.get().getBasicProfile().getName();
        data.email = auth2.currentUser.get().getBasicProfile().getEmail();
    }
    main.innerHTML =
        Mustache.render(document.getElementById("template-addOpinion").innerHTML,
            data);
}

function createHTML4Opinions(targetElm) {
    controlActiveTab("#opinions");
    let main = document.getElementById(targetElm);
    let opinions = [];
    const getReqSettings = //an object wih settings of the request
        {
            method: 'GET',
            headers: {
                'X-Parse-Application-Id': 'gWQviEB1U8Z5yGFFdY73EoHEmJAQRXFH4Lzmkt1Q',
                'X-Parse-REST-API-Key': 'uQ8jmaqknb54YULZ57ckCPB9Ia0ZmP4nGBkHq7I4'
            }
        };
    fetch(urlOpinions, getReqSettings)
        .then(response => {
            if (response.ok) {
                return response.json();
            } else {
                return Promise.reject(new Error(`Server answered with ${response.status}: ${response.statusText}.`));
            }
        })
        .then(responseJSON => {
            opinions = responseJSON["results"];
            if(router.operationType){
                if(router.operationType === OperationType.ADD){
                    opinions.isOperation = true;
                    opinions.operationStyle = "success";
                    opinions.operationMessage = "Opinion was successfully added on server";
                    router.operationType = OperationType.NONE;
                    window.router.operationMessage = "";
                }
                else if(router.operationType === OperationType.ERROR){
                    opinions.isOperation = true;
                    opinions.operationStyle = "danger";
                    opinions.operationMessage = window.router.operationMessage;
                    window.router.operationType = OperationType.NONE;
                    window.router.operationMessage = "";
                }
            }
            return Promise.resolve();
        })
        .then(() => {
            opinions.forEach(opinion => {
                opinion.createdDate = (new Date(opinion["createdAt"])).toDateString();
                opinion.willReturnMessage = opinion.willReturn ? "I will return to this page." : "Sorry, one visit was enough.";
                opinion.srcImage = (opinion.pictureProfile === '') ? "images/user-silhouette.png" : opinion.pictureProfile;
                opinion.preferToWatch = toCamelCase(opinion.preferToWatch);
                opinion.keywordClass = "";
                for (let index = 0; index < keywords.length; index++) {
                    if (keywords[index].value === opinion.keyword) {
                        opinion.keywordClass = opinion.keyword;
                        break;
                    }
                }
                opinion.keywordClass = opinion.keywordClass.toLowerCase();
            });
        })
        .catch(error => {
            opinions.isOperation = true;
            opinions.operationStyle = "danger";
            opinions.operationMessage = error;
            router.operationType = OperationType.NONE;
        })
        .finally(() => {
            main.innerHTML = Mustache.render(
                document.getElementById("template-opinions").innerHTML,
                opinions
            )
            return Promise.resolve();
        })
        .finally(()=>{
            controlAlert("opinions");
        });
}

function pagination(targetElm, current, total, smtPerPage) {
    const totalCount = Math.ceil(total / smtPerPage);
    if (current > 1) {
        targetElm.prev = current - 1;
    }
    if (current < totalCount) {
        targetElm.next = current + 1;
    }
    else if(current > totalCount){
        return totalCount;
    }
    return current;
}

function fetchAndDisplayArticles(targetElm, current) {
    controlActiveTab("#articles/0")
    let main = document.getElementById(targetElm);
    current = parseInt(current);
    if (current <= 0) {
        if (localStorage.currentPage) {
            current = localStorage.currentPage;
        } else {
            current = 1;
            localStorage.currentPage = current;
        }
        window.location.hash = `#articles/${current}`;
        return;
    }
    localStorage.currentPage = current;
    current = (current - 1) * articlesPerPage;
    let listArticles = [];
    const urlArticles = urlBase + "/article/?tag=" + mainTag + "&max=" + articlesPerPage + "&offset=" + current;
    fetch(urlArticles)
        .then(response => {
            if (response.ok) {
                return response.json();
            } else {
                return Promise.reject(new Error(`Failed to access the list of articles. 
                Server answered with ${response.status}: ${response.statusText}.`));
            }
        })
        .then(responseJSON => {
            listArticles = responseJSON["articles"];
            current = current / articlesPerPage + 1;
            let tempCurrent = pagination(listArticles, current, responseJSON["meta"]["totalCount"], articlesPerPage);
            if(current !== undefined && current > tempCurrent && tempCurrent !== 0){
                window.location.hash = `#articles/${tempCurrent}`;
                return Promise.reject("Wrong index");
            }
            if(window.router.operationType){
                if(window.router.operationType === OperationType.ADD){
                    listArticles.isOperation = true;
                    listArticles.operationStyle = "success";
                    listArticles.operationMessage = "Article was successfully added on server";
                    window.router.operationType = OperationType.NONE;
                    window.router.operationMessage = "";
                }
                else if(window.router.operationType === OperationType.DELETE){
                    listArticles.isOperation = true;
                    listArticles.operationStyle = "success";
                    listArticles.operationMessage = "Article was successfully deleted from server";
                    window.router.operationType = OperationType.NONE;
                    window.router.operationMessage = "";
                }
                else if(window.router.operationType === OperationType.ERROR){
                    listArticles.isOperation = true;
                    listArticles.operationStyle = "danger";
                    listArticles.operationMessage = window.router.operationMessage;
                    window.router.operationType = OperationType.NONE;
                    window.router.operationMessage = "";
                }
            }
            return Promise.resolve();
        })
        .then(() => {
            const urlArticle = urlBase + "/article";
            let requests = listArticles.map(
                article => fetch(urlArticle + "/" + article.id)
            );
            return Promise.all(requests);
        })
        .then(responses => {
            let failed = "";
            for (let response of responses) {
                if (!response.ok) failed += response.url + " ";
            }
            if (failed === "") {
                return responses;
            } else {
                return Promise.reject(new Error(`Failed to access the content of the articles with urls ${failed}.`));
            }
        })
        .then(responses => Promise.all(responses.map(resp => resp.json())))
        .then(articles => {
            articles.forEach((article, index) => {
                listArticles[index].content = article.content;
                listArticles[index].detailLink = '#article/' + article.id + '/' + current;
            });
            return Promise.resolve();
        })
        .then(() => {
            main.innerHTML = Mustache.render(
                document.getElementById("template-articles").innerHTML,
                listArticles
            )
            controlIgnoredDiv("gtx-trans");
            return Promise.resolve();
        })
        .then(()=>{
            controlAlert("articles");
        })
        .catch(error => {
            if(error !== "Wrong index") {
                const errMsgObj = {errMessage: error};
                main.innerHTML =
                    Mustache.render(
                        document.getElementById("template-articles-error").innerHTML,
                        errMsgObj
                    );
            }
        });
}

const ProcessType = {
    SHOW: 1,
    EDIT: 2
};

function fetchAndDisplayArticleDetail(targetElm, artIdFromHash, currentPageFromHash) {
    fetchAndProcessArticle(...arguments, ProcessType.SHOW);
}

function editArticle(targetElm, artIdFromHash, currentPageFromHash) {
    fetchAndProcessArticle(...arguments, ProcessType.EDIT);
}

function addArticle(targetElm) {
    let main = document.getElementById(targetElm);
    let article = {
        formTitle: "Add Article",
        formSubmitCall: `processArtAddFrmData(event,'${urlBase}')`,
        submitBtTitle: "Add article",
        urlBase: urlBase,
        backLink: `#articles/0`
    };
    let user = isSignedIn();
    if (user) {
        article.author = auth2.currentUser.get().getBasicProfile().getName();
    }
    main.innerHTML =
        Mustache.render(document.getElementById("template-article-form").innerHTML,
            article);
}

function deleteArticle(targetElm, artIdFromHash, currentPageFromHash) {
    const url = `${urlBase}/article/${artIdFromHash}`;
    const deleteReqSettings = //an object wih settings of the request
        {
            method: 'DELETE',
            headers: {
                'Content-Type': 'application/json;charset=utf-8'
            }
        };
    fetch(url, deleteReqSettings)
        .then(response => {
            if (response.ok) {
                return Promise.resolve();
            } else {
                return Promise.reject(new Error(`Server answered with ${response.status}: ${response.statusText}.`));
            }
        })
        .then(() => {
            window.router.operationType = 3;
            return Promise.resolve();
        })
        .catch(error => { ////here we process all the failed promises
            window.router.operationType = 4;
            window.router.operationMessage = error;
        })
        .finally(() => window.location.hash = `#articles/${currentPageFromHash}`);
}

function fetchAndProcessArticle(targetElm, artIdFromHash, currentPageFromHash, processType) {
    let main = document.getElementById(targetElm);
    const url = `${urlBase}/article/${artIdFromHash}`;
    let article;
    fetch(url)
        .then(response => {
            if (response.ok) {
                return response.json();
            } else { //if we get server error
                return Promise.reject(new Error(`Server answered with ${response.status}: ${response.statusText}.`));
            }
        })
        .then(responseJSON => {
            if (processType === ProcessType.EDIT) {
                responseJSON.formTitle = "Article Edit";
                responseJSON.formSubmitCall =
                    `processArtEditFrmData(event,${artIdFromHash},${currentPageFromHash},'${urlBase}')`;
                responseJSON.submitBtTitle = "Save article";
                responseJSON.urlBase = urlBase;
                responseJSON.backLink = `#article/${artIdFromHash}/${currentPageFromHash}`;
                let user = isSignedIn();
                if (user) {
                    responseJSON.author = auth2.currentUser.get().getBasicProfile().getName();
                }
                const index = responseJSON["tags"].indexOf(mainTag);
                if (index > -1) {
                    responseJSON["tags"].splice(index, 1);
                }
                main.innerHTML =
                    Mustache.render(
                        document.getElementById("template-article-form").innerHTML,
                        responseJSON
                    );
                return Promise.reject("Edit");
            } else if (processType === ProcessType.SHOW) {
                responseJSON.backLink = `#articles/${currentPageFromHash}`;
                responseJSON.editLink = `#artEdit/${responseJSON.id}/${currentPageFromHash}`;
                responseJSON.deleteLink = `#artDelete/${responseJSON.id}/${currentPageFromHash}`;
                responseJSON.dateCreated = new Date(responseJSON.dateCreated).toDateString();
                responseJSON.lastUpdated = new Date(responseJSON.lastUpdated).toDateString();
                if(window.router.operationType === OperationType.EDIT){
                    responseJSON.isOperationArticle = true;
                    responseJSON.operationStyle = "success";
                    responseJSON.operationMessage = "Article was successfully edited";
                    window.router.operationType = OperationType.NONE;
                    window.router.operationMessage = "";
                }
                else if(window.router.operationType === OperationType.ERROR){
                    responseJSON.isOperationArticle = true;
                    responseJSON.operationStyle = "danger";
                    responseJSON.operationMessage = window.router.operationMessage;
                    window.router.operationType = OperationType.NONE;
                    window.router.operationMessage = "";
                }
                const index = responseJSON["tags"].indexOf(mainTag);
                if (index > -1) {
                    responseJSON["tags"].splice(index, 1);
                }
                article = responseJSON;
                main.innerHTML =
                    Mustache.render(
                        document.getElementById("template-article").innerHTML,
                        article
                    );
                window.location.hash = `#artComment/${article.id}/1`;
                controlIgnoredDiv("gtx-trans");
                return Promise.resolve();
            }
        })
        .then(()=>{
            controlAlert("article");
            return Promise.resolve();
        })
        .catch(error => { ////here we process all the failed promises
            const errMsgObj = {errMessage: error};
            if (errMsgObj.errMessage !== "Edit") {
                main.innerHTML =
                    Mustache.render(
                        document.getElementById("template-articles-error").innerHTML,
                        errMsgObj
                    );
            }
        });
}

function showComments(targetElm, artIdFromHash, currentPage) {
    currentPage = Number(currentPage);
    if(currentPage === 0) {
        location.hash = "#artComment/"+artIdFromHash+"/1";
        return;
    }
    let main = document.getElementById(targetElm);
    let current = (currentPage - 1) * commentsPerPage;
    let url = urlBase + "/article/" + parseInt(artIdFromHash) + "/comment/?max=" + commentsPerPage + "&offset=" + current;
    let comments;
    fetch(url)
        .then(response => {
            if (response.ok) return response.json();
            else return Promise.reject(new Error(`Failed to access the list of comments. 
                Server answered with ${response.status}: ${response.statusText}.`));
        })
        .then(responseJSON => {
            responseJSON["comments"].forEach(comment => {
                comment.dateCreated = (new Date(comment.dateCreated)).toDateString();
            });
            if(window.router.operationType === OperationType.ADD){
                responseJSON.isOperationComment = true;
                responseJSON.operationStyle = "success";
                responseJSON.operationMessage = "Comment was successfully added on server";
                window.router.operationType = OperationType.NONE;
                window.router.operationMessage = "";
            }
            else if(window.router.operationType === OperationType.EDIT){
                responseJSON.isOperationComment = true;
                responseJSON.operationStyle = "success";
                responseJSON.operationMessage = "Comment was successfully edited";
                window.router.operationType = OperationType.NONE;
                window.router.operationMessage = "";
            }
            else if(window.router.operationType === OperationType.DELETE){
                responseJSON.isOperationComment = true;
                responseJSON.operationStyle = "success";
                responseJSON.operationMessage = "Comment was successfully deleted from server";
                window.router.operationType = OperationType.NONE;
                window.router.operationMessage = "";
            }
            else if(window.router.operationType === OperationType.ERROR){
                responseJSON.isOperationComment = true;
                responseJSON.operationStyle = "danger";
                responseJSON.operationMessage = window.router.operationMessage;
                window.router.operationType = OperationType.NONE;
                window.router.operationMessage = "";
            }
            responseJSON.currentPage = currentPage;
            current = current / commentsPerPage + 1;
            let tempCurrent = pagination(responseJSON, current, responseJSON["meta"]["totalCount"], commentsPerPage);
            if(current !== undefined && current > tempCurrent && tempCurrent !== 0){
                window.location.hash = `#articles/${tempCurrent}`;
                return Promise.reject("Wrong index");
            }
            comments = responseJSON;
            return Promise.resolve();
        })
        .then(() => {
            main.innerHTML =
                Mustache.render(
                    document.getElementById("template-comment").innerHTML,
                    comments
                );
            return Promise.resolve();
        })
        .then(() => {
            controlAlert("comments");
            return Promise.resolve();
        })
        .catch(error => {
            if(error !== "Wrong index") {
                const errMsgObj = {errMessage: error};
                main.innerHTML =
                    Mustache.render(
                        document.getElementById("template-articles-error").innerHTML,
                        errMsgObj
                    );
            }
        });
}