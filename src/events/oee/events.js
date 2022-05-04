const DataTypes = require("sequelize").DataTypes;
const sequelize = require("../../database/index")
const _maquina = require("../../database/models/maquina");
const _turno = require("../../database/models/turno");
const _subproducto = require("../../database/models/subproducto");
const _horarios = require("../../database/models/horarios");
const _interrupcion = require("../../database/models/interrupcion");
const _operador = require("../../database/models/operador");
const _paradamaquina = require("../../database/models/paradamaquina");
const _datasensor = require("../../database/models/sensordata");
const _categoriadeparada = require("../../database/models/categoriadeparada");
const _detturoperador = require("../../database/models/detturoperador");
const _detproduccion = require("../../database/models/detproduccion");
const _productoturno = require("../../database/models/productoturno");
const _mantencion = require("../../database/models/mantencion");
const _subproductosmaquina = require("../../database/models/subproductosmaquina");
const _parada = require("../../database/models/parada");
const {Op, Sequelize} = require("sequelize");
const moment = require("moment");
const domain = require("domain");
const productoturno = _productoturno(sequelize.sql, DataTypes);
const subproductosmaquina = _subproductosmaquina(sequelize.sql, DataTypes);
const subproducto = _subproducto(sequelize.sql, DataTypes);
const detproduccion = _detproduccion(sequelize.sql, DataTypes);
const operador = _operador(sequelize.sql, DataTypes);
const detturoperador = _detturoperador(sequelize.sql, DataTypes);
const interrupcion = _interrupcion(sequelize.sql, DataTypes);
const datasensor = _datasensor(sequelize.sql, DataTypes);
const parada = _parada(sequelize.sql, DataTypes);
const mantencion = _mantencion(sequelize.sql, DataTypes);
const categoriadeparada = _categoriadeparada(sequelize.sql, DataTypes);
const horarios = _horarios(sequelize.sql, DataTypes);
const maquina = _maquina(sequelize.sql, DataTypes);
const paradamaquina = _paradamaquina(sequelize.sql, DataTypes);
const turno = _turno(sequelize.sql, DataTypes);
const interruptionPersistencia = require("../interruption/persistence")

async function allTurns(machines, fechas = {}) {

    let listaTurnos = []
    for (let mach of machines) {
        let turnos = await turno.findAll({
            where: {idmaquina: mach}, include: [
                {
                    model:detturoperador,
                    as:"detturoperadors",
                    include:[{model:operador,as:"idoperador_operador"}]
                },
                {
                    model: horarios,
                    as: "idhorario_horario"
                }, {
                    model: productoturno,
                    as: "productoturnos",
                    include: [{
                        model: subproducto,
                        as: "idsubproducto_subproducto"
                    },
                        {
                            model: detproduccion,
                            as: 'detproduccions'
                        }]
                }
            ],
            order:[["horainicio","asc"]]
        })
        if (turnos.length > 0) {
            listaTurnos.push(turnos)
        }
    }
    let turnos = listaTurnos.flat()
    if (turnos.length === 0) return []
    if (fechas.desde === undefined && fechas.hasta === undefined) {
        turnos = turnos.map(o => {
            return {...o.dataValues, horafin: o.dataValues.horafin == null ? Date.now() : o.dataValues.horafin}
        })

    } else {
        fechas.desde = parseInt(fechas.desde)
        fechas.hasta = parseInt(fechas.hasta)
        turnos = turnos.map(o => {
            return {...o.dataValues, horafin: o.dataValues.horafin == null ? Date.now() : o.dataValues.horafin}
        }).filter(o =>
            fechas.desde <= moment(o.horainicio).toDate().getTime() && fechas.hasta >= moment(o.horafin).toDate().getTime() ||
            fechas.desde <= moment(o.horafin).toDate().getTime() && fechas.hasta >= moment(o.horafin).toDate().getTime() ||
            fechas.hasta > moment(o.horainicio).toDate().getTime() && fechas.desde <= moment(o.horainicio).toDate().getTime() ||
            fechas.desde <= moment(o.horafin).toDate().getTime() && fechas.hasta > moment(o.horainicio).toDate().getTime() ||
            fechas.desde <= moment(o.horainicio).toDate().getTime() && fechas.hasta < moment(o.horafin).toDate().getTime() &&
            fechas.hasta > moment(o.horainicio).toDate().getTime() ||
            fechas.desde >= moment(o.horainicio).toDate().getTime() && fechas.hasta < moment(o.horafin).toDate().getTime() ||
            fechas.desde >= moment(o.horainicio).toDate().getTime() && fechas.hasta > moment(o.horafin).toDate().getTime() &&
            fechas.desde < moment(o.horafin).toDate().getTime())

    }
    turnos = turnos.map(o => {
        return {
            ...o,
            capRealMin: moment.duration(moment(fechas.hasta < moment(o.horafin).toDate().getTime() ? fechas.hasta : moment(o.horafin).toDate().getTime()).diff(moment(fechas.desde > moment(o.horainicio).toDate().getTime() ? fechas.desde : moment(o.horainicio).toDate().getTime()))).asMinutes(),
            velNominal: (o.produccionesperada || 0) / (o.productoturnos[0] ? o.productoturnos[0].idsubproducto_subproducto?.velprod : 0)

        }
    })
    return turnos

}

