const httpClient = require("./httpClient")
const throwError = require("../utils/throwError")
const constants = require("../config/constants")
const getLine = require("../utils/getLine")
module.exports = {


    tokenAdmin: async () => {
        let kcRequest = await httpClient.makePOST(constants.url + "/auth/realms/master/protocol/openid-connect/token", {
                "content-type": "application/x-www-form-urlencoded"
            },
            `grant_type=password&client_id=admin-cli&username=admin&password=adminmes`)
        return kcRequest.data.access_token
    },
    createUser: async (tkn, body) => {
        let kcRequest = await httpClient.makePOST(constants.url + "/auth/admin/realms/mes/users", {
                "content-type": "application/json",
                "authorization": "Bearer " + tkn
            }, body
        )
        return kcRequest.data

    },
    users: async (tkn) => {
        let kcRequest = await httpClient.makeGET(constants.url + "/auth/admin/realms/mes/users", {
                "content-type": "application/json",
                "authorization": "Bearer " + tkn
            }
        )
        return kcRequest.data

    },
    usersByUsername: async (tkn, data) => {

        let kcUsers = await module.exports.users(tkn)
        return kcUsers.find(o => o.username == data.username)

        /*   let kcRequest = await httpClient.makeGET(constants.url+`/auth/admin/realms/mes/users/${id}`, {
                   "content-type": "application/json",
                   "authorization": "Bearer " + tkn
               }
           )
           return kcRequest.data*/

    },
    sendVerifyEmail: async (tkn, id) => {
        let kcRequest = {}
        try {
            kcRequest = await httpClient.makePUT(constants.url + `/auth/admin/realms/mes/users/${id}/send-verify-email`, {
                    "content-type": "application/json",
                    "authorization": "Bearer " + tkn
                }
            )
        } catch (e) {
            console.log(e);
            console.log(getLine().default());

        }
        return kcRequest.data


    },
    updateUser: async (tkn, id, body) => {
        let kcRequest = await httpClient.makePUT(constants.url + `/auth/admin/realms/mes/users/${id}`, {
                "content-type": "application/json",
                "authorization": "Bearer " + tkn
            }, body
        )
        return kcRequest

    },
    recoveryPasswordUser: async (tkn, id) => {
        let kcRequest = await httpClient.makePUT(constants.url + `/auth/admin/realms/mes/users/${id}/execute-actions-email?lifespan=43200`, {
                "content-type": "application/json",
                "authorization": "Bearer " + tkn
            }, ["UPDATE_PASSWORD"]
        )
        return kcRequest

    },
    deleteUser: async (tkn, id) => {
        let kcRequest = await httpClient.makeDELETE(constants.url + `/auth/admin/realms/mes/users/${id}`, {
                "content-type": "application/json",
                "authorization": "Bearer " + tkn
            }
        )
        return kcRequest

    },
    checkUserExist: async (tkn, id) => {
        let exist = {};
        try {
            let existentUser = await module.exports.usersByUsername(tkn, id)
           // console.log(existentUser);
            exist.email = existentUser.email
            exist.idKC = existentUser.id
            exist.idEmail = existentUser.email
            exist.role = existentUser.lastName
            exist.idRole = existentUser.lastName
            exist.username = existentUser.username

        } catch (e) {
            console.log(e);
            console.log(getLine().default());

            throw ({code: 400, response: e.response})
        }
        return exist
    }
}