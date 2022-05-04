const validate = require("../../utils/validateRole")
const entityPersistence = require("./persistence")
const response = require("../../utils/response")
const oauth = require("../../utils/oauth")
const checkParams = require("../../utils/checkParams")
const throwError = require ("../../utils/throwError")
module.exports = (app) => {
    app.get("/maquinamant", oauth.introspect, async (req, res) => {
        if (await validate(req, res, "administrador,operador,supervisor")) {
            try {
                console.log(req.query.idmaquina);
                let entities = await entityPersistence.getAll(req.query.idmaquina);
                response(res, 200, entities)
            } catch (e) {
                console.log(e);
                response(res, e.code, response.ERROR(e.data))
            }
        } else {
            response(res, 403, response.ERROR("rol no permitido"))
        }
    })
    app.post("/maquinamant", oauth.introspect, async (req, res) => {
        if (await validate(req, res, "administrador,operador,supervisor")) {
            try {

                /*if (!checkParams(req.body, ["nombre"])) {
                    throwError(400, "faltan datos")
                }*/
                let entity = {
                    idmaquina: req.body.idmaquina,
                    idparada: req.body.idparada,
                    cadacuanto: req.body.cadacuanto,
                    duracion: req.body.duracion,
                }
                let createdEntity = await entityPersistence.create(entity)
                response(res, 201, createdEntity)
            } catch (e) {
                console.log(e);
                response(res, e.code, response.ERROR(e.data))
            }
        } else {
            response(res, 403, response.ERROR("rol no permitido"))
        }
    })
    app.put("/maquinamant", oauth.introspect, async (req, res) => {
        if (await validate(req, res, "administrador,operador,supervisor")) {
            try {

               /* if (!checkParams(req.body, ["nombre","id"])) {
                    throwError(400, "faltan datos")
                }*/
                let entity = {
                    id: req.body.id,
                    idmaquina: req.body.idmaquina,
                    idparada: req.body.idparada,
                    cadacuanto: req.body.cadacuanto,
                    duracion: req.body.duracion,
                }
                let updatedEntity = await entityPersistence.update(entity)
                response(res, 204, updatedEntity)
            } catch (e) {
                console.log(e);
                response(res, e.code, response.ERROR(e.data))
            }
        } else {
            response(res, 403, response.ERROR("rol no permitido"))
        }
    })
    app.delete("/maquinamant/:id", oauth.introspect, async (req, res) => {
        if (await validate(req, res, "administrador,operador,supervisor")) {
            try {
                let id = req.params.id
                let deletedEntity = await entityPersistence.delete(id)
                response(res, 204, {})
            } catch (e) {
                console.log(e);
                response(res, e.code, response.ERROR(e.data))
            }
        } else {
            response(res, 403, response.ERROR("rol no permitido"))

        }
    })


}