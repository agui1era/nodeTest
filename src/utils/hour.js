const http = require("./httpClient")
module.exports = {
    hora:()=>{
        return http.makeGET('https://www.timeapi.io/api/Time/current/zone?timeZone=America/Santiago')
    }
}