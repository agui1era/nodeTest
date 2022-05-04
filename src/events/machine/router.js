const validate = require("../../utils/validateRole")
const entityPersistence = require("./persistence")
const response = require("../../utils/response")
const oauth = require("../../utils/oauth")
const checkParams = require("../../utils/checkParams")
const throwError = require("../../utils/throwError")
const getLine = require("../../utils/getLine")

module.exports = (app) => {
    app.get("/machine", oauth.introspect, async (req, res) => {
        if (await validate(req, res, "administrador,operador,supervisor")) {
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
    app.get("/machines/active", oauth.introspect, async (req, res) => {
        if (await validate(req, res, "administrador,operador,supervisor")) {
            try {
                let entities = await entityPersistence.getAllActives();
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
    app.get("/machine/id/:id", oauth.introspect, async (req, res) => {
        if (await validate(req, res, "administrador,operador,supervisor")) {
            try {
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
    app.get("/machines/in/detention", oauth.introspect, async (req, res) => {
        if (await validate(req, res, "administrador,operador,supervisor")) {
            try {
                let entities = await entityPersistence.getAllInDetention();
                response(res, 200, entities)
            } catch (e) {
                console.log(e);
                console.log(getLine().default());

                response(res, e.code || 500, response.ERROR(e.data))
            }
        } else {
            response(res, 403, response.ERROR("rol no permitido"))
        }
    })
    app.get("/machines/in/maintenance", oauth.introspect, async (req, res) => {
        if (await validate(req, res, "administrador,operador,supervisor")) {
            try {
                let entities = await entityPersistence.getAllInMaintenance();
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
    app.get("/machines/good", oauth.introspect, async (req, res) => {
        if (await validate(req, res, "administrador,operador,supervisor")) {
            try {
                let entities = await entityPersistence.getAllGood();
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
    app.post("/machine", oauth.introspect, async (req, res) => {
        if (await validate(req, res, "administrador")) {
            try {

                if (!checkParams(req.body, ["nombre"])) {
                    throwError(400, "faltan datos")
                }
                let entity = {
                    nombre: req.body.nombre,
                    conSensor: req.body.conSensor || false,
                    oeeesperado: req.body.oeeesperado,
                    lugar: req.body.lugar,
                    estndrprod: req.body.estndrprod,
                    idproceso: req.body.idproceso,
                    subproductoasignado: req.body.subproductoasignado
                }
                let createdEntity = await entityPersistence.create(entity,req.query.idproceso)
                response(res, 201, createdEntity)
            } catch (e) {
                console.log(e);
                console.log(getLine().default());

                response(res, e.code || 500, response.ERROR(e.data))
            }
        } else {
            response(res, 403, response.ERROR("rol no permitido"))
        }
    })
    app.post("/machine/products/:idMachine", oauth.introspect, async (req, res) => {
        if (await validate(req, res, "operador,supervisor,administrador")) {
            try {

                /* if (!checkParams(req.body, ["nombre"])) {
                     throwError(400, "faltan datos")
                 }*/
                let idMachine = req.params.idMachine
                let productionsList = []
                productionsList = Array.from(new Set(req.body))

                for (let product of productionsList) {
                    let existProduct = await entityPersistence.checkMachineProduct(idMachine, product)
                    if (existProduct == null) {
                        await entityPersistence.createProductions([{idmaquina: idMachine, idproducto: product}])
                    }
                }

                response(res, 201, {})
            } catch (e) {
                console.log(e);
                console.log(getLine().default());

                response(res, e.code, response.ERROR(e.data))
            }
        } else {
            response(res, 403, response.ERROR("rol no permitido"))
        }
    })
    app.post("/machine/detentions/:idMachine", oauth.introspect, async (req, res) => {
        if (await validate(req, res, "operador,supervisor,administrador")) {
            try {

                /* if (!checkParams(req.body, ["nombre"])) {
                     throwError(400, "faltan datos")
                 }*/
                let idMachine = req.params.idMachine == 'no' ? undefined : req.params.idMachine
                /*   let data = req.body.map(o=>{return {
                       idmaquina:idMachine,
                       nombre:o.nombre,
                       idcategoriaparada:o.idcategoriaparada,
                       inventarioreq:o.inventarioreq
                   }})*/
                let data = req.body.map(o => {
                    return {
                        nombre: o.nombre,
                        idcategoriaparada: o.idcategoriaparada,
                        inventarioreq: o.inventarioreq,
                        idmaquina: idMachine
                    }
                })
                let createdEntity1 = await entityPersistence.createDetentionsByMachine(data)

                data = createdEntity1.map(o => {
                    return {
                        idparada: o.id,
                        idmaquina: idMachine
                    }
                })

                let detentionsMachineCreated = await entityPersistence.createDetentionsMachine(data)

                response(res, 201, createdEntity1)
            } catch (e) {
                console.log(e);
                console.log(getLine().default());

                response(res, e.code, response.ERROR(e.data))
            }
        } else {
            response(res, 403, response.ERROR("rol no permitido"))
        }
    })
    app.get("/machine/products/:idMachine", oauth.introspect, async (req, res) => {
        if (await validate(req, res, "administrador,operador,supervisor")) {
            try {

                let idMachine = req.params.idMachine

                let entitiesList = await entityPersistence.getProductionByMachine(idMachine)

                response(res, 200, entitiesList)
            } catch (e) {
                console.log(e);
                console.log(getLine().default());

                response(res, e.code || 500, response.ERROR(e.data))
            }
        } else {
            response(res, 403, response.ERROR("rol no permitido"))
        }
    })
    app.get("/machine/detentions/:idMachine", oauth.introspect, async (req, res) => {
        if (await validate(req, res, "administrador,operador,supervisor")) {
            try {

                let idMachine = req.params.idMachine
                let idCat = req.query.idCat

                let entitiesList = await entityPersistence.getDetentionsByMachine(idMachine,idCat)

                response(res, 200, entitiesList)
            } catch (e) {
                console.log(e);
                console.log(getLine().default());

                response(res, e.code || 500, response.ERROR(e.data))
            }
        } else {
            response(res, 403, response.ERROR("rol no permitido"))
        }
    })
    app.get("/machine/detentions", oauth.introspect, async (req, res) => {
        if (await validate(req, res, "administrador,operador,supervisor")) {
            try {

                let idMachine = req.params.idMachine

                let entitiesList = await entityPersistence.getAllDetentions()

                response(res, 200, entitiesList)
            } catch (e) {
                console.log(e);
                response(res, e.code || 500, response.ERROR(e.data))
            }
        } else {
            response(res, 403, response.ERROR("rol no permitido"))
        }
    })
    app.put("/machine", oauth.introspect, async (req, res) => {
        if (await validate(req, res, "administrador,supervisor,operador")) {
            try {

                if (!checkParams(req.body, ["id"])) {
                    throwError(400, "faltan datos")
                }
                let entity = {
                    id: req.body.id,
                    nombre: req.body.nombre,
                    idproceso: req.body.idproceso,
                    lugar: req.body.lugar,
                    conSensor: req.body.conSensor,
                    oeeesperado: req.body.oeeesperado,
                    estndrprod: req.body.estndrprod,
                    subproductoasignado: req.body.subproductoasignado,
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
    app.put("/machine/products", oauth.introspect, async (req, res) => {
        if (await validate(req, res, "administrador")) {
            try {

                if (!checkParams(req.body, ["id"])) {
                    throwError(400, "faltan datos")
                }
                let entity = {
                    id: req.body.id,
                    idproducto: req.body.idproducto
                }
                let updatedEntity = await entityPersistence.updateProductOfMachine(entity)
                response(res, 204, updatedEntity)
            } catch (e) {
                console.log(e);
                response(res, e.code, response.ERROR(e.data))
            }
        } else {
            response(res, 403, response.ERROR("rol no permitido"))
        }
    })
    app.put("/machine/detentions", oauth.introspect, async (req, res) => {
        if (await validate(req, res, "administrador")) {
            try {

                if (!checkParams(req.body, ["id"])) {
                    throwError(400, "faltan datos")
                }
                let entity = {
                    id: req.body.id,
                    nombre: req.body.nombre,
                    idcategoriaparada: req.body.idcategoriaparada,
                    inventarioreq: req.body.inventarioreq
                }
                let updatedEntity = await entityPersistence.updateDetentionOfMachine(entity)
                response(res, 204, updatedEntity)
            } catch (e) {
                console.log(e);
                response(res, e.code, response.ERROR(e.data))
            }
        } else {
            response(res, 403, response.ERROR("rol no permitido"))
        }
    })
    app.delete("/machine/:id", oauth.introspect, async (req, res) => {
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
    app.delete("/machine/products/:id", oauth.introspect, async (req, res) => {
        if (await validate(req, res, "administrador")) {
            try {
                let id = req.params.id
                let deletedEntity = await entityPersistence.deleteProductOfMachine(id)
                response(res, 204, {})
            } catch (e) {
                console.log(e);
                response(res, e.code, response.ERROR(e.data))
            }
        } else {
            response(res, 403, response.ERROR("rol no permitido"))

        }
    })
    app.delete("/machine/detentions/:id", oauth.introspect, async (req, res) => {
        if (await validate(req, res, "administrador")) {
            try {
                let id = req.params.id
                let deletedEntity = await entityPersistence.deleteDetentionOfMachine(id)
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