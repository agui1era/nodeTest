const validate = require("../../utils/validateRole")
const entityPersistence = require("./persistence")
const response = require("../../utils/response")
const oauth = require("../../utils/oauth")
const checkParams = require("../../utils/checkParams")
const throwError = require("../../utils/throwError")
const getLine = require("../../utils/getLine");

module.exports = (app) => {
    app.get("/detention", oauth.introspect, async (req, res) => {
        if (await validate(req, res, "administrador,supervisor,operador")) {
            try {
                let entities = await entityPersistence.getAll();
                response(res, 200, entities)
            } catch (e) {
                console.log(e);
                console.log(getLine().default());

                response(res, e.code, response.ERROR(e.data))
            }
        } else {
            response(res, 403, response.ERROR("rol no permitido"))
        }
    })
    app.post("/detention", oauth.introspect, async (req, res) => {
        if (await validate(req, res, "administrador,supervisor,operador")) {
            try {

               /* if (!checkParams(req.body, ["nombre"])) {
                    throwError(400, "faltan datos")
                }*/
                let entity = {
                    nombre: req.body.nombre || "",
                    idcategoriaparada: req.body.idcategoriaparada
                }
                let createdEntity = await entityPersistence.create(entity)
                response(res, 201, createdEntity)
            } catch (e) {
                console.log(e);
                console.log(getLine().default());

                response(res, e.code, response.ERROR(e.data))
            }
        } else {
            response(res, 403, response.ERROR("rol no permitido"))
        }
    })
    app.post("/detention/machine", oauth.introspect, async (req, res) => {
        if (await validate(req, res, "administrador,supervisor,operador")) {
            try {

               /* if (!checkParams(req.body, ["nombre"])) {
                    throwError(400, "faltan datos")
                }*/
                let entity = {
                    nombre: req.body.nombre,
                    idcategoriaparada: req.body.idcategoriaparada,
                    idmaquina: req.body.idmaquina
                }
                let createdEntity = await entityPersistence.createByMachine(entity,req.query.idcategoriaparada)
                response(res, 201, createdEntity)
            } catch (e) {
                console.log(e);
                console.log(getLine().default());

                response(res, e.code, response.ERROR(e.data))
            }
        } else {
            response(res, 403, response.ERROR("rol no permitido"))
        }
    })
    app.post("/detention", oauth.introspect, async (req, res) => {
        if (await validate(req, res, "administrador")) {
            try {

               /* if (!checkParams(req.body, ["nombre"])) {
                    throwError(400, "faltan datos")
                }*/
                let entity = {
                    nombre: req.body.nombre,
                    idcategoriaparada: req.body.idcategoriaparada
                }
                let createdEntity = await entityPersistence.createByMachine(entity)
                response(res, 201, createdEntity)
            } catch (e) {
                console.log(e);
                console.log(getLine().default());

                response(res, e.code, response.ERROR(e.data))
            }
        } else {
            response(res, 403, response.ERROR("rol no permitido"))
        }
    })
    app.put("/detention", oauth.introspect, async (req, res) => {
        if (await validate(req, res, "administrador")) {
            try {

                if (!checkParams(req.body, ["nombre","id"])) {
                    throwError(400, "faltan datos")
                }
                let entity = {
                    id: req.body.id,
                    nombre: req.body.nombre,
                    idcategoriaparada: req.body.idcategoriaparada,
                    idmaqrel: req.body.idmaqrel,

                }
                let updatedEntity = await entityPersistence.update(entity)
                response(res, 201, updatedEntity)
            } catch (e) {
                console.log(e);
                console.log(getLine().default());
                response(res, e.code, response.ERROR(e.data))
            }
        } else {
            response(res, 403, response.ERROR("rol no permitido"))
        }
    })
    app.delete("/detention/:id", oauth.introspect, async (req, res) => {
        if (await validate(req, res, "administrador")) {
            try {
                let id = req.params.id
                let deletedEntity = await entityPersistence.delete(id)
                response(res, 200, {})
            } catch (e) {
                console.log(e);
                console.log(getLine().default());

                response(res, e.code, response.ERROR(e.data))
            }
        } else {
            response(res, 403, response.ERROR("rol no permitido"))

        }
    })


}