function sumatoriaTotalHoras(turnos) {
    if (turnos.length == 0) return 0
    if (turnos.length == 1) return turnos[0].capRealMin
    let totalHoras = 0
    for (let t of turnos) {
        totalHoras += +t.capRealMin
    }
    return totalHoras
}

async function paradasProductivas(maquinas, fechas) {
    let listaParadas = []
    for (let mach of maquinas) {


        listaParadas.push((await interrupcion.findAll({


            where: fechas.desde !== undefined && fechas.hasta !== undefined ?
                {
                    /*  horainicio: {
                          [Op.gte]:fechas.desde,
                          [Op.lt]:fechas.hasta
                      },*/
                    [Op.and]: [
                        Sequelize.literal(`horainicio + (duracion || 's')::interval > to_timestamp(cast(${fechas.desde}/1000 as bigint))::timestamp and horainicio <= to_timestamp(cast(${fechas.hasta}/1000 as bigint))::timestamp`),
                    ]
                } :
                {},
            include: [{
                model: parada, as: "tipo_parada", where: {idcategoriaparada: {[Op.not]: null}},
                include: [
                    {
                        model: categoriadeparada,
                        as: "idcategoriaparada_categoriadeparada",
                        where: {tipo: "no programada"}
                    },
                    {
                        model: paradamaquina,
                        as: "paradamaquinas",
                        where: {idmaquina: mach}
                    }]
            }]
        })).filter(o => o.tipo_parada != null))
    }
    listaParadas = listaParadas.flat()
    if (fechas.desde !== undefined && fechas.hasta !== undefined) {
        listaParadas = listaParadas.map(o => {
            return {
                ...o.dataValues,
                /*oldDuracion:o.dataValues.duracion,*/
                duracion: moment.duration(moment(fechas.hasta < moment(o.dataValues.horainicio).add(o.dataValues.duracion, "seconds").toDate().getTime() ? fechas.hasta : moment(o.dataValues.horainicio).add(o.dataValues.duracion, "seconds").toDate().getTime()).diff(moment(fechas.desde > moment(o.dataValues.horainicio).toDate().getTime() ? fechas.desde : moment(o.dataValues.horainicio).toDate().getTime()))).asSeconds(),
                /* hi:fechas.desde > moment(o.dataValues.horainicio).toDate().getTime() ? fechas.desde :moment( o.dataValues.horainicio).toDate().getTime(),
                 horafin:moment(o.dataValues.horainicio).add(o.dataValues.duracion,"seconds").toDate().getTime(),
                 hf:fechas.hasta < moment(o.dataValues.horafin).toDate().getTime() ? fechas.hasta : moment(o.dataValues.horafin).toDate().getTime()
 */
            }
        })
    }

    return listaParadas
}

