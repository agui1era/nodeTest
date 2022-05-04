const {parentPort, workerData} = require("worker_threads");
const _entity = require("./database/models/maquina");
const _interruption = require("./database/models/interrupcion");
const _paradamaquina = require("./database/models/paradamaquina");
const _parada = require("./database/models/parada");
const _sensordata = require("./database/models/sensordata");
const _turno = require("./database/models/turno");
const _productoturno = require("./database/models/productoturno");
const _detproduccion = require("./database/models/detproduccion");
const sequelize = require("./database/index");
const {DataTypes, Op} = require("sequelize");
const entityPersistence = require("./events/detention/persistence");
const response = require("./utils/response");
const interruptionEntity = _interruption(sequelize.sql, DataTypes);
const parada = _parada(sequelize.sql, DataTypes);
const paradamaquina = _paradamaquina(sequelize.sql, DataTypes);
const turno = _turno(sequelize.sql, DataTypes);
const detproduccion = _detproduccion(sequelize.sql, DataTypes);
const machineEnt = _entity(sequelize.sql, DataTypes);
const productoturno = _productoturno(sequelize.sql, DataTypes);
const sensordata = _sensordata(sequelize.sql, DataTypes);
const hour = require("./utils/hour")
const moment = require("moment");
const turnPersistenceClass = require("./events/turn/persistence")


