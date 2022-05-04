const DataTypes = require("sequelize").DataTypes;
const sequelize = require("../../database/index")
const _entity = require("../../database/models/planta");
const _turno = require("../../database/models/turno");
const _maquina = require("../../database/models/maquina");
const _merma = require("../../database/models/merma");
const _proceso = require("../../database/models/proceso");
const _planta = require("../../database/models/planta");
const _categoriadeparada = require("../../database/models/categoriadeparada");
const _parada = require("../../database/models/parada");
const _paradamaquina = require("../../database/models/paradamaquina");
const _indicadoresevents = require("../../database/models/indicadoresevents");
const _interrupcion = require("../../database/models/interrupcion");
const _mantencion = require("../../database/models/mantencion");
const _ordendetrabajo = require("../../database/models/ordendetrabajo");
const _turnomerma = require("../../database/models/turnomerma");
const _horarios = require("../../database/models/horarios");
const _subproductosmaquina = require("../../database/models/subproductosmaquina");
const throwError = require("../../utils/throwError")
const maquina = _maquina(sequelize.sql, DataTypes);
const categoriaparada = _categoriadeparada(sequelize.sql, DataTypes);
const parada = _parada(sequelize.sql, DataTypes);
const planta = _planta(sequelize.sql, DataTypes);
const interrupcion = _interrupcion(sequelize.sql, DataTypes);
const indicadoresevents = _indicadoresevents(sequelize.sql, DataTypes);
const ordendetrabajo = _ordendetrabajo(sequelize.sql, DataTypes);
const turnomerma = _turnomerma(sequelize.sql, DataTypes);
const mantencion = _mantencion(sequelize.sql, DataTypes);
const horarios = _horarios(sequelize.sql, DataTypes);
const paradamaquina = _paradamaquina(sequelize.sql, DataTypes);
const proceso = _proceso(sequelize.sql, DataTypes);
const entity = _entity(sequelize.sql, DataTypes);
const turno = _turno(sequelize.sql, DataTypes);
const merma = _merma(sequelize.sql, DataTypes);
var randomColor = require('randomcolor'); // import the script