async function paradasMantenimiento(maquinas, fechas) {
    let listaParadas = []

    for (let mach of maquinas) {
        listaParadas.push((await interrupcion.findAll({
            where: fechas.desde !== undefined && fechas.hasta !== undefined ?
                {
                    /*  horainicio: {
                          [Op.gte]:fechas.desde,
                          [Op.lt]:fechas.hasta
                      },*/
                    [Op.and]: [
                        Sequelize.literal(`horainicio + (duracion || 's')::interval > to_timestamp(cast(${fechas.desde}/1000 as bigint))::timestamp and horainicio <= to_timestamp(cast(${fechas.hasta}/1000 as bigint))::timestamp`),
                    ]
                } :
                {},
            include: [{
                model: parada, as: "tipo_parada", where: {idcategoriaparada: {[Op.not]: null}},
                include: [
                    {
                        model: categoriadeparada,
                        as: "idcategoriaparada_categoriadeparada",
                        where: {tipo: "programada"}
                    },
                    {
                        model: paradamaquina,
                        as: "paradamaquinas",
                        where: {idmaquina: mach}
                    }]
            }]
        })).filter(o => o.tipo_parada != null))
    }
    listaParadas = listaParadas.flat()
    if (fechas.desde !== undefined && fechas.hasta !== undefined) {
        listaParadas = listaParadas.map(o => {
            return {
                ...o.dataValues,
                oldDuracion: o.dataValues.duracion,
                //duracion: moment.duration(moment(fechas.hasta < moment(o.dataValues.horainicio).add(o.dataValues.duracion,"seconds").toDate().getTime() ? fechas.hasta :  moment(o.dataValues.horainicio).add(o.dataValues.duracion,"seconds").toDate().getTime()).diff(moment(fechas.desde > moment(o.dataValues.horainicio).toDate().getTime() ? fechas.desde : moment(o.dataValues.horainicio).toDate().getTime()))).asSeconds(),

            }
        })
    }

    return listaParadas
}

async function paradasMicro(maquinas) {
    let listaParadas = []

    for (let mach of maquinas) {
        listaParadas.push((await interrupcion.findAll({
            include: [{
                model: parada, as: "tipo_parada", where: {idcategoriaparada: null},
                include: [
                    {
                        model: paradamaquina,
                        as: "paradamaquinas",
                        where: {idmaquina: mach}
                    }]
            }]
        })).filter(o => o.tipo_parada != null))
    }
    return listaParadas.flat()
}

async function totalParadasProductivas(machines, fechas) {
    let totalParadasP = await paradasProductivas(machines, fechas)
    let totalParadasPMin = (totalParadasP.map(o => o.duracion).reduce((a, b) => +a + +b, 0)) / 60
    return {value: totalParadasPMin, list: totalParadasP}
}

async function totalParadasMantenimiento(machines, fechas) {
    let totalParadasM = await paradasMantenimiento(machines, fechas)
    let totalParadasMMin = (totalParadasM.map(o => o.duracion).reduce((a, b) => +a + +b, 0)) / 60
    return {value: totalParadasMMin, list: totalParadasM}
}

async function totalParadasMicro(machines) {
    let totalMicroParadas = await paradasMicro(machines)
    let totalMicroParadasMin = (totalMicroParadas.map(o => o.duracion).reduce((a, b) => +a + +b, 0)) / 60
    return totalMicroParadasMin
}

async function turnosTotalProduccion(machines) {
    let turnos = await allTurns(machines)
    return turnos.map(o => o.prodtotal || 0).reduce((a, b) => +a + b, 0)

}

