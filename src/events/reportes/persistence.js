const DataTypes = require("sequelize").DataTypes;
const sequelize = require("../../database/index")
const _entity = require("../../database/models/producto");
const _subProducto = require("../../database/models/subproducto");
const _categoriadeparada = require("../../database/models/categoriadeparada");
const _maquina = require("../../database/models/maquina");
const _interrupcion = require("../../database/models/interrupcion");
const _turno = require("../../database/models/turno");
const _proceso = require("../../database/models/proceso");
const _planta = require("../../database/models/planta");
const _detalleproduccion = require("../../database/models/detproduccion");
const _subproductosmaquina = require("../../database/models/subproductosmaquina");
const _parada = require("../../database/models/parada");
const _sensor = require("../../database/models/sensordata");
const _horarios = require("../../database/models/horarios");
const _productoturno = require("../../database/models/productoturno")
const entity = _entity(sequelize.sql, DataTypes);
const interrupcion = _interrupcion(sequelize.sql, DataTypes);
const categoriadeparada = _categoriadeparada(sequelize.sql, DataTypes);
const sensor = _sensor(sequelize.sql, DataTypes);
const subproductosmaquina = _subproductosmaquina(sequelize.sql, DataTypes);
const parada = _parada(sequelize.sql, DataTypes);
const proceso = _proceso(sequelize.sql, DataTypes);
const planta = _planta(sequelize.sql, DataTypes);
const detalleproduccion = _detalleproduccion(sequelize.sql, DataTypes);
const productoturno = _productoturno(sequelize.sql, DataTypes);
const horarios = _horarios(sequelize.sql, DataTypes);
const subProducto = _subProducto(sequelize.sql, DataTypes);
const maquina = _maquina(sequelize.sql, DataTypes);
const turno = _turno(sequelize.sql, DataTypes);

const oeeEvent = require('../oee/events')
const turnoPersistencia = require("../turn/persistence")
const sensorPersistencia = require("../sensores/persistence")
const {Op} = require("sequelize");
const moment = require("moment");


