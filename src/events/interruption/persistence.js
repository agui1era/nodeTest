const DataTypes = require("sequelize").DataTypes;
const sequelize = require("../../database/index")
const _entity = require("../../database/models/interrupcion");
const _productoturno = require("../../database/models/productoturno");
const _parada = require("../../database/models/parada");
const _mantencion = require("../../database/models/mantencion");
const _proceso = require("../../database/models/proceso");
const _planta = require("../../database/models/planta");
const _paradamaquina = require("../../database/models/paradamaquina");
const _categoriadeparada = require("../../database/models/categoriadeparada");
const _interrupcion = require("../../database/models/interrupcion");
const _maquina = require("../../database/models/maquina");
const _turno = require("../../database/models/turno");
const {Op} = require("sequelize");
const moment = require("moment");
const throwError = require("../../utils/throwError");
const entity = _entity(sequelize.sql, DataTypes);
const mantencion = _mantencion(sequelize.sql, DataTypes);
const interrupcion = _interrupcion(sequelize.sql, DataTypes);
const proceso = _proceso(sequelize.sql, DataTypes);
const parada = _parada(sequelize.sql, DataTypes);
const planta = _planta(sequelize.sql, DataTypes);
const paradamaquina = _paradamaquina(sequelize.sql, DataTypes);
const categoriadeparada = _categoriadeparada(sequelize.sql, DataTypes);
const productoturno = _productoturno(sequelize.sql, DataTypes);
const turno = _turno(sequelize.sql, DataTypes);
const maquina = _maquina(sequelize.sql, DataTypes);