async function totalProduccionOk(turnos, fechas) {

    let produccionesOk = []
    let totalprod = 0
    let c = []
    for (let t of turnos) {
        let totalUnidades = 0
        let machineRecord = await maquina.findOne({where: {id: t.idmaquina}})
        if (machineRecord.conSensor) {
            let totalProdSensor = await datasensor.findAll({
                where: {
                    idmaquina: t.idmaquina.toString(),
                    timestamp: {
                        [Op.gte]: moment(t.horainicio).toDate().getTime(),
                        [Op.lt]: moment(t.horafin).toDate().getTime()
                    }
                }
            })
            if (fechas.desde !== undefined && fechas.hasta !== undefined) {
                totalProdSensor = totalProdSensor
                    .filter(o =>
                        moment(o.timestamp).toDate().getTime() >= fechas.desde &&
                        moment(o.timestamp).toDate().getTime() < fechas.hasta
                    )
            }
            let totalProdSensorCantidad = totalProdSensor.map(o => o.produccion).filter(o => !isNaN(o)).reduce((a, b) => +a + +b, 0)
            totalUnidades = totalProdSensorCantidad
        } else {
            let totalProdManual = (await productoturno.findAll({
                where: {idturno: t.id},
                include: [{
                    model: detproduccion,
                    as: "detproduccions",
                }]
            }))
            let totalProd = totalProdManual.map(oo => oo.detproduccions).flat(1)
                .map(o => o.cantidad)
                .reduce((a, b) => +a + +b, 0)
            totalUnidades = totalProd
        }
        let totalProdManual = (await productoturno.findAll({
            where: {idturno: t.id},
            include: [{
                model: detproduccion,
                as: "detproduccions",
            }]
        }))
        let mermas = totalProdManual.map(o => o.mermas || 0).reduce((a, b) => +a + +b, 0)
        totalprod += totalUnidades
        let capacidadRealMin = t.capRealMin
        let tiempoPorUnidad = totalprod == 0 ? capacidadRealMin : capacidadRealMin / totalprod
        c.push(capacidadRealMin - (mermas * tiempoPorUnidad))
    }


    return {value: c.reduce((a, b) => +a + +b, 0), totalprod}

}

async function totalUnidades(machines) {
    let totalUnidades = 0
    let totalProdManual = []
    let totalProdSensor = []
    let totalProdTurnos = []
    for (let machine of machines) {
        let machineRecord = await maquina.findOne({where: {id: machine}})
        if (machineRecord.conSensor) {
            totalProdSensor.push(await datasensor.findAll({where: {idmaquina: machine.toString()}}))


        } else {
            totalProdManual.push((await detproduccion.findAll({
                include: [{
                    model: productoturno,
                    as: "idprodturn_productoturno",
                    include: [{
                        model: turno,
                        as: "idturno_turno",
                        where: {idmaquina: machine}
                    }]
                }]
            })).filter(o => o.idprodturn_productoturno != null))


        }
    }
    totalProdSensor = totalProdSensor.flat()
    let totalProdSensorCantidad = totalProdSensor.map(o => o.produccion).filter(o => !isNaN(o)).reduce((a, b) => +a + +b, 0)

    totalProdManual = totalProdManual.flat()
    let totalProdManualCantidad = totalProdManual.map(o => o.cantidad).filter(o => !isNaN(o)).reduce((a, b) => +a + +b, 0)
    totalUnidades = totalProdSensorCantidad > 0 ? totalProdSensorCantidad : totalProdManualCantidad

    //let totalTurnos = await turnosTotalProduccion(machines)

    return totalUnidades
}


//Capacidad real en minutos - total paradas productivas
TPMin = (capRMin, tpp) => capRMin - tpp
//Capacidad real en minutos - total paradas mantenimiento
TDMin = (capRMin, tpm) => capRMin - tpm
Disponibilidad = (TPMin, TDMin) => TPMin / TDMin

TiempoProduciendo = (capRMin, tmp) => capRMin - tmp
Rendimiento = (TiempoProduciendo, TPMin) => TiempoProduciendo / TPMin

async function getchartLapso(desde, hasta, idmaquina = []) {

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
    let datosChart = []
    for (let r of rangosQuery) {
        let data = await module.exports.maqOee(idmaquina, {desde: r.desde, hasta: r.hasta}, false)
        datosChart.push({
            desde: r.desde,
            hasta: r.hasta,
            oeeP: data.oee?.oeeP || 0,
            rendimientoP: data.oee?.rendimientoP || 0,
            calidadP: data.oee?.calidadP || 0,
            disponibilidadP: data.oee?.disponibilidadP || 0,
            mtbf: data.oee?.mtbf || 0,
            mttr: data.oee?.mttr || 0,
            diferencia: unidad
        })
    }
    return datosChart


}

