const logger = require('./logger')
module.exports = (res, code = 500, body) => {
    logger('RESPONSE',false)
    logger(body,false)
    logger('RESPONSE',false)
    res.status(code).send(body)
}
module.exports.ERROR = (msg) => {
    return {error: msg}
}