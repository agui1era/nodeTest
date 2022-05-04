const axios = require('axios');

module.exports = {
    makeGET: (url, headers = {}) =>
        axios.get(url, {
            headers
        }),
    makePOST: (url, headers = {}, body) =>
        axios.post(url, body, {
            headers
        }),
    makePUT: (url, headers = {}, body) =>
        axios.put(url, body, {
            headers
        }),
    makeDELETE: (url, headers = {}, body) =>
        axios.delete(url, {
            headers
        })

}