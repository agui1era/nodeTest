const login = require("../events/login/loginEvent")
const response = require("./response")
const getToken = require("./getTokenReq")
module.exports = async (req, res, role) => {
    let validate = false;
    let token = getToken(req);
    if (token != null) {
        let infoToken = await login.introspect(token)
        if (role.split(",").find(o=>o==infoToken.data.family_name)) {
            validate = true
        }
    }
    return validate
}

