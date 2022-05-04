const _sensor = require("../../database/models/sensordata");
const _sensorT = require("../../database/models/sensor");
const _maquina = require("../../database/models/maquina");
const _categoriasensor = require("../../database/models/categoriasensor");
const _turno = require("../../database/models/turno");
const _horarios = require("../../database/models/horarios");
const {DataTypes, Op} = require("sequelize");
const sequelize = require("../../database/index");
const moment = require("moment");
const categoriasensor = _categoriasensor(sequelize.sql, DataTypes);
const turno = _turno(sequelize.sql, DataTypes);
const maquina = _maquina(sequelize.sql, DataTypes);
const sensor = _sensor(sequelize.sql, DataTypes);
const sensorT = _sensorT(sequelize.sql, DataTypes);
const horarios = _horarios(sequelize.sql, DataTypes);


module.exports = {
    getProductionByTurnAndHour: async (idturno, labelHora) => {
        let recordsResp = []

        let turnoRecord = await turno.findOne({
            where: {id: idturno},
            include: [
                {model: horarios, as: "idhorario_horario"}
            ]
        })
        if (turnoRecord) {
            let fechaQuery = moment(turnoRecord.horainicio)


            let horaInicioTurno = turnoRecord.idhorario_horario.horainicio.split(":")[0]
            let horaFinTurno = turnoRecord.idhorario_horario.horafin.split(":")[0]

            if (horaFinTurno <= horaInicioTurno) {
                if (labelHora >= 0 && labelHora < horaInicioTurno) {
                    fechaQuery.add(1, "day")
                }
                //el turno pasa las 00:00(diaanterior)
            }
            fechaQuery.hours(labelHora)

            let fechaQ = fechaQuery.toDate().getTime()

            //console.log(turnoRecord);
            let idmaquina = turnoRecord.idmaquina
            /*console.log(turnoRecord.horafin)
            console.log(turnoRecord.idhorario_horarios)
            console.log(moment(turnoRecord.horainicio).format("HH:mm"))
            console.log(moment(turnoRecord.horafin).format("HH:mm"))*/
            // console.log(moment(fechaQ).subtract(1,"minutes").toDate().getTime());
            recordsResp = await sensor.findAll({
                order: [["timestamp", "ASC"]],
                where: {
                    idmaquina,
                    timestamp: {
                        [Op.gte]: moment(fechaQ).toDate().getTime(),
                        [Op.lt]: moment(fechaQ).add("1", "hours").toDate().getTime()
                    }

                }
            })


        }
        return recordsResp
    },
    getProductionByTurn: async idturno => {
        let recordsResp = []
        let turnoRecord = await turno.findOne({
            where: {id: idturno},
            include: [
                {model: horarios, as: "idhorario_horario"}
            ]
        })
        if (turnoRecord) {
            let idmaquina = turnoRecord.idmaquina
            if (turnoRecord.horafin == null) {
                recordsResp = await sensor.findAll({
                    where: {
                        idsensor:{[Op.like]: '%_CF%'},
                        idmaquina,
                        timestamp: {
                            [Op.gte]: moment(turnoRecord.horainicio).toDate().getTime()
                        }
                    }
                })
            } else {
                recordsResp = await sensor.findAll({
                    where: {
                        idsensor:{[Op.like]: '%_CF%'},
                        idmaquina,
                        timestamp: {
                            [Op.gte]: moment(turnoRecord.horainicio).toDate().getTime(),
                            [Op.lt]: moment(turnoRecord.horafin).toDate().getTime()
                        }

                    }
                })
            }

        }
        if (recordsResp.length > 0) {
            for (let rR of recordsResp) {
                rR.dataValues.idcategoriasensor_categoriasensor = await sensorT.findOne({
                    where: {idreferencia: rR.idsensor},
                    include: [{model: categoriasensor, as: "idcategoriasensor_categoriasensor"}]
                })
            }
            recordsResp = recordsResp.filter(o => o.dataValues.idcategoriasensor_categoriasensor.idcategoriasensor == 3)
        }
        return recordsResp
    },
    getProductionByTurnScrapSensor: async idturno => {
        let recordsResp = []
        let turnoRecord = await turno.findOne({
            where: {id: idturno},
            include: [
                {model: horarios, as: "idhorario_horario"}
            ]
        })
        if (turnoRecord) {
            //console.log(turnoRecord);
            let idmaquina = turnoRecord.idmaquina
            /*console.log(turnoRecord.horafin)
            console.log(turnoRecord.idhorario_horarios)
            console.log(moment(turnoRecord.horainicio).format("HH:mm"))
            console.log(moment(turnoRecord.horafin).format("HH:mm"))*/

            if (turnoRecord.horafin == null) {
                recordsResp = await sensor.findAll({
                    where: {
                        idmaquina,

                        timestamp: {
                            [Op.gte]: moment(turnoRecord.horainicio).toDate().getTime()
                        }

                    }
                })
            } else {
                recordsResp = await sensor.findAll({
                    where: {
                        idmaquina,
                        timestamp: {
                            [Op.gte]: moment(turnoRecord.horainicio).toDate().getTime(),
                            [Op.lt]: moment(turnoRecord.horafin).toDate().getTime()
                        }

                    }
                })
            }
        }
        if (recordsResp.length > 0) {
            for (let rR of recordsResp) {
                rR.dataValues.idcategoriasensor_categoriasensor = await sensorT.findOne({
                    where: {idreferencia: rR.idsensor},
                    include: [{model: categoriasensor, as: "idcategoriasensor_categoriasensor"}]
                })
            }
            recordsResp = recordsResp.filter(o => o.dataValues.idcategoriasensor_categoriasensor.idcategoriasensor == 2)
        }
        return recordsResp
    },
    getProductionByTurnAndCustomCategorySensor: async (idturno, idcategory) => {
        let recordsResp = []
        let turnoRecord = await turno.findOne({
            where: {id: idturno},
            include: [
                {model: horarios, as: "idhorario_horario"}
            ]
        })
        if (turnoRecord) {
            let idmaquina = turnoRecord.idmaquina
            if (turnoRecord.horafin == null) {
                recordsResp = await sensor.findAll({
                    where: {
                        idmaquina,
                        timestamp: {
                            [Op.gte]: moment(turnoRecord.horainicio).toDate().getTime()
                        }
                    }
                })
            } else {
                recordsResp = await sensor.findAll({
                    where: {
                        idmaquina,
                        timestamp: {
                            [Op.gte]: moment(turnoRecord.horainicio).toDate().getTime(),
                            [Op.lt]: moment(turnoRecord.horafin).toDate().getTime()
                        }
                    }
                })
            }
        }
        if (recordsResp.length > 0) {
            for (let rR of recordsResp) {
                rR.dataValues.idcategoriasensor_categoriasensor = await sensorT.findOne({
                    where: {idreferencia: rR.idsensor},
                    include: [{model: categoriasensor, as: "idcategoriasensor_categoriasensor"}]
                })
            }
            recordsResp = recordsResp.filter(o => o.dataValues.idcategoriasensor_categoriasensor.idcategoriasensor == idcategory)
        }
        return recordsResp
    },
    getRegistered: async () => {
        return sensorT.findAll({
            include: [{
                model: categoriasensor,
                as: "idcategoriasensor_categoriasensor"
            }, {
                model: maquina,
                as: "idmaquina_maquina"
            }],
            where: {
                idcategoriasensor: {
                    [Op.not]: null
                }
            },
            order: [["idreferencia", "asc"]]


        })
    },
    getRegisteredByMachine: async (idmaquina) => {
        return sensorT.findAll({
            where: {
                idcategoriasensor: {
                    [Op.not]: null
                },
                idmaquina
            },
            order: [["idreferencia", "asc"]]


        })
    },
    asociarMaquina: async data => {
        return sensorT.update({idmaquina: data.idmaquina}, {
            where: {id: data.id}
        })
    },

    getUnregistered: async () => {
        return sensorT.findAll({
            where: {
                idcategoriasensor: null
            },
            order: [["idreferencia", "asc"]]
        })
    },
    register: async sensor => {
        return sensorT.update({idcategoriasensor: sensor.idcategoriasensor}, {
            where: {
                id: sensor.id
            }
        })
    }


}