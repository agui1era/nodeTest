const validate = require("../../utils/validateRole")
const entityPersistence = require("./persistence")
const response = require("../../utils/response")
const oauth = require("../../utils/oauth")
const checkParams = require("../../utils/checkParams")
const throwError = require("../../utils/throwError")
const getLine = require("../../utils/getLine")

module.exports = (app) => {
    app.post("/indicadores", oauth.introspect, async (req, res) => {
        if (await validate(req, res, "administrador,supervisor,operador")) {
            try {
                 let body= {
                    tipo:req.body.tipo,
                    maquina:req.body.idmaquina,
                    fecha: req.body.fecha,
                };
                console.log(body.fecha);
                let entities = await entityPersistence.getAll(body);  
                let indicadores = {"indicadores":entities};
                console.log(indicadores);
                response(res, 200, indicadores);
            } catch (e) {
                console.log(getLine().default());
                response(res, e.code, response.ERROR(e.data))
            }
        } else {
            response(res, 403, response.ERROR("Error"))
        }
    })
}