const DataTypes = require("sequelize").DataTypes;
const sequelize = require("../../database/index")
const _entity = require("../../database/models/ordendetrabajo");
const _subproductosmaquina = require("../../database/models/subproductosmaquina");
const _merma = require("../../database/models/merma");
const _maquinamant = require("../../database/models/maquinamant");
const _subproducto = require("../../database/models/subproducto");
const _ordendetrabajopausa = require("../../database/models/ordendetrabajopausa");
const _mantencion = require("../../database/models/mantencion");
const _ordendetrabajo = require("../../database/models/ordendetrabajo");
const _sensordata = require("../../database/models/sensordata");
const _diashorarios = require("../../database/models/diashorarios");
const _turnomerma = require("../../database/models/turnomerma");
const _iniciadorot = require("../../database/models/iniciadorot");
const _horarios = require("../../database/models/horarios");
const _diaspermitidos = require("../../database/models/diaspermitidos");
const _proceso = require("../../database/models/proceso");
const _detproduccion = require("../../database/models/detproduccion");
const _planta = require("../../database/models/planta");
const _parada = require("../../database/models/parada");
const _interrupcion = require("../../database/models/interrupcion");
const _paradamaquina = require("../../database/models/paradamaquina");
const _turno = require("../../database/models/turno");
const _maquina = require("../../database/models/maquina");
const _productoturno = require("../../database/models/productoturno");
const _producto = require("../../database/models/producto");
const {workerData} = require("worker_threads");
const moment = require("moment");
const entity = _entity(sequelize.sql, DataTypes);
const subproductosmaquina = _subproductosmaquina(sequelize.sql, DataTypes);
const merma = _merma(sequelize.sql, DataTypes);
const detproduccion = _detproduccion(sequelize.sql, DataTypes);
const producto = _producto(sequelize.sql, DataTypes);
const iniciadorot = _iniciadorot(sequelize.sql, DataTypes);
const ordendetrabajopausa = _ordendetrabajopausa(sequelize.sql, DataTypes);
const ordendetrabajo = _ordendetrabajo(sequelize.sql, DataTypes);
const diaspermitidos = _diaspermitidos(sequelize.sql, DataTypes);
const turnomerma = _turnomerma(sequelize.sql, DataTypes);
const maquinamant = _maquinamant(sequelize.sql, DataTypes);
const mantencion = _mantencion(sequelize.sql, DataTypes);
const parada = _parada(sequelize.sql, DataTypes);
const paradamaquina = _paradamaquina(sequelize.sql, DataTypes);
const interrupcion = _interrupcion(sequelize.sql, DataTypes);
const planta = _planta(sequelize.sql, DataTypes);
const sensordata = _sensordata(sequelize.sql, DataTypes);
const proceso = _proceso(sequelize.sql, DataTypes);
const turno = _turno(sequelize.sql, DataTypes);
const maquina = _maquina(sequelize.sql, DataTypes);
const diashorarios = _diashorarios(sequelize.sql, DataTypes);
const productoturno = _productoturno(sequelize.sql, DataTypes);
const horarios = _horarios(sequelize.sql, DataTypes);
const subproducto = _subproducto(sequelize.sql, DataTypes);
const createNotification = require("../../utils/createNotification")
const {Op} = require("sequelize");
const throwError = require("../../utils/throwError")
module.exports = {

    getById: id => {
        return entity.findOne({
            where: {id}, include: [{
                model: subproducto,
                as: "idsubproducto_subproducto"
            }]
        })
    },
    getByMaquinaId: async id => {
        let maquinaRecord = await maquina.findOne({
            where: {id}, include: [{
                model: proceso,
                as: "idproceso_proceso",
                include: [{
                    model: planta,
                    as: "idplanta_plantum"
                }]
            }]
        })

        let results = await entity.findAll({
            where: {idmaquina: id},
            include: [

                {
                    model: subproducto,
                    as: "idsubproducto_subproducto",
                    include: [{
                        model: subproductosmaquina,
                        as: "subproductosmaquinas",

                    }]
                }, {
                    model: proceso,
                    as: "idproceso_proceso"
                }, {
                    model: planta,
                    as: "idplanta_plantum"
                }, {
                    model: iniciadorot,
                    as: "iniciadorots"
                }
            ],
            order: [["nombre", "asc"]]
        })
        results = results.filter(o => o.idsubproducto_subproducto != null)
        let resp = []
        for (let ot of results) {
            let obj = {...ot.dataValues}
            obj.maq = maquinaRecord
            obj.mermasTotales = await mermasOT(ot.id)
            obj.progreso = ((obj.cantidadactual - obj.mermasTotales) * 100) / obj.cantidadesperada
            resp.push(obj)
        }
        resp = resp.filter(o => !o.borrado)
        return resp


    }, getAll: async (query) => {
        if (query.horainicio) {
            let fechasQDesde = parseInt(query.horainicio.split(",")[0])
            let fechasQHasta = parseInt(query.horainicio.split(",")[1])
            query.horainicio = {
                [Op.gte]: fechasQDesde,
                [Op.lt]: fechasQHasta,
            }
        }
        let ordenes = await entity.findAll({
            where: query,
            include: [
                {
                    model: turnomerma, as: "turnomermas",
                    include: [{model: merma, as: "idmerma_merma"}]
                }, {
                    model: subproducto,
                    as: "idsubproducto_subproducto"
                }, {
                    model: proceso,
                    as: "idproceso_proceso"
                }, {
                    model: planta,
                    as: "idplanta_plantum"
                }, {
                    model: iniciadorot,
                    as: "iniciadorots"
                }

            ],
            order: [["horainicio", "desc"]]
        })
        for (let ot of ordenes) {
            if (ot.dataValues.idmaquina) {
                let maquinaRecord = await maquina.findOne({
                    where: {id: ot.dataValues.idmaquina}, include: [{
                        model: proceso,
                        as: "idproceso_proceso",
                        include: [{
                            model: planta,
                            as: "idplanta_plantum"
                        }]
                    }]
                })
                ot.dataValues.maq = maquinaRecord
            }
            ot.dataValues.mermasTotales = await mermasOT(ot.dataValues.id)
            ot.dataValues.progreso = ((ot.dataValues.cantidadactual - ot.dataValues.mermasTotales) * 100) / ot.dataValues.cantidadesperada

        }
        ordenes = ordenes.filter(o => !o.borrado)
        return ordenes
    },
    create: async (data, io, nombreMaquina = false) => {
        let existentRecordByName = await entity.findOne({where: {nombre: data.nombre}})
        if (nombreMaquina) {
            let existenMaquinaName = await maquina.findOne({where: {nombre: data.idmaquina}})
            data.idmaquina = existenMaquinaName.id
            let existentProcessName = await proceso.findOne({where: {nombre: data.idproceso}})
            data.idproceso = existentProcessName.id
            console.log("proc");
            let existentPlantName = await planta.findOne({where: {nombre: data.idplanta}})
            data.idplanta = existentPlantName.id
            console.log("plant");

            let existentProductName = await producto.findOne({where: {nombre: data.idproducto}})
            console.log("prod");
            let existentSubProductName = await subproducto.findOne({
                where: {
                    nombre: data.idsubproducto,
                    idproducto: existentProductName.id
                }
            })
            data.idsubproducto = existentSubProductName.id

        }
        if (existentRecordByName)
            throwError(500, "Nombre registrado")
        let createdOt = await entity.create(data)
        let otRecord = await entity.findOne({
            where: {id: createdOt.id}, include: [
                {
                    model: subproducto,
                    as: "idsubproducto_subproducto"
                }
            ]
        })
        let spVelProd = otRecord.idsubproducto_subproducto.velprod
        let otCantidadE = otRecord.cantidadesperada
        let tiempoEstimado = otCantidadE / spVelProd
        let tiempoEstimadoSinMantenciones = tiempoEstimado
        await ordendetrabajo.update({tiempototal: tiempoEstimado}, {where: {id: otRecord.id}})

        let horasMant = 0
        let enMantenimiento = false
        let enMantenimientoHoras = 0
        let enMantenimientoObj = {}
        let mantencionesDeLaOT = []
        if (otRecord.idmaquina) {
            let mantencionesMaquina = await maquinamant.findAll({
                where: {idmaquina: otRecord.idmaquina},
                include: [{model: parada, as: "idparada_parada"}]
            })
            for (let mm of mantencionesMaquina) {
                let totalMantenciones = (tiempoEstimado / mm.cadacuanto)
                horasMant += (totalMantenciones * mm.duracion)
                mantencionesDeLaOT.push({
                    freq: mm.cadacuanto,
                    duracion: mm.duracion,
                    cAux: mm.cadacuanto,
                    dur: mm.duracion,
                    nMant: parseInt(totalMantenciones.toString()),
                    mm
                })


            }
        }
        tiempoEstimado += horasMant
        console.log("tiempoEstimado");
        console.log(tiempoEstimado);


        let fechaFinPrediction = undefined
        /*
         let noEsPrimera = false
         let inicioOTFecha = otRecord.horainicio

            while (fechaFinPrediction === undefined) {
             for (let horari of horariosDelDia) {

                 let horaInitTurn = horari.idhorarios_horarios.horainicio.split(":")[0]
                 let fechaHorario = moment(inicioOTFecha).hour(horaInitTurn)
                 let fechaOt = moment(inicioOTFecha)
                 let fOt = inicioOTFecha
                 let fHhI = fechaHorario.toDate().getTime()
                 console.log("Tiempo Estimado: "+tiempoEstimado);
                 console.log("inicio OT");
                 console.log(horari.idhorarios_horarios.nombre);
                 console.log("horas del turno: "+horari.idhorarios_horarios.horasdelturno);
                 console.log(inicioOTFecha);
                 console.log(moment(inicioOTFecha).format("DD/MM/YYYY HH:mm"));
                 console.log(fechaHorario.format("DD/MM/YYYY HH:mm"));

                 let fHhF = moment(inicioOTFecha).hour(horaInitTurn).add(horari.idhorarios_horarios.horasdelturno, "h").toDate().getTime()
                 if (fOt >= fHhI && fOt < fHhF) {
                     if (tiempoEstimado <= horari.idhorarios_horarios.horasdelturno) {
                         console.log(fechaHorario.format("DD/MM/YYYY HH:mm"));
                         console.log("tiempoestimado es menor al total del turno")
                         console.log(fechaHorario.add(tiempoEstimado, "h").format("DD/MM/YYYY HH:mm"))
                         fechaFinPrediction = fechaHorario.add(tiempoEstimado, "h").format("DD/MM/YYYY HH:mm")

                     } else {
                         console.log("tiempoestimado es mayor al total del turno")

                         tiempoEstimado -= horari.idhorarios_horarios.horasdelturno

                     }

                 }
             }
                inicioOTFecha = moment(inicioOTFecha).add(1,"d").toDate().getTime()

            }*/

        let horaInicioOt = moment(otRecord.horainicio)
        let horaInicioOt2 = moment(otRecord.horainicio)
        let numDay = moment(otRecord.horainicio).format("d")
        let fechaRangoI = 0;
        let fechaRangoF = 0;
        let fechaRango = 0
        let diaAnterior = false
        let esDiaAnterior = false
        let tiempoEstimadoResp = 0
        let principio = true
        let ayerNoHuboNada = false
        let ayerPodriaHaber = false
        let ccMant = 0
        while (fechaFinPrediction == undefined) {
            tiempoEstimadoResp = tiempoEstimado
            if (principio) {
                fechaRango = moment(horaInicioOt.toDate().getTime())
                principio = false
            }
            numDay = moment(fechaRango.toDate().getTime())
            if (diaAnterior) {
                numDay.subtract(1, "d")
                diaAnterior = false
                ayerPodriaHaber = true
            }
            /*  if (diaAnterior) {
                  numDay = moment(horaInicioOt.toDate().getTime()).subtract(1, "d")
                  diaAnterior = false

              } else {
                  numDay = moment(horaInicioOt.toDate().getTime())
              }*/

            let recordDia = await diaspermitidos.findOne({
                where: {
                    num: numDay.format("d")
                }
            })
            let horariosDelDia = await diashorarios.findAll({
                where: {iddiaspermitidos: recordDia.id},
                include: [{model: horarios, as: "idhorarios_horarios", where: {borrado: null}}],
                order: [["idhorarios_horarios", "horainicio", "asc"]]
            })
            if (horariosDelDia.length == 0) {
                fechaRango.add(1, "d").startOf("day")
            }
            //Recorriendo horarios del dia
            for (let horari of horariosDelDia) {
                //si no queda tiempo estimado y existe prediccion terminar loop
                if (tiempoEstimado == 0 && fechaFinPrediction != undefined)
                    break
                //si existe fecha prediccion terminar loop
                if (fechaFinPrediction != undefined)
                    break
                //Hora de inicio del horario
                let horaT = moment(numDay.toDate().getTime()).hour(horari.idhorarios_horarios.horainicio.split(":")[0]).minute(0).seconds(0)
                //Hora de fin del horario
                let horaTf = moment(numDay.toDate().getTime()).hour(horari.idhorarios_horarios.horainicio.split(":")[0]).minute(0).seconds(0).add(horari.idhorarios_horarios.horasdelturno, "h")
                //total de horas del horario
                let horasDelTu = horari.idhorarios_horarios.horasdelturno
                let horaAux = moment(horaT.toDate().getTime())
                //fecha contador es menor que la hora inicio del horario
                if (fechaRango.toDate().getTime() < horaT.toDate().getTime()) {
                    let recordDia2 = await diaspermitidos.findOne({
                        where: {
                            num: moment(numDay.toDate().getTime()).subtract(1, "d").format("d")
                        }
                    })
                    let horariosDelDia2 = await diashorarios.findAll({
                        where: {iddiaspermitidos: recordDia2.id},
                        include: [{model: horarios, as: "idhorarios_horarios", where: {borrado: null}}],
                        order: [["idhorarios_horarios", "horainicio", "asc"]]
                    })
                    //el dia anterior hubo turnos
                    if (horariosDelDia2.length > 0 && fechaRango.toDate().getTime() != moment(fechaRango.toDate().getTime()).startOf("day").toDate().getTime() && !esDiaAnterior) {
                        diaAnterior = true
                        esDiaAnterior = true
                        break
                    }
                    //el dia anterior NO hubo turnos
                    else {
                        fechaRango = moment(horaT.toDate().getTime())
                    }

                }
                //Fecha contador esta en el rango aceptado y es mayor que la hora inicio
                if (fechaRango.toDate().getTime() > horaT.toDate().getTime() &&
                    fechaRango.toDate().getTime() <= horaTf.toDate().getTime()) {
                    //Cambiar hora inicio a Fecha contador
                    horaT = moment(fechaRango.toDate().getTime())
                    //Recalcular horas del turno
                    horasDelTu = moment.duration(horaTf.diff(fechaRango)).asHours()
                }
                //Recorrer horas del turno
                for (let i = 0; i <= horasDelTu; i++) {
                    //Fecha contador esta en el rango aceptado
                    if (tiempoEstimado == 0) {
                        fechaFinPrediction = {}
                        fechaFinPrediction.fecha = fechaRango.format("DD/MM/YYYY HH:mm")
                        fechaFinPrediction.horario = horari
                        fechaFinPrediction.i = i
                        break
                    }
                    if (fechaRango.toDate().getTime() >= horaT.toDate().getTime() &&
                        fechaRango.toDate().getTime() < horaTf.toDate().getTime()
                    ) {
                        //Tiempo estimado es mayor a 1 hora
                        if (tiempoEstimado >= 1) {
                            //Sumar hora es menor al fin del turno
                            if ((horasDelTu - i) >= 1) {
                                tiempoEstimado -= 1
                                fechaRango.add(1, "h")
                            }
                            //Sumar hora NO es menor al fin del turno
                            else {
                                tiempoEstimado -= (horasDelTu - i)
                                fechaRango.add((horasDelTu - i) * 60, "minutes")
                            }
                        }
                        //Tiempo estimado NO es mayor a 1 hora, Sumar minutos y terminar
                        else if (tiempoEstimado >= 0 && tiempoEstimado < 1) {
                            /*tiempoEstimado = 0*/
                            if ((horasDelTu - i) >= tiempoEstimado) {
                                fechaRango.add(tiempoEstimado * 60, "minutes")
                                fechaFinPrediction = {}
                                fechaFinPrediction.fecha = fechaRango.format("DD/MM/YYYY HH:mm")
                                fechaFinPrediction.horario = horari
                                fechaFinPrediction.i = i
                                break
                            } else {

                                fechaRango.add((tiempoEstimado - (horasDelTu - i)) * 60, "minutes")
                                tiempoEstimado -= (horasDelTu - i)

                            }
                        }
                        if (!enMantenimiento) {
                            ccMant += 1

                            let mantencionesEnFreq = mantencionesDeLaOT.filter(o => (ccMant % o.freq) == 0)
                            for (let aMant of mantencionesEnFreq) {
                                aMant.nMant -= 1
                                enMantenimiento = true
                                enMantenimientoHoras = aMant.duracion
                                let newParada = await parada.create({
                                    nombre: aMant.mm.idparada_parada.nombre,
                                    idcategoriaparada: aMant.mm.idparada_parada.idcategoriaparada,
                                    inventarioreq: true,
                                    idmaquina: otRecord.idmaquina
                                })
                                await paradamaquina.create({
                                    idmaquina: otRecord.idmaquina,
                                    idparada: newParada.id
                                })
                                let newInt = await interrupcion.create({
                                    horainicio: fechaRango.toDate().getTime(),
                                    duracion: aMant.duracion * (60 * 60),
                                    idmaquina: otRecord.idmaquina,
                                    comentario: "",
                                    tipo: newParada.id
                                })
                                let newMaintenance = await mantencion.create({
                                    idinterrupcion: newInt.id,
                                    nombre: `${otRecord.nombre}-${aMant.mm.idparada_parada.nombre}-${otRecord.idmaquina}-${ccMant / aMant.freq}`,
                                    fechaprogramada: fechaRango.toDate().getTime()
                                })

                            }
                        }
                        console.log(fechaRango.format("DD/MM/YYYY HH:mm  ") + ccMant)
                        if (enMantenimiento) {
                            console.log("en mantencion !");
                            enMantenimientoHoras -= 1
                            if (enMantenimientoHoras <= 0) {
                                enMantenimiento = false
                            }
                        }

                    } else {
                        break
                    }
                }
            }
            if (fechaRango.format("d") == numDay.format("d") && !diaAnterior && fechaFinPrediction == undefined) {
                fechaRango.add("1", "d").startOf("day")
            }

            /*     if (tiempoEstimado == tiempoEstimadoResp && horariosDelDia.length >=1) {
                     console.log("tiempo no cambia y si existen horarios");
                     diaAnterior = true
                 }*/
            /*  if (horariosDelDia.length == 0) {
                  console.log("no existen horarios deberia buscar mañana");
                  horaInicioOt = moment(horaInicioOt.toDate().getTime()).add(1, "d").startOf("day")
              }*/


            /* if (tiempoEstimado == (otCantidadE / spVelProd)

             ) {
                 diaAnterior = true
             }
             if (horaInicioOt.format("d") == numDay.format("d")) {
                 horaInicioOt = moment(horaInicioOt.toDate().getTime()).add(1, "d").startOf("day")
             }*/
            //si paso al otro dia nice si no hay que sumar hasta el otro dia


        }
        await ordendetrabajo.update({horafinpredecida: fechaRango.toDate().getTime()}, {
            where: {
                id: createdOt.id
            }
        })
        if (data.idmaquina) {
            await createNotification(1,
                `Se ha creado una nueva Orden de trabajo `,
                {ot: createdOt.dataValues},
                data.idmaquina, io)
        }

        return {
            createdOt,
            fechaFinPrediction,
            fechaInicioOt: moment(otRecord.horainicio).format("DD/MM/YYYY HH:mm"),
            tiempoEstimado: otCantidadE / spVelProd,
            esDiaAnterior
        }
    },
    sumar: async data => {
        let idOT = data.idordendetrabajo
        let idTurno = data.idturno
        let turnoRecord = await turno.findOne({
            where: {id: data.idturno},
            include: [{model: maquina, as: "idmaquina_maquina"}]
        })
        let ptNulls = await productoturno.findAll({
            where: {idordendetrabajo: null, idturno: idTurno}, include: [{
                model: detproduccion,
                as: "detproduccions"

            }]
        })
        let totalProd = ptNulls.map(o => o.detproduccions).flat().map(o => o.cantidad).reduce((a, b) => +a + +b, 0)
        let ordenDeTrabajoRecord = await ordendetrabajo.findOne({where: {id: idOT}})
        await ordendetrabajo
            .update({cantidadactual: +ordenDeTrabajoRecord.cantidadactual + totalProd}, {where: {id: idOT}})
        for (let ptN of ptNulls) {
            await productoturno
                .update({
                        idsubproducto: ordenDeTrabajoRecord.idsubproducto,
                        idordendetrabajo: ordenDeTrabajoRecord.id,
                        serie: ordenDeTrabajoRecord.codigo,
                        formato: ordenDeTrabajoRecord.formatoelegido,
                        formatounidad: ordenDeTrabajoRecord.unidadelegida,
                        condicion: ordenDeTrabajoRecord.condicionelegida,
                        cantidadesperada: ordenDeTrabajoRecord.cantidadesperada
                    },
                    {
                        where: {id: ptN.id}
                    })

        }
        if (turnoRecord.idmaquina_maquina.conSensor) {
            let sensoresDataNull = await sensordata.findAll({
                where: {idmaquina: turnoRecord.idmaquina_maquina.id.toString(), idordendetrabajo: null},
            })
            for (let sd of sensoresDataNull) {
                await sensordata.update({
                    idordendetrabajo: ordenDeTrabajoRecord.id,
                    idsubproducto: ordenDeTrabajoRecord.idsubproducto
                }, {where: {id: sd.id}})
            }


        }

        return {totalProd, ptNulls, ordenDeTrabajoRecord}

    },
    asociarTurnoPasado: async (idTurno, idordendetrabajo) => {

        let ptActivo = await productoturno.findOne({
            where: {
                activoenturno: true,
                idturno: idTurno
            }
        })
        if (ptActivo) {
            await productoturno.update({activoenturno: false}, {where: {id: ptActivo.id}})
            if (ptActivo.idordendetrabajo == null) {
                await productoturno.destroy({where: {id: ptActivo.id}})
            }
        }

        let ordendetrabajoRecord = await ordendetrabajo.findOne({
            where: {id: idordendetrabajo},
            include: [{
                model: subproducto,
                as: "idsubproducto_subproducto"
            }]
        })

        await ordendetrabajo.update({
            horainicioaccion: Date.now(),
            estado: 'Comenzado'
        }, {where: {id: ordendetrabajoRecord.id}})


        let productoTurnoCreado = await productoturno.create({
            idsubproducto: ordendetrabajoRecord.dataValues.idsubproducto_subproducto.id,
            formato: ordendetrabajoRecord.dataValues.formatoelegido,
            formatounidad: ordendetrabajoRecord.dataValues.unidadelegida,
            cantidadesperada: ordendetrabajoRecord.dataValues.cantidadesperada,
            condicion: ordendetrabajoRecord.dataValues.condicionelegida,
            idturno: idTurno,
            serie: ordendetrabajoRecord.dataValues.codigo,
            idordendetrabajo,
            activoenturno: true

        })


    },
    finishOT: async (id, userData = {}, io) => {
        let otRecord = await entity.findOne({
            where: {id}, include: [{
                model: productoturno,
                as: "productoturnos",
                include: [{
                    model: turno,
                    as: "idturno_turno",
                    where: {horafin: null}
                }]
            }]
        })
        let turnosComprometidos = Array.from(new Set(otRecord.productoturnos.map(o => o.idturno)))
        for (let t of turnosComprometidos) {
            let turnoRecord = await turno.findOne({where: {id: t}})
            let productoTurnoActivo = await productoturno.findOne({
                where: {
                    idturno: t,
                    activoenturno: true
                }
            })
            await productoturno.update({activoenturno: false}, {where: {id: productoTurnoActivo.id}})
            let productoTurnoCreado = await productoturno.create({
                idsubproducto: null,
                idturno: t,
                activoenturno: true
            })

            let idMachine = turnoRecord.idmaquina
            let entity = {
                nombre: "Cambio de producto",
                idmaqrel: idMachine.toString()
            }
            let okParada = await parada.findOrCreate({where: entity})
            let intInconclusa = await interrupcion.findOne({
                where: {
                    duracion: "0",
                    tipo: okParada[0].id,
                    comentario: "Realización de cambio de producto",
                }
            })
            if (intInconclusa) {
                await interrupcion.update({
                    duracion: moment.duration(moment(Date.now()).diff(moment(intInconclusa.horainicio))).asSeconds().toString()
                }, {where: {id: intInconclusa.id}})

            }


        }
        let updatedObj = await entity.update({
            estado: "Terminado",
            horafinconfirmada: Date.now(),
            quientermina: userData.username,
            quienterminauser: `${userData.nombre} ${userData.apellido}`
        }, {where: {id}})

        await createNotification(3,
            `Ha Terminado una Orden de trabajo`,
            {ot: otRecord},
            otRecord.idmaquina, io)
        return updatedObj

    },
    update: async (data) => {
        await entity.update(data, {where: {id: data.id}})
        await calcularFechaFinOT(data.id)
        return {}
    },
    delete: async (id) => {
        let otRecord = await ordendetrabajo.findOne({where: {id}})
        if (!otRecord)
            throwError(400, "faltan datos")
        if (otRecord?.idmaquina) {
            let mantencionesMaquina = await maquinamant.findAll({
                where: {idmaquina: otRecord.idmaquina},
                include: [{model: parada, as: "idparada_parada"}]
            })
            let mantencionesOT = []
            for (let aMant of mantencionesMaquina) {
                mantencionesOT.push(await mantencion.findAll({
                    where: {
                        nombre: {[Op.like]: `${otRecord.nombre}-${aMant.idparada_parada.nombre}-${otRecord.idmaquina}%`}
                    }, include: [{
                        model: interrupcion, as: "idinterrupcion_interrupcion", include: [{
                            model: parada, as: "tipo_parada", include: [{
                                model: paradamaquina,
                                as: "paradamaquinas",
                                where: {
                                    idmaquina: otRecord.idmaquina
                                }
                            }]
                        }]
                    }]
                }))

            }
            mantencionesOT = mantencionesOT.flat()
            for (let mOt of mantencionesOT) {
                await mantencion.destroy({where: {id: mOt.id}})
            }
        }
        try {
            let deletedOt = await ordendetrabajo.destroy({where: {id}})
        } catch (e) {
            console.log(e);
        }

        console.log(id);
        return id


    },
    init: async (id, io) => {
        let recordOT = await entity.findOne({where: {id}})
        if (recordOT) {
            switch (recordOT.estado) {
                case 'Comenzar':
                    await createNotification(2,
                        `Ha comenzado una Orden de trabajo`,
                        {ot: recordOT},
                        recordOT.idmaquina, io)
                    await recordOT.update({horainicioaccion: Date.now(), estado: 'Comenzado'}, {where: {id}})
                    break;
                case 'Comenzado':
                    await recordOT.update({
                        horafinconfirmada: Date.now(),
                        estado: 'Terminado',
                        quientermina: userData.username,
                        quienterminauser: `${userData.nombre} ${userData.apellido}`
                    }, {where: {id}})
                    await createNotification(3,
                        `Ha Terminado una Orden de trabajo`,
                        {ot: recordOT},
                        recordOT.idmaquina, io)
                    break;
            }
        }
    },
    pausar: async (id, idpt) => {
        let recordOT = await entity.findOne({
            where: {id},
        })
        let productoTurnoRecord = await productoturno.findOne({
            where: {id: idpt}, include: [{model: turno, as: "idturno_turno"}]
        })
        if (recordOT) {

            if (recordOT.estado == "Comenzado") {
                await productoturno.update({activoenturno: false}, {where: {id: idpt}})
                let productoNull = await productoturno.findOrCreate(
                    {
                        where: {
                            idsubproducto: null,
                            idturno: productoTurnoRecord.idturno,
                            activoenturno: true
                        }
                    })
                await recordOT.update({horadepausainicio: Date.now(), estado: 'Pausado'}, {where: {id}})
                await ordendetrabajopausa.create({
                    idordendetrabajo: id,
                    horainicio: Date.now(),
                })
                let idMachine = productoTurnoRecord.idturno_turno.idmaquina
                let entity = {
                    nombre: "Cambio de producto",
                    idmaqrel: idMachine.toString()
                }
                let okParada = await parada.findOrCreate({where: entity})
                let findParadaMaquina = {
                    idparada: okParada[0].id,
                    idmaquina: idMachine
                }
                let okParadaMaquina = await paradamaquina.findOrCreate({where: findParadaMaquina})
                let interru = {
                    horainicio: Date.now(),
                    duracion: "0",
                    tipo: okParada[0].id,
                    comentario: "Realización de cambio de producto",
                    idturno: productoTurnoRecord.idturno

                }
                await interrupcion.create(interru)

            }

        }
    }


}

