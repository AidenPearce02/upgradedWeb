function removeOpinions() {
    let toRemove = [];
    let opinions = [];
    const getReqSettings =
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
            return Promise.resolve();
        })
        .then(() => {
            opinions.forEach(opinion => {
                let createdDate = new Date(opinion["createdAt"]);
                const diffTime = Math.abs(new Date() - createdDate);
                const diffDays = diffTime / (1000 * 60 * 60 * 24);
                if (diffDays >= 1) {
                    toRemove.push(opinion["objectId"]);
                }
            });
            return Promise.resolve();
        })
        .then(() => {
            if(toRemove.length > 0){
                const deleteReqSettings =
                    {
                        method: 'DELETE',
                        headers: {
                            'X-Parse-Application-Id': 'gWQviEB1U8Z5yGFFdY73EoHEmJAQRXFH4Lzmkt1Q',
                            'X-Parse-REST-API-Key': 'uQ8jmaqknb54YULZ57ckCPB9Ia0ZmP4nGBkHq7I4'
                        }
                    };
                toRemove.forEach(opinionId => {
                    fetch(urlOpinions + "/" + opinionId, deleteReqSettings)
                        .then(response => {
                            if (response.ok) {
                                return Promise.resolve();
                            } else {
                                return Promise.reject(new Error(`Server answered with ${response.status}: ${response.statusText}.`));
                            }
                        })
                        .catch(error => {
                            window.alert(`Failed to remove the old opinions from server. ${error}`);
                        });
                })
                return Promise.resolve();
            }
            return Promise.reject();
        })
        .then(() => {
            window.location.hash = "#404";
            window.location.hash = "#opinions";
        })
        .catch(error => {
            if(error !== undefined) {
                window.alert(`Failed to remove the old opinions from server. ${error}`);
            }
        });
}