module.exports = {
    maqOee: async (machines, fechas = {}, noCharts = true, onlyOee = false) => {
        let listaTurnos = await allTurns(machines, fechas)
        if (listaTurnos.length == 0) return false
        let capRMin = sumatoriaTotalHoras(listaTurnos)
        let tpp = await totalParadasProductivas(machines, fechas)
        //let tpp = await paradasProductivas(machines, fechas)
        let tpm = await totalParadasMantenimiento(machines, fechas)
        let tmp = await totalParadasMicro(machines)
        let paradasMicroD = await paradasMicroPorDeduccion(listaTurnos, fechas)
        //let unidadesTotales = await totalUnidades(machines)
        let sumatoriaProduciendoOk = await totalProduccionOk(listaTurnos, fechas)
        let listaProdTurns = (await Promise.all(listaTurnos.map(async o => (await productoturno.findAll({
            where: {
                idturno: o.id
            },
            include: [{
                model: subproducto,
                as: 'idsubproducto_subproducto'
            },
                {
                    model: detproduccion,
                    as: 'detproduccions'
                }]
        }))))).flat()
        let cantidadEsperadaProdTurns = listaProdTurns.map(o => o.cantidadesperada || 0).reduce((a, b) => +a + +b, 0)
        let mermasProdTurns = listaProdTurns.map(o => o.mermas || 0).reduce((a, b) => +a + +b, 0)
        let velprodProdTurns = listaProdTurns.map(o => o.idsubproducto_subproducto?.velprod || 0).reduce((a, b) => +a + +b, 0)
        let detProdsProdTurn = listaProdTurns.map(o => o.detproduccions).flat()

        let acumulado = await interruptionPersistencia.getAcumuladoPorTurno(listaTurnos[listaTurnos.length - 1].id)
        acumulado = (acumulado / 60).toFixed(0)
        //let unidadesEsperadas = listaTurnos.map(o => o.produccionesperada ? o.produccionesperada : 0).reduce((a, b) => +a + +b, 0)
        let unidadesEsperadas = cantidadEsperadaProdTurns
        //let mermas = listaTurnos.map(o => o.mermas || 0).reduce((a, b) => +a + +b, 0)
        let mermas = mermasProdTurns
        listaTurnos = listaTurnos.map(o => {
            return {
                ...o,
                velReal: (o.registrosSensor.map(o => o.produccion || 0).filter(o => !isNaN(o)).reduce((a, b) => +a + +b, 0)) / (o.productoturnos[0] ? o.productoturnos[0].idsubproducto_subproducto?.velprod : 0),
            }
        })
        //let velNominal = listaTurnos.map(o => o.velNominal ? o.velNominal : 0).filter(o => !isNaN(o)).reduce((a, b) => +a + +b) / listaTurnos.length
        let velNominal = cantidadEsperadaProdTurns / velprodProdTurns
        let velReal = sumatoriaProduciendoOk.totalprod / velprodProdTurns
        /* let velReal = listaTurnos.map(o => o.velReal != null ? o.velReal : 0).filter(o => {
            return isFinite(o)
        }).reduce((a, b) => +a + +b, 0) / listaTurnos.length
        */
        let uso = Math.trunc((TPMin(capRMin, tpp.value) * 100) / capRMin)
        let disponibilidadP = Disponibilidad(TPMin(capRMin, tpp.value), TDMin(capRMin, tpm.value)) * 100
        let rendimientoP = ((TPMin(capRMin, tpp.value + tmp)) / capRMin) * 100

        let calidadP = sumatoriaProduciendoOk.totalprod == 0 ? 100 : ((sumatoriaProduciendoOk.value / capRMin) * 100)
        if (onlyOee) return {
            lastTurn : listaTurnos.slice(-1),
            acumulado,
            calidad: calidadP,
            rendimiento: rendimientoP,
            disponibilidad: disponibilidadP,
            oee: Math.trunc((Disponibilidad(TPMin(capRMin, tpp.value), TDMin(capRMin, tpm.value)) * ((TPMin(capRMin, tpp.value + tmp)) / capRMin) * (sumatoriaProduciendoOk.totalprod == 0 ? 1 : (sumatoriaProduciendoOk.value / capRMin))) * 100)
        }
        let duracion = paradasMicroD
        let totalEventos = listaTurnos.map(o => o.registrosSensor).flat().length
        let mtbf = tpp.list.length == 0 ? 0 : ((capRMin - tpp.value) / tpp.list.length)
        let mttr = tpp.list.length == 0 ? 0 : tpp.value / tpp.list.length
        let diffDias = moment.duration(moment(fechas.hasta).diff(moment(fechas.desde))).asDays()
        let caLiobj = {
            tiempoProdOk: sumatoriaProduciendoOk,
            capRMin
        }
        let oeeObj = {}
        /* oeeObj.unidadesTotales = listaTurnos.map(o =>
             o.registrosSensor.map(o => o.produccion).filter(o => !isNaN(o)).reduce((a, b) => +a + +b, 0)).reduce((a, b) => +a + +b, 0)
         */
        oeeObj.unidadesTotales = sumatoriaProduciendoOk.totalprod
        oeeObj.unidadesEsperadas = unidadesEsperadas
        oeeObj.mermas = mermas
        oeeObj.lastTurn = listaTurnos.slice(-1)
        oeeObj.acumulado = acumulado
        oeeObj.cali = caLiobj
        oeeObj.velNominal = Math.trunc(velNominal)
        oeeObj.velReal = velReal
        oeeObj.uso = uso
        oeeObj.disponibilidadP = disponibilidadP
        oeeObj.rendimientoP = rendimientoP
        oeeObj.calidadP = calidadP
        oeeObj.oeeP = Math.trunc((Disponibilidad(TPMin(capRMin, tpp.value), TDMin(capRMin, tpm.value)) * ((TPMin(capRMin, tpp.value + tmp)) / capRMin) * (sumatoriaProduciendoOk.totalprod == 0 ? 1 : (sumatoriaProduciendoOk.value / capRMin))) * 100)
        oeeObj.duracion = duracion
        oeeObj.totalEventos = totalEventos
        oeeObj.mttr = mttr
        oeeObj.mtbf = mtbf
        oeeObj.sensorSeries = listaTurnos.map(o => o.registrosSensor).flat()
        oeeObj.sensorSeries = oeeObj.sensorSeries.sort((a, b) => a.timestamp - b.timestamp)
        let ssobj = {}
        for (let ds of oeeObj.sensorSeries) {
            if (ssobj[ds.timestamp]) {
                ssobj[ds.timestamp].value = +ssobj[ds.timestamp].value + +ds.produccion
            } else {
                ssobj[ds.timestamp] = {
                    name: moment(ds.timestamp).format(diffDias >= 2 ? "MM/DD" : 'MM/DD HH:00'),
                    value: ds.produccion
                }
            }
        }
        oeeObj.sensorSeries = Object.keys(ssobj).map(o => {
            return {
                name: ssobj[o].name,
                value: ssobj[o].value
            }
        })
        let objss = {}
        for (let ss of oeeObj.sensorSeries) {
            if (objss[ss.name]) {
                objss[ss.name].value = +objss[ss.name].value + +ss.value
            } else {
                objss[ss.name] = {
                    name: ss.name,
                    value: ss.value
                }
            }
        }
        oeeObj.sensorSeries = Object.keys(objss).map(o => {
            return {name: o, value: objss[o].value}
        })


        /*
           let objss = {}
           for(let ss of oeeObj.sensorSeries){
               if(objss[ss.name]){
                   objss[ss.name].value = +objss[ss.name].value + +ss.value
               }else{
                   objss[ss.name] = {
                       name:ss.name,
                       value:ss.value
                   }
               }
           }*/
        /*oeeObj.sensorSeries = objss
*/

        if (noCharts) {
            let charts = await getchartLapso(fechas.desde, fechas.hasta, machines)
            oeeObj.oeeCharts = {
                name: "OEE", series: charts.map(o => {
                        return {
                            name: moment(o.hasta).format(diffDias >= 2 ? "MM/DD" : 'MM/DD HH:00'),
                            value: o.oeeP
                        }
                    }
                )
            }
            oeeObj.calidadCharts = {
                name: "Calidad", series: charts.map(o => {
                        return {
                            name: moment(o.hasta).format(diffDias >= 2 ? "MM/DD" : 'MM/DD HH:00'),
                            value: o.calidadP
                        }
                    }
                )
            }
            oeeObj.rendimientoCharts = {
                name: "Rendimiento", series: charts.map(o => {
                        return {
                            name: moment(o.hasta).format(diffDias >= 2 ? "MM/DD" : 'MM/DD HH:00'),
                            value: o.rendimientoP
                        }
                    }
                )
            }
            oeeObj.disponibilidadCharts = {
                name: "Disponibilidad", series: charts.map(o => {
                        return {
                            name: moment(o.hasta).format(diffDias >= 2 ? "MM/DD" : 'MM/DD HH:00'),
                            value: o.disponibilidadP
                        }
                    }
                )
            }
            oeeObj.mttrCharts = {
                name: "MTTR", series: charts.map(o => {
                        return {
                            name: moment(o.hasta).format(diffDias >= 2 ? "MM/DD" : 'MM/DD HH:00'),
                            value: o.mttr
                        }
                    }
                )
            }
            oeeObj.mtbfCharts = {
                name: "MTBF", series: charts.map(o => {
                        return {
                            name: moment(o.hasta).format(diffDias >= 2 ? "MM/DD" : 'MM/DD HH:00'),
                            value: o.mtbf
                        }
                    }
                )
            }


        }


        let calidadObj = {}
        calidadObj.prodTotal = oeeObj.unidadesTotales
        calidadObj.mermas = mermas
        calidadObj.prodAceptada = calidadObj.prodTotal - calidadObj.mermas
        let rendimientoObj = {}
        rendimientoObj.prodTotal = oeeObj.unidadesTotales
        rendimientoObj.prodEstimada = oeeObj.unidadesEsperadas
        rendimientoObj.prodReal = calidadObj.prodAceptada
        //rendimientoObj.table = borrarDuplicados(listaTurnos.map(o => o.productoturnos[0].idsubproducto_subproducto), 'nombre')
        rendimientoObj.table = listaTurnos.map(o => {

            /*   return {
                   ptotal: o.registrosSensor.map(oo => oo.produccion).filter(oo => !isNaN(oo)).reduce((a, b) => +a + +b, 0),
                   pesperada: (o.produccionesperada || 0),
                   ...o.productoturnos[0]?.idsubproducto_subproducto?.dataValues
               }*/
            return o.productoturnos.map(oo => {
                return {
                    ptotal: oo.detproduccions.map(dp => dp.cantidad).reduce((a, b) => +a + +b, 0),
                    pesperada: oo.cantidadesperada,
                    ...oo.idsubproducto_subproducto?.dataValues
                }
            }).flat()
        }).flat()
        let rendObjNoDuplicados = {}
        for (let renObj of rendimientoObj.table) {
            if (renObj.nombre) {
                if (rendObjNoDuplicados[renObj.nombre]) {
                    rendObjNoDuplicados[renObj.nombre].ptotal = +rendObjNoDuplicados[renObj.nombre].ptotal + +renObj.ptotal
                    rendObjNoDuplicados[renObj.nombre].pesperada = +rendObjNoDuplicados[renObj.nombre].pesperada + +renObj.pesperada
                } else {
                    rendObjNoDuplicados[renObj.nombre] = {
                        ...renObj
                    }
                }
            }

        }
        rendimientoObj.table = Object.keys(rendObjNoDuplicados).map(o => {
            //GENERADOR DE COLORES
            let color = "#" + Math.floor(Math.random() * 16777215).toString(16)

            return {
                name: o,
                value: rendObjNoDuplicados[o].ptotal,
                colorRecord: color,
                color,
                percentVsEstimada: rendObjNoDuplicados[o].pesperada == 0 ? 0 :
                    (((rendObjNoDuplicados[o].ptotal * 100) / rendObjNoDuplicados[o].pesperada) / 100) > 1 ? 1 :
                        (((rendObjNoDuplicados[o].ptotal * 100) / rendObjNoDuplicados[o].pesperada) / 100)
            }
        })
        rendimientoObj.color = {domain: rendimientoObj.table.map(o => o.color)}

        let disponibilidadObj = {}
        disponibilidadObj.cats = (await categoriadeparada.findAll()).map(o => {
            return {
                name: o.nombre,
                color: o.color,
                value: tpp.list.filter(oo => oo.tipo_parada.idcategoriaparada == o.id).length + tpm.list.filter(oo => oo.tipo_parada.idcategoriaparada == o.id).length
            }
        })
        disponibilidadObj.catsColors = {
            colorScheme: {
                domain: disponibilidadObj.cats.map(o => o.color)
            }
        }
        let todaslasp = [tpm.list, tpp.list].flat()

        let dispObjNorepetidosParadas = {}

        for (let unaP of todaslasp) {
            if (dispObjNorepetidosParadas[unaP.tipo_parada.nombre]) {
                dispObjNorepetidosParadas[unaP.tipo_parada.nombre].value += 1

            } else {
                dispObjNorepetidosParadas[unaP.tipo_parada.nombre] = {
                    name: unaP.tipo_parada.nombre,
                    value: 1,
                    color: unaP.tipo_parada.idcategoriaparada_categoriadeparada.color
                }
            }
        }


        disponibilidadObj.paradas = Object.keys(dispObjNorepetidosParadas).map(o => {
            return {
                name: o,
                value: dispObjNorepetidosParadas[o].value,
                color: dispObjNorepetidosParadas[o].color
            }
        }).sort((a, b) => b.value - a.value).slice(0, 10)

        disponibilidadObj.interrupciones = todaslasp.length
        disponibilidadObj.paradasInfo = disponibilidadObj.paradas.map(o => {
            return {
                name: o.name,
                percent: (o.value * 100) / todaslasp.length
            }
        }).sort((a, b) => +b.percent - +a.percent)
        disponibilidadObj.paradasColors = {colorScheme: {domain: disponibilidadObj.paradas.map(o => o.color)}}

        let result = {
            lastTurn:oeeObj.lastTurn,
            oee: oeeObj,
            calidad: calidadObj,
            rendimiento: rendimientoObj,
            disponibilidad: disponibilidadObj
        }
        return {...result}
    }
}