const machinePersistencia = require("../machine/persistence")
const turnoPersistencia = require("../turn/persistence")
const sensorPersistencia = require("../sensores/persistence")
const interruptionPersistencia = require("../interruption/persistence")
const subproductosmaquinaPersistencia = require("../subproductsmaquina/persistence")
const moment = require("moment");
moment.locale("es")
const h = require("../../utils/hour");
const entityPersistence = require("./persistence");
const event = require("./events")
const {Op} = require("sequelize");
module.exports = {
    getAllIndicadores: async () => {
        return indicadoresevents.findAll()
    },
    oeeByTurn: async idturno => {
        let oeeRespuesta = {}

        let prstdTurn = await turno.findOne({

            where: {id: idturno},
            include: [{model: maquina, as: "idmaquina_maquina"},
                {model: horarios, as: "idhorario_horario"}]
        })


        /** RENDIMIENTO

         velocidad del turno / velocidad guardada de la maquina
         */
        if (prstdTurn) {


            oeeRespuesta.rendimiento = 0
            let spdemaquina = await subproductosmaquinaPersistencia.getAll(prstdTurn.idmaquina_maquina.id)
            if (spdemaquina.length >= 1) {
                let spAsignado = spdemaquina.find(o => o.idsubproducto == prstdTurn.idmaquina_maquina.subproductoasignado)
                if (spAsignado) {
                    oeeRespuesta.rendimiento = (prstdTurn.velocidad / spAsignado.idsubproducto_subproducto.velprod).toFixed(2)
                }
            }


            // oeeRespuesta.rendimiento = (prstdTurn.velocidad / prstdTurn.idmaquina_maquina.velpromprod).toFixed(2)

            let turnoCorriendo = prstdTurn.horafin == null
            let diferenciaEnHoras = 0
            if (turnoCorriendo) {
                let inicioTurno = moment(prstdTurn.horainicio)
                let ahora = moment(Date.now())
                let horasDeProduccionReales = moment.duration(ahora.diff(inicioTurno))
                diferenciaEnHoras = horasDeProduccionReales.asHours()

            } else {
                diferenciaEnHoras = prstdTurn.idhorario_horario.horasdelturno || 0
            }

            let interruptionsOfMach = await interruptionPersistencia.getAllByMachineAndTurn(prstdTurn.id)
            let interruptionsOfTurn = interruptionsOfMach.filter(int => int.tipo_parada != null && int.comentario != 'baja de velocidad reportada por el sensor')

            oeeRespuesta.disponibilidad = 1
            if (interruptionsOfTurn.length >= 1) {
                let totalminutosDeInterrupciones = interruptionsOfTurn.length == 1 ? interruptionsOfTurn[0].duracion : interruptionsOfTurn.reduce((a, b) => a.duracion || 0 + b.duracion || 0) //viene en segundosss
                totalminutosDeInterrupciones = totalminutosDeInterrupciones / 60
                totalminutosDeInterrupciones = parseInt(totalminutosDeInterrupciones)
                let difDeHorasEnMinutos = diferenciaEnHoras * 60
                let TiempoRealMenosTiempoInterrupciones = difDeHorasEnMinutos - totalminutosDeInterrupciones
                let TiempoRealMenosTiempoInterrupcionesEnHoras = TiempoRealMenosTiempoInterrupciones / 60
                oeeRespuesta.disponibilidad = (TiempoRealMenosTiempoInterrupcionesEnHoras / diferenciaEnHoras).toFixed(2)
                if (totalminutosDeInterrupciones > difDeHorasEnMinutos) {
                    oeeRespuesta.disponibilidad = 0
                }
            }


            let produccionTurno = await turnoPersistencia.getAllProductionByTurn(prstdTurn.id)
            let totalProdN = produccionTurno.total
            oeeRespuesta.calidad = totalProdN === 0 ? 0 : ((totalProdN - prstdTurn.mermas || 0) / totalProdN).toFixed(2)

            oeeRespuesta.oee = +oeeRespuesta.disponibilidad * +oeeRespuesta.rendimiento * +oeeRespuesta.calidad

            if (prstdTurn.idmaquina_maquina.conSensor) {
                //desconectada?
                let datosSensor = await sensorPersistencia.getProductionByTurn(prstdTurn.id)
                if (datosSensor.length == 0) {
                    oeeRespuesta.datos = false
                } else if (datosSensor.length >= 1) {
                    oeeRespuesta.datos = true
                }
            } else {
                //sin datos?
                let produccionTotal = await turnoPersistencia.getAllProductionByTurn(prstdTurn.id)
                if (produccionTotal.nRegistros == 0) {
                    oeeRespuesta.datos = false
                } else if (produccionTotal.nRegistros >= 1) {
                    oeeRespuesta.datos = true

                }
            }

            return oeeRespuesta
        } else {
            return {datos: false}

        }


        /** DISPONIBILIDAD

         horas desde hora inicio del turno hasta hora de ahora / (horas desde el inicio del turno hasta ahora - interrupciones desde inicio de turno hasta ahora)
         */


        /** CALIDAD

         piezas totales producidas hasta ahora / (piezas totales producidas hasta ahora - mermas)

         /** OEE
         V*P*R


         */
    },
    oeeByMaquina: async idmaquina => {

        let promedios = {}
        let estado = "operativa"
        let turnosDeMaquina = await turno.findAll({
            order: [['id', 'ASC']],
            where: {idmaquina}
        })
        let maquinaDatos = await maquina.findOne({where: {id: idmaquina}})
        if (maquinaDatos.conSensor) {
            //revisar si es amarilla (perdida de velocidad)

        }
        if (maquinaDatos) {

            let inDet = await machinePersistencia.getInDetention(maquinaDatos.id)
            if (inDet) {
                estado = "detenida"
            } else {
                let inMant = await machinePersistencia.getInMaintenance(maquinaDatos.id)
                if(inMant?.length > 0) {
                   if(!inMant[0]?.laSensor){
                       estado = "mantenimiento"

                   }else{
                       estado = "listaPara"

                   }

               } else {
                    let inLowVelocity = await machinePersistencia.getInLowVelocity(maquinaDatos.id)
                    if (inLowVelocity) {
                        estado = "bajavelocidad"
                    }
                }
            }

        }
        let listaOeeTurnos = []
        if (turnosDeMaquina.length == 0) {
            return {
                datos: false, maquina: maquinaDatos, estado
            }
        }
        let fchs = {}

        fchs.desde = moment(turnosDeMaquina[turnosDeMaquina.length - 1].horainicio).toDate().getTime()
        fchs.hasta = moment(turnosDeMaquina[turnosDeMaquina.length - 1].horafin == null ? Date.now() : moment(turnosDeMaquina[turnosDeMaquina.length - 1].horafin).toDate().getTime()).toDate().getTime()

        let datosOee = await event.maqOee([idmaquina], {...fchs}, true, true)
        /* for (let tur of turnosDeMaquina) {
             let oeeDataTurno = await module.exports.oeeByTurn(tur.id)
             if (oeeDataTurno) {
                 listaOeeTurnos.push(oeeDataTurno)
             }
         }

         let promedioRendimiento = 0
         let promedioCalidad = 0
         let promedioDisponibilidad = 0
         let promedioOEE = 0
         for (let i = 0; i < listaOeeTurnos.length; i++) {
             promedioRendimiento += +listaOeeTurnos[i].rendimiento
             promedioCalidad += +listaOeeTurnos[i].calidad
             promedioDisponibilidad += +listaOeeTurnos[i].disponibilidad || 0
             promedioOEE += +listaOeeTurnos[i].oee || 0
         }*/
        promedios.maquina = maquinaDatos
        /* let acumulado = await interruptionPersistencia.getAcumuladoPorTurno(turnosDeMaquina[turnosDeMaquina.length - 1].id)
         acumulado = (acumulado / 60).toFixed(0)
         promedios.lastTurn = {
             ...turnosDeMaquina[turnosDeMaquina.length - 1].dataValues,
             acumulado,
             oee: listaOeeTurnos[turnosDeMaquina.length - 1]
         }*/
        /* promedios.rendimiento = promedioRendimiento / listaOeeTurnos.length
         promedios.calidad = promedioCalidad / listaOeeTurnos.length
         promedios.disponibilidad = promedioDisponibilidad / listaOeeTurnos.length
         promedios.oee = (promedioOEE / listaOeeTurnos.length).toFixed(2)
         */
        promedios.rendimiento = datosOee.rendimiento
        promedios.calidad = datosOee.calidad
        promedios.acumulado = datosOee.acumulado
        promedios.disponibilidad = datosOee.disponibilidad
        promedios.oee = datosOee.oee
        promedios.datos = true
        promedios.estado = estado
        promedios.lastTurn = datosOee
        return promedios

    },
    oeeByProceso: async idproceso => {

        let procesoRecord = await proceso.findOne({where: {id: idproceso}})
        if (procesoRecord) {
            let maquinasRecord = await maquina.findAll({where: {idproceso: procesoRecord.id}})
            let oeeMaquinasList = []
            let sumOee = 0
            let respOee = 0
            let promDis = 0
            let promRen = 0
            let promCal = 0

            let allOeeRecordsMaquinas = []
            let turnosDeMaquina = await turno.findAll({
                order: [['id', 'ASC']],
                horafin: null
            })

            let fchs = {}
            if (turnosDeMaquina.length > 0) {
                fchs.desde = moment(turnosDeMaquina[turnosDeMaquina.length - 1].horainicio).toDate().getTime()
                fchs.hasta = moment(turnosDeMaquina[turnosDeMaquina.length - 1].horafin == null ? Date.now() : moment(turnosDeMaquina[turnosDeMaquina.length - 1].horafin).toDate().getTime()).toDate().getTime()
            } else {
                fchs.desde = Date.now()
                fchs.hasta = Date.now()
            }

            let datosOee = await event.maqOee(maquinasRecord.map(o => o.id), {...fchs}, true, true)
            if (maquinasRecord.length >= 1) {
                for (let m of maquinasRecord) {
                    let oeeMaquina = await module.exports.oeeByMaquina(m.id)
                    allOeeRecordsMaquinas.push(oeeMaquina)
                    if (oeeMaquina.datos) {
                        oeeMaquinasList.push(oeeMaquina)
                    }
                }


                if (oeeMaquinasList.length >= 1) {
                    sumOee = oeeMaquinasList.map(o => o.oee).reduce((a, b) => +a + b)
                    respOee = sumOee / oeeMaquinasList.length
                    //if(isNaN(respOee)){respOee = 0}
                    promDis = (oeeMaquinasList.map(o => o.disponibilidad).reduce((a, b) => +a + b)) / oeeMaquinasList.length
                    promRen = (oeeMaquinasList.map(o => o.rendimiento).reduce((a, b) => +a + b)) / oeeMaquinasList.length
                    promCal = (oeeMaquinasList.map(o => o.calidad).reduce((a, b) => +a + b)) / oeeMaquinasList.length

                }

            }


            if (oeeMaquinasList.length == 0) {
                return {datos: false, proceso: procesoRecord, maquinas: allOeeRecordsMaquinas}
            } else {

                return {
                    proceso: procesoRecord,
                    datos: true,
                    oee: respOee,
                    rendimiento: promRen,
                    disponibilidad: promDis,
                    calidad: promCal,
                    maquinas: allOeeRecordsMaquinas
                }
            }
        }
    },

    oeeByPlant: async idplanta => {
        let plantaRecord = await entity.findOne({where: {id: idplanta}})
        if (plantaRecord) {
            let procesosRecord = await proceso.findAll({where: {idplanta}})
            let oeeProcessList = []
            let allOeeRecordsProcess = []

            for (let m of procesosRecord) {
                let oeePro = await module.exports.oeeByProceso(m.id)
                allOeeRecordsProcess.push(oeePro)
                if (oeePro.datos) {
                    oeeProcessList.push(oeePro)
                }
            }

            let listOee = oeeProcessList.map(o => o.oee)
            let sumOee = 0
            let promDis = 0
            let promRen = 0
            let promCal = 0
            for (let oe of listOee) {
                sumOee += +oe || 0
            }
            let respOee = 0
            if (listOee.length != 0) {
                respOee = sumOee / listOee.length
                promDis = (oeeProcessList.map(o => o.disponibilidad).reduce((a, b) => +a + b)) / oeeProcessList.length
                promRen = (oeeProcessList.map(o => o.rendimiento).reduce((a, b) => +a + b)) / oeeProcessList.length
                promCal = (oeeProcessList.map(o => o.calidad).reduce((a, b) => +a + b)) / oeeProcessList.length

            }

            if (oeeProcessList.length == 0) {
                return {datos: false, planta: plantaRecord, procesos: allOeeRecordsProcess}
            } else {

                return {
                    planta: plantaRecord,
                    datos: true,
                    oee: respOee,
                    rendimiento: promRen,
                    disponibilidad: promDis,
                    calidad: promCal,
                    procesos: allOeeRecordsProcess
                }
            }
        }
    },
    allMantPendings: async (query) => {
        let queryFecha = {}
        if (query.horainicio) {
            let fechasQDesde = parseInt(query.horainicio.split(",")[0])
            let fechasQHasta = parseInt(query.horainicio.split(",")[1])
            query.horainicio = {
                [Op.gte]: fechasQDesde,
                [Op.lt]: fechasQHasta,
            }
            queryFecha.fechaprogramada = query.horainicio
        }
        let atraasadas = []
        let normals = []
        let allMants = await mantencion.findAll({
            where: queryFecha,
            include: [{
                model: interrupcion, as: 'idinterrupcion_interrupcion'
            }]
        })
        for (let aMant of allMants) {
            aMant.dataValues.maquina = (await paradamaquina.findOne({
                where: {idparada: aMant.idinterrupcion_interrupcion.tipo},
                include: [{
                    model: maquina,
                    as: "idmaquina_maquina",
                    include: [{
                        model: proceso,
                        as: "idproceso_proceso",
                        include: [{model: planta, as: "idplanta_plantum"}]
                    }]
                }]
            })).idmaquina_maquina
            aMant.dataValues.parada = (await parada.findOne({
                where: {id: aMant.idinterrupcion_interrupcion.tipo},
                include: [{model: categoriaparada, as: "idcategoriaparada_categoriadeparada"}],
            }))
        }
        allMants = allMants.filter(o =>
            (query.idmaquina ? o.dataValues.maquina.id == query.idmaquina : true) &&
            (query.idproceso ? o.dataValues.maquina.idproceso_proceso.id == query.idproceso : true) &&
            (query.idplanta ? o.dataValues.maquina.idproceso_proceso.idplanta_plantum.id == query.idplanta : true)
        )

        for (let mant of allMants) {
            if (Date.now() > mant.fechaprogramada) {
                mant.dataValues.atraso = moment(mant.fechaprogramada).fromNow()
                atraasadas.push(mant)
            } else {
                normals.push(mant)
            }
        }
        let maquinass = Array.from(new Set(allMants.map(o => JSON.stringify(o.dataValues.maquina))))
        maquinass = maquinass.map(o => JSON.parse(o))
        let donaChart = []

        for (let maq of maquinass) {
            maq.mants = allMants.filter(o => o.dataValues.maquina.id == maq.id).length
            donaChart.push({
                name: maq.nombre,
                colorRecord: randomColor.randomColor(),
                color: randomColor.randomColor(),
                percentVsEstimada: 1,
                value: maq.mants
            })
        }

        return {maquinass, normals, atraasadas, totalMants: allMants.length, donaChart}
    },
    allOtPendings: async (query) => {
        if (query.horainicio) {
            let fechasQDesde = parseInt(query.horainicio.split(",")[0])
            let fechasQHasta = parseInt(query.horainicio.split(",")[1])
            query.horainicio = {
                [Op.gte]: fechasQDesde,
                [Op.lt]: fechasQHasta,
            }
        }
        let allOt = await ordendetrabajo.findAll({
            where: query,
            include: [{model: maquina, as: "idmaquina_maquina"}]

            /*  attributes:['horainicio',
                  'horainicioaccion',
                  'horafinpredecida',
                  'horafincorte',
                  'horafinconfirmada']*/
        })
        let atrasadas = []
        let normals = []
        let progresosMaquinas = []
        for (let ot of allOt) {
            if (
                (Date.now() > moment(ot.horainicio).toDate().getTime() && ot.horainicioaccion == null) ||
                (Date.now() > moment(ot.horafinpredecida) && ot.horafinconfirmada == null)
            ) {

                atrasadas.push(ot)
            } else {
                normals.push(ot)
            }
        }
        for (let at of atrasadas) {
            if (at.horainicioaccion == null) {
                at.dataValues.atraso = moment(at.horainicio).fromNow()
            } else {
                at.dataValues.atraso = moment(at.horafinpredecida).fromNow()
            }
        }

        let maquinass = Array.from(new Set(allOt.map(o => JSON.stringify(o.idmaquina_maquina))))
        maquinass = maquinass.map(o => JSON.parse(o))
        for (let maq of maquinass) {
            maq.actual = allOt.filter(o => o.idmaquina == maq.id).map(o => o.cantidadactual).reduce((a, b) => +a + +b, 0)
            maq.total = allOt.filter(o => o.idmaquina == maq.id).map(o => o.cantidadesperada).reduce((a, b) => +a + +b, 0)
        }
        let donaChart = []
        donaChart.push({
            name: "OT",
            colorRecord: "#367BF5",
            color: "#367BF5",
            percentVsEstimada: 1,
            value: normals.length
        })
        donaChart.push({
            name: "OT pendientes",
            colorRecord: "#EA3D2F",
            color: "#EA3D2F",
            percentVsEstimada: 1,
            value: atrasadas.length
        })

        return {donaChart, maquinass, atrasadas, normals}
    },
    allOtMerma: async (query) => {
        if (query.horainicio) {
            let fechasQDesde = parseInt(query.horainicio.split(",")[0])
            let fechasQHasta = parseInt(query.horainicio.split(",")[1])
            query.horainicio = {
                [Op.gte]: fechasQDesde,
                [Op.lt]: fechasQHasta,
            }
        }
        let dataResp = {}
        let allOt = await ordendetrabajo.findAll({
            where: query,
            include: [{
                model: maquina,
                as: 'idmaquina_maquina'
            }, {model: turnomerma, as: 'turnomermas', include: [{model: merma, as: 'idmerma_merma'}]}]
        })
        let allMaquinasDeOt = Array.from(new Set(allOt.map(o => o.idmaquina)))
        let allOtByMaquina = []
        for (let maqOt of allMaquinasDeOt) {
            let dataMaqOt = {}
            //dataMaqOt.color = "#" + Math.floor(Math.random() * 16777215).toString(16)
            dataMaqOt.color = randomColor.randomColor({luminosity: 'dark', hue: 'white'})
            dataMaqOt.idmaquina = maqOt
            dataMaqOt.maquina = allOt.find(o => o.idmaquina == maqOt).idmaquina_maquina
            dataMaqOt.ot = allOt.filter(o => o.idmaquina == maqOt)
            dataMaqOt.totalMermas = allOt.filter(o => o.idmaquina == maqOt).map(o => o.turnomermas.map(t => t.cantidad)).flat().reduce((a, b) => +a + +b, 0)

            allOtByMaquina.push(dataMaqOt)
        }
        let allOtByType = []
        let allTiposDeMermasOt = Array.from(new Set(allOt.map(o => o.turnomermas.map(t => t.idmerma)).flat(2)))
        for (let mermaOt of allTiposDeMermasOt) {
            let dataMaqOt = {}
            dataMaqOt.color = randomColor.randomColor({luminosity: 'bright'})
            dataMaqOt.idmerma = mermaOt
            dataMaqOt.merma = await merma.findOne({where: {id: mermaOt}})
            dataMaqOt.ot = allOt.filter(o => o.turnomermas.map(t => t.idmerma).includes(mermaOt))
            dataMaqOt.totalMermas = allOt.map(o => o.turnomermas).flat().filter(o => o.idmerma == mermaOt).map(t => t.cantidad).reduce((a, b) => +a + +b, 0)
            //dataMaqOt.totalMermas = allOt.filter(o => o.turnomermas.map(t => t.idmerma).includes(mermaOt)).map(o => o.turnomermas.map(t => t.cantidad)).flat().reduce((a, b) => +a + +b, 0)
            allOtByType.push(dataMaqOt)
        }
        dataResp.mermasPorMaquina = allOtByMaquina
        dataResp.mermasPorTipo = allOtByType
        return dataResp
    },
    allParadas: async (query) => {

        let fechaQuery = {}
        if (query.horainicio) {
            fechaQuery = {
                horainicio: {
                    [Op.gte]: moment(query.horainicio).startOf("day").toDate().getTime(),
                    [Op.lt]: moment(query.horainicio).add(1, "d").startOf("day").toDate().getTime()
                }
            }
        }
        let dataResp = []
        let allInterruptions = await interrupcion.findAll({
            where: fechaQuery,
            include: [{
                model: parada,
                as: "tipo_parada",
                include: [{
                    model: categoriaparada,
                    as: "idcategoriaparada_categoriadeparada"
                }]
            }]
        })

        for (let aInt of allInterruptions) {
            aInt.dataValues.maquina = (await paradamaquina.findOne({
                where: {
                    idparada: aInt.tipo
                }, include: [{model: maquina, "as": "idmaquina_maquina"}]
            })).idmaquina_maquina
        }
        if (query.idmaquina) {
            allInterruptions = allInterruptions.filter(o => o.dataValues.maquina.id == query.idmaquina)
        }
        let objInts = {}
        for (let int of allInterruptions) {
            if (objInts[int.tipo_parada.nombre]) {
                objInts[int.tipo_parada.nombre] += 1
            } else {
                objInts[int.tipo_parada.nombre] = 1
            }
        }
        for (let paradaKey of Object.keys(objInts)) {
            dataResp.push({
                name: paradaKey,
                obj: objInts,
                tipo: allInterruptions.filter(o => o.tipo_parada.nombre == paradaKey)[0].tipo_parada.idcategoriaparada_categoriadeparada?.clase || "MPL",
                series: allInterruptions.filter(o => o.tipo_parada.nombre == paradaKey).map(o => {
                    return {
                        name: moment(o.horainicio).format("HH:mm"),
                        value: o.duracion / 60
                    }
                })

            })
        }
        let pareto = {}
        for (let aInt of allInterruptions) {
            pareto[aInt.tipo_parada.nombre] = ""
        }
        for (let aIntK of Object.keys(pareto)) {
            pareto[aIntK] = allInterruptions
                .filter(o => o.tipo_parada.nombre == aIntK)
                .map(o => o.duracion).reduce((a, b) => +a + +b, 0)
        }

        let fallaTime = allInterruptions
            .filter(o => o.tipo_parada.idcategoriaparada_categoriadeparada?.nombre.includes("Falla"))
            .map(o => o.duracion).reduce((a, b) => +a + +b, 0) / 60

        let machinss = Array.from(new Set(allInterruptions
            .map(o => JSON.stringify(o.dataValues.maquina))))
        machinss = machinss.map(o => JSON.parse(o))
        for (let mm of machinss) {
            mm.fallaTime = allInterruptions
                .filter(o => o.tipo_parada.idcategoriaparada_categoriadeparada?.nombre.includes("Falla"))
                .filter(o => o.dataValues.maquina.id == mm.id)
                .map(o => o.duracion).reduce((a, b) => +a + +b, 0) / 60
        }

        return {dataResp, pareto, machinss}
    },
    allMantenimientos: async (query) => {
        let fechaQuery = {}
        let indicadoresMant = []
        if (query.horainicio) {
            fechaQuery = {
                fechaprogramada: {
                    [Op.gte]: moment(query.horainicio).startOf("day").toDate().getTime(),
                    [Op.lt]: moment(query.horainicio).add(1, "d").startOf("day").toDate().getTime()
                }
            }
        }
        let dataResp = []
        let allMants = await mantencion.findAll({
            where: fechaQuery,
            include: [{
                model: interrupcion, as: 'idinterrupcion_interrupcion'
            }]
        })
        for (let aMant of allMants) {
            aMant.dataValues.maquina = (await paradamaquina.findOne({
                where: {idparada: aMant.idinterrupcion_interrupcion.tipo},
                include: [{
                    model: maquina,
                    as: "idmaquina_maquina",
                    include: [{
                        model: proceso,
                        as: "idproceso_proceso",
                        include: [{model: planta, as: "idplanta_plantum"}]
                    }]
                }]
            })).idmaquina_maquina
            aMant.dataValues.parada = (await parada.findOne({
                where: {id: aMant.idinterrupcion_interrupcion.tipo},
                include: [{model: categoriaparada, as: "idcategoriaparada_categoriadeparada"}],
            }))
        }
        allMants = allMants.filter(o =>
            (query.idmaquina ? o.dataValues.maquina.id == query.idmaquina : true)
        )
        let allInterruptions = []
        for (let mm of allMants) {
            let intObj = await interrupcion.findOne({
                where: {id: mm.idinterrupcion},
                include: [{
                    model: parada,
                    as: "tipo_parada",
                    include: [{
                        model: categoriaparada,
                        as: "idcategoriaparada_categoriadeparada"
                    }]
                }]
            })
            allInterruptions.push(intObj)
        }
        let objInts = {}
        for (let int of allInterruptions) {
            if (objInts[int.tipo_parada.nombre]) {
                objInts[int.tipo_parada.nombre] += 1
            } else {
                objInts[int.tipo_parada.nombre] = 1
            }
        }
        for (let paradaKey of Object.keys(objInts)) {
            dataResp.push({
                name: paradaKey,
                tipo: allInterruptions.filter(o => o.tipo_parada.nombre == paradaKey)[0].tipo_parada.idcategoriaparada_categoriadeparada?.clase || null,
                series: allInterruptions.filter(o => o.tipo_parada.nombre == paradaKey).map(o => {
                    return {
                        name: moment(o.horainicio).format("HH:mm"),
                        value: o.duracion / 60
                    }
                })
            })
        }
        let turnosProd = await turno.findAll({where: {horainicio: fechaQuery.fechaprogramada}})

        let machins = await maquina.findAll()
        for (let mm of machins) {
            let mObj = {}
            mObj.tiempoTotal = turnosProd.filter(o => o.idmaquina == mm.id).map(o => o.horastotales).reduce((a, b) => +a + +b, 0)*60
            mObj.maquina = mm
            mObj.tiempoMant = allMants
                .filter(o => o.dataValues.maquina.id == mm.id)
                .map(o => o.idinterrupcion_interrupcion.duracion)
                .reduce((a, b) => +a + +b, 0) / 60
            mObj.tiempoMantPorcentaje = ((mObj.tiempoMant * 100) / mObj.tiempoTotal)
            indicadoresMant.push(mObj)
        }

        return {dataResp, indicadoresMant}
    }


}

