const validate = require("../../utils/validateRole")
const response = require("../../utils/response")
const oauth = require("../../utils/oauth")
const checkParams = require("../../utils/checkParams")
const throwError = require("../../utils/throwError")
var moment = require('moment');
const sensorPersistence = require('./persistence')
const {Worker} = require("worker_threads");
const getLine = require("../../utils/getLine")

module.exports = (app, io) => {

    io.on('connection', socket => {
        socket.on('msg', data => {

            let idmaquina = data.turno.idturno_turno?.idmaquina
            if (idmaquina) {
                socket.join(idmaquina + "maq")
            }
        })
    })
    app.get("/sensor/unregistered", oauth.introspect, async (req, res) => {
        if (await validate(req, res, "administrador,operador,supervisor")) {
            try {
                let entities = await sensorPersistence.getUnregistered();
                //console.log(entities);
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
    app.get("/sensor/registered", oauth.introspect, async (req, res) => {
        if (await validate(req, res, "administrador,operador,supervisor")) {
            try {
                let entities = await sensorPersistence.getRegistered();
                //console.log(entities);
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

    app.post("/sensor/register", oauth.introspect, async (req, res) => {
        if (await validate(req, res, "administrador,operador,supervisor")) {
            try {
                let data = {
                    idcategoriasensor:req.body.idcategoriasensor,
                    id:req.body.id
                }
                let entities = await sensorPersistence.register(data);
                //console.log(entities);
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

    app.get("/sensor/maquina/:id", oauth.introspect, async (req, res) => {
        if (await validate(req, res, "administrador,operador,supervisor")) {
            try {
                let entities = await sensorPersistence.getRegisteredByMachine(req.params.id);
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

    app.post("/sensor/maquina", oauth.introspect, async (req, res) => {
        if (await validate(req, res, "administrador,operador,supervisor")) {
            try {
                let data = {
                    id:req.body.id,
                    idmaquina:req.body.idmaquina
                }
                let entities = await sensorPersistence.asociarMaquina(data);
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

    app.get("/sensor/turn/:idturno", oauth.introspect, async (req, res) => {
        if (await validate(req, res, "administrador,operador,supervisor")) {
            try {
                let entities = await sensorPersistence.getProductionByTurn(req.params.idturno);
                //console.log(entities);
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

    app.get("/sensor/merma/turn/:idturno", oauth.introspect, async (req, res) => {
        if (await validate(req, res, "administrador,operador,supervisor")) {
            try {
                let entities = await sensorPersistence.getProductionByTurnScrapSensor(req.params.idturno);
                //console.log(entities);
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
    app.get("/sensor/category/:category/turn/:idturno", oauth.introspect, async (req, res) => {
        if (await validate(req, res, "administrador,operador,supervisor")) {
            try {
                let entities = await sensorPersistence.getProductionByTurnAndCustomCategorySensor(req.params.idturno,req.params.category);
                //console.log(entities);
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
    app.get("/sensor/turn/:idturno/:hora", oauth.introspect, async (req, res) => {
        if (await validate(req, res, "administrador,operador,supervisor")) {
            try {
                let entities = await sensorPersistence.getProductionByTurnAndHour(req.params.idturno, req.params.hora);
                //console.log(entities);
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
    app.post("/sensor", async (req, res) => {
        let auth = req.headers.authorization
        if (auth == "Basic c29mdHdhcmVNRVM6M0hVWkJhZlVWV0YzNmtVZQ==") {
            let data = {}
            for (let info of req.body.data) {
               /* if(info.id == 'marconi12'){
                    info.id = 1
                } if(info.id == 'marconi3'){
                    info.id = 2
                } if(info.id == 'envasadora'){
                    info.id = 3
                }*/
                //io.to(info.id + "maq").emit('sensores', info)
                console.log(req.ip);
                console.log(info);
                const worker = new Worker("./src/ingestor2.js", {workerData: {data: info}});
                worker.once("message", result => {
                    io.emit("produccion", Date.now())
                });
                /* worker.on("error", error => {console.log(error)});
                 worker.on("exit", exitCode => {console.log(`It exited with code ${exitCode}`)})
 */

            }
        }


        res.send()
        /*  if (await validate(req, res, "administrador,supervisor,operador")) {
              try {
                  let entities = await entityPersistence.getAllHandHours();
                  response(res, 200, entities)
              } catch (e) {
                  console.log(e);
                  response(res, e.code, response.ERROR(e.data))
              }
          } else {
              response(res, 403, response.ERROR("rol no permitido"))
          }*/
    })
}