paradasMicroPorDeduccion = async (turnos, fechas) => {
    let capacidadesReales = []
    let tiempoInterrumpido = []
    let bajasLista = []
    let sinProducirLista = []
    let sensorRegistrosLista = []

    for (let t of turnos) {
        let sinProducir = 0
        let bajasDeVelocidad = 0
        let registrosSensor = await datasensor.findAll({
            where: {
                idmaquina: t.idmaquina.toString(),
                timestamp: {
                    [Op.gte]: moment(t.horainicio).toDate().getTime(),
                    [Op.lt]: moment(t.horafin).toDate().getTime()
                }
            }
        })
        if (fechas.desde !== undefined && fechas.hasta !== undefined) {
            registrosSensor = registrosSensor
                .filter(o =>
                    moment(o.timestamp).toDate().getTime() >= fechas.desde &&
                    moment(o.timestamp).toDate().getTime() < fechas.hasta
                )
        }
        t.registrosSensor = registrosSensor
        sensorRegistrosLista.push(registrosSensor)
        for (const [index, sd] of registrosSensor.entries()) {
            if (index > 0 && sd.timestamp != registrosSensor[index - 1].timestamp) {

                if (sd.produccion == 0) {
                    sinProducir += 1

                } else if (sd.produccion < ((t.productoturnos[0] ? t.productoturnos[0].idsubproducto_subproducto?.velprod : 0) / 60)) {
                    bajasDeVelocidad += 1
                }
            }
        }
        bajasLista.push(bajasDeVelocidad)
        sinProducirLista.push(sinProducir)
        tiempoInterrumpido.push(bajasDeVelocidad + sinProducir)
        //let capacidadRealMin = moment.duration((moment(t.horafin == null ? Date.now() : t.horafin).diff(moment(t.horainicio)))).asMinutes()
        //capacidadesReales.push(capacidadRealMin)
    }
    //return {bajasLista, sinProducirLista, tiempoInterrumpido, sensorRegistrosLista}
    return tiempoInterrumpido.reduce((a, b) => +a + +b, 0)
}

function borrarDuplicados(listaObj, k) {
    const uniqueValuesSp = new Set();
    return listaObj.filter(o => {
        if (o != null) {
            const isPresentInSet = uniqueValuesSp.has(o[k]);
            uniqueValuesSp.add(o[k]);
            return !isPresentInSet;
        } else {
            return false
        }

    })
}