module.exports = {
    getAll: async () => {


        let maquinas = await maquina.findAll()
        let fechs = {}

        fechs.desde = moment().subtract(1, "month").toDate().getTime()
        fechs.hasta = Date.now()

        let machOee = await oeeEvent.maqOee(maquinas.map(o=>o.id), {desde: fechs.desde, hasta: fechs.hasta})
        return machOee


        /* let plantas = await planta.findAll();
         let records = []
         for (let p of plantas) {
             records.push(await module.exports.getByPlant(p.id, "month"))
         }
         let ignorados = ["lastTurnId", "table", "color"]
         let promedios = ["uso", "disponibilidadP", "calidadP", "rendimientoP", "oeeP"]

         let datosOee = records.map(o => o.oee)
             .reduce((a, b) => {
                 let result = {}
                 for (let k of Object.keys(a)) {
                     if (ignorados.find(o => o == k)) {
                     } else {

                         result[k] = a[k] + b[k]
                     }
                 }
                 return result
             })
         let oee = {}
         for (let k of Object.keys(datosOee)) {
             if (promedios.find(o => o == k)) {
                 oee[k] = datosOee[k] / records.length
             } else {
                 oee[k] = datosOee[k]
             }
         }

         oee.oeeCharts = {series: formatearYSumar(records.map(o => o.oee.oeeCharts.series).flat())}
         oee.calidadCharts = {series: formatearYSumar(records.map(o => o.oee.calidadCharts.series).flat())}
         oee.rendimientoCharts = {series: formatearYSumar(records.map(o => o.oee.rendimientoCharts.series).flat())}
         oee.disponibilidadCharts = {series: formatearYSumar(records.map(o => o.oee.disponibilidadCharts.series).flat())}
         oee.sensorSeries = formatearYSumar(records.map(o => o.oee.sensorSeries).flat())

         let datosCalidad = records.map(o => o.calidad)
             .reduce((a, b) => {
                 let result = {}
                 for (let k of Object.keys(a)) {
                     if (ignorados.find(o => o == k)) {
                     } else {
                         result[k] = a[k] + b[k]
                     }
                 }
                 return result
             })

         let datosRendimiento = records.map(o => o.rendimiento)
             .reduce((a, b) => {
                 let result = {}
                 for (let k of Object.keys(a)) {
                     if (ignorados.find(o => o == k)) {
                     } else {
                         result[k] = a[k] + b[k]
                     }
                 }
                 return result
             })
         datosRendimiento.table = records.map(o => o.rendimiento.table).flat()
         datosRendimiento.color = {
             domain: records.map(o => o.rendimiento.color.domain).flat()
         }
         let datosDisponibilidad = {}
         datosDisponibilidad.cats = formatearYSumar(records.map(o => o.disponibilidad.cats).flat())
         datosDisponibilidad.catsColors = {
             colorScheme: {domain: formatearDuplicadosStr(records.map(o => o.disponibilidad.catsColors.colorScheme.domain).flat())}
         }
         let paradasFormatted = formatearYSumar(records.map(o => o.disponibilidad.paradas.map((oo, ii) => {
             return {
                 name: oo.name,
                 value: oo.value,
                 color: o.disponibilidad.paradasColors.colorScheme.domain[ii]
             }
         })).flat())

         datosDisponibilidad.paradas = paradasFormatted.map(o => {
             return {name: o.name, value: o.value}
         })
         datosDisponibilidad.paradasInfo = formatearYSumar(records.map(o => o.disponibilidad.paradas).flat())
             .map(o => {
                 return {
                     name: o.name,
                     percent: (o.value * 100) / records.map(o => o.disponibilidad.interrupciones || 0).reduce((a, b) => +a + +b)
                 }
             }).sort((a, b) => +b.percent - +a.percent)
         datosDisponibilidad.paradasColors = {colorScheme: {domain: paradasFormatted.map(o => o.color)}}

         return {
             /!* records,*!/ oee, calidad: datosCalidad, rendimiento: datosRendimiento, disponibilidad: datosDisponibilidad
         }*/

    },
    getOeeBySp: async (idsp, lapso, otro = [], idmaquina = null, isChart = false) => {
        let spRecord = await subProducto.findOne({where: {id: idsp}})
        let result = {}
        let listaCats = await categoriadeparada.findAll()
        let unidadesTotales = await productoturno.findAll({
            where: {idsubproducto: idsp},
            include: [
                {
                    model: detalleproduccion,
                    as: "detproduccions"
                },
                {

                    model: turno,
                    as: "idturno_turno",
                    include: [
                        {
                            model: horarios,
                            as: "idhorario_horario"
                        },
                        {
                            model: interrupcion,
                            as: "interrupcions",
                            include: [
                                {
                                    model: parada,
                                    as: "tipo_parada",
                                    /* where: {
                                         idcategoriaparada: {
                                             [Op.not]: null
                                         }
                                     }*/
                                }
                            ]
                        }
                    ],
                    where: lapso == 'week' ?
                        {
                            horainicio: {
                                [Op.gte]: moment().subtract(1, "week").toDate().getTime()
                            },
                            idmaquina: idmaquina != null ? idmaquina : {[Op.not]: null}
                        } :
                        lapso == 'month' ?
                            {
                                horainicio: {
                                    [Op.gte]: moment().subtract(1, "month").toDate().getTime()
                                },
                                idmaquina: idmaquina != null ? idmaquina : {[Op.not]: null}

                            } :
                            lapso == 'other' ?
                                {
                                    horainicio: {
                                        [Op.gte]: parseInt(otro[0]),
                                        [Op.lt]: parseInt(otro[1])
                                    },
                                    idmaquina: idmaquina != null ? idmaquina : {[Op.not]: null}


                                } :
                                lapso == 'turn' ? {
                                        idmaquina: idmaquina != null ? idmaquina : {[Op.not]: null}
                                    }
                                    : {
                                        idmaquina: idmaquina != null ? idmaquina : {[Op.not]: null}
                                    }
                }
            ],
            order: [["idturno_turno", 'horainicio', 'asc']],
        })
        if (unidadesTotales.length == 0) {
            return {
                error: "no hay turnos"
            }
        }
        if (lapso == "other") {
            result.desdeO = parseInt(otro[0])
            result.hastaO = parseInt(otro[1])
        }
        if (lapso == "week") {
            result.desdeO = moment().subtract(1, "week").toDate().getTime()
            result.hastaO = Date.now()
        }

        if (lapso == "month") {
            result.desdeO = moment().subtract(1, "month").toDate().getTime()
            result.hastaO = Date.now()
        }

        if (lapso == 'turn') {
            unidadesTotales = unidadesTotales.slice(-1)
            result.lastTurnId = unidadesTotales[0].idturno_turno.id
            result.desdeO = new Date(unidadesTotales[0].idturno_turno.horainicio).getTime()
            result.hastaO = new Date(unidadesTotales[0].idturno_turno.horafin == null ? Date.now() : unidadesTotales[0].idturno_turno.horafin).getTime()
        }
        let diffDias = moment.duration(moment(result.hastaO).diff(moment(result.desdeO))).asDays()

        if (!isChart) {
            result.charts = await module.exports.getOeeParaChart(result.desdeO, result.hastaO, idsp, idmaquina)
            result.oeeCharts = {
                name: "OEE", series: result.charts.datosChart.map(o => {
                        return {
                            name: moment(o.hasta).format(diffDias >= 1 ? "MM/DD" : 'MM/DD HH:00'),
                            value: o.oeeP
                        }
                    }
                )
            }
            result.calidadCharts = {
                name: "Calidad", series: result.charts.datosChart.map(o => {
                        return {
                            name: moment(o.hasta).format(diffDias >= 1 ? "MM/DD" : 'MM/DD HH:00'),
                            value: o.calidadP
                        }
                    }
                )
            }
            result.rendimientoCharts = {
                name: "Rendimiento", series: result.charts.datosChart.map(o => {
                        return {
                            name: moment(o.hasta).format(diffDias >= 1 ? "MM/DD" : 'MM/DD HH:00'),
                            value: o.rendimientoP
                        }
                    }
                )
            }
            result.disponibilidadCharts = {
                name: "Disponibilidad", series: result.charts.datosChart.map(o => {
                        return {
                            name: moment(o.hasta).format(diffDias >= 1 ? "MM/DD" : 'MM/DD HH:00'),
                            value: o.disponibilidadP
                        }
                    }
                )
            }
            result.mttrCharts = {
                name: "MTTR", series: result.charts.datosChart.map(o => {
                        return {
                            name: moment(o.hasta).format(diffDias >= 1 ? "MM/DD" : 'MM/DD HH:00'),
                            value: o.mttr
                        }
                    }
                )
            }
            result.mtbfCharts = {
                name: "MTBF", series: result.charts.datosChart.map(o => {
                        return {
                            name: moment(o.hasta).format(diffDias >= 1 ? "MM/DD" : 'MM/DD HH:00'),
                            value: o.mtbf
                        }
                    }
                )
            }
        }


        result.unidadesTotales = 0
        result.esteSP = {
            name: spRecord.nombre,
            id: spRecord.id
        }
        result.unidadesEsperadas = 0
        result.mermas = 0
        result.totalEventos = 0
        result.sensorSeries = []
        let tiempoTotalHoras = 0
        let tiempoProdHoras = 0
        let registrosSen = []


        for (let dp of unidadesTotales) {
            let fechaIni = moment(dp.idturno_turno.horainicio)
            let prodCeros = []

            /*  while (fechaIni.toDate().getTime() < dp.idturno_turno.horafin == null ? Date.now() : moment(dp.idturno_turno.horafin).toDate().getTime()) {
                  console.log(fechaIni.format("yy/MM/DD HH:mm:ss"))
                  console.log(dp.idturno_turno.horafin);
                  //console.log(dp.idturno_turno)
                  console.log(await sensor.findOne({
                      where: {
                          idmaquina: dp.idturno_turno.id.toString(),
                          timestamp:{
                              [Op.gte]:fechaIni.toDate().getTime(),
                              [Op.lt]:moment(fechaIni.toDate().getTime()).add(1,"minutes").toDate().getTime()
                          }
                      }
                  }))
                  fechaIni.add(1, "minutes")
              }*/
            if (!isNaN(dp.idturno_turno.produccionesperada)) {
                result.unidadesEsperadas += +dp.idturno_turno.produccionesperada
            }
            if (!isNaN(dp.idturno_turno.mermas)) {
                result.mermas += +dp.idturno_turno.mermas
            }
            if (dp.detproduccions.length > 0) {

                result.unidadesTotales += +dp.detproduccions.map(a => a.cantidad || 0).reduce((a, b) => (+a || 0) + (+b || 0))
            }
            if (dp.idturno_turno.horafin != null) {
                tiempoTotalHoras += +dp.idturno_turno.idhorario_horario.horasdelturno
            } else {
                tiempoTotalHoras += moment.duration(moment(Date.now()).diff(dp.idturno_turno.horainicio)).asHours()
            }
            let sensorRecords = await sensorPersistencia.getProductionByTurn(dp.idturno_turno.id)
            let registros = []
            registrosSen.push(sensorRecords)

            /*    for (let i = 0; i <= dp.idturno_turno.idhorario_horario.horasdelturno + 1; i = i+3) {
                        let filtradosPorHora = sensorRecords
                            .filter(o => o.timestamp > moment(dp.idturno_turno.horainicio).add(i, "hours").toDate().getTime() &&
                                o.timestamp < moment(dp.idturno_turno.horainicio).add(i + 3, "hours").toDate().getTime())

                        if (filtradosPorHora.length > 0) {
                            registros.push(filtradosPorHora.reduce((a, b) => {
                                return {
                                    name:moment(dp.idturno_turno.horainicio).add(i, "hours").format("MM/DD"  + " HH:00"),
                                    produccion: +a.produccion + +b.produccion
                                }

                            }))

                        }
                        if((i+3)>dp.idturno_turno.idhorario_horario.horasdelturno){
                            filtradosPorHora = sensorRecords
                                .filter(o => o.timestamp > moment(dp.idturno_turno.horainicio).add(i, "hours").toDate().getTime() &&
                                    o.timestamp < moment(dp.idturno_turno.horainicio).add(i + 3, "hours").toDate().getTime())



                        }

                        /!*sensorRecords
                        .filter(o => o.timestamp > moment(dp.idturno_turno).add(i + 1, "hours").toDate().getTime() &&
                            o.timestamp < moment(dp.idturno_turno).add(i + 1, "hours").toDate().getTime()
                        ).reduce((a, b) => {

                            return {
                                timestamp: moment(dp.idturno_turno).add(i + 1, "hours").toDate().getTime(),
                                produccion: +a.produccion + +b.produccion
                            }

                        })
                        .map(o => {
                            return {
                                name: moment(o.timestamp).format((lapso != 'turn' ? "yy/MM/DD" : '') + " HH:mm:ss"),
                                value: o.produccion
                            }
                        }))*!/
                }*/
            result.sensorSeries.push(sensorRecords)

            /* result.sensorSeries.push(sensorRecords.map(o => {
                 return {
                     name: moment(o.timestamp).format((lapso != 'turn' ? "yy/MM/DD" : '') + " HH:mm:ss"),
                     value: o.produccion
                 }
             }))*/
            result.totalEventos += sensorRecords.length
        }
        result.sensorSeries = result.sensorSeries.flat()
        result.unidadesTotales = result.sensorSeries.map(o => o.produccion || 0).reduce((a, b) => +a + +b, 0)

        let turnoFechaI = moment(result.desdeO)
        let turnoFechaF = moment(result.hastaO)


        let listaSensorSeries = []
        if (!isChart) {
            console.log(diffDias);
            console.log("diffDias");

            while (turnoFechaI.toDate().getTime() < result.hastaO) {
                let fI = turnoFechaI.toDate().getTime()
                if (diffDias >= 1) {
                    turnoFechaI.add(1, "days")
                } else {
                    turnoFechaI.add(1, "hour")
                }
                listaSensorSeries.push(result.sensorSeries.filter(o => o.timestamp > fI && o.timestamp < turnoFechaI.toDate().getTime()))
            }
            listaSensorSeries = listaSensorSeries.filter(o => o.length > 0).map(o => o.reduce((a, b) => {
                return {
                    name: moment(o[0].timestamp).format(diffDias >= 1 ? "MM/DD" : "MM/DD HH:00"),
                    produccion: +a.produccion + +b.produccion,
                }
            }))
            listaSensorSeries = listaSensorSeries.map(o => {
                return {
                    name: o.name,
                    value: o.produccion
                }
            })

        }

        result.sensorSeries = listaSensorSeries

        result.unidadesTotales = Math.trunc(result.unidadesTotales)
        let productosTurno = await productoturno.findAll({
            where: {idsubproducto: idsp},
            include: [
                {
                    model: detalleproduccion,
                    as: "detproduccions"
                },
                {
                    model: turno,
                    as: "idturno_turno",
                    include: [
                        {
                            model: interrupcion,
                            as: "interrupcions",
                            include: [
                                {
                                    model: parada,
                                    as: "tipo_parada",
                                    /*where: {
                                        idcategoriaparada: {
                                            [Op.not]: null
                                        }
                                    }*/
                                }
                            ]
                        }
                    ]
                }
            ]
        })
        let interrupciones = unidadesTotales.map(o => o.idturno_turno.interrupcions).flat()
        let interrupcionesCategorizadas = interrupciones.filter(o => o.tipo_parada.idcategoriaparada != null)
        let interrupcionesTiempoProductivo = interrupcionesCategorizadas.filter(o => {
            let catOfInt = listaCats.find(oo => oo.dataValues.id == o.tipo_parada.idcategoriaparada)
            return catOfInt.tipo == 'no programada'
        })
        let interrupcionesTiempoDisponible = interrupcionesCategorizadas.filter(o => {
            let catOfInt = listaCats.find(oo => oo.dataValues.id == o.tipo_parada.idcategoriaparada)
            return catOfInt.tipo == 'programada'
        })
        result.intTP = interrupcionesTiempoProductivo.length == 0 ? 0 : interrupcionesTiempoProductivo.length == 1 ? interrupcionesTiempoProductivo[0].duracion :
            interrupcionesTiempoProductivo.reduce((a, b) => +a.duracion + +b.duracion)
        result.intTD = interrupcionesTiempoDisponible.length == 0 ? 0 : interrupcionesTiempoDisponible.length == 1 ? interrupcionesTiempoDisponible[0].duracion :
            interrupcionesTiempoDisponible.reduce((a, b) => +a.duracion + +b.duracion)
        result.intBajasVelocidad = interrupciones.filter(o => o.tipo_parada.categoriadeparada == null && o.tipo_parada.nombre == "Baja de velocidad").map(o => o.duracion).reduce((a, b) => +a + +b, 0)
        result.intMicroParadas = interrupciones.filter(o => o.tipo_parada.categoriadeparada == null && o.tipo_parada.nombre == "Maquina sin producir").map(o => o.duracion).reduce((a, b) => +a + +b, 0)

        result.velNominal = Math.trunc(result.unidadesEsperadas / spRecord.velprod)
        result.velReal = Math.trunc(result.unidadesTotales / spRecord.velprod)
        result.tiempoTotalHoras = Math.trunc(tiempoTotalHoras)
        result.tiempoProdHoras = +result.tiempoTotalHoras - ((interrupcionesTiempoProductivo.map(o => o.duracion).reduce((a, b) => +a + +b, 0) / 60) / 60)
        result.tiempoParadasProdMin = Math.trunc((interrupcionesTiempoProductivo.map(o => o.duracion).reduce((a, b) => +a + +b, 0) / 60))
        result.disponibilidad = ((result.tiempoProdHoras * 60) / (result.tiempoTotalHoras * 60))
        result.disponibilidadP = Math.trunc(result.disponibilidad * 100)
        result.tiempoProduciendo = Math.trunc(((result.tiempoProdHoras * 60) * 60)) - (result.intBajasVelocidad + result.intMicroParadas) < 0 ? 0 : Math.trunc(((result.tiempoProdHoras * 60) * 60)) - (result.intBajasVelocidad + result.intMicroParadas)
        result.tiempoProdSegs = Math.trunc(((result.tiempoProdHoras * 60) * 60))
        result.rendimiento = (result.tiempoProduciendo / ((result.tiempoProdHoras * 60) * 60))
        result.rendimientoP = Math.trunc(result.rendimiento * 100)

        result.tiempoProdUno = result.unidadesTotales == 0 ? 0 : Math.trunc(result.tiempoProduciendo / result.unidadesTotales)
        result.tiempoProduciendoNOOK = result.tiempoProdUno * result.mermas
        result.tiempoProduciendoOK = result.tiempoProduciendo - result.tiempoProduciendoNOOK
        result.calidad = (result.tiempoProduciendoOK / result.tiempoProdSegs)
        result.calidadP = Math.trunc(result.calidad * 100)
        result.oee = result.disponibilidad * result.calidad * result.rendimiento
        result.oeeP = Math.trunc(result.oee * 100)
        result.duracion = (interrupcionesCategorizadas.map(o => o.duracion).reduce((a, b) => +a + +b, 0) / 60)
        result.mtbf = interrupcionesTiempoProductivo.length == 0 ? 0 : ((result.tiempoProdHoras * 60) - result.duracion) / interrupcionesTiempoProductivo.length
        result.mttr = interrupcionesTiempoProductivo.length == 0 ? 0 : result.duracion / interrupcionesTiempoProductivo.length


        result.uso = Math.trunc((result.tiempoProdHoras * 100) / result.tiempoTotalHoras)
        if (isNaN(result.uso)) result.uso = 0
        return result

    },

    getReporteCalidad: async (idsp, lapso, otro, maquina = null, oeeSp) => {
        let result = {}
        //let oeeSp = await module.exports.getOeeBySp(idsp, lapso, otro, maquina)
        result.prodTotal = oeeSp.unidadesTotales
        result.mermas = oeeSp.mermas
        result.prodAceptada = +result.prodTotal - +result.mermas

        return result


    },
    getReporteRendimiento: async (idsp, lapso, otro, maquina = null, oeeSp) => {
        let recordIdSp = await subProducto.findOne({where: {id: idsp}})

        let result = {}
        if (recordIdSp) {
            //let oeeSp = await module.exports.getOeeBySp(idsp, lapso, otro, maquina)
            result.prodTotal = oeeSp.unidadesTotales
            result.prodEstimada = oeeSp.unidadesEsperadas
            result.prodReal = oeeSp.unidadesTotales - oeeSp.mermas
            let color = "#" + Math.floor(Math.random() * 16777215).toString(16)
            result.table = [
                {
                    name: recordIdSp.nombre,
                    value: result.prodTotal,
                    colorRecord: color,
                    color,
                    percentVsEstimada: result.prodEstimada == 0 ? 0 : ((result.prodTotal * 100) / result.prodEstimada) / 100
                }]
            result.color = {domain: [color]}
        }


        return result


    },

    getReporteDisponibilidad: async (idsp, lapso, otro, turnId = "", maquina = null) => {
        let result = {}
        let categorias = await categoriadeparada.findAll()
        let productosTurno = await productoturno.findAll({
            where: {idsubproducto: idsp},
            include: [
                {
                    model: detalleproduccion,
                    as: "detproduccions"
                },
                {
                    model: turno,
                    as: "idturno_turno",
                    include: [
                        {
                            model: interrupcion,
                            as: "interrupcions",
                            include: [
                                {
                                    model: parada,
                                    as: "tipo_parada",
                                    where: {
                                        idcategoriaparada: {
                                            [Op.not]: null
                                        }
                                    }
                                }
                            ]
                        }
                    ],
                    where: lapso == 'week' ?
                        {
                            horainicio: {
                                [Op.gte]: moment().subtract(1, "week").toDate().getTime()
                            }
                        } :
                        lapso == 'month' ?
                            {
                                horainicio: {
                                    [Op.gte]: moment().subtract(1, "month").toDate().getTime()
                                }
                            } :
                            lapso == 'other' ?
                                {
                                    horainicio: {
                                        [Op.gte]: parseInt(otro[0]),
                                        [Op.lt]: parseInt(otro[1])
                                    }

                                } :
                                lapso == 'turn' ? {}
                                    : {}
                }
            ],
            order: [["idturno_turno", 'horainicio', 'asc']],
        })
        if (productosTurno.length == 0) {
            return {error: "no hay turnos"}
        }
        if (lapso == 'turn') {
            productosTurno = productosTurno.slice(-1)
        }
        let interrupciones = productosTurno.map(o => o.idturno_turno.interrupcions).flat()
        let cats = categorias.slice()
        for (let c of cats) {
            c.dataValues.name = c.dataValues.nombre
            c.dataValues.interrupciones = interrupciones.filter(o => o.tipo_parada.idcategoriaparada == c.id)
                .map(o => {
                    return {
                        id: o.id,
                        horainicio: o.horainicio,
                        duracion: o.duracion,
                        tipo_parada: {
                            id: o.tipo_parada.id,
                            nombre: o.tipo_parada.nombre,
                            idcategoriaparada: o.tipo_parada.idcategoriaparada,

                        }
                    }
                })
        }
        for (let c of cats) {
            c.dataValues.value = c.dataValues.interrupciones.length
        }
        let dataCats = cats.map(o => {
            return {
                name: o.nombre,
                value: o.dataValues.value
            }
        })
        // let dataParadas =
        let obj = {}

        for (let int of interrupciones) {
            if (obj[int.tipo_parada.nombre]) {
                obj[int.tipo_parada.nombre] += 1
            } else {
                obj[int.tipo_parada.nombre] = 1
            }
        }
        let obj2 = {}

        for (let int of interrupciones) {
            if (obj2[int.tipo_parada.nombre]) {
                obj2[int.tipo_parada.nombre] += int.duracion / 60
            } else {
                obj2[int.tipo_parada.nombre] = int.duracion / 60
            }
        }


        return {
            cats: dataCats,
            catsColors: {
                colorScheme: {
                    domain: cats.map(o => o.color)
                }
            },
            paradas: Object.keys(obj).map(o => {
                return {name: o, value: obj[o]}
            }).length > 100 ? Object.keys(obj).map(o => {
                return {name: o, value: obj[o]}
            }).slice(0, 10) : Object.keys(obj).map(o => {
                return {name: o, value: obj[o]}
            }),
            interrupciones: interrupciones.length,
            paradasInfo: Object.keys(obj2).map(o => {
                return {name: o, duracion: obj2[o], percent: (obj[o] * 100) / interrupciones.length}
            }).sort((a, b) => +b.percent - +a.percent),
            paradasColors: {
                colorScheme: {
                    domain: Object.keys(obj).map(o => categorias.find(ooo => ooo.id == interrupciones.find(oo => oo.tipo_parada.nombre == o).tipo_parada.idcategoriaparada).color)
                }
            }
        }


    },
    getByProc: async (id, lapso, otro = [], idsp = null) => {
        let resp = {}
        let processRecord = await proceso.findOne({
            where: {id}, include: [
                {
                    model: maquina,
                    as: "maquinas"
                }
            ]
        })
        let maquinas = processRecord.maquinas

        let fechs = {}

        if (lapso == "other") {
            fechs.desde = parseInt(otro[0])
            fechs.hasta = parseInt(otro[1])
        }
        if (lapso == "week") {
            fechs.desde = moment().subtract(1, "week").toDate().getTime()
            fechs.hasta = Date.now()
        }

        if (lapso == "month") {
            fechs.desde = moment().subtract(1, "month").toDate().getTime()
            fechs.hasta = Date.now()
        }

        if (lapso == 'turn') {
            let todalasTurnas = await turno.findAll({where: {idmaquina}, order: [['horainicio', 'asc']]})

            fechs.desde = moment(todalasTurnas.slice(-1)[0].horainicio).toDate().getTime()
            fechs.hasta = moment(todalasTurnas.slice(-1)[0].horafin == null ? Date.now() : moment(todalasTurnas.slice(-1)[0].horafin).toDate().getTime()).toDate().getTime()
        }
        let machOee = await oeeEvent.maqOee(maquinas.map(o=>o.id), {desde: fechs.desde, hasta: fechs.hasta})
        return machOee


       /* let ignorados = ["lastTurnId", "table", "color"]
        let promedios = ["uso", "disponibilidadP", "calidadP", "rendimientoP", "oeeP"]

        let datosOee = maqs.map(o => o.oee)
            .reduce((a, b) => {
                let result = {}
                for (let k of Object.keys(a)) {
                    if (ignorados.find(o => o == k)) {
                    } else {

                        result[k] = a[k] + b[k]
                    }
                }
                return result
            })
        let oee = {}
        for (let k of Object.keys(datosOee)) {
            if (promedios.find(o => o == k)) {
                oee[k] = datosOee[k] / maqs.length
            } else {
                oee[k] = datosOee[k]
            }
        }
        oee.oeeCharts = {series: formatearYSumar(maqs.map(o => o.oee.oeeCharts.series).flat())}
        oee.calidadCharts = {series: formatearYSumar(maqs.map(o => o.oee.calidadCharts.series).flat())}
        oee.rendimientoCharts = {series: formatearYSumar(maqs.map(o => o.oee.rendimientoCharts.series).flat())}
        oee.disponibilidadCharts = {series: formatearYSumar(maqs.map(o => o.oee.disponibilidadCharts.series).flat())}
        oee.mttrCharts = {series: formatearYSumar(maqs.map(o => o.oee.mttrCharts.series).flat())}
        oee.mtbfCharts = {series: formatearYSumar(maqs.map(o => o.oee.mtbfCharts.series).flat())}
        oee.sensorSeries = formatearYSumar(maqs.map(o => o.oee.sensorSeries).flat())

        let datosCalidad = maqs.map(o => o.calidad)
            .reduce((a, b) => {
                let result = {}
                for (let k of Object.keys(a)) {
                    if (ignorados.find(o => o == k)) {
                    } else {
                        result[k] = a[k] + b[k]
                    }
                }
                return result
            })

        let datosRendimiento = maqs.map(o => o.rendimiento)
            .reduce((a, b) => {
                let result = {}
                for (let k of Object.keys(a)) {
                    if (ignorados.find(o => o == k)) {
                    } else {
                        result[k] = a[k] + b[k]
                    }
                }
                return result
            })
        datosRendimiento.table = maqs.map(o => o.rendimiento.table).flat()
        datosRendimiento.color = {
            domain: maqs.map(o => o.rendimiento.color.domain).flat()
        }
        let datosDisponibilidad = {}
        datosDisponibilidad.cats = formatearYSumar(maqs.map(o => o.disponibilidad.cats).flat())
        datosDisponibilidad.catsColors = {
            colorScheme: {domain: formatearDuplicadosStr(maqs.map(o => o.disponibilidad.catsColors.colorScheme.domain).flat())}
        }
        let paradasFormatted = formatearYSumar(maqs.map(o => o.disponibilidad.paradas.map((oo, ii) => {
            return {
                name: oo.name,
                value: oo.value,
                color: o.disponibilidad.paradasColors.colorScheme.domain[ii]
            }
        })).flat())

        datosDisponibilidad.paradas = paradasFormatted.map(o => {
            return {name: o.name, value: o.value}
        })
        datosDisponibilidad.interrupciones = maqs.map(o => o.disponibilidad.interrupciones || 0).reduce((a, b) => +a + +b),

            datosDisponibilidad.paradasInfo = formatearYSumar(maqs.map(o => o.disponibilidad.paradas).flat())
                .map(o => {
                    return {
                        name: o.name,
                        percent: (o.value * 100) / maqs.map(o => o.disponibilidad.interrupciones || 0).reduce((a, b) => +a + +b)
                    }
                }).sort((a, b) => +b.percent - +a.percent)
        datosDisponibilidad.paradasColors = {colorScheme: {domain: paradasFormatted.map(o => o.color)}}

        return {
            /!*maqs,*!/ oee, calidad: datosCalidad, rendimiento: datosRendimiento, disponibilidad: datosDisponibilidad
        }*/
    },

    getByPlant: async (id, lapso, otro = []) => {
        let plantRecord = await planta.findOne({
            where: {id}, include: [
                {
                    model: proceso,
                    as: "procesos",
                    include: [{
                        model: maquina,
                        as: "maquinas"
                    }]
                }
            ]
        })
        console.log(plantRecord);
        let maquinas = plantRecord.procesos.map(o=>o.maquinas).flat()

        let fechs = {}

        if (lapso == "other") {
            fechs.desde = parseInt(otro[0])
            fechs.hasta = parseInt(otro[1])
        }
        if (lapso == "week") {
            fechs.desde = moment().subtract(1, "week").toDate().getTime()
            fechs.hasta = Date.now()
        }

        if (lapso == "month") {
            fechs.desde = moment().subtract(1, "month").toDate().getTime()
            fechs.hasta = Date.now()
        }

        if (lapso == 'turn') {
            let todalasTurnas = await turno.findAll({where: {idmaquina}, order: [['horainicio', 'asc']]})

            fechs.desde = moment(todalasTurnas.slice(-1)[0].horainicio).toDate().getTime()
            fechs.hasta = moment(todalasTurnas.slice(-1)[0].horafin == null ? Date.now() : moment(todalasTurnas.slice(-1)[0].horafin).toDate().getTime()).toDate().getTime()
        }
        let machOee = await oeeEvent.maqOee(maquinas.map(o=>o.id), {desde: fechs.desde, hasta: fechs.hasta})
        return machOee
        /* let ignorados = ["lastTurnId", "table", "color"]
         let promedios = ["uso", "disponibilidadP", "calidadP", "rendimientoP", "oeeP"]

         let datosOee = procs.map(o => o.oee)
             .reduce((a, b) => {
                 let result = {}
                 for (let k of Object.keys(a)) {
                     if (ignorados.find(o => o == k)) {
                     } else {

                         result[k] = a[k] + b[k]
                     }
                 }
                 return result
             })
         let oee = {}
         for (let k of Object.keys(datosOee)) {
             if (promedios.find(o => o == k)) {
                 oee[k] = datosOee[k] / procs.length
             } else {
                 oee[k] = datosOee[k]
             }
         }

         oee.oeeCharts = {series: formatearYSumarYDividir(procs.map(o => o.oee.oeeCharts.series).flat(), procs.length)}
         oee.calidadCharts = {series: formatearYSumarYDividir(procs.map(o => o.oee.calidadCharts.series).flat(), procs.length)}
         oee.rendimientoCharts = {series: formatearYSumarYDividir(procs.map(o => o.oee.rendimientoCharts.series).flat(), procs.length)}
         oee.disponibilidadCharts = {series: formatearYSumarYDividir(procs.map(o => o.oee.disponibilidadCharts.series).flat(), procs.length)}
         oee.mttrCharts = {series: formatearYSumarYDividir(procs.map(o => o.oee.mttrCharts.series).flat(), procs.length)}
         oee.mtbfCharts = {series: formatearYSumarYDividir(procs.map(o => o.oee.mtbfCharts.series).flat(), procs.length)}

         oee.sensorSeries = formatearYSumar(procs.map(o => o.oee.sensorSeries).flat())

         let datosCalidad = procs.map(o => o.calidad)
             .reduce((a, b) => {
                 let result = {}
                 for (let k of Object.keys(a)) {
                     if (ignorados.find(o => o == k)) {
                     } else {
                         result[k] = a[k] + b[k]
                     }
                 }
                 return result
             })

         let datosRendimiento = procs.map(o => o.rendimiento)
             .reduce((a, b) => {
                 let result = {}
                 for (let k of Object.keys(a)) {
                     if (ignorados.find(o => o == k)) {
                     } else {
                         result[k] = a[k] + b[k]
                     }
                 }
                 return result
             })
         datosRendimiento.table = procs.map(o => o.rendimiento.table).flat()
         datosRendimiento.color = {
             domain: procs.map(o => o.rendimiento.color.domain).flat()
         }
         let datosDisponibilidad = {}
         datosDisponibilidad.cats = formatearYSumar(procs.map(o => o.disponibilidad.cats).flat())
         datosDisponibilidad.catsColors = {
             colorScheme: {domain: formatearDuplicadosStr(procs.map(o => o.disponibilidad.catsColors.colorScheme.domain).flat())}
         }
         let paradasFormatted = formatearYSumar(procs.map(o => o.disponibilidad.paradas.map((oo, ii) => {
             return {
                 name: oo.name,
                 value: oo.value,
                 color: o.disponibilidad.paradasColors.colorScheme.domain[ii]
             }
         })).flat())

         datosDisponibilidad.interrupciones = procs.map(o => o.disponibilidad.interrupciones || 0).reduce((a, b) => +a + +b),

             datosDisponibilidad.paradas = paradasFormatted.map(o => {
                 return {name: o.name, value: o.value}
             })
         datosDisponibilidad.paradasInfo = formatearYSumar(procs.map(o => o.disponibilidad.paradas).flat())
             .map(o => {
                 return {
                     name: o.name,
                     percent: (o.value * 100) / procs.map(o => o.disponibilidad.interrupciones || 0).reduce((a, b) => +a + +b)
                 }
             }).sort((a, b) => +b.percent - +a.percent)
         datosDisponibilidad.paradasColors = {colorScheme: {domain: paradasFormatted.map(o => o.color)}}

         return {
             /!*procs,*!/ oee, calidad: datosCalidad, rendimiento: datosRendimiento, disponibilidad: datosDisponibilidad
         }*/
    },

    getOeeParaChart: async (desde, hasta, idsp = [], idmaquina = null) => {

        let unidad = "hora"
        let difEnHoras = (((hasta - desde) / 1000) / 60) / 60
        let diffHoras = moment.duration(moment(hasta).diff(moment(desde))).asHours()
        let diffDias = moment.duration(moment(hasta).diff(moment(desde))).asDays()
        let diffSemanas = moment.duration(moment(hasta).diff(moment(desde))).asWeeks()


        if (difEnHoras <= 1) {
            unidad = "minuto"
        } else if (diffDias <= 4) {
            unidad = "hora"
        } else if (diffDias >= 4) {
            unidad = "dias"
        } else if (diffSemanas >= 3) {
            unidad = "semanas"
        }
        let rangos = []
        let fechaI = moment(desde)
        while (fechaI.toDate().getTime() < moment(hasta).toDate().getTime()) {
            rangos.push(fechaI.toDate().getTime())
            if (unidad == "minuto") {
                fechaI.add(1, "minutes")
            } else if (unidad == "dias") {
                fechaI.add(1, "day")
            } else if (unidad == "semanas") {
                fechaI.add(1, "week")
            } else {
                fechaI.add(1, "hours")
            }
        }
        let rangosQuery = []
        for (let i = 0; i < rangos.length; i++) {
            if (i != rangos.length - 1) {
                rangosQuery.push({desde: rangos[i], hasta: rangos[i + 1]})
            }
        }
        let datosChart =/*await module.exports.getOeeBySp(idsp,"turn",[1636177674491, 1638683274491],idmaquina,true)*/ []
        for (let r of rangosQuery) {
            let data = await module.exports.getOeeBySp(idsp, "other", [r.desde, r.hasta], idmaquina, true)

            datosChart.push({
                desde: r.desde,
                hasta: r.hasta,
                oeeP: data.oeeP || 0,
                rendimientoP: data.rendimientoP || 0,
                calidadP: data.calidadP || 0,
                disponibilidadP: data.disponibilidadP || 0,
                mtbf: data.mtbf || 0,
                mttr: data.mttr || 0,
                diferencia: unidad
            })
        }
        return {
            datosChart,
            /*rangos,
            rangosQuery,
            difEnHoras,
            diffHoras*/
        }


    }

    ,
    getByMaq: async (idmaquina, lapso, otro = [], idspSel = null) => {

        let fechs = {}

        if (lapso == "other") {
            fechs.desde = parseInt(otro[0])
            fechs.hasta = parseInt(otro[1])
        }
        if (lapso == "week") {
            fechs.desde = moment().subtract(1, "week").toDate().getTime()
            fechs.hasta = Date.now()
        }

        if (lapso == "month") {
            fechs.desde = moment().subtract(1, "month").toDate().getTime()
            fechs.hasta = Date.now()
        }

        if (lapso == 'turn') {
            let todalasTurnas = await turno.findAll({where: {idmaquina}, order: [['horainicio', 'asc']]})

            fechs.desde = moment(todalasTurnas.slice(-1)[0].horainicio).toDate().getTime()
            fechs.hasta = moment(todalasTurnas.slice(-1)[0].horafin == null ? Date.now() : moment(todalasTurnas.slice(-1)[0].horafin).toDate().getTime()).toDate().getTime()
        }
        let machOee = await oeeEvent.maqOee([idmaquina], {desde: fechs.desde, hasta: fechs.hasta})
        console.log("machOee");
        console.log(machOee);
        return machOee
        /*   let ultimoTurno = await turno.findAll({where: {idmaquina}, order: [["horainicio", "ASC"]]})
           if (idspSel != null) {
               machineRecord.subproductosmaquinas = machineRecord.subproductosmaquinas.filter(o => o.idsubproducto == idspSel)
           }
           console.log(machineRecord.subproductosmaquinas);

           let spsE = await Promise.all(machineRecord.subproductosmaquinas.map(async o => await module.exports.getOeeBySp(o.idsubproducto_subproducto.id, lapso, otro, idmaquina)))
           let sps = spsE.slice()
           if (lapso == "turn") {
               ultimoTurno = ultimoTurno.slice(-1)
               sps = sps.filter(o => o.lastTurnId == ultimoTurno[0].id)
           }
           sps = sps.filter(o => !(o.error))

           let chartsOFormateado = formatearYSumar(sps.map(o => o.oeeCharts.series).flat())
           let chartsRFormateado = formatearYSumar(sps.map(o => o.rendimientoCharts.series).flat())
           let chartsCFormateado = formatearYSumar(sps.map(o => o.calidadCharts.series).flat())
           let chartsDFormateado = formatearYSumar(sps.map(o => o.disponibilidadCharts.series).flat())
           let chartsMTTRFormateado = formatearYSumar(sps.map(o => o.mttrCharts.series).flat())
           let chartsMTBFFormateado = formatearYSumar(sps.map(o => o.mtbfCharts.series).flat())


           console.log(sps);
           let oeeObj = {
               lastTurnId: sps[0]?.lastTurnId,
               "unidadesTotales":
                   sps.length == 0 ? 0 :
                       sps.length == 1 ? sps[0].unidadesTotales :
                           sps.reduce((a, b) => (a.unidadesTotales ? +a.unidadesTotales : 0) + (b.unidadesTotales ? +b.unidadesTotales : 0)),
               "unidadesEsperadas":
                   sps.length == 0 ? 0 :
                       sps.length == 1 ? sps[0].unidadesEsperadas :
                           sps.reduce((a, b) => (+a.unidadesEsperadas || 0) + (+b.unidadesEsperadas || 0)),
               "mermas":
                   sps.length == 0 ? 0 :
                       sps.length == 1 ? sps[0].mermas :
                           sps.reduce((a, b) => (+a.mermas || 0) + (+b.mermas || 0)),
               "velNominal":
                   sps.length == 0 ? 0 :
                       sps.length == 1 ? sps[0].velNominal :
                           sps.reduce((a, b) => (+a.velNominal || 0) + (+b.velNominal || 0)),
               "velReal":
                   sps.length == 0 ? 0 :
                       sps.length == 1 ? sps[0].velReal :
                           sps.reduce((a, b) => (+a.velReal || 0) + (+b.velReal || 0)),
               "tiempoTotalHoras":
                   sps.length == 0 ? 0 :
                       sps.length == 1 ? sps[0].tiempoTotalHoras :
                           sps.reduce((a, b) => (+a.tiempoTotalHoras || 0) + (+b.tiempoTotalHoras || 0)),
               "tiempoProdHoras":
                   sps.length == 0 ? 0 :
                       sps.length == 1 ? sps[0].tiempoProdHoras :
                           sps.reduce((a, b) => (+a.tiempoProdHoras || 0) + (+b.tiempoProdHoras || 0)),
               "uso":
                   sps.length == 0 ? 0 :
                       sps.length == 1 ? sps[0].uso :
                           sps.reduce((a, b) => (+a.uso || 0) + (+b.uso || 0)),
               "disponibilidadP":
                   sps.length == 0 ? 0 :
                       sps.length == 1 ? sps[0].disponibilidadP / 1 :
                           sps.reduce((a, b) => (+a.disponibilidadP || 0) + (+b.disponibilidadP || 0)) / sps.length,
               "calidadP":
                   sps.length == 0 ? 0 :
                       sps.length == 1 ? sps[0].calidadP / 1 :
                           sps.reduce((a, b) => (+a.calidadP || 0) + (+b.calidadP || 0)) / sps.length,
               "rendimientoP":
                   sps.length == 0 ? 0 :
                       sps.length == 1 ? sps[0].rendimientoP / 1 :
                           sps.reduce((a, b) => (+a.rendimientoP || 0) + (+b.rendimientoP || 0)) / sps.length,
               "oeeP":
                   sps.length == 0 ? 0 :
                       sps.length == 1 ? sps[0].oeeP / 1 :
                           sps.reduce((a, b) => (+a.oeeP || 0) + (+b.oeeP || 0)) / sps.length,
               "duracion":
                   sps.length == 0 ? 0 :
                       sps.length == 1 ? sps[0].duracion :
                           sps.reduce((a, b) => (+a.duracion || 0) + (+b.duracion || 0)),
               "totalEventos":
                   sps.length == 0 ? 0 :
                       sps.length == 1 ? sps[0].totalEventos :
                           sps.reduce((a, b) => (+a.totalEventos || 0) + (+b.totalEventos || 0)),

               oeeCharts: {
                   name: "OEE",
                   series: sps.length == 0 ? [] : sps.length == 1 ? sps[0].oeeCharts.series :
                       chartsOFormateado
               },
               calidadCharts: {
                   name: "Calidad",
                   series: sps.length == 0 ? [] : sps.length == 1 ? sps[0].calidadCharts.series :
                       chartsCFormateado
               },
               rendimientoCharts: {
                   name: "Rendimiento",
                   series: sps.length == 0 ? [] : sps.length == 1 ? sps[0].rendimientoCharts.series :
                       chartsRFormateado
               },
               disponibilidadCharts: {
                   name: "Disponibilidad",
                   series: sps.length == 0 ? [] : sps.length == 1 ? sps[0].disponibilidadCharts.series : chartsDFormateado
               },
               mttrCharts: {
                   name: "MTTR",
                   series: sps.length == 0 ? [] : sps.length == 1 ? sps[0].mttrCharts.series : chartsMTTRFormateado
               },
               mtbfCharts: {
                   name: "MTBF",
                   series: sps.length == 0 ? [] : sps.length == 1 ? sps[0].mtbfCharts.series : chartsMTBFFormateado
               },
               sensorSeries: sps.length == 0 ? [] : sps.length == 1 ? sps[0].sensorSeries :
                   formatearYSumar(sps.map(o => o.sensorSeries).flat()),
           }
           let spsCalidad = await Promise.all(machineRecord.subproductosmaquinas.map(async (o, ind) => await module.exports.getReporteCalidad(o.idsubproducto_subproducto.id, lapso, otro, idmaquina, spsE[ind])))
           spsCalidad = spsCalidad.filter(o => !(o.error))

           let calidadObj = {
               "prodTotal":
                   spsCalidad.length == 0 ? 0 :
                       spsCalidad.length == 1 ? spsCalidad[0].prodTotal :
                           spsCalidad.map(o => o.prodTotal || 0).reduce((a, b) => +a + +b),
               "mermas":
                   spsCalidad.length == 0 ? 0 :
                       spsCalidad.length == 1 ? spsCalidad[0].mermas :
                           spsCalidad.map(o => o.mermas || 0).reduce((a, b) => +a + +b),
               "prodAceptada":
                   spsCalidad.length == 0 ? 0 :
                       spsCalidad.length == 1 ? spsCalidad[0].prodAceptada :
                           spsCalidad.map(o => o.prodAceptada || 0).reduce((a, b) => +a + +b),
           }

           let spsRendimiento = await Promise.all(machineRecord.subproductosmaquinas.map(async (o, ind) => await module.exports.getReporteRendimiento(o.idsubproducto_subproducto.id, lapso, otro, idmaquina, spsE[ind])))
           spsRendimiento = spsRendimiento.filter(o => !(o.error))

           let rendimientoObj = {
               "prodTotal": spsRendimiento.length == 0 ? 0 : spsRendimiento.length == 1 ? spsRendimiento[0].prodTotal :
                   spsRendimiento.map(o => o.prodTotal || 0).reduce((a, b) => (+a + +b)),
               "prodEstimada": spsRendimiento.length == 0 ? 0 : spsRendimiento.length == 1 ? spsRendimiento[0].prodEstimada :
                   spsRendimiento.map(o => o.prodEstimada || 0).reduce((a, b) => (+a + +b)),

               "prodReal": spsRendimiento.length == 0 ? 0 : spsRendimiento.length == 1 ? spsRendimiento[0].prodReal :
                   spsRendimiento.map(o => o.prodReal || 0).reduce((a, b) => (+a + +b)),

               "table": spsRendimiento.length == 0 ? [] : spsRendimiento.map(o => {
                   return {
                       name: o.table[0].name,
                       colorRecord: o.table[0].colorRecord,
                       color: o.table[0].color,
                       value: o.table[0].value || 0,
                       percentVsEstimada: o.table[0].percentVsEstimada || 0
                   }
               }),
               color: {
                   domain: spsRendimiento.map(o => o.table[0].color)
               }
           }

           let spsDisponibilidad = await Promise.all(machineRecord.subproductosmaquinas.map(async o => await module.exports.getReporteDisponibilidad(o.idsubproducto_subproducto.id, lapso, otro, idmaquina)))
           spsDisponibilidad = spsDisponibilidad.filter(o => !(o.error))

           let datosDisponibilidad = {}
           datosDisponibilidad.cats = formatearYSumar(spsDisponibilidad.map(o => o.cats).flat())
           datosDisponibilidad.catsColors = {
               colorScheme: {domain: formatearDuplicadosStr(spsDisponibilidad.map(o => o.catsColors.colorScheme.domain).flat())}
           }
           let paradasFormatted = formatearYSumar(spsDisponibilidad.map(o => o.paradas.map((oo, ii) => {
               return {
                   name: oo.name,
                   value: oo.value,
                   color: o.paradasColors.colorScheme.domain[ii]
               }
           })).flat())

           datosDisponibilidad.paradas = paradasFormatted.map(o => {
               return {name: o.name, value: o.value}
           })
           datosDisponibilidad.paradasColors = {colorScheme: {domain: paradasFormatted.map(o => o.color)}}


           let disponibilidadObj = {
               "cats": spsDisponibilidad.length == 0 ? [] : spsDisponibilidad.length == 1 ? spsDisponibilidad[0].cats :
                   datosDisponibilidad.cats,
               "catsColors": {
                   "colorScheme": {
                       "domain": spsDisponibilidad.length == 0 ? [] : spsDisponibilidad.length == 1 ? spsDisponibilidad[0].catsColors.colorScheme.domain :
                           datosDisponibilidad.catsColors.colorScheme.domain,
                   }
               },
               "paradas":
                   spsDisponibilidad.length == 0 ? [] : spsDisponibilidad.length == 1 ? spsDisponibilidad[0].paradas :
                       datosDisponibilidad.paradas,
               interrupciones: spsDisponibilidad.map(o => o.interrupciones || 0).reduce((a, b) => +a + +b,0),
               paradasInfo: formatearYSumar(spsDisponibilidad.map(o => o.paradas).flat())
                   .map(o => {
                       return {
                           name: o.name,
                           percent: (o.value * 100) / spsDisponibilidad.map(o => o.interrupciones || 0).reduce((a, b) => +a + +b)
                       }
                   }).sort((a, b) => +b.percent - +a.percent),
               "paradasColors": {
                   "colorScheme": {
                       "domain": spsDisponibilidad.length == 0 ? [] : spsDisponibilidad.length == 1 ? spsDisponibilidad[0].paradasColors.colorScheme.domain :
                           datosDisponibilidad.paradasColors.colorScheme.domain

                   }
               }
           }

           return {
               //sps,
               //spes: machineRecord.subproductosmaquinas,
               oee: oeeObj,
               //spsCalidad,
               calidad: calidadObj,
               //spsRendimiento,
               rendimiento: rendimientoObj,
               //spsDisponibilidad,
               disponibilidad: disponibilidadObj
           }*/
    },
    getReporteOee: async idmaquina => {
        let turnosMaq = await turno.findAll({where: {idmaquina}})
        let detProd = []
        let detProdS = []
        if (turnosMaq.length == 0) return {}
        for (let t of turnosMaq) {
            detProdS.push(await sensorPersistencia.getProductionByTurn(t.id));
            detProd.push(await turnoPersistencia.getAllProductionByTurn(t.id));
        }

        return {
            s: {
                unidadesTotales: detProdS.map(o => o.map(oo => oo.produccion)).flat()
                    .reduce((a, b) => +a + +b, 0),

                r: detProdS
            },
            p: {
                unidadesTotales: detProd.map(o => o.total).reduce((a, b) => +a + +b, 0),
                r: detProd
            }
        }
    }
}


function formatearYSumar(repetidos = []) {
    let obj = {}
    for (let r of repetidos) {
        if (obj[r.name]) {
            obj[r.name].value += r.value
        } else {
            obj[r.name] = {
                value: r.value,
                color: r.color
            }
        }
    }
    return Object.keys(obj).map(o => {
        return {name: o, value: obj[o].value, color: obj[o].color}
    })
}

function formatearYSumarYDividir(repetidos = [], n) {
    let obj = {}
    for (let r of repetidos) {
        if (obj[r.name]) {
            obj[r.name].value += r.value
        } else {
            obj[r.name] = {
                value: r.value,
                color: r.color
            }
        }
    }
    return Object.keys(obj).map(o => {
        return {name: o, value: obj[o].value / n, color: obj[o].color}
    })
}

function formatearDuplicadosStr(repetidos = []) {
    let obj = {}
    for (let r of repetidos) {
        if (obj[r]) {
            obj[r] += 1
        } else {
            obj[r] = 1
        }
    }
    return Object.keys(obj).map(o => o)
}