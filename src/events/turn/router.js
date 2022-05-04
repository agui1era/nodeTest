const validate = require("../../utils/validateRole")
const entityPersistence = require("./persistence")
const response = require("../../utils/response")
const oauth = require("../../utils/oauth")
const checkParams = require("../../utils/checkParams")
const throwError = require("../../utils/throwError")
const login = require("../login/loginEvent")
const getToken = require("../../utils/getTokenReq")
const h = require("../../utils/hour");
const getLine = require("../../utils/getLine");
const userPersistence = require("../users/usersPersistence");

module.exports = (app,io) => {
    app.get("/turn/all/productturn", oauth.introspect, async (req, res) => {
        if (await validate(req, res, "operador,supervisor,administrador")) {
            try {
                let machineId = req.params.id
                //let hora = await h.hora()
                let entities = await entityPersistence.getAllProductTurns()
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
    app.get("/turn/machine/:id", oauth.introspect, async (req, res) => {
        if (await validate(req, res, "operador,supervisor,administrador")) {
            try {
                let machineId = req.params.id
                //let hora = await h.hora()
                let entities = await entityPersistence.getTurnByMachineAndDay(
                    {
                        idmaquina: machineId,
                        dia: new Date(Date.now()).toISOString(),
                    }
                );
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
    app.get("/turn/pending", oauth.introspect, async (req, res) => {
        if (await validate(req, res, "operador,supervisor,administrador")) {
            try {
                let token = getToken(req);
                let infoToken = await login.introspect(token)
                let entities = await entityPersistence.getPendingsByUser({
                    username: infoToken.data.username,
                    role: infoToken.data.family_name
                });
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
    app.get("/turn/initiated/:machineId", oauth.introspect, async (req, res) => {
        if (await validate(req, res, "operador,supervisor,administrador")) {
            try {
                let entities = await entityPersistence.getInitedTurnByMachine(req.params.machineId);
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
    app.get("/turn/production/:turnId", oauth.introspect, async (req, res) => {
        if (await validate(req, res, "operador,supervisor,administrador")) {
            try {
                let entities = await entityPersistence.getAllProductionByTurn(req.params.turnId)
                //let hora = await h.hora()

                res.set("lahora", Date.now())
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
    app.get("/turn/production/machine/:id", oauth.introspect, async (req, res) => {
        if (await validate(req, res, "operador,supervisor,administrador")) {
            try {

                let entities = await entityPersistence.getAllProductionByProductTurn(req.params.id);
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
    app.get("/turn/operators/:idturno", oauth.introspect, async (req, res) => {
        if (await validate(req, res, "operador,supervisor,administrador")) {
            try {

                let entities = await entityPersistence.getOperatorsByTurn(req.params.idturno);
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
    /*
    app.get("/turn/detentions/:turnId", oauth.introspect, async (req, res) => {
        if (await validate(req, res, "operador,supervisor")) {
            try {

                let entities = await entityPersistence.getAllDetentionsByTurn(req.params.turnId);
                response(res, 200, entities)
            } catch (e) {
                console.log(e);
                response(res, e.code, response.ERROR(e.data))
            }
        } else {
            response(res, 403, response.ERROR("rol no permitido"))
        }
    })*/

    app.get("/turn/product/machine/:id", oauth.introspect, async (req, res) => {
        if (await validate(req, res, "operador,supervisor,administrador")) {
            try {

                let entities = await entityPersistence.getAllProductTurnByTurn(req.params.id);
                response(res, 200, entities)
            } catch (e) {
                console.log(e);
                console.log(getLine().default());

                response(res, e.code || 510, response.ERROR(e.data))
            }
        } else {
            response(res, 403, response.ERROR("rol no permitido"))
        }
    })
    app.put("/turn/init/:id", oauth.introspect, async (req, res) => {
        if (await validate(req, res, "operador,supervisor,administrador")) {
            try {
                let idordendetrabajo = null
                if(req.body.idordendetrabajo){
                    idordendetrabajo = req.body.idordendetrabajo
                }
                let token = getToken(req);
                let infoToken = await login.introspect(token)
                let role = infoToken.data.family_name
                infoToken.data.role = infoToken.data.family_name
                let userData = await userPersistence.getUserByUsername(infoToken.data)
                userData.username = infoToken.data.username
                let createdTurn = await entityPersistence.createOrGetTurnOfNowOfMachine(req.params.id,idordendetrabajo,userData,io)

                let entity = {
                    idturno: createdTurn.id,
                    horainicio: Date.now(),
                    username: infoToken.data.username,
                    role
                }
                let createdTurnRelation = await entityPersistence.initTurnDetailsByRole(entity)
                io.emit("ot", true)

                response(res, 201, createdTurnRelation)
            } catch (e) {
                console.log(e);
                console.log(getLine().default());

                response(res, e.code, response.ERROR(e.data))
            }
        } else {
            response(res, 403, response.ERROR("rol no permitido"))
        }
    })


      app.put("/turn", oauth.introspect, async (req, res) => {
          if (await validate(req, res, "administrador,operador,supervisor")) {
              try {

                  if (!checkParams(req.body, ["id"])) {
                      throwError(400, "faltan datos")
                  }
                  let entity = {
                      id: req.body.id,
                      velocidad: req.body.velocidad,
                      mermas: req.body.mermas,
                      produccionesperada: req.body.produccionesperada,
                  }
                  console.log(entity);
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
      });

    app.post("/turn/product", oauth.introspect, async (req, res) => {
        if (await validate(req, res, "administrador,operador,supervisor")) {
            try {
              /*  if (!checkParams(req.body, ["idturno"])) {
                    throwError(400, "faltan datos")
                }*/
                let entity = {
                    idmaquina: req.body.idmaquina,
                    idhorario: req.body.idhorario,
                    dia: req.body.dia,
                    horainicio: req.body.horainicio,
                    idturno: req.body.idturno,
                    formato: req.body.formato,
                    serie: req.body.serie,
                    condicion: req.body.condicion,
                    idsubproducto: req.body.idsubproducto,
                    mermas: req.body.mermas,
                    cantidadesperada: req.body.cantidadesperada,
                    formatounidad: req.body.formatounidad,
                    idordendetrabajo: req.body.idordendetrabajo
                }
                // let existentProductionEntity = await entityPersistence.checkProductoOfTurn(entity);
                let createProductionEntity = {}
                // if (!existentProductionEntity) {
                createProductionEntity = await entityPersistence.createTurnProduct(entity,req.query.idturno)
                // }

                //  console.log(existentProductionEntity);
                /*    entity = {
                        hora: req.body.hora,
                        cantidad: req.body.cantidad,
                        idprodturn: existentProductionEntity ? existentProductionEntity.id : createProductionEntity.id,
                    }
                    console.log(entity);
                    let detProduction = await entityPersistence.createDetProduction(entity)
    */
                response(res, 201, createProductionEntity)
            } catch (e) {
                console.log(e);
                console.log(getLine().default());

                response(res, e.code, response.ERROR(e.data))
            }
        } else {
            response(res, 403, response.ERROR("rol no permitido"))
        }
    });
    app.post("/turn/production", oauth.introspect, async (req, res) => {
        if (await validate(req, res, "administrador,operador,supervisor")) {
            try {
              /*  if (!checkParams(req.body, ["idprodturn"])) {
                    throwError(400, "faltan datos")
                }*/
                let entity = {
                    idprodturn: req.body.idprodturn,
                    idmaquina:req.body.idmaquina,
                    idhorario:req.body.idhorario,
                    dia:req.body.dia,
                    horainicio:req.body.horainicio,
                    formato:req.body.formato,
                    condicion:req.body.condicion,
                    formatounidad:req.body.formatounidad,
                    idordendetrabajo:req.body.idordendetrabajo,
                    idsubproducto:req.body.idsubproducto,

                    hora: req.body.hora,
                    cantidad: req.body.cantidad
                }
                let createProductionEntity = await entityPersistence.createDetProduction(entity,req.query.idpt)
                //let hora = await h.hora()
                io.emit("minuto",Date.now())
                io.emit("produccion", true)

                response(res, 201, createProductionEntity)
            } catch (e) {
                console.log(e);
                console.log(getLine().default());

                response(res, e.code, response.ERROR(e.data))
            }
        } else {
            response(res, 403, response.ERROR("rol no permitido"))
        }
    });
    app.put("/turn/product", oauth.introspect, async (req, res) => {
        if (await validate(req, res, "administrador,operador,supervisor")) {
            try {
                /* if (!checkParams(req.body, ["idturno"])) {
                     throwError(400, "faltan datos")
                 }*/
                let entity = {
                    id: req.body.id,
                    formato: req.body.formato,
                    serie: req.body.serie,
                    condicion: req.body.condicion,
                    idsubproducto: req.body.idsubproducto,
                    formatounidad: req.body.formatounidad,
                    activoenturno: req.body.activoenturno,
                    cantidadesperada: req.body.cantidadesperada,
                    mermas: req.body.mermas,
                    velocidad: req.body.velocidad,
                }
                // let existentProductionEntity = await entityPersistence.checkProductoOfTurn(entity);
                let createProductionEntity = {}
                // if (!existentProductionEntity) {
                createProductionEntity = await entityPersistence.editTurnProduct(entity)
                // }

                //  console.log(existentProductionEntity);
                /*    entity = {
                        hora: req.body.hora,
                        cantidad: req.body.cantidad,
                        idprodturn: existentProductionEntity ? existentProductionEntity.id : createProductionEntity.id,
                    }
                    console.log(entity);
                    let detProduction = await entityPersistence.createDetProduction(entity)
    */
                response(res, 204, createProductionEntity)
            } catch (e) {
                console.log(e);
                console.log(getLine().default());

                response(res, e.code, response.ERROR(e.data))
            }
        } else {
            response(res, 403, response.ERROR("rol no permitido"))
        }
    });
    app.delete("/turn/product/:id", oauth.introspect, async (req, res) => {
        if (await validate(req, res, "administrador,operador,supervisor")) {
            try {

                let deletedEntity = await entityPersistence.deleteTurnProduct(req.params.id)
                response(res, 204, '')
            } catch (e) {
                console.log(e);
                response(res, e.code, response.ERROR(e.data))
            }
        } else {
            response(res, 403, response.ERROR("rol no permitido"))
        }
    });
    app.delete("/turn/production/:id", oauth.introspect, async (req, res) => {
        if (await validate(req, res, "administrador,operador,supervisor")) {
            try {

                let deletedEntity = await entityPersistence.deleteDetProduction(req.params.id)
                response(res, 204, '')
            } catch (e) {
                console.log(e);
                console.log(getLine().default());

                response(res, e.code, response.ERROR(e.data))
            }
        } else {
            response(res, 403, response.ERROR("rol no permitido"))
        }
    });
    app.patch("/turn/end/:id", oauth.introspect, async (req, res) => {
        if (await validate(req, res, "operador,supervisor,administrador")) {
            try {
                /*
                                if (!checkParams(req.body, ["id"])) {
                                    throwError(400, "faltan datos")
                                }*/

                let token = getToken(req);
                let infoToken = await login.introspect(token)
                let username = infoToken.data.username
                let role = infoToken.data.family_name

                let updatedEntity = await entityPersistence.endTurn({
                    username,
                    role,
                    id: req.params.id
                })
                console.log(updatedEntity);
                response(res, 200, updatedEntity)
            } catch (e) {
                console.log(e);
                console.log(getLine().default());

                response(res, e.code, response.ERROR(e.data))
            }
        } else {
            response(res, 403, response.ERROR("rol no permitido"))
        }
    })
    /* app.delete("/turn/:id", oauth.introspect, async (req, res) => {
         if (await validate(req, res, "administrador")) {
             try {
                 let id = req.params.id
                 let deletedEntity = await entityPersistence.delete(id)
                 console.log(deletedEntity);
                 response(res, 200, {})
             } catch (e) {
                 console.log(e);
                 response(res, e.code, response.ERROR(e.data))
             }
         } else {
             response(res, 403, response.ERROR("rol no permitido"))

         }
     })*/


}