//console.log(workerData.data);
machineEnt.findOne({
    where: {
        id: workerData.data.id
    }
}).then(machineRecord => {
    if (machineRecord) {

        turnPersistenceClass.createOrGetTurnOfNowOfMachine(workerData.data.id).then(startedTurn => {
            //console.log("startedTurn");
            //console.log(startedTurn);
            turno.update({sensor: true, velocidad: +workerData.data.produccion * 60}, {
                where: {id: startedTurn.id}
            })


            productoturno.findOne({
                where: {
                    idturno: startedTurn.id
                }
            }).then(okProductTurn => {
                //console.log("okProductTurn");
                //console.log(okProductTurn);

                if (okProductTurn == null) {
                    productoturno.create({
                        idturno: startedTurn.id,
                        activoenturno: true
                    }).then(okProdTurnPersistence => {

                        productoturno.findOne({where: {idturno: startedTurn.id}}).then(
                            recordProductTurn => {
                                detproduccion.findOne({
                                    where: {
                                        idprodturn: recordProductTurn.id,
                                        hora: moment(parseInt(workerData.data.ts)).format("HH:00")

                                    }
                                }).then(okDetProd => {
                                    if (okDetProd == null) {
                                        detproduccion.create({
                                            idprodturn: recordProductTurn.id,
                                            hora: moment(parseInt(workerData.data.ts)).format("HH:00"),
                                            cantidad: 0
                                        }).then(okDetProdPersistence => {
                                            detproduccion.findOne({
                                                where: {
                                                    idprodturn: recordProductTurn.id,
                                                    hora: moment(parseInt(workerData.data.ts)).format("HH:00"),

                                                }
                                            }).then(findedOkDetProdPersistence => {
                                                detproduccion.update({cantidad: +workerData.data.produccion + +findedOkDetProdPersistence.cantidad}, {
                                                    where: {
                                                        id: findedOkDetProdPersistence.id
                                                    }
                                                })
                                            })
                                        })

                                    } else {
                                        detproduccion.findOne({
                                            where: {
                                                idprodturn: recordProductTurn.id,
                                                hora: moment(parseInt(workerData.data.ts)).format("HH:00"),

                                            }
                                        }).then(findedOkDetProdPersistence => {
                                            detproduccion.update({cantidad: +workerData.data.produccion + +findedOkDetProdPersistence.cantidad}, {
                                                where: {
                                                    id: findedOkDetProdPersistence.id
                                                }
                                            })
                                        })
                                    }
                                })
                            })
                    })
                } else {
                    productoturno.findOne({where: {idturno: startedTurn.id}}).then(
                        recordProductTurn => {
                            detproduccion.findOne({
                                where: {
                                    idprodturn: recordProductTurn.id,
                                    hora: moment(parseInt(workerData.data.ts)).format("HH:00")
                                }
                            }).then(okDetProd => {
                                if (okDetProd == null) {
                                    detproduccion.create({
                                        idprodturn: recordProductTurn.id,
                                        hora: moment(parseInt(workerData.data.ts)).format("HH:00"),
                                        cantidad: 0
                                    }).then(okDetProdPersistence => {
                                        detproduccion.findOne({
                                            where: {
                                                idprodturn: recordProductTurn.id,
                                                hora: moment(parseInt(workerData.data.ts)).format("HH:00"),

                                            }
                                        }).then(findedOkDetProdPersistence => {
                                            detproduccion.update({cantidad: +workerData.data.produccion + +findedOkDetProdPersistence.cantidad}, {
                                                where: {
                                                    id: findedOkDetProdPersistence.id
                                                }
                                            })
                                        })
                                    })

                                } else {
                                    detproduccion.findOne({
                                        where: {
                                            idprodturn: recordProductTurn.id,
                                            hora: moment(parseInt(workerData.data.ts)).format("HH:00"),

                                        }
                                    }).then(findedOkDetProdPersistence => {
                                        detproduccion.update({cantidad: +workerData.data.produccion + +findedOkDetProdPersistence.cantidad}, {
                                            where: {
                                                id: findedOkDetProdPersistence.id
                                            }
                                        })
                                    })
                                }
                            })
                        }
                    )
                }
            })
        })
        sensordata.create({
            idmaquina: workerData.data.id,
            produccion: workerData.data.produccion,
            timestamp: parseInt(workerData.data.ts)
        })
        let prodxmin = (machineRecord.velpromprod / 60).toFixed(0)

        //Deteccion de bajas de velocidad
        if (workerData.data.produccion < prodxmin * 0.70 && workerData.data.produccion != 0) {
            //baja de velocidad

            console.log("HAY UNA BAJA DE VLOCIDAD");

            let idMachine = workerData.data.id


            let entity = {
                nombre: "Baja de velocidad",
                idmaqrel: idMachine.toString()
            }
            parada.findOrCreate({where: entity}).then(okParada => {
                //console.log("okPARADA");
                //console.log(okParada);
                let findParadaMaquina = {
                    idparada: okParada[0].id,
                    idmaquina: idMachine
                }
                //console.log(findParadaMaquina);
                paradamaquina.findOrCreate({where: findParadaMaquina}).then(okParadaMaquina => {

                    let interru = {
                        horainicio: moment(parseInt(workerData.data.ts)).subtract(1, "minute").toDate().getTime(),
                        duracion: 60,
                        tipo: okParada[0].id,
                        comentario: "baja de velocidad reportada por el sensor"
                    }
                    interruptionEntity.create(interru)
                })
            })

        }
        //Deteccion de maquina en pausa
        if (workerData.data.produccion == 0) {
            console.log("LA MAQUINA PODRIA ESTAR EN PAUSA");
            sensordata.findAll({
                limit: 1,
                where: {idmaquina: workerData.data.id.toString()},
                order: [['timestamp', 'DESC']]
            }).then(registroAnterior => {
                if (registroAnterior.length == 1) {
                    console.log(`REGISTRO ANTERIOR ${JSON.stringify(registroAnterior)}`);
                    if (registroAnterior[0].produccion == 0) {
                        console.log("LA MAQUINA ESTA EN PAUSA");
                        let idMachine = workerData.data.id
                        let entity = {
                            nombre: "Maquina sin producir",
                            idmaqrel: idMachine.toString()
                        }
                        parada.findOrCreate({where: entity}).then(okParada => {
                            /* //console.log("okPARADA");
                             //console.log(okParada);*/
                            let findParadaMaquina = {
                                idparada: okParada[0].id,
                                idmaquina: idMachine
                            }
                            //console.log(findParadaMaquina);
                            let diferenciaEnSecs = moment.duration(moment(parseInt(workerData.data.ts))
                                .diff(moment(registroAnterior[0].timestamp))).asSeconds()
                            paradamaquina.findOrCreate({where: findParadaMaquina}).then(okParadaMaquina => {

                                let interru = {
                                    horainicio: registroAnterior[0].timestamp,
                                    duracion: +diferenciaEnSecs + 60,
                                    tipo: okParada[0].id,
                                    comentario: "Alerta reportada por el sensor"
                                }
                                interruptionEntity.create(interru).then(okCreatInt=>{
                                    console.log(okCreatInt);
                                })
                            })
                        })


                    }


                }


            })
        }

    }

})


parentPort.postMessage("ingestado")
