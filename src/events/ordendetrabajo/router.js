const validate = require("../../utils/validateRole")
const entityPersistence = require("./persistence")
const response = require("../../utils/response")
const oauth = require("../../utils/oauth")
const checkParams = require("../../utils/checkParams")
const throwError = require("../../utils/throwError")
const getToken = require("../../utils/getTokenReq");
const login = require("../login/loginEvent");
const userPersistence = require("../users/usersPersistence")
module.exports = (app, io) => {
    app.get("/ordendetrabajo", oauth.introspect, async (req, res) => {
        if (await validate(req, res, "administrador,operador,supervisor")) {
            try {
                let queryP = {
                    idmaquina: req.query.selectedMachine,
                    idplanta: req.query.selectedPlant,
                    idproceso: req.query.selectedProcess,
                    horainicio: req.query.selectedFechas
                }
                Object.keys(queryP).forEach(key => {
                    if (queryP[key] === undefined) {
                        delete queryP[key];
                    }
                });
                let entities = await entityPersistence.getAll(queryP);
                response(res, 200, entities)
            } catch (e) {
                console.log(e);
                response(res, e.code, response.ERROR(e.data))
            }
        } else {
            response(res, 403, response.ERROR("rol no permitido"))
        }
    })
    app.get("/ordendetrabajo/id/:id", oauth.introspect, async (req, res) => {
        if (await validate(req, res, "administrador,operador,supervisor")) {
            try {
                let id = req.params.id
                let entities = await entityPersistence.getById(id);
                response(res, 200, entities)
            } catch (e) {
                console.log(e);
                response(res, e.code, response.ERROR(e.data))
            }
        } else {
            response(res, 403, response.ERROR("rol no permitido"))
        }
    })
    app.get("/ordendetrabajo/maquina/:id", oauth.introspect, async (req, res) => {
        if (await validate(req, res, "administrador,operador,supervisor")) {
            try {
                let entities = await entityPersistence.getByMaquinaId(req.params.id);
                response(res, 200, entities)
            } catch (e) {
                console.log(e);
                response(res, e.code, response.ERROR(e.data))
            }
        } else {
            response(res, 403, response.ERROR("rol no permitido"))
        }
    })
    app.get("/ordendetrabajo/finish/:id", oauth.introspect, async (req, res) => {
        if (await validate(req, res, "administrador,operador,supervisor")) {
            try {
                let token = getToken(req);
                let infoToken = await login.introspect(token)
                infoToken.data.role = infoToken.data.family_name
                let userData = await userPersistence.getUserByUsername(infoToken.data)
                let entities = await entityPersistence.finishOT(req.params.id, userData, io);
                io.emit("ot", true)

                response(res, 200, entities)
            } catch (e) {
                console.log(e);
                response(res, e.code, response.ERROR(e.data))
            }
        } else {
            response(res, 403, response.ERROR("rol no permitido"))
        }
    })
    app.post("/ordendetrabajo", oauth.introspect, async (req, res) => {
        if (await validate(req, res, "administrador,operador,supervisor")) {
            try {
                let token = getToken(req);
                let infoToken = await login.introspect(token)
                infoToken.data.role = infoToken.data.family_name
                let userData = await userPersistence.getUserByUsername(infoToken.data)
                /*  if (!checkParams(req.body, ["nombre"])) {
                      throwError(400, "faltan datos")
                  }*/
                let entity = {
                    creador: req.body.creador ? req.body.creador : `${userData.nombre} ${userData.apellido}`,
                    creadoruser: req.body.creadoruser ? req.body.creadoruser : `${infoToken.data.username}`,
                    foto: req.body.foto,
                    idsubproducto: req.body.idsubproducto,
                    idproducto: req.body.idproducto,
                    formatoelegido: req.body.formatoelegido,
                    condicionelegida: req.body.condicionelegida,
                    unidadelegida: req.body.unidadelegida,
                    idmaquina: req.body.idmaquina || null,
                    horainicio: req.body.horainicio,
                    horainicioaccion: req.body.horainicioaccion,
                    nombre: req.body.nombre,
                    codigo: req.body.codigo,
                    residuos: req.body.residuos,
                    idproceso: req.body.idproceso,
                    idplanta: req.body.idplanta,
                    cantidadactual: 0,
                    cantidadesperada: req.body.cantidadesperada,
                    estado: req.body.estado ? req.body.estado : "Comenzar"
                }
                let createdEntity = await entityPersistence.create(entity, io, req.query.idmaquina)
                io.emit("ot", true)

                response(res, 201, createdEntity)
            } catch (e) {
                console.log(e);
                response(res, e.code, response.ERROR(e.data))
            }
        } else {
            response(res, 403, response.ERROR("rol no permitido"))
        }
    })
    app.post("/ordendetrabajo/sumar", oauth.introspect, async (req, res) => {
        if (await validate(req, res, "administrador,operador,supervisor")) {
            try {
                let entity = {
                    idordendetrabajo: req.body.idordendetrabajo,
                    idturno: req.body.idturno
                }
                let createdEntity = await entityPersistence.sumar(entity)
                io.emit("ot", true)
                response(res, 200, createdEntity)
            } catch (e) {
                console.log(e);
                response(res, e.code, response.ERROR(e.data))
            }
        } else {
            response(res, 403, response.ERROR("rol no permitido"))
        }
    })
    app.post("/ordendetrabajo/asociar", oauth.introspect, async (req, res) => {
        if (await validate(req, res, "administrador,operador,supervisor")) {
            try {
                let entity = {
                    idordendetrabajo: req.body.idordendetrabajo,
                    idturno: req.body.idturno
                }
                let createdEntity = await entityPersistence.asociarTurnoPasado(entity.idturno, entity.idordendetrabajo)
                io.emit("ot", true)
                response(res, 200, createdEntity)
            } catch (e) {
                console.log(e);
                response(res, e.code, response.ERROR(e.data))
            }
        } else {
            response(res, 403, response.ERROR("rol no permitido"))
        }
    })
    app.put("/ordendetrabajo", oauth.introspect, async (req, res) => {
        if (await validate(req, res, "administrador,operador,supervisor")) {
            try {

                if (!checkParams(req.body, ["id"])) {
                    throwError(400, "faltan datos")
                }
                let entity = {
                    id: req.body.id,
                    creador: req.body.creador,
                    foto: req.body.foto,
                    idsubproducto: req.body.idsubproducto,
                    formatoelegido: req.body.formatoelegido,
                    condicionelegida: req.body.condicionelegida,
                    unidadelegida: req.body.unidadelegida,
                    idmaquina: req.body.idmaquina,
                    idplanta: req.body.idplanta,
                    horainicio: req.body.horainicio,
                    nombre: req.body.nombre,
                    residuos: req.body.residuos,
                    codigo: req.body.codigo,
                    idproceso: req.body.idproceso,
                    cantidadesperada: req.body.cantidadesperada,
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
    app.put("/ordendetrabajo/init", oauth.introspect, async (req, res) => {
        if (await validate(req, res, "administrador")) {
            try {
                let entity = {
                    id: req.body.id
                }
                let updatedEntity = await entityPersistence.init(entity.id, io)
                response(res, 200, updatedEntity)
            } catch (e) {
                console.log(e);
                response(res, e.code, response.ERROR(e.data))
            }
        } else {
            response(res, 403, response.ERROR("rol no permitido"))
        }
    })
    app.put("/ordendetrabajo/pause", oauth.introspect, async (req, res) => {
        if (await validate(req, res, "administrador,supervisor,operador")) {
            try {
                let entity = {
                    id: req.body.id,
                    idpt: req.body.idpt
                }
                let updatedEntity = await entityPersistence.pausar(entity.id, entity.idpt)
                io.emit("ot", true)

                response(res, 200, updatedEntity)
            } catch (e) {
                console.log(e);
                response(res, e.code, response.ERROR(e.data))
            }
        } else {
            response(res, 403, response.ERROR("rol no permitido"))
        }
    })
    app.delete("/ordendetrabajo/:id", oauth.introspect, async (req, res) => {
        if (await validate(req, res, "administrador")) {
            try {
                let id = req.params.id
                let deletedEntity = await entityPersistence.delete(id)
                //let deletedEntity = await entityPersistence.update({borrado: true, id})
                response(res, 200, deletedEntity)
            } catch (e) {
                console.log(e);
                response(res, e.code || 500, response.ERROR(e.data))
            }
        } else {
            response(res, 403, response.ERROR("rol no permitido"))

        }
    })


}