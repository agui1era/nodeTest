const validate = require("../../utils/validateRole")
const entityPersistence = require("./persistence")
const response = require("../../utils/response")
const oauth = require("../../utils/oauth")
const checkParams = require("../../utils/checkParams")
const throwError = require("../../utils/throwError")
const getRole = require("../../utils/oauth")
const getToken = require("../../utils/getTokenReq");
const login = require("../login/loginEvent");
const userPersistence = require("../users/usersPersistence");
module.exports = (app, io) => {
    app.get("/interrupcion/:id", oauth.introspect, async (req, res) => {
        if (await validate(req, res, "administrador,supervisor,operador")) {
            try {
                let entities = await entityPersistence.getById(req.params.id);
                response(res, 200, entities)
            } catch (e) {
                console.log(e);
                response(res, e.code, response.ERROR(e.data))
            }
        } else {
            response(res, 403, response.ERROR("rol no permitido"))
        }
    })
    app.get("/interrupcion", oauth.introspect, async (req, res) => {
        if (await validate(req, res, "administrador,supervisor,operador")) {
            try {
                let entities = await entityPersistence.getAll(req.query.pag);
                response(res, 200, entities)
            } catch (e) {
                console.log(e);
                response(res, e.code, response.ERROR(e.data))
            }
        } else {
            response(res, 403, response.ERROR("rol no permitido"))
        }
    })
    app.get("/interrupcion/fusionar/todo", oauth.introspect, async (req, res) => {
        if (await validate(req, res, "administrador,supervisor,operador")) {
            try {


                let entities = await entityPersistence.fusionAll();
                response(res, 200, entities)
            } catch (e) {
                console.log(e);
                response(res, e.code, response.ERROR(e.data))
            }
        } else {
            response(res, 403, response.ERROR("rol no permitido"))
        }
    })
    app.get("/interrupcion/machine/:idmachine/:idturno", oauth.introspect, async (req, res) => {
        if (await validate(req, res, "administrador,supervisor,operador")) {
            try {
                let entities = await entityPersistence.getAllByMachine(req.params.idmachine, req.params.idturno || '');
                response(res, 200, entities.filter(o => o.tipo_parada != null))
            } catch (e) {
                console.log(e);
                response(res, e.code, response.ERROR(e.data))
            }
        } else {
            response(res, 403, response.ERROR("rol no permitido"))
        }
    })
    app.post("/interrupcion", oauth.introspect, async (req, res) => {
        if (await validate(req, res, "administrador,supervisor,operador")) {
            try {

                /*  if (!checkParams(req.body, ["nombre"])) {
                      throwError(400, "faltan datos")
                  }*/
                let token = getToken(req);
                let infoToken = await login.introspect(token)
                console.log(infoToken.data);
                infoToken.data.role = infoToken.data.family_name
                let userData = await userPersistence.getUserByUsername(infoToken.data)
                console.log(userData);

                let entity = {
                    horainicio: req.body.horainicio == "now" ? Date.now() : req.body.horainicio,
                    duracion: req.body.duracion,
                    idmaquina: req.body.idmaquina,
                    tipo: req.body.tipo,
                    comentario: req.body.comentario,
                }

                if (await validate(req, res, "operador")) {

                    entity.quiennecesitaconfirmacion = `${userData.nombre} ${userData.apellido}`
                    entity.quiennecesitaconfirmacionuser = infoToken.data.username
                    entity.necesitaconfirmacion = true
                }

                let createdEntity = await entityPersistence.create(entity,io,req.query.idtipo)
                io.emit("minuto", Date.now())
                response(res, 201, createdEntity)
            } catch (e) {
                console.log(e);
                response(res, e.code, response.ERROR(e.data))
            }
        } else {
            response(res, 403, response.ERROR("rol no permitido"))
        }
    })

    app.post("/interrupcion/fusion", oauth.introspect, async (req, res) => {
        if (await validate(req, res, "administrador,supervisor,operador")) {
            try {

                /*if (!checkParams(req.body, ["nombre","id"])) {
                    throwError(400, "faltan datos")
                }*/
                let entity = {
                    idturno: req.body.idturno,
                    interrupcion: req.body.interrupcion,
                    initMin: req.body.initMin
                }
                let updatedEntity = await entityPersistence.fusion(entity)
                response(res, 200, updatedEntity)
            } catch (e) {
                console.log(e);
                response(res, e.code, response.ERROR(e.data))
            }
        } else {
            response(res, 403, response.ERROR("rol no permitido"))
        }
    })
    app.post("/interrupcion/fusion/turno", oauth.introspect, async (req, res) => {
        if (await validate(req, res, "administrador,supervisor,operador")) {
            try {

                /*if (!checkParams(req.body, ["nombre","id"])) {
                    throwError(400, "faltan datos")
                }*/
                let entity = {
                    idturno: req.body.idturno,
                }
                let updatedEntity = await entityPersistence.fusionTurno(entity)
                io.emit("minuto", Date.now())

                response(res, 200, updatedEntity)
            } catch (e) {
                console.log(e);
                response(res, e.code, response.ERROR(e.data))
            }
        } else {
            response(res, 403, response.ERROR("rol no permitido"))
        }
    })
    app.post("/interrupcion/confirmar", oauth.introspect, async (req, res) => {
        if (await validate(req, res, "administrador,supervisor,operador")) {
            try {

                /*if (!checkParams(req.body, ["nombre","id"])) {
                    throwError(400, "faltan datos")
                }*/
                let token = getToken(req);
                let infoToken = await login.introspect(token)
                console.log(infoToken.data);
                infoToken.data.role = infoToken.data.family_name
                let userData = await userPersistence.getUserByUsername(infoToken.data)
                console.log(userData);

                let entity = {
                    id: req.body.id,
                    idcategoriaparada: req.body.idcategoriaparada,
                    nombre: req.body.nombre,
                    quiencreaconfirmacion: `${userData.nombre} ${userData.apellido}`,
                    quiencreaconfirmacionuser: infoToken.data.username

                }

                let updatedEntity = await entityPersistence.confirmar(entity)
                response(res, 200, updatedEntity)
            } catch (e) {
                console.log(e);
                response(res, e.code, response.ERROR(e.data))
            }
        } else {
            response(res, 403, response.ERROR("rol no permitido"))
        }
    })
    app.put("/interrupcion", oauth.introspect, async (req, res) => {
        if (await validate(req, res, "administrador,supervisor,operador")) {
            try {

                /*if (!checkParams(req.body, ["nombre","id"])) {
                    throwError(400, "faltan datos")
                }*/
                let entity = {
                    id: req.body.id,
                    horainicio: req.body.horainicio,
                    duracion: req.body.duracion,
                    tipo: req.body.tipo,
                    comentario: req.body.comentario,
                    necesitaconfirmacion: req.body.necesitaconfirmacion,
                }
                /*  if (await validate(req, res, "operador")) {
                      entity.necesitaconfirmacion = true
                  }
  */
                let updatedEntity = await entityPersistence.update(entity,io)
                io.emit("minuto", Date.now())
                response(res, 201, updatedEntity)
            } catch (e) {
                console.log(e);
                response(res, e.code, response.ERROR(e.data))
            }
        } else {
            response(res, 403, response.ERROR("rol no permitido"))
        }
    })
    app.delete("/interrupcion/:id", oauth.introspect, async (req, res) => {
        if (await validate(req, res, "administrador,supervisor,operador")) {
            try {
                let id = req.params.id
                let deletedEntity = await entityPersistence.delete(id)
                response(res, 200, {})
            } catch (e) {
                console.log(e);
                response(res, e.code, response.ERROR(e.data))
            }
        } else {
            response(res, 403, response.ERROR("rol no permitido"))

        }
    })


}