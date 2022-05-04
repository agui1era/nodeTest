const validate = require("../../utils/validateRole")
const entityPersistence = require("./persistence")
const response = require("../../utils/response")
const oauth = require("../../utils/oauth")
const checkParams = require("../../utils/checkParams")
const throwError = require("../../utils/throwError")

module.exports = (app) => {
    app.get("/product", oauth.introspect, async (req, res) => {
        if (await validate(req, res, "administrador,supervisor,operador")) {
            try {
                let entities = await entityPersistence.getAll(req.query.s);
                response(res, 200, entities)
            } catch (e) {
                console.log(e);
                response(res, e.code, response.ERROR(e.data))
            }
        } else {
            response(res, 403, response.ERROR("rol no permitido"))
        }
    })
    app.post("/product", oauth.introspect, async (req, res) => {
        if (await validate(req, res, "administrador")) {
            try {

                if (!checkParams(req.body, ["nombre"])) {
                    throwError(400, "faltan datos")
                }
                let entity = {
                    nombre: req.body.nombre,
                    categoria: req.body.categoria,
                   /* sku: req.body.sku,
                    formatosdemedida: req.body.formatosdemedida,*/
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
    app.put("/product", oauth.introspect, async (req, res) => {
        if (await validate(req, res, "administrador")) {
            try {

                if (!checkParams(req.body, ["nombre","id"])) {
                    throwError(400, "faltan datos")
                }
                let entity = {
                    id: req.body.id,
                    nombre: req.body.nombre,
                    categoria: req.body.categoria,
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
    app.delete("/product/:id", oauth.introspect, async (req, res) => {
        if (await validate(req, res, "administrador")) {
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