const httpClient = require("../../utils/httpClient")
const constants = require("../../config/constants")
module.exports = {
    login: (user,pass) => {
        return httpClient.makePOST(constants.url+"/auth/realms/mes/protocol/openid-connect/token",{
            "content-type":"application/x-www-form-urlencoded"
        },
            `grant_type=password&client_id=loginapp&client_secret=${constants.realmSecret}&username=${user}&password=${pass}`)
    },
    introspect: (token) => {
        return httpClient.makePOST(constants.url+"/auth/realms/mes/protocol/openid-connect/token/introspect",{
            "content-type":"application/x-www-form-urlencoded"
        },
            `token_type_hint=access_token&client_id=loginapp&client_secret=${constants.realmSecret}&token=${token}`)
    }
}