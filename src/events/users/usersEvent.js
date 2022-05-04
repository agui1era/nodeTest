const kcAdmin = require("../../utils/keycloakadmin")
const throwError = require("../../utils/throwError")
const getLine = require("../../utils/getLine")
module.exports = {
    create: async (data) => {

        try {
            let {username, firstName, lastName, email} = data
            let token = await kcAdmin.tokenAdmin()
            let newUser = {
                username,
                "enabled": true,
                firstName,
                lastName,
                email,
                "emailVerified": false,
                "requiredActions": ["UPDATE_PASSWORD", "VERIFY_EMAIL"]
            }
            let createdUser = await kcAdmin.createUser(token, newUser)
            let users = await kcAdmin.users(token);
            let persistedUser = users.find(o => o.email == email)
            let sendEmail = await kcAdmin.sendVerifyEmail(token, persistedUser.id)
        } catch (e) {
            console.log(e);
            console.log(getLine().default());

            throwError(500, e.response.data.errorMessage ? e.response.data.errorMessage : 'err')
        }
    },
    updateUser: async (data) => {
        try {

            let token = await kcAdmin.tokenAdmin()
            let user = await kcAdmin.checkUserExist(token, data)
            let updatedUser = await kcAdmin.updateUser(token, user.idKC, data)
            return user


        } catch (e) {
            console.log(e)
            console.log(getLine().default());

            throwError(e.code ? e.code : 500, e.response?.data?.error ? e.response?.data?.error : e.response?.data?.errorMessage ? e.response?.data?.errorMessage : 'err')
        }
    },
    recoveryPassUser: async (data) => {
        try {
            console.log(data);
            let token = await kcAdmin.tokenAdmin()
            let user = await kcAdmin.checkUserExist(token, data)
            //console.log(user)
            //console.log("user")
            let recoveryPass = await kcAdmin.recoveryPasswordUser(token, user.idKC)
            return user


        } catch (e) {
            console.log(e)
            console.log(getLine().default());

            throwError(e.code ? e.code : 500, e.response?.data?.error ? e.response?.data?.error : e.response?.data?.errorMessage ? e.response?.data?.errorMessage : 'err')
        }
    },
    deleteUser: async (username) => {
        try {

            let token = await kcAdmin.tokenAdmin()

            let user = await kcAdmin.checkUserExist(token, {username})
            let deletedUser = await kcAdmin.deleteUser(token, user.idKC)


            return user


        } catch (e) {
            console.log(e)
            console.log(getLine().default());

            throwError(e.code ? e.code : 500, e.response.data.error ? e.response.data.error : e.response.data.errorMessage ? e.response.data.errorMessage : 'err')
        }
    },


}