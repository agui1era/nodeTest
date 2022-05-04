const validate = require("../../utils/validateRole")
const entityPersistence = require("./persistence")
const entityEvent = require("./events")
const response = require("../../utils/response")
const oauth = require("../../utils/oauth")
const checkParams = require("../../utils/checkParams")
const throwError = require("../../utils/throwError")
const getLine = require("../../utils/getLine")
module.exports = (app) => {
    app.get("/oee/:idturno", oauth.introspect, async (req, res) => {
        if (await validate(req, res, "administrador,operador,supervisor")) {
            try {
                let idturno = req.params.idturno
                let entities = await entityPersistence.oeeByTurn(idturno);
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
    app.post("/oee/maquina", oauth.introspect, async (req, res) => {
        if (await validate(req, res, "administrador,operador,supervisor")) {
            try {
                let maquinas = req.body.maquinas
                let fechas = {}
                if (req.body.fechas) fechas = req.body.fechas
                let entities = await entityEvent.maqOee(maquinas, fechas);
                if (entities) {
                    response(res, 200, entities)
                } else {
                    response(res, 200, {error: 'errorOee'})
                }
            } catch (e) {
                console.log(e);
                console.log(getLine().default());
                response(res, e.code, response.ERROR(e.data))
            }
        } else {
            response(res, 403, response.ERROR("rol no permitido"))
        }
    })
    app.get("/oee/machine/:idMachine", oauth.introspect, async (req, res) => {
        if (await validate(req, res, "administrador,operador,supervisor")) {
            try {
                let idmaquina = req.params.idMachine
                let entities = await entityPersistence.oeeByMaquina(idmaquina);
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
    app.get("/oee/process/:idproceso", oauth.introspect, async (req, res) => {
        if (await validate(req, res, "administrador,operador,supervisor")) {
            try {
                let idproceso = req.params.idproceso
                let entities = await entityPersistence.oeeByProceso(idproceso);
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
    app.get("/oee/plant/:idplanta", oauth.introspect, async (req, res) => {
        if (await validate(req, res, "administrador,operador,supervisor")) {
            try {
                let idproceso = req.params.idplanta
                let entities = await entityPersistence.oeeByPlant(idproceso);
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
    app.get("/analitica/ot/mermas", oauth.introspect, async (req, res) => {
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
                let entities = await entityPersistence.allOtMerma(queryP);
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

    app.get("/analitica/ot/pendientes", oauth.introspect, async (req, res) => {
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

                let entities = await entityPersistence.allOtPendings(queryP);
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
    app.get("/analitica/mantenciones/pendientes", oauth.introspect, async (req, res) => {
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
                let entities = await entityPersistence.allMantPendings(queryP);
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


    app.get("/indicadores", oauth.introspect, async (req, res) => {
        if (await validate(req, res, "administrador,operador,supervisor")) {
            try {
                let entities = await entityPersistence.getAllIndicadores();
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
    app.get("/analitica/paradas/all", oauth.introspect, async (req, res) => {
        if (await validate(req, res, "administrador,operador,supervisor")) {
            try {
                let queryP = {
                    idmaquina: req.query.selectedMachine,
                    idplanta: req.query.selectedPlant,
                    idproceso: req.query.selectedProcess,
                    horainicio: req.query.selectedFecha
                }
                Object.keys(queryP).forEach(key => {
                    if (queryP[key] === undefined) {
                        delete queryP[key];
                    }
                });
                let entities = await entityPersistence.allParadas(queryP);
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
    app.get("/analitica/mantenimientos/all", oauth.introspect, async (req, res) => {
        if (await validate(req, res, "administrador,operador,supervisor")) {
            try {
                let queryP = {
                    idmaquina: req.query.selectedMachine,
                    /*  idplanta: req.query.selectedPlant,
                      idproceso: req.query.selectedProcess,*/
                    horainicio: req.query.selectedFecha
                }
                Object.keys(queryP).forEach(key => {
                    if (queryP[key] === undefined) {
                        delete queryP[key];
                    }
                });
                let entities = await entityPersistence.allMantenimientos(queryP);
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


    /*  app.post("/plant", oauth.introspect, async (req, res) => {
          if (await validate(req, res, "administrador")) {
              try {

                  if (!checkParams(req.body, ["nombre"])) {
                      throwError(400, "faltan datos")
                  }
                  let entity = {
                      nombre: req.body.nombre,
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
      })
      app.put("/plant", oauth.introspect, async (req, res) => {
          if (await validate(req, res, "administrador")) {
              try {

                  if (!checkParams(req.body, ["nombre","id"])) {
                      throwError(400, "faltan datos")
                  }
                  let entity = {
                      id: req.body.id,
                      nombre: req.body.nombre
                  }
                  let updatedEntity = await entityPersistence.update(entity)
                  console.log(updatedEntity);
                  response(res, 204, updatedEntity)
              } catch (e) {
                  console.log(e);
                  response(res, e.code, response.ERROR(e.data))
              }
          } else {
              response(res, 403, response.ERROR("rol no permitido"))
          }
      })
      app.delete("/plant/:id", oauth.introspect, async (req, res) => {
          if (await validate(req, res, "administrador")) {
              try {
                  let id = req.params.id
                  let deletedEntity = await entityPersistence.delete(id)
                  console.log(deletedEntity);
                  response(res, 204, {})
              } catch (e) {
                  console.log(e);
                  response(res, e.code, response.ERROR(e.data))
              }
          } else {
              response(res, 403, response.ERROR("rol no permitido"))

          }
      })*/


}