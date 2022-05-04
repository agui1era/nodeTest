const DataTypes = require("sequelize").DataTypes;
const sequelize = require("../../database/index")
const _entity = require("../../database/models/producto");
const _subProducto = require("../../database/models/subproducto");
const _turno = require("../../database/models/turno");
const _maquina = require("../../database/models/maquina");


const entity = _entity(sequelize.sql, DataTypes);
const maquina = _maquina(sequelize.sql, DataTypes);
const turno = _turno(sequelize.sql, DataTypes);
const subProducto = _subProducto(sequelize.sql, DataTypes);
const turnoPersistencia = require("../turn/persistence")
const interrupcionPersistencia = require("../interruption/persistence")
const sensorPersistencia = require("../sensores/persistence")
const moment = require("moment");
module.exports = {
    getByTurn: async idTurn => {
        let sensor = false
        let turnoRecord = await turno.findOne({where: {id: idTurn}})
        let turnProduction = await turnoPersistencia.getAllProductionByTurn(idTurn)
        let idmaquina = turnoRecord.idmaquina
        let maquinaRecord = await maquina.findOne({where: {id: idmaquina}})
        let interruptionsRecord = await interrupcionPersistencia.getAllByMachineAndTurn(idTurn)
        interruptionsRecord = interruptionsRecord.filter(int => int.tipo_parada != null)
        let allowedHours = await turnoPersistencia.getAllowedHoursByTurn(idTurn)
        let intPorHora = {}
        let intPasadas = {}
        for (let h of allowedHours.dataValues.horasPermitidas) {
            intPorHora[h] = {
                ints: interruptionsRecord.filter(o => moment(o.horainicio).format("HH") == h.split(":")[0])
                    .map(o => {
                        let osinM = {
                            "id": o.id,
                            "horainicio": o.horainicio,
                            "duracion": o.duracion,
                            "tipo": o.tipo,
                            "idturno": o.idturno,
                            "necesitaconfirmacion": o.necesitaconfirmacion,
                            "comentario": o.comentario,
                            "mantencions": o.mantencions,
                            "tipo_parada": {
                                "id": o.tipo_parada.id,
                                "nombre": o.tipo_parada.nombre,
                                "idmaqrel": o.tipo_parada.idmaqrel,
                                "inventarioreq": o.tipo_parada.inventarioreq,
                                "idcategoriaparada": o.tipo_parada.idcategoriaparada,
                                idcategoriaparada_categoriadeparada: o.tipo_parada.idcategoriaparada_categoriadeparada
                            }
                        }
                        let horasPasadas = 0
                        if ((+moment(o.horainicio).format("mm") + (o.duracion / 60)) >= 60) {
                            horasPasadas = Math.trunc((+moment(o.horainicio).format("mm") + (o.duracion / 60)) / 60)
                            for (let i = 1; i <= horasPasadas; i++) {
                                let data = {
                                    m: 0,
                                    type: o.tipo_parada.nombre == 'Baja de velocidad' ? 'warning' : "error",
                                    f: "60",
                                    //lbl: moment(this.isActiveTurnObj.idturno_turno.horainicio).add(indi + 1 + i, "h").format("HH:00"),
                                    info: osinM
                                }

                                if (i == (horasPasadas)
                                ) {
                                    data.f = (((+moment(o.horainicio).format("mm") + +(o.duracion / 60).toFixed(0))) - 60 * horasPasadas).toString()
                                }
                                if(moment().hour(h.split(":")[0]).add(i, "h").format("HH") ==
                                    allowedHours.dataValues.horasPermitidas[allowedHours.dataValues.horasPermitidas.length - 1]
                                        .split(":")[0]){
                                   /* data.f = allowedHours.dataValues.horasPermitidas[allowedHours.dataValues.horasPermitidas.length - 1]
                                        .split(":")[1]
*/                                    data.f = (((+moment(o.horainicio).format("mm") + +(o.duracion / 60).toFixed(0))) - 60 * horasPasadas).toString()

                                }

                                if (intPasadas[
                                    moment().hour(h.split(":")[0]).add(i, "h").format("HH") ==
                                    allowedHours.dataValues.horasPermitidas[allowedHours.dataValues.horasPermitidas.length - 1]
                                        .split(":")[0] ? moment().hour(h.split(":")[0]).add(i, "h").format("HH:") +
                                        allowedHours.dataValues.horasPermitidas[allowedHours.dataValues.horasPermitidas.length - 1]
                                            .split(":")[1] : moment().hour(h.split(":")[0]).add(i, "h").format("HH:00")
                                    ] == undefined) {
                                    intPasadas[
                                        moment().hour(h.split(":")[0]).add(i, "h").format("HH") ==
                                        allowedHours.dataValues.horasPermitidas[allowedHours.dataValues.horasPermitidas.length - 1]
                                            .split(":")[0] ? moment().hour(h.split(":")[0]).add(i, "h").format("HH:") +
                                            allowedHours.dataValues.horasPermitidas[allowedHours.dataValues.horasPermitidas.length - 1]
                                                .split(":")[1] : moment().hour(h.split(":")[0]).add(i, "h").format("HH:00")
                                        ] = []
                                }

                                intPasadas[
                                    moment().hour(h.split(":")[0]).add(i, "h").format("HH") ==
                                    allowedHours.dataValues.horasPermitidas[allowedHours.dataValues.horasPermitidas.length - 1]
                                        .split(":")[0] ? moment().hour(h.split(":")[0]).add(i, "h").format("HH:") +
                                        allowedHours.dataValues.horasPermitidas[allowedHours.dataValues.horasPermitidas.length - 1]
                                            .split(":")[1] : moment().hour(h.split(":")[0]).add(i, "h").format("HH:00")
                                    ].push(data)
                            }


                        }
                        let data = {
                            m: moment(o.horainicio).format("mm"),
                            type: o.tipo_parada.nombre == 'Baja de velocidad' ? 'warning' : "error",
                            f: (+moment(o.horainicio).format("mm") + +(o.duracion / 60).toFixed(0)) >= 60 ? "60" : +moment(o.horainicio).format("mm") + +(o.duracion / 60).toFixed(0),
                            //lbl: moment(this.isActiveTurnObj.idturno_turno.horainicio).add(indi + 1 + i, "h").format("HH:00"),
                            info: osinM
                        }

                        /*   console.log(`${data.m}
                           ${data.f}
                           ${o.duracion/60}
                           ${+moment(o.horainicio).format("mm") + +(o.duracion / 60).toFixed(0)}
                           `);*/
                        //    console.log(+moment(o.horainicio).add(o.duracion, "seconds").format("mm"));
                        //     console.log(+moment(o.horainicio).format("mm") + (o.duracion / 60).toFixed(0));
                        //     console.log(+moment(o.horainicio).format("mm") + (o.duracion / 60).toFixed(0)) >= 60 ? "60" : +moment(o.horainicio).format("mm") + (o.duracion / 60).toFixed(0)

                        return data/*{
                                mI: moment(o.horainicio).format("mm"),
                                d: (o.duracion / 60).toFixed(0),
                                horasPasadas,

                            }*/
                    })

            }
        }

        /* for(let h of allowedHours.dataValues.horasPermitidas){
             intPorHora.push({
                 lbl:h,
                 interruptions:interruptionsRecord.filter(o=>moment(o.horainicio).format("HH") == h.split(":")[0])
                     .map(o=>{
                         return {
                             mI:moment(o.horainicio).format("mm"),
                             d:(o.duracion/60).toFixed(0)
                         }
                     })

             })
         }*/
        let horasRes = {}
        for (let h of Object.keys(intPorHora)) {
            horasRes[h] = {
                interruptions: []
            }
            horasRes[h].tope = 60
            if (h == Object.keys(intPorHora)[Object.keys(intPorHora).length - 1] && turnoRecord.horafin == null) {
                horasRes[h].tope = parseInt(h.split(":")[1])
            }

            if (allowedHours.dataValues.horasPermitidas.find(o => o.split(":")[0] == h.split(":")[0])) {
                horasRes[h].interruptions = intPorHora[h].ints
                if (intPasadas[h]) {
                    horasRes[h].interruptions.push(...intPasadas[h])
                }
                /*  if(intPasadas[h]?.length>=1){
                      intPorHora[h].ints.push(intPasadas[h])
                      horasRes[h] = intPorHora[h]
                  }*/
            }
        }
        if (maquinaRecord.conSensor) {
            sensor = true
            for (let h of Object.keys(horasRes)) {

                horasRes[h].minutos = {}
                for (let psensor of await sensorPersistencia.getProductionByTurnAndHour(idTurn, h.split(":")[0])) {
                    /*if(psensor.idordendetrabajo){
                        horasRes[h].minutos[moment(psensor.timestamp).format("mm")] = psensor

                    }*/
                    horasRes[h].minutos[moment(psensor.timestamp).format("mm")] = psensor

                }

            }


        }

        return {
            listaHoras: allowedHours.dataValues.horasPermitidas,
            sensor,
            horas: horasRes
        }
    }
}