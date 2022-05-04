const _turno = require("../../database/models/turno");
const _maquina = require("../../database/models/maquina");
const _detturoperador = require("../../database/models/detturoperador");
const _productoturno = require("../../database/models/productoturno");
const _dettursupervisor = require("../../database/models/dettursupervisor");
const _ordendetrabajopausa = require("../../database/models/ordendetrabajopausa");
const _ordendetrabajo = require("../../database/models/ordendetrabajo");
const _horarios = require("../../database/models/horarios");
const sequelize = require("../../database/index");
const {DataTypes} = require("sequelize");
const moment = require("moment");

const turno = _turno(sequelize.sql, DataTypes);
const maquina = _maquina(sequelize.sql, DataTypes);
const horarios = _horarios(sequelize.sql, DataTypes);
const detturoperador = _detturoperador(sequelize.sql, DataTypes);
const productoturno = _productoturno(sequelize.sql, DataTypes)
const ordendetrabajopausa = _ordendetrabajopausa(sequelize.sql, DataTypes)
const ordendetrabajo = _ordendetrabajo(sequelize.sql, DataTypes)
const dettursupervisor = _dettursupervisor(sequelize.sql, DataTypes);
const turnoPersistencia = require("../turn/persistence")
module.exports = {
    initTurnsIfNotExists: async () => {
        let todasLasMaquinas = await maquina.findAll()
        for (let machine of todasLasMaquinas) {
            try {
                let initiatedTurn = await turnoPersistencia.createOrGetTurnOfNowOfMachine(machine.id)

            } catch (e) {
                console.log("error al iniciar turno automaticamente podrian no existir");
            }
        }
    },
    endActiveTurns: async () => {

        let turnosNoAcabados = await turno.findAll({
            where: {horafin: null},
            include: [{model: horarios, as: "idhorario_horario"}]
        })
        if (turnosNoAcabados.length >= 1) {
            for (let tu of turnosNoAcabados) {
                let hFin = tu.idhorario_horario.horafin.split(":")[0]
                let hAct = moment(Date.now()).format("HH")
                if (hFin == hAct) {
                    let editedTurn = await turno.update({horafin: Date.now()}, {where: {id: tu.id}})
                    let productoTurnoActivo = await productoturno.findOne({
                        where: {
                            idturno: tu.id,
                            activoenturno: true
                        }
                    })
                    if (productoTurnoActivo?.idordendetrabajo) {
                        let ordendetrabajoRecord = await ordendetrabajo.findOne({where: {id: productoTurnoActivo.idordendetrabajo}})
                        if (ordendetrabajoRecord.estado == "Comenzado") {
                            await ordendetrabajo.update({estado: "Pausado"}, {where: {id: productoTurnoActivo.idordendetrabajo}})
                            await ordendetrabajopausa.create({
                                idordendetrabajo: productoTurnoActivo.idordendetrabajo,
                                horainicio: Date.now(),
                            })
                        }
                    }


                    let turnosOperadorNoAcabados = await detturoperador.findAll({where: {idturno: tu.id}})
                    if (turnosOperadorNoAcabados.length >= 1) {
                        for (let turnOp of turnosOperadorNoAcabados) {
                            await detturoperador.update({horafin: Date.now()}, {where: {id: turnOp.id}})
                        }
                    }
                }

            }

        }


    }
}