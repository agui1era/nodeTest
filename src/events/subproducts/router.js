const validate = require("../../utils/validateRole")
const entityPersistence = require("./persistence")
const response = require("../../utils/response")
const oauth = require("../../utils/oauth")
const checkParams = require("../../utils/checkParams")
const throwError = require("../../utils/throwError")
const getLine = require("../../utils/getLine")

module.exports = (app) => {
    app.get("/subproduct", oauth.introspect, async (req, res) => {
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
    app.get("/subproduct/:id", oauth.introspect, async (req, res) => {
        if (await validate(req, res, "administrador,supervisor,operador")) {
            try {
                if(!req.params.id){
                    return response(res,200,[])
                }
            /*    if(req.params.id == "null"){
                    return response(res,200,[])
                }*/
                let entities = await entityPersistence.getById(req.params.id);
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
    app.post("/subproduct", oauth.introspect, async (req, res) => {
        if (await validate(req, res, "administrador")) {
            try {

                if (!checkParams(req.body, ["nombre"])) {
                    throwError(400, "faltan datos")
                }
                let entity = {
                    nombre: req.body.nombre,
                    categoria: req.body.categoria,
                    condicion: req.body.condicion,
                    formato: req.body.formato,
                    unidad: req.body.unidad,
                    sku: req.body.sku,
                    pesoenvase: req.body.pesoenvase,
                    pesofinal: req.body.pesofinal,
                    velprod: req.body.velprod,
                    stdprod: req.body.stdprod,
                    idproducto: req.body.idproducto,

                }
                let createdEntity = await entityPersistence.create(entity,req.query.idproducto)
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
    app.put("/subproduct", oauth.introspect, async (req, res) => {
        if (await validate(req, res, "administrador")) {
            try {

                if (!checkParams(req.body, ["nombre","id"])) {
                    throwError(400, "faltan datos")
                }
                let entity = {
                    id: req.body.id,
                    nombre: req.body.nombre,
                    categoria: req.body.categoria,
                    formato: req.body.formato,
                    unidad: req.body.unidad,
                    condicion: req.body.condicion,
                    pesoenvase: req.body.pesoenvase,
                    pesofinal: req.body.pesofinal,
                    sku: req.body.sku,
                    velprod: req.body.velprod,
                    stdprod: req.body.stdprod,
                    idproducto: req.body.idproducto,
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
    app.delete("/subproduct/:id", oauth.introspect, async (req, res) => {
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