async function mermasOT(idordendetrabajo) {
    let allPt = await productoturno.findAll({where: {idordendetrabajo}})
    return allPt.map(o => o.mermas || 0).reduce((a, b) => +a + +b, 0)


}

async function calcularFechaFinOT(idordendetrabajo) {


    let otRecord = await entity.findOne({
        where: {id: idordendetrabajo}, include: [
            {
                model: subproducto,
                as: "idsubproducto_subproducto"
            }
        ]
    })
    let horasMant = 0
    let enMantenimiento = false
    let enMantenimientoHoras = 0
    let mantencionesDeLaOT = []
    let spVelProd = otRecord.idsubproducto_subproducto.velprod
    let otCantidadE = otRecord.cantidadesperada
    let tiempoEstimado = otCantidadE / spVelProd

    if (otRecord?.idmaquina) {
        let mantencionesMaquina = await maquinamant.findAll({
            where: {idmaquina: otRecord.idmaquina},
            include: [{model: parada, as: "idparada_parada"}]
        })
        let mantencionesOT = []
        for (let aMant of mantencionesMaquina) {
            mantencionesOT.push(await mantencion.findAll({
                where: {
                    nombre: {[Op.like]: `${otRecord.nombre}-${aMant.idparada_parada.nombre}-${otRecord.idmaquina}%`}
                }, include: [{
                    model: interrupcion, as: "idinterrupcion_interrupcion", include: [{
                        model: parada, as: "tipo_parada", include: [{
                            model: paradamaquina,
                            as: "paradamaquinas",
                            where: {
                                idmaquina: otRecord.idmaquina
                            }
                        }]
                    }]
                }]
            }))

        }
        mantencionesOT = mantencionesOT.flat()
        for (let mOt of mantencionesOT) {
            await mantencion.destroy({where: {id: mOt.id}})
        }
    }
    if (otRecord.idmaquina) {
        let mantencionesMaquina = await maquinamant.findAll({
            where: {idmaquina: otRecord.idmaquina},
            include: [{model: parada, as: "idparada_parada"}]
        })
        for (let mm of mantencionesMaquina) {
            let totalMantenciones = (tiempoEstimado / mm.cadacuanto)
            horasMant += (totalMantenciones * mm.duracion)
            mantencionesDeLaOT.push({
                freq: mm.cadacuanto,
                duracion: mm.duracion,
                cAux: mm.cadacuanto,
                dur: mm.duracion,
                nMant: parseInt(totalMantenciones.toString()),
                mm
            })
        }
    }
    tiempoEstimado += horasMant


    let fechaFinPrediction = undefined
    let horaInicioOt = moment(otRecord.horainicio)
    let numDay = moment(otRecord.horainicio).format("d")
    let fechaRango = 0
    let diaAnterior = false
    let esDiaAnterior = false
    let tiempoEstimadoResp = 0
    let principio = true
    let ayerPodriaHaber = false
    let ccMant = 0

    while (fechaFinPrediction == undefined) {
        tiempoEstimadoResp = tiempoEstimado


        if (principio) {
            fechaRango = moment(horaInicioOt.toDate().getTime())
            principio = false
        }
        numDay = moment(fechaRango.toDate().getTime())
        if (diaAnterior) {
            numDay.subtract(1, "d")
            diaAnterior = false
            ayerPodriaHaber = true
        }

        let recordDia = await diaspermitidos.findOne({
            where: {
                num: numDay.format("d")
            }
        })
        let horariosDelDia = await diashorarios.findAll({
            where: {iddiaspermitidos: recordDia.id},
            include: [{model: horarios, as: "idhorarios_horarios", where: {borrado: null}}],
            order: [["idhorarios_horarios", "horainicio", "asc"]]
        })
        if (horariosDelDia.length == 0) {
            fechaRango.add(1, "d").startOf("day")
        }
        //Recorriendo horarios del dia
        for (let horari of horariosDelDia) {
            //si no queda tiempo estimado y existe prediccion terminar loop
            if (tiempoEstimado == 0 && fechaFinPrediction != undefined)
                break
            //si existe fecha prediccion terminar loop
            if (fechaFinPrediction != undefined)
                break
            //Hora de inicio del horario
            let horaT = moment(numDay.toDate().getTime()).hour(horari.idhorarios_horarios.horainicio.split(":")[0]).minute(0).seconds(0)
            //Hora de fin del horario
            let horaTf = moment(numDay.toDate().getTime()).hour(horari.idhorarios_horarios.horainicio.split(":")[0]).minute(0).seconds(0).add(horari.idhorarios_horarios.horasdelturno, "h")
            //total de horas del horario
            let horasDelTu = horari.idhorarios_horarios.horasdelturno
            let horaAux = moment(horaT.toDate().getTime())
            //fecha contador es menor que la hora inicio del horario
            if (fechaRango.toDate().getTime() < horaT.toDate().getTime()) {
                let recordDia2 = await diaspermitidos.findOne({
                    where: {
                        num: moment(numDay.toDate().getTime()).subtract(1, "d").format("d")
                    }
                })
                let horariosDelDia2 = await diashorarios.findAll({
                    where: {iddiaspermitidos: recordDia2.id},
                    include: [{model: horarios, as: "idhorarios_horarios", where: {borrado: null}}],
                    order: [["idhorarios_horarios", "horainicio", "asc"]]
                })
                //el dia anterior hubo turnos
                if (horariosDelDia2.length > 0 && fechaRango.toDate().getTime() != moment(fechaRango.toDate().getTime()).startOf("day").toDate().getTime() && !esDiaAnterior) {
                    diaAnterior = true
                    esDiaAnterior = true
                    break
                }
                //el dia anterior NO hubo turnos
                else {
                    fechaRango = moment(horaT.toDate().getTime())
                }

            }
            //Fecha contador esta en el rango aceptado y es mayor que la hora inicio
            if (fechaRango.toDate().getTime() > horaT.toDate().getTime() &&
                fechaRango.toDate().getTime() <= horaTf.toDate().getTime()) {
                //Cambiar hora inicio a Fecha contador
                horaT = moment(fechaRango.toDate().getTime())
                //Recalcular horas del turno
                horasDelTu = moment.duration(horaTf.diff(fechaRango)).asHours()
            }
            //Recorrer horas del turno
            for (let i = 0; i <= horasDelTu; i++) {
                //Fecha contador esta en el rango aceptado
                if (tiempoEstimado == 0) {
                    fechaFinPrediction = {}
                    fechaFinPrediction.fecha = fechaRango.format("DD/MM/YYYY HH:mm")
                    fechaFinPrediction.horario = horari
                    fechaFinPrediction.i = i
                    break
                }
                if (fechaRango.toDate().getTime() >= horaT.toDate().getTime() &&
                    fechaRango.toDate().getTime() < horaTf.toDate().getTime()
                ) {
                    //Tiempo estimado es mayor a 1 hora
                    if (tiempoEstimado >= 1) {
                        //Sumar hora es menor al fin del turno
                        if ((horasDelTu - i) >= 1) {
                            tiempoEstimado -= 1
                            fechaRango.add(1, "h")
                        }
                        //Sumar hora NO es menor al fin del turno
                        else {
                            tiempoEstimado -= (horasDelTu - i)
                            fechaRango.add((horasDelTu - i) * 60, "minutes")
                        }
                    }
                    //Tiempo estimado NO es mayor a 1 hora, Sumar minutos y terminar
                    else if (tiempoEstimado >= 0 && tiempoEstimado < 1) {
                        /*tiempoEstimado = 0*/
                        if ((horasDelTu - i) >= tiempoEstimado) {
                            fechaRango.add(tiempoEstimado * 60, "minutes")
                            fechaFinPrediction = {}
                            fechaFinPrediction.fecha = fechaRango.format("DD/MM/YYYY HH:mm")
                            fechaFinPrediction.horario = horari
                            fechaFinPrediction.i = i
                            break
                        } else {

                            fechaRango.add((tiempoEstimado - (horasDelTu - i)) * 60, "minutes")
                            tiempoEstimado -= (horasDelTu - i)

                        }
                    }
                    if (!enMantenimiento) {
                        ccMant += 1

                        let mantencionesEnFreq = mantencionesDeLaOT.filter(o => (ccMant % o.freq) == 0)
                        for (let aMant of mantencionesEnFreq) {
                            aMant.nMant -= 1
                            enMantenimiento = true
                            enMantenimientoHoras = aMant.duracion
                            let newParada = await parada.create({
                                nombre: aMant.mm.idparada_parada.nombre,
                                idcategoriaparada: aMant.mm.idparada_parada.idcategoriaparada,
                                inventarioreq: true,
                                idmaquina: otRecord.idmaquina
                            })
                            await paradamaquina.create({
                                idmaquina: otRecord.idmaquina,
                                idparada: newParada.id
                            })
                            let newInt = await interrupcion.create({
                                horainicio: fechaRango.toDate().getTime(),
                                duracion: aMant.duracion * (60 * 60),
                                idmaquina: otRecord.idmaquina,
                                comentario: "",
                                tipo: newParada.id
                            })
                            let newMaintenance = await mantencion.create({
                                idinterrupcion: newInt.id,
                                nombre: `${otRecord.nombre}-${aMant.mm.idparada_parada.nombre}-${otRecord.idmaquina}-${ccMant / aMant.freq}`,
                                fechaprogramada: fechaRango.toDate().getTime()
                            })

                        }
                    }
                    console.log(fechaRango.format("DD/MM/YYYY HH:mm  ") + ccMant)
                    if (enMantenimiento) {
                        console.log("en mantencion !");
                        enMantenimientoHoras -= 1
                        if (enMantenimientoHoras <= 0) {
                            enMantenimiento = false
                        }
                    }
                } else {
                    break
                }
            }
        }
        if (fechaRango.format("d") == numDay.format("d") && !diaAnterior && fechaFinPrediction == undefined) {
            fechaRango.add("1", "d").startOf("day")
        }

    }
    await ordendetrabajo.update({horafinpredecida: fechaRango.toDate().getTime()}, {
        where: {
            id: idordendetrabajo
        }
    })
}