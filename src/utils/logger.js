const fs = require('fs')
const moment = require("moment");
let _console = {...console}

module.exports = (data,print=true) =>{
    try{
        let ahora = moment().format("HH:mm:ss:ms: ")
        if (print) {
            _console.log(data);
        }
        let msg = typeof data == 'object' && data?.name != "SequelizeDatabaseError" ||
                                            data?.name != "SequelizeEagerLoadingError" ? ahora+JSON.stringify(data)+"\n":ahora+data+""
        fs.writeFile('logs.txt',msg, { flag: 'a+' }, err => {})

    }catch (e) {
        console.error(e)
    }
}
module.exports.entradas = data =>{
    try{
        let ahora = moment().format("HH:mm:ss:ms: ")
        let msg = ahora+data+"\n"
        fs.writeFile('entradas.txt', msg, { flag: 'a+' }, err => {})

    }catch (e) {
        console.error(e)
    }
}