const validate = require("../../utils/validateRole")
const entityPersistence = require("./persistence")
const response = require("../../utils/response")
const oauth = require("../../utils/oauth")
const checkParams = require("../../utils/checkParams")
const throwError = require("../../utils/throwError")
var moment = require('moment');

module.exports = (app) => {
    app.get("/hand-hour", oauth.introspect, async (req, res) => {
        if (await validate(req, res, "administrador,supervisor,operador")) {
            try {
                let entities = await entityPersistence.getAllHandHours();
                response(res, 200, entities)
            } catch (e) {
                console.log(e);
                response(res, e.code, response.ERROR(e.data))
            }
        } else {
            response(res, 403, response.ERROR("rol no permitido"))
        }
    })

    app.get("/the-time", oauth.introspect, async (req, res) => {
        if (await validate(req, res, "administrador,supervisor,operador")) {
            try {
                response(res, 200, {time: Date.now()})
            } catch (e) {
                console.log(e);
                response(res, e.code, response.ERROR(e.data))
            }
        } else {
            response(res, 403, response.ERROR("rol no permitido"))
        }
    })

    function subirHoras(fI, contador) {

    }

    app.post("/hand-hour", oauth.introspect, async (req, res) => {
        if (await validate(req, res, "administrador")) {
            try {

                let entity = {
                    nombre: req.body.nombre,
                    horainicio: req.body.horainicio,
                    horafin: req.body.horafin
                }
                if (entity.horainicio && entity.horafin) {

                    let fechaI = moment(Date.now()).hours(entity.horainicio.split(":")[0]).minutes(0).seconds(0).milliseconds(0)
                    let c = 0
                    while (fechaI.format("HH") != entity.horafin.split(":")[0]) {
                        c += 1
                        fechaI.add("1", "h")
                    }
                    entity.horasdelturno = c
                }
                /* if (entity.horainicio && entity.horafin) {

                     entity.horasdelturno = moment.duration(moment().hours(entity.horafin.split(":")[0]).diff(moment().hours(entity.horainicio.split(":")[0]))).asHours().toFixed(0)
                 }*/

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
     app.post("/hand-hour/assign", oauth.introspect, async (req, res) => {
        if (await validate(req, res, "administrador")) {
            try {

                let entity = {
                    idhorarios: req.body.idhorarios,
                    iddiaspermitidos: req.body.iddiaspermitidos,
                }

                let createdEntity = await entityPersistence.assign(entity)
                response(res, 201, {result:createdEntity})
            } catch (e) {
                console.log(e);
                response(res, e.code, response.ERROR(e.data))
            }
        } else {
            response(res, 403, response.ERROR("rol no permitido"))
        }
    })
    app.put("/hand-hour", oauth.introspect, async (req, res) => {
        if (await validate(req, res, "administrador")) {
            try {

                if (!checkParams(req.body, ["id"])) {
                    throwError(400, "faltan datos")
                }
                let entity = {
                    id: req.body.id,
                    nombre: req.body.nombre,
                    horainicio: req.body.horainicio,
                    horafin: req.body.horafin,
                }
                /*let inicio = moment().hours(entity.horainicio.split(":")[0]).toDate().getTime()
                let i = 0
                let horaFin = moment().hours(entity.horainicio.split(":")[0])
*/
                if (entity.horainicio && entity.horafin) {
                    let fechaI = moment(Date.now()).hours(entity.horainicio.split(":")[0]).minutes(0).seconds(0).milliseconds(0)
                    let c = 0
                    while (fechaI.format("HH") != entity.horafin.split(":")[0]) {
                        c += 1
                        fechaI.add("1", "h")
                    }
                    entity.horasdelturno = c

                }


                /*

                                if (entity.horainicio && entity.horafin) {
                                    if (entity.horainicio > entity.horafin) {
                                        entity.horasdelturno = moment.duration(moment().hours(entity.horainicio.split(":")[0]).diff(moment().hours(entity.horafin.split(":")[0]))).asHours().toFixed(0)

                                    } else {
                                        entity.horasdelturno = moment.duration(moment().hours(entity.horafin.split(":")[0]).diff(moment().hours(entity.horainicio.split(":")[0]))).asHours().toFixed(0)

                                    }
                                }*/
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
    app.delete("/hand-hour/:id", oauth.introspect, async (req, res) => {
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
    app.get("/settings", oauth.introspect, async (req, res) => {
        if (await validate(req, res, "administrador,supervisor,operador")) {
            try {
                let entities = await entityPersistence.getSettings();
                response(res, 200, entities)
            } catch (e) {
                console.log(e);
                response(res, e.code, response.ERROR(e.data))
            }
        } else {
            response(res, 403, response.ERROR("rol no permitido"))
        }
    })

    /*app.post("/settings", oauth.introspect, async (req, res) => {
        if (await validate(req, res, "administrador")) {
            try {

                let entity = {
                    nombre: req.body.nombre,
                    horainicio: req.body.horainicio,
                    horafin: req.body.horafin
                }
                let createdEntity = await entityPersistence.create(entity)
                console.log(createdEntity);
                response(res, 201, createdEntity)
            } catch (e) {
                console.log(e);
                response(res, e.code, response.ERROR(e.data))
            }
        } else {
            response(res, 403, response.ERROR("rol no permitido"))
        }
    })*/
    app.put("/settings", oauth.introspect, async (req, res) => {
        if (await validate(req, res, "administrador")) {
            try {

                if (!checkParams(req.body, ["id"])) {
                    throwError(400, "faltan datos")
                }
                let entity = {
                    id: req.body.id,
                    nombreempresa: req.body.nombreempresa,
                    pais: req.body.pais,
                    thingsboardurl: req.body.thingsboardurl,
                    foto: req.body.foto,
                }
                let updatedEntity = await entityPersistence.updateSettings(entity)
                response(res, 204, updatedEntity)
            } catch (e) {
                console.log(e);
                response(res, e.code, response.ERROR(e.data))
            }
        } else {
            response(res, 403, response.ERROR("rol no permitido"))
        }
    })

    app.get("/dias", oauth.introspect, async (req, res) => {
        if (await validate(req, res, "administrador")) {
            try {
                let updatedEntity = await entityPersistence.getDays()
                response(res, 200, updatedEntity)
            } catch (e) {
                console.log(e);
                response(res, e.code, response.ERROR(e.data))
            }
        } else {
            response(res, 403, response.ERROR("rol no permitido"))
        }
    })

    app.post("/dias", oauth.introspect, async (req, res) => {
        if (await validate(req, res, "administrador")) {
            try {
                let data = {
                    nombre: req.body.nombre,
                    permitido: req.body.permitido,
                }
                let updatedEntity = await entityPersistence.updateDay(data)
                response(res, 200, updatedEntity)
            } catch (e) {
                console.log(e);
                response(res, e.code, response.ERROR(e.data))
            }
        } else {
            response(res, 403, response.ERROR("rol no permitido"))
        }
    })


}