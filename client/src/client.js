function logStudentData(data, cb) {
    return fetch('/user', {
        method:"POST",
        headers: {"Content-Type": "application/json",
                  "Accept":"application/json"},
        body:JSON.stringify(data)
    })
    .then(checkStatus)
    .then(parseJSON)
    .then(cb)
}

function getStudentSchedule(id, cb) {
    return fetch(`/schedule/${id}`, {
        method:"GET",
        headers:{
            "Content-Type": "application/json",
            "Accept":"application/json"
        }
    })
    .then(checkStatus)
    .then(parseJSON)
    .then(cb)
}

function checkStatus(response) {
    if (response.status >= 200 && response.status < 300) {
        return response;
    }
    const error = new Error(`HTTP Error ${response.statusText}`);
    error.status = response.statusText;
    error.response = response;
    console.log(error); // eslint-disable-line no-console
    throw error;
}

function parseJSON(response) {
    return response.json();
}

const Client = { logStudentData, getStudentSchedule };
export default Client;