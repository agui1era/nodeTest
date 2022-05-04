const initDB = require("./database/index");
const {parentPort, workerData} = require("worker_threads");
const _entity = require("./database/models/maquina");
const _interruption = require("./database/models/interrupcion");
const _paradamaquina = require("./database/models/paradamaquina");
const _turnomerma = require("./database/models/turnomerma");
const _parada = require("./database/models/parada");
const _producto = require("./database/models/producto");
const _diaspermitidos = require("./database/models/diaspermitidos");
const _subproducto = require("./database/models/subproducto");
const _sensor = require("./database/models/sensor");
const _diashorarios = require("./database/models/diashorarios");
const _horarios = require("./database/models/horarios");
const _categoriasensor = require("./database/models/categoriasensor");
const _ordendetrabajo = require("./database/models/ordendetrabajo");
const _sensordata = require("./database/models/sensordata");
const _subproductosmaquina = require("./database/models/subproductosmaquina");
const _maquina = require("./database/models/maquina");
const _turno = require("./database/models/turno");
const _productoturno = require("./database/models/productoturno");
const _detproduccion = require("./database/models/detproduccion");
const sequelize = require("./database/index");
const {DataTypes, Op} = require("sequelize");
const entityPersistence = require("./events/detention/persistence");
const response = require("./utils/response");
const interruptionEntity = _interruption(sequelize.sql, DataTypes);
const diaspermitidos = _diaspermitidos(sequelize.sql, DataTypes);
const subproductosmaquina = _subproductosmaquina(sequelize.sql, DataTypes);
const parada = _parada(sequelize.sql, DataTypes);
const paradamaquina = _paradamaquina(sequelize.sql, DataTypes);
const sensor = _sensor(sequelize.sql, DataTypes);
const horarios = _horarios(sequelize.sql, DataTypes);
const diashorarios = _diashorarios(sequelize.sql, DataTypes);
const categoriasensor = _categoriasensor(sequelize.sql, DataTypes);
const turno = _turno(sequelize.sql, DataTypes);
const subproducto = _subproducto(sequelize.sql, DataTypes);
const producto = _producto(sequelize.sql, DataTypes);
const turnomerma = _turnomerma(sequelize.sql, DataTypes);
const detproduccion = _detproduccion(sequelize.sql, DataTypes);
const ordendetrabajo = _ordendetrabajo(sequelize.sql, DataTypes);
const machineEnt = _entity(sequelize.sql, DataTypes);
const productoturno = _productoturno(sequelize.sql, DataTypes);
const sensordata = _sensordata(sequelize.sql, DataTypes);
const maquina = _maquina(sequelize.sql, DataTypes);
const hour = require("./utils/hour")
const logger = require("./utils/logger");
const moment = require("moment");
const getLine = require("./utils/getLine");
const turnPersistenceClass = require("./events/turn/persistence")
const subproductsmaquinaPersistenceClass = require("./events/subproductsmaquina/persistence")


console.log = function (...args) {
    let msg = {...args}[0];
    logger(msg)
}
initDB.init();
const initm = require("./database/models/init-models")
const prodlogsPersistence = require("./events/prodlog/persistence");

const ingestacion = async () => {
    try {
        console.log(`tratando de ingestar ${JSON.stringify(workerData.data)}`);
        if (isNaN(workerData.data.produccion)) workerData.data.produccion = 0
        if (isNaN(workerData.data.acumulado)) workerData.data.acumulado = 0
        let sensorRegistrado = await sensor.findOne({
            where: {
                idreferencia: workerData.data.id.toString()
            }
        })
        if (sensorRegistrado) {

        } else {
            await sensor.create({
                idreferencia: workerData.data.id.toString()
            })
            return true
        }
        if (sensorRegistrado.idmaquina == null) {
            console.log("necesitar ser asociado a maquina");
            return true
        }
        workerData.data.idsensor = workerData.data.id.toString()
        workerData.data.id = sensorRegistrado.idmaquina

        let registroAnteriorValid = await sensordata
            .findAll({
                limit: 1,
                where: {idmaquina: workerData.data.id.toString(), idsensor: workerData.data.idsensor},
                order: [['timestamp', 'DESC']]
            })
        if (registroAnteriorValid && new Date(registroAnteriorValid[0]?.timestamp).getTime() == workerData.data.ts) {
            console.log("noa haciendo nada se supone ant");
            return true
        } else if (workerData.data.ts == 0) {
            console.log("noa haciendo nada se supone ts");
            return true
        }/* else if (diasPerm.filter(o => o == diaDeHoy).length == 0) {
            console.log(diaDeHoy);
            console.log(diasPerm);
            console.log("no en los dias permitidos");
            return true
        }*/
        let machineRecord = await machineEnt.findOne({
            where: {
                id: workerData.data.id
            }
        })
        if (!machineRecord.conSensor) {
            return true
        }


        let elSensor = await sensor.findOne({
            where: {
                idreferencia: workerData.data.idsensor.toString()
            },
            include: [{model: categoriasensor, as: "idcategoriasensor_categoriasensor"}]
        })

        let createdDataSensor = await sensordata.create({
            idmaquina: workerData.data.id,
            idsensor: workerData.data.idsensor,
            produccion: workerData.data.produccion,
            timestamp: parseInt(workerData.data.ts)
        })


        let spmaquina = await subproductosmaquina.findAll({
            where: {idmaquina: machineRecord.id}
        })
        for (let spm of spmaquina) {
            let spDetails = await subproducto.findOne({where: {id: spm.dataValues.idsubproducto}})
            spm.idsubproducto_subproducto = spDetails.dataValues
        }

        let spAsignado = spmaquina.find(o => o.idsubproducto == machineRecord.subproductoasignado)


        let startedTurn = await turnPersistenceClass.createOrGetTurnOfNowOfMachine(workerData.data.id)

        await turno.update({
            sensor: true,
            velocidad: +workerData.data.produccion * 60,
            // prodtotal: parseInt(workerData.data.acumulado) || 0
        }, {
            where: {id: startedTurn.id}
        })
        let okProductTurn = await productoturno.findOne({
            where: {
                idturno: startedTurn.id,
                activoenturno: true
            }
        })
        if (okProductTurn == null) {
            await productoturno.create({
                idturno: startedTurn.id,
                activoenturno: true
            })
        }
        let producoTurnPersistence = await productoturno.findOne({
            where:
                {
                    idturno: startedTurn.id,
                    activoenturno: true
                },
            include: [{
                model: subproducto,
                as: "idsubproducto_subproducto"
            }]
        })
        let detProduccion = await detproduccion.findOne({
            where: {
                idprodturn: producoTurnPersistence.id,
                hora: moment(parseInt(workerData.data.ts)).format("HH:00")
            }
        })
        if (detProduccion == null) {
            await detproduccion.create({
                idprodturn: producoTurnPersistence.id,
                hora: moment(parseInt(workerData.data.ts)).format("HH:00"),
                cantidad: 0
            })
        }
        let tsLog = moment(startedTurn.horainicio).hours(parseInt(moment(parseInt(workerData.data.ts)).format("HH"))).toDate().getTime()


        let turTurn = await turno.findOne({
            where: {id: startedTurn.id}, include: [{
                model: horarios, as: 'idhorario_horario'
            }, {model: maquina, as: 'idmaquina_maquina'}]
        })

        if (producoTurnPersistence != null) {
            if (producoTurnPersistence?.idsubproducto == null) {
                let antiguaOT = await ordendetrabajo.findOne({
                    where: {idmaquina: turTurn.idmaquina, estado: {[Op.ne]: 'Terminado'}},
                    order: [['horainicioaccion', "asc"]]
                })
                /*

                                if (antiguaOT != null) {
                                    producoTurnPersistence.idsubproducto = antiguaOT.idsubproducto;
                                    producoTurnPersistence.idordendetrabajo = antiguaOT.id;
                                    await ordendetrabajo.update({
                                        horainicioaccion: Date.now(),
                                        estado: "Comenzado"
                                    }, {where: {id: antiguaOT.id}})

                                    await productoturno.update({
                                        idordendetrabajo: antiguaOT.id,
                                        idsubproducto: antiguaOT.idsubproducto
                                    }, {where: {id: producoTurnPersistence.id}})

                                }
                */

            }
        }
        let ptActiveOfTurn = await productoturno.findOne({
            where: {
                idturno: turTurn.id,
            }
        })
        let horasOt = null
        if(ptActiveOfTurn.idordendetrabajo){
            let otReco = await ordendetrabajo.findOne({where:{id:ptActiveOfTurn.idordendetrabajo}})
            horasOt = otReco.tiempototal
        }
        let logRegisterData = {
            ts: tsLog,
            cantidad: parseInt(workerData.data.produccion),
            horasdelturno: turTurn.idhorario_horario.horasdelturno,
            maquina: turTurn.idmaquina,
            turno: turTurn.id,
            turnotiempo:turTurn.horastotales,
            horario: turTurn.idhorario,
            ordendetrabajo: ptActiveOfTurn?.idordendetrabajo,
            ordendetrabajotiempo: horasOt,
            producto: producoTurnPersistence?.idsubproducto_subproducto?.idproducto,
            subproducto: producoTurnPersistence?.idsubproducto,
            modo: "automatico",
        }
        let regLog = await prodlogsPersistence.registerProd(logRegisterData)


        let detProduccionPersisten = await detproduccion.findOne({
            where: {
                idprodturn: producoTurnPersistence.id,
                hora: moment(parseInt(workerData.data.ts)).format("HH:00"),
            }
        })
        if (elSensor.idcategoriasensor == 3) {
            await detproduccion.update({cantidad: +workerData.data.produccion + +detProduccionPersisten.cantidad}, {
                where: {
                    id: detProduccionPersisten.id
                }
            })
        }

        if (producoTurnPersistence.idordendetrabajo) {
            let ordendetrabajoRecord = await ordendetrabajo.findOne({where: {id: producoTurnPersistence.idordendetrabajo}})

            if (elSensor.idcategoriasensor == 2) {
                await turnomerma.create({
                    idordendetrabajo: ordendetrabajoRecord.id,
                    idmerma: 1,
                    cantidad: workerData.data.produccion,
                })
            }
            if (elSensor.idcategoriasensor == 3) {
                await ordendetrabajo.update({
                    cantidadactual: +(+ordendetrabajoRecord.cantidadactual + +workerData.data.produccion)
                }, {where: {id: producoTurnPersistence.idordendetrabajo}})

            }

            ordendetrabajoRecord = await ordendetrabajo.findOne({where: {id: producoTurnPersistence.idordendetrabajo}})
            if (ordendetrabajoRecord.cantidadactual >= ordendetrabajoRecord.cantidadesperada &&
                ordendetrabajoRecord.horafincorte == null) {
                await ordendetrabajo.update({
                    horafincorte: Date.now()
                }, {where: {id: ordendetrabajoRecord.id}})
            }
            await sensordata.update({
                    idordendetrabajo: producoTurnPersistence.idordendetrabajo,
                    idsubproducto: producoTurnPersistence.idsubproducto,
                },
                {
                    where: {
                        id: createdDataSensor.id
                    }
                }
            )

        } else {

        }

        //let prodxmin = (machineRecord.velpromprod / 60).toFixed(0)

        //if (workerData.data.produccion < prodxmin * 0.70 && workerData.data.produccion != 0) {


        if (elSensor.idcategoriasensor == 3){
            if (workerData.data.produccion < (spAsignado.idsubproducto_subproducto.velprod / 60) && workerData.data.produccion != 0) {
                //baja de velocidad
                console.log("HAY UNA BAJA DE VELOCIDAD");
                let idMachine = workerData.data.id
                let entity = {
                    nombre: "Baja de velocidad",
                    idmaqrel: idMachine.toString()
                }
                let okParada = await parada.findOrCreate({where: entity})
                let findParadaMaquina = {
                    idparada: okParada[0].id,
                    idmaquina: idMachine
                }
                let okParadaMaquina = await paradamaquina.findOrCreate({where: findParadaMaquina})

                let intPrevia = await initm.initModels(sequelize.sql).interrupcion.findAll({


                    order: [['horainicio', 'DESC']],
                    where: {
                        horainicio: {
                            [Op.lt]: Date.now()
                        }
                    },

                    include: [
                        {
                            model: parada, as: "tipo_parada",
                            include: [{
                                model: paradamaquina,
                                as: "paradamaquinas",
                                where: {idmaquina: workerData.data.id}
                            }],

                        }
                    ]
                })
                intPrevia = intPrevia.filter(o => o.tipo_parada != null)
                if (intPrevia.length == 0) {
                    let interru = {
                        horainicio: moment(parseInt(workerData.data.ts)).toDate().getTime(), //.subtract(1, "minute").toDate().getTime(),
                        duracion: 60,
                        tipo: okParada[0].id,
                        comentario: "baja de velocidad reportada por el sensor",
                        idturno: startedTurn.id
                    }
                    await interruptionEntity.create(interru)
                } else {
                    let minFinalParada = moment(intPrevia[0].horainicio).add(intPrevia[0].duracion, "seconds").format("mm")
                    let minData = moment(parseInt(workerData.data.ts)).format("mm")

                    if (intPrevia[0].tipo == okParada[0].id && minFinalParada == minData
                    ) {
                        await interruptionEntity.update({duracion: +intPrevia[0].duracion + 60}, {where: {id: intPrevia[0].id}})

                    } else {
                        let interru = {
                            horainicio: moment(parseInt(workerData.data.ts)).toDate().getTime(), //.subtract(1, "minute").toDate().getTime(),
                            duracion: 60,
                            tipo: okParada[0].id,
                            comentario: "baja de velocidad reportada por el sensor",
                            idturno: startedTurn.id

                        }
                        await interruptionEntity.create(interru)
                    }
                }


            }


            if (workerData.data.produccion == 0 && producoTurnPersistence.idordendetrabajo) {

                let idMachine = workerData.data.id
                let entity = {
                    nombre: "Maquina sin producir",
                    idmaqrel: idMachine.toString()
                }
                let okParada = await parada.findOrCreate({where: entity})
                let findParadaMaquina = {
                    idparada: okParada[0].id,
                    idmaquina: idMachine
                }

                let okParadaMaquina = await paradamaquina.findOrCreate({where: findParadaMaquina})


                let interru = {
                    horainicio: moment(parseInt(workerData.data.ts))/*.subtract(1,"minutes")*/.toDate().getTime(),
                    duracion: 60,
                    tipo: okParada[0].id,
                    comentario: "Alerta reportada por el sensor",
                    idturno: startedTurn.id
                }
                let intCr = await interruptionEntity.create(interru)
                console.log("LA MAQUINA PODRIA ESTAR EN PAUSA");
            }

        }


    } catch (e) {
        console.log(e);
        console.log(getLine())
    }
    return true

}


ingestacion.call(null).then(ok => {
    parentPort.postMessage("ingestado")
})



