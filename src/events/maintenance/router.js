const validate = require("../../utils/validateRole")
const entityPersistence = require("./persistence")
const response = require("../../utils/response")
const oauth = require("../../utils/oauth")
const checkParams = require("../../utils/checkParams")
const throwError = require ("../../utils/throwError")
const getLine = require("../../utils/getLine")
const getToken = require("../../utils/getTokenReq");
const login = require("../login/loginEvent");
const userPersistence = require("../users/usersPersistence");

module.exports = (app,io) => {
    app.get("/maintenance", oauth.introspect, async (req, res) => {
        if (await validate(req, res, "administrador,operador,supervisor")) {
            try {
                let entities = await entityPersistence.getAllMaintenances();
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
    app.get("/maintenance/:idMachine", oauth.introspect, async (req, res) => {
        if (await validate(req, res, "administrador,operador,supervisor")) {
            try {
                let entities = await entityPersistence.getAll(req.params.idMachine);
                response(res, 200, entities.filter(o=>o.idinterrupcion_interrupcion.tipo_parada != null))
            } catch (e) {
                console.log(e);
                console.log(getLine().default());

                response(res, e.code, response.ERROR(e.data))
            }
        } else {
            response(res, 403, response.ERROR("rol no permitido"))
        }
    })
   /* app.get("/maintenance/:idturno/:hora", oauth.introspect, async (req, res) => {
        if (await validate(req, res, "administrador,operador,supervisor")) {
            try {
                let entities = await entityPersistence.getAllByTurnAndHour(req.params.idturno,req.params.hora);
                console.log(entities);
                response(res, 200, entities.filter(o=>o.idinterrupcion_interrupcion.tipo_parada != null))
            } catch (e) {
                console.log(e);
                response(res, e.code, response.ERROR(e.data))
            }
        } else {
            response(res, 403, response.ERROR("rol no permitido"))
        }
    })*/
    app.get("/maintenance/init/:idMaintenance", oauth.introspect, async (req, res) => {
        if (await validate(req, res, "administrador,operador,supervisor")) {
            try {
                let token = getToken(req);
                let infoToken = await login.introspect(token)
                infoToken.data.role = infoToken.data.family_name
                let userData = await userPersistence.getUserByUsername(infoToken.data)
                let entities = await entityPersistence.init(req.params.idMaintenance,infoToken.data.username,io);
                response(res, 200, entities)
            } catch (e) {
                console.log(e);
                response(res, e.code, response.ERROR(e.data))
            }
        } else {
            response(res, 403, response.ERROR("rol no permitido"))
        }
    })
    app.post("/maintenance", oauth.introspect, async (req, res) => {
        if (await validate(req, res, "administrador,operador,supervisor")) {
            try {

              /*  if (!checkParams(req.body, ["nombre"])) {
                    throwError(400, "faltan datos")
                }*/
                let token = getToken(req);
                let infoToken = await login.introspect(token)
                infoToken.data.role = infoToken.data.family_name
                let userData = await userPersistence.getUserByUsername(infoToken.data)
                let entity = {
                    quiencrea:infoToken.data.username,
                    idinterrupcion: req.body.idinterrupcion,
                    fechaprogramada: req.body.fechaprogramada,
                    fecharealizada: req.body.fecharealizada,
                    nombre: req.body.nombre,
                }
                let createdEntity = await entityPersistence.create(entity,io)
                response(res, 201, createdEntity)
            } catch (e) {
                console.log(e);
                response(res, e.code, response.ERROR(e.data))
            }
        } else {
            response(res, 403, response.ERROR("rol no permitido"))
        }
    })
    app.put("/maintenance", oauth.introspect, async (req, res) => {
        if (await validate(req, res, "administrador,operador,supervisor")) {
            try {

              /*  if (!checkParams(req.body, ["nombre","id"])) {
                    throwError(400, "faltan datos")
                }*/
                let entity = {
                    id: req.body.id,
                    idinterrupcion: req.body.idinterrupcion,
                    fechaprogramada: req.body.fechaprogramada,
                    fecharealizada: req.body.fecharealizada,
                    fecharealizadafin: req.body.fecharealizadafin,
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
    app.patch("/maintenance/dscto", oauth.introspect, async (req, res) => {
        if (await validate(req, res, "administrador,operador,supervisor")) {
            try {

                if (!checkParams(req.body, ["id"])) {
                    throwError(400, "faltan datos")
                }

                let data ={
                    idparada:req.body.idparada,
                    id:req.body.id,
                    activo:req.body.activo,
                }

                let dscto = null
                if(req.body.activo){
                    dscto = await entityPersistence.restarInventario(data)
                }else{
                    dscto = await entityPersistence.sumarInventario(data)
                }


                response(res, 200, dscto)
            } catch (e) {
                console.log(e);
                response(res, e.code, response.ERROR(e.data))
            }
        } else {
            response(res, 403, response.ERROR("rol no permitido"))
        }
    })
    app.delete("/maintenance/:id", oauth.introspect, async (req, res) => {
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