const sensorPersistencia = require("../sensores/persistence")
const turnoPersistencia = require("../turn/persistence")
const {workerData} = require("worker_threads");
const createNotification = require("../../utils/createNotification");
module.exports = {

    getById: id => {
        return entity.findOne({
            where: {id}, include: [
                {
                    model: parada,
                    as: "tipo_parada",
                    include: [
                        {
                            model: categoriadeparada,
                            as: "idcategoriaparada_categoriadeparada"
                        },
                        {
                            model: paradamaquina,
                            as: "paradamaquinas",
                            include: [
                                {
                                    model: maquina,
                                    as: "idmaquina_maquina",
                                    include: [
                                        {
                                            model: proceso,
                                            as: "idproceso_proceso"
                                        }
                                    ]
                                }
                            ]
                        }

                    ]

                }
            ]
        })
    },
    getAll: async (pag = 0) => {
        let totalPaginas = ((await entity.count()) / 500).toFixed(0)

        let results = await entity.findAll({
            offset: pag * 500,
            limit: 500,
            include: [
                {
                    model: parada,
                    as: "tipo_parada",
                    include: [
                        {
                            model: categoriadeparada,
                            as: "idcategoriaparada_categoriadeparada"
                        },
                        {
                            model: paradamaquina,
                            as: "paradamaquinas",
                            include: [
                                {
                                    model: maquina,
                                    as: "idmaquina_maquina",
                                    include: [
                                        {
                                            model: proceso,
                                            as: "idproceso_proceso"
                                        }
                                    ]
                                }
                            ]
                        }

                    ]

                }
            ],
            order: [
                ["necesitaconfirmacion", "desc"],
                ["tipo_parada", "idcategoriaparada_categoriadeparada", "alertacritica", "desc"],
                ["horainicio", "desc"]

            ]
        })
        for (let r of results) {
            if (r?.tipo_parada?.paradamaquinas[0]?.idmaquina) {
                r.dataValues.maq = await maquina.findOne({
                    where: {id: r.tipo_parada.paradamaquinas[0].idmaquina}
                    , include: [
                        {
                            model: proceso,
                            as: "idproceso_proceso",
                            include: [
                                {
                                    model: planta,
                                    as: "idplanta_plantum"
                                }
                            ]
                        }
                    ]
                })
            }

        }
        return {results, totalPaginas}

    },
    getAcumuladoPorTurno: async idturno => {
        let acumulado = 0
        let turnoRecord = await turno.findOne({
            where: {id: idturno}
        })
        if (turnoRecord.idmaquina) {
            let interrups = await entity.findAll({
                where: {
                    horainicio: {
                        [Op.gte]: turnoRecord.horainicio
                    }
                },
                include: [
                    {
                        model: parada,
                        as: "tipo_parada",

                        include: [{
                            model: paradamaquina,
                            as: 'paradamaquinas',
                            where: {
                                idmaquina: turnoRecord.idmaquina
                            }
                        }]
                    }
                ]
            })
            interrups = interrups.filter(o => o.tipo_parada != null)
            if (interrups.length > 1) {
                acumulado = interrups.map(o => o.duracion).reduce((a, b) => (+a >= 0 ? +a : 0) + (+b >= 0 ? +b : 0))
            } else if (interrups.length == 1) {
                acumulado = interrups.map(o => o.duracion)[0] >= 0 ? interrups.map(o => o.duracion)[0] : 0
            }
        }
        return acumulado
    },
    getAllByMachineAndTurn: async (idturno) => {
        let turnoPersistence = await turno.findOne({where: {id: idturno}})
        let res = await entity.findAll({
            where: {
                horainicio: {
                    [Op.gte]: turnoPersistence.horainicio,
                    [Op.lt]: turnoPersistence.horafin != null ? turnoPersistence.horafin : Date.now(),
                }
            },
            include: [
                {
                    model: mantencion,
                    as: "mantencions"
                },
                {
                    model: parada,
                    as: "tipo_parada",

                    include: [
                        {
                            model: paradamaquina,
                            as: "paradamaquinas",
                            where: {
                                idmaquina: turnoPersistence.idmaquina
                            },
                            include: [
                                {
                                    model: maquina,
                                    as: "idmaquina_maquina",
                                    include: [
                                        {
                                            model: proceso,
                                            as: "idproceso_proceso"
                                        }
                                    ]
                                }
                            ]
                        },
                        {
                            model: categoriadeparada,
                            as: "idcategoriaparada_categoriadeparada"
                        }
                    ]
                }
            ],
            order: [["horainicio", "desc"]]
        })
        res = res.filter(o => o.tipo_parada != null)
        return res
        /* return paradamaquina.findAll({
             where:{
                 idmaquina:id
             },
             include:[
                 {
                     model:parada,
                     as:"idparada_parada",
                     include:[
                         {
                             model:entity,
                             as:"interrupcions"
                         }
                     ]
                 }
             ]
         })*/
    },
    getAllByMachine: (id, idturno) => {
        return entity.findAll({
            /*  where: {
                  idturno: {[Op.ne]: null}
              },*/
            include: [
                {
                    model: mantencion,
                    as: "mantencions"
                },
                {
                    model: parada,
                    as: "tipo_parada",

                    include: [
                        {
                            model: paradamaquina,
                            as: "paradamaquinas",
                            where: {
                                idmaquina: id
                            },
                            include: [
                                {
                                    model: maquina,
                                    as: "idmaquina_maquina",
                                    include: [
                                        {
                                            model: proceso,
                                            as: "idproceso_proceso"
                                        }
                                    ]
                                }
                            ]
                        },
                        {
                            model: categoriadeparada,
                            as: "idcategoriaparada_categoriadeparada"
                        }
                    ]
                }
            ],
            order: [["horainicio", "desc"]]

        })
        /* return paradamaquina.findAll({
             where:{
                 idmaquina:id
             },
             include:[
                 {
                     model:parada,
                     as:"idparada_parada",
                     include:[
                         {
                             model:entity,
                             as:"interrupcions"
                         }
                     ]
                 }
             ]
         })*/
    },
    create: async (data, io, idtipo = false) => {
        if (idtipo) {
            let paradaMaquina = await maquina.findOne({where: {nombre: data.idmaquina}})
            console.log("paradamaquina");
            console.log("paradamaquina");
            console.log("paradamaquina");
            console.log("paradamaquina");
            console.log(paradamaquina);
            console.log(data);
            let paradaNombre = await parada.findOne({where: {nombre: data.tipo, idmaqrel: null}})
            let newParadaM = await parada.create({
                nombre: paradaNombre.nombre,
                idmaqrel: paradaMaquina.toString(),
                idcategoriaparada: paradaNombre.idcategoriaparada
            })
            let paradaMaquinaRelacion = await paradamaquina.create({
                idmaquina: paradaMaquina.id,
                idparada: newParadaM.id
            })
            data.tipo = newParadaM.id.toString()
            console.log("paradamaquina2");
            console.log(data);


        }
        let paradaData = await parada.findOne({
            where: {
                id: data.tipo
            },
            include: [
                {
                    model: paradamaquina,
                    as: "paradamaquinas"
                }, {
                    model: categoriadeparada,
                    as: "idcategoriaparada_categoriadeparada"
                }
            ]
        })
        if (paradaData.idcategoriaparada_categoriadeparada.alertacritica &&
            data.necesitaconfirmacion &&
            paradaData.idcategoriaparada_categoriadeparada.tipo == "no programada"
        ) {
            /*  console.log("ES critica");*/


        } else {
            console.log(" noES critica");

            data.necesitaconfirmacion = false
        }
        //y si es creada en un futuro no podra tener el turno de ahora
        let turnoRecord = await turnoPersistencia.getInitedTurnByMachine(paradaData.paradamaquinas[0].idmaquina)
        data.idturno = turnoRecord?.id
        console.log("AAAAAAA");
        let ptActiveOfTurn = await productoturno.findOne({
            where:
                {idturno: data.idturno, activoenturno: true}
        })
     /*   if(ptActiveOfTurn.idordendetrabajo == null){
            throwError(400,"No hay orden de trabajo activa")
        }*/
        data.idordendetrabajo = ptActiveOfTurn.idordendetrabajo

        let nuevaInte = await entity.create(data)
        if (paradaData.idcategoriaparada_categoriadeparada.alertacritica
        ) {
            let maqRecord = await paradamaquina.findOne({
                where:
                    {idparada: paradaData.id},
                include: [
                    {model: maquina, as: "idmaquina_maquina"}
                ]
            })
            await createNotification(13,
                `Alerta critica creada en ${maqRecord.idmaquina_maquina.nombre}`,
                {parada: {id: paradaData.id}},
                maqRecord.idmaquina, io)
            setTimeout(async () => {
                let recordInte = await entity.findOne({where: {id: nuevaInte.id}})
                if (recordInte.duracion == 0 && !recordInte.necesitaconfirmacion) {
                    let maqRecord = await paradamaquina.findOne({
                        where:
                            {idparada: paradaData.id},
                        include: [
                            {model: maquina, as: "idmaquina_maquina"}
                        ]
                    })
                    await createNotification(5,
                        `Alerta critica creada hace 10 minutos en ${maqRecord.idmaquina_maquina.nombre}`,
                        {parada: {id: paradaData.id}},
                        maqRecord.idmaquina, io)
                }
                /*  }, 1000 * 60 * 0.5)*/
            }, 15000)
            setTimeout(async () => {
                let recordInte = await entity.findOne({where: {id: nuevaInte.id}})
                if (recordInte.duracion == 0 && !recordInte.necesitaconfirmacion) {
                    let maqRecord = await paradamaquina.findOne({
                        where:
                            {idparada: paradaData.id},
                        include: [
                            {model: maquina, as: "idmaquina_maquina"}
                        ]
                    })
                    await createNotification(6,
                        `Alerta critica creada hace 30 minutos en ${maqRecord.idmaquina_maquina.nombre}`,
                        {parada: {id: paradaData.id}},
                        maqRecord.idmaquina, io)
                }
            }, 1000 * 60 * 30)
            /*  console.log("ES criticaaaaasa");*/

        } else {
            /*console.log(" noES critica");*/
        }

        return nuevaInte
    },
    update: async (data, io) => {
        let existentRecord = await entity.findOne({
            where: {id: data.id}, include: [{
                model: parada, as: "tipo_parada"
            }]
        })
        console.log(existentRecord.tipo);
        let maqRecord = await paradamaquina.findOne({
            where: {idparada: existentRecord.tipo},
            include: [{model: maquina, as: "idmaquina_maquina"}]
        })
        console.log(existentRecord.duracion);
        if (existentRecord.duracion == 0) {
            console.log("ES 0000");
            console.log(maqRecord);
            await createNotification(7,
                `${maqRecord?.idmaquina_maquina?.nombre} ha reanudado su producción`,
                {parada: {id: existentRecord.tipo}},
                maqRecord.idmaquina, io)
        }

        return entity.update(data, {where: {id: data.id}})
    },
    delete: async (id) => {
        return entity.destroy({where: {id}})
    },
    confirmar: async data => {
        let interruptionRecord = await entity.findOne({where: {id: data.id}})
        await parada.update({
            nombre: data.nombre,
            idcategoriaparada: data.idcategoriaparada
        }, {where: {id: interruptionRecord.tipo}})
        await entity.update({
            necesitaconfirmacion: false,
            quiencreaconfirmacion: data.quiencreaconfirmacion,
            quiencreaconfirmacionuser: data.quiencreaconfirmacionuser
        }, {where: {id: data.id}})
    },
    fusion: async (data) => {

        let interruptionRecord = await entity.findOne({where: {id: data.interrupcion}})
        let turnoRecord = await turno.findOne({where: {id: data.idturno}})
        let fechaAux = moment(interruptionRecord.horainicio)
            .add(interruptionRecord.duracion, "seconds")
        let fechaAuxMin = fechaAux.format("mm")
        let recordsSensor = await sensorPersistencia.getProductionByTurnAndHour(data.idturno, moment(interruptionRecord.horainicio).format("HH"))
        let rangos = []
        for (let i = 0; i < data.initMin; i++) {
            rangos.push(i.toString())
        }
        let listaPermitidos = []
        for (let rs of recordsSensor) {
            if (rangos.find(r => r == moment(rs.timestamp).format("m"))) {
                listaPermitidos.push(rs)
            }
        }
        let infoFirstProd = false

        function llegarAlProd(recordsS, minF) {
            let minFm1 = +minF - 1
            let minAnt = recordsS.find(o => moment(o.timestamp).format("m") == minFm1.toString())
            if (minAnt?.produccion > 0) {
                infoFirstProd = minAnt
                return true
            } else if (minFm1 == 0) {
                return false
            } else {
                llegarAlProd(recordsS, minFm1)
            }
        }

        llegarAlProd(listaPermitidos, data.initMin)

        let des = moment(interruptionRecord.horainicio).minutes(infoFirstProd ? +moment(infoFirstProd.timestamp).format("mm") + 1 : 0).seconds(0)
        let fin = moment(interruptionRecord.horainicio).minutes(data.initMin).seconds(0)
        //let fin = fechaAux.toDate().getTime()
        let interrupcionesPermitidas = await entity.findAll({
            order: [["horainicio", "ASC"]],
            where: {
                horainicio: {
                    [Op.gte]: des.toDate().getTime(),
                    [Op.lt]: fin.toDate().getTime()
                },
                tipo: interruptionRecord.tipo
            }
        })

        let intEncontradasHastaProd = []
        let intEncontradasHastaProdid = []


        /*  function prodInterrupcionesEntre(intlist, minF) {
              console.log(intlist);
              let minFm1 = +minF - 1
              if (minFm1 == 0) return false
              let minAnt = intlist.filter(o =>
                  moment(o.horainicio).format("m") == minFm1.toString() ||
                  moment(o.horainicio).add(o.duracion, "seconds").format("m") > minFm1
              )

              console.log(minAnt);
              if (minAnt) {
                  intEncontradasHastaProdid.push(...minAnt.map(o=>o.id))
                  intEncontradasHastaProd.push(...minAnt)
                  prodInterrupcionesEntre(intlist, minFm1)
              }
          }

          prodInterrupcionesEntre(interrupcionesPermitidas, data.initMin)
  */
        /* recordsSensor = recofusionrdsSensor.filter(o=>rangos
             .find(i=>{
                 console.log(o);
                 console.log(`${i} ==  ${parseInt(moment(o.timestamp).format("mm"))} ${i == parseInt(moment(o.timestamp).format("mm"))}`)
                 return i == parseInt(moment(o.timestamp).format("mm"))
             }))
 */
        // intEncontradasHastaProd = Array.from(new Set(intEncontradasHastaProdid))
        // intEncontradasHastaProd = intEncontradasHastaProd.sort((a,b)=>moment(b.horainicio).toDate() - moment(a.horainicio).toDate())
        let minIParada = moment(interruptionRecord.horainicio).minute(infoFirstProd ? +moment(infoFirstProd.timestamp).format("mm") + 1 : 0)
        let duracionParada = data.initMin - minIParada.format("m")
        let nuevaInt = {
            horainicio: minIParada.toDate().getTime(),
            duracion: duracionParada * 60,
            tipo: interruptionRecord.tipo,
            idturno: data.idturno
        }
        let createdInt = await entity.create(nuevaInt)
        let createdIntRecord = await entity.findOne({
            where: {id: createdInt.id}, include: [
                {
                    model: parada,
                    as: "tipo_parada",
                    include: [
                        {
                            model: categoriadeparada,
                            as: "idcategoriaparada_categoriadeparada"
                        }
                    ]
                }
            ]
        })

        await entity.destroy({where: {id: interrupcionesPermitidas.map(o => o.id)}})

        return {
            /*  rangos,
              listaPermitidos,
              lbl: moment(interruptionRecord.horainicio).format("HH"),
              infoFirstProd,
              minProd: infoFirstProd ? +moment(infoFirstProd.timestamp).format("mm") + 1 : 0,
              intEncontradasHastaProd: interrupcionesPermitidas,
              nuevaInt,
              createdInt*/
            ...createdIntRecord.dataValues

        }
    },
    fusionTurno: async id => {


        let turnoRecord = await turno.findOne({where: {id: id.idturno}})
        if (turnoRecord.procesado) {
            console.log("turno listo")
            return true
        }

        console.log("turno proceso")

        let fechaI = moment(turnoRecord.horainicio)
        let fechaF = moment(turnoRecord.horafin == null ? Date.now() : turnoRecord.horafin)
        fechaF.add(1, "h")
        let entity = {
            nombre: "Maquina sin producir",
            idmaqrel: turnoRecord.idmaquina.toString()
        }
        let okParada = await parada.findOrCreate({where: entity})
        let findParadaMaquina = {
            idparada: okParada[0].id,
            idmaquina: turnoRecord.idmaquina
        }
        let okParadaMaquina = await paradamaquina.findOrCreate({where: findParadaMaquina})


        while (fechaI.format("HH") != fechaF.format("HH")) {
            /*            if(fechaI.format("HH") == "11"){*/
            let recordsSensor = await sensorPersistencia.getProductionByTurnAndHour(id.idturno, fechaI.format("HH"))
            recordsSensor.filter(o => o.idordendetrabajo != null)
            let interrupcionesEnLaHora = await interrupcion.findAll({
                where: {
                    idturno: id.idturno,
                    horainicio: {
                        [Op.gte]: fechaI.toDate().getTime(),
                        [Op.lt]: moment(fechaI.toDate().getTime()).add(1, "h").toDate().getTime()
                    }
                }
            })
            for (let int of interrupcionesEnLaHora) {
                if (int.tipo == okParada[0].id && int.duracion == 60) {
                    if (int.id) {
                        await interrupcion.destroy({where: {id: int.id}})
                    }
                }
            }
            let es0 = false
            let ceroI = 0
            let primerCero = null
            let ultimoCero = null
            let intervalosCero = []
            let recordsCero = []
            let sensoresLongitude = recordsSensor.length
            for (let i = 0; i < sensoresLongitude; i++) {

                if (recordsSensor[i].produccion == 0) {
                    es0 = true
                    if (!primerCero) {
                        primerCero = recordsSensor[i]
                    }
                    recordsCero.push(moment(recordsSensor[i].timestamp).format("mm"))
                }
                if (recordsSensor[i].produccion > 0 || i == recordsSensor.length - 1) {
                    if (es0) {
                        ultimoCero = recordsSensor[i]
                        intervalosCero.push({
                            primerCero,
                            ultimoCero
                        })
                        primerCero = null
                        ultimoCero = null
                    }
                    es0 = false

                }
            }
            /*   for (let dataSen of recordsSensor) {
                   let recordEnCero = recordsCero.find(o => o == moment(dataSen.timestamp).format("mm"))
                   if (recordEnCero) {
                       /!* console.log(await interrupcion.findOne({
                            where: {horainicio:dataSen.timestamp}
                        }))*!/
                   }
               }*/


            /* let cForOf = 0
           for(let a0 of recordsCero){
                if(cForOf == 0){
                    console.log("Min inicio")
                }
                console.log(moment(a0.timestamp).format("YYYY-MM-DD HH:mm:ss"))
                if(cForOf == recordsCero.length - 1){
                    console.log("min final");
                }
                cForOf+=1

            }*/
            for (let unCero of intervalosCero) {
                let duracion = moment.duration(
                    moment(unCero.ultimoCero.timestamp)
                        .diff(moment(unCero.primerCero.timestamp)))
                    .asMinutes().toString().split(".")[0]
                let horainicio = unCero.primerCero.timestamp
                let interru = {
                    horainicio,
                    duracion: (((+duracion == 0 ? 1 : +duracion)) * 60).toString(),
                    tipo: okParada[0].id,
                    comentario: "Alerta reportada por el sensor Procesada",
                    idturno: id.idturno
                }


                let intCr = await interrupcion.findOrCreate({where: interru})

            }
            fechaI.add(1, "h")

        }
        console.log("turno listo")
        if (turnoRecord.horafin != null) {
            await turno.update({procesado: true}, {where: {id: id.idturno}})
        }


    },

    fusionAll: async () => {
        let allTurnos = await turno.findAll()
        for (let turn of allTurnos) {
            let idturno = turn.id
            await module.exports.fusionTurno({idturno});
            /* await module.exports.fusionTurno(turn.id)*/
        }
    }
}