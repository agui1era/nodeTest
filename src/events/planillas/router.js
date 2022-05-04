const validate = require("../../utils/validateRole")
const entityPersistence = require("./persistence")
const response = require("../../utils/response")
const oauth = require("../../utils/oauth")
const checkParams = require("../../utils/checkParams")
const throwError = require("../../utils/throwError")
const objectstocsv = require('objects-to-csv')
const fs = require("fs")
var data = [
    {code: 'CA', name: 'California'},
    {code: 'TX', name: 'Texas'},
    {code: 'NY', name: 'New York'},
];
module.exports = (app) => {
    app.get("/planillas/produccion", oauth.introspect, async (req, res) => {
        if (await validate(req, res, "administrador,operador,supervisor")) {
            try {
                let dia = req.query.dia
                let entities = await entityPersistence.planillaProduccion(dia);

                response(res, 200, entities)
               /* res.download("./test.csv",() => {

                    fs.unlinkSync("./test.csv")

                })*/
            } catch (e) {
                console.log(e);
                response(res, e.code, response.ERROR(e.data))
            }
        } else {
            response(res, 403, response.ERROR("rol no permitido"))
        }
    })

}