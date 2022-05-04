const getToken = require("./getTokenReq")
const response = require("./response")
const login = require("../events/login/loginEvent")
module.exports = {
    introspect: (req, res, next) => {
        let token = getToken(req)
        if (token != null) {
            login.introspect(token).then(infoToken => {
                if(infoToken.data.active){
                    next()
                }else{
                    response(res, 401, response.ERROR("Unauthorized token"))
                }
            }).catch()
        } else {
            response(res, 400, response.ERROR("Error token"))
        }
    }
}