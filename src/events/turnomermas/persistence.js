const DataTypes = require("sequelize").DataTypes;
const sequelize = require("../../database/index")
const throwError = require("../../utils/throwError")
const _entity = require("../../database/models/turnomerma");
const _entity2 = require("../../database/models/planta");
const _mantencion = require("../../database/models/mantencion");
const _merma = require("../../database/models/merma");
const _productoturno = require("../../database/models/productoturno");
const _ordendetrabajo = require("../../database/models/ordendetrabajo");
const _turnomerma = require("../../database/models/turnomerma");
const _inventario = require("../../database/models/inventario");
const _parada = require("../../database/models/parada");


const entity = _entity(sequelize.sql, DataTypes);
const parada = _parada(sequelize.sql, DataTypes);
const merma = _merma(sequelize.sql, DataTypes);
const turnomerma = _turnomerma(sequelize.sql, DataTypes);
const ordendetrabajo = _ordendetrabajo(sequelize.sql, DataTypes);
const productoturno = _productoturno(sequelize.sql, DataTypes);
const entity2 = _entity2(sequelize.sql, DataTypes);
const mantencion = _mantencion(sequelize.sql, DataTypes);
const inventario = _inventario(sequelize.sql, DataTypes);
const prodlogsPersistence = require("../prodlog/persistence")

module.exports = {
    getAll: () => {
        return entity.findAll({
            include: [{model: ordendetrabajo, as: "idordendetrabajo_ordendetrabajo"},
                {model: merma, as: "idmerma_merma"}],
            order: [["idmerma", "asc"]]
        })
    },
    getAllByOt: (idordendetrabajo = undefined) => {
        return entity.findAll({
            where: {idordendetrabajo},
            include: [{model: ordendetrabajo, as: "idordendetrabajo_ordendetrabajo"},
                {model: merma, as: "idmerma_merma"}],
            order: [["idmerma", "asc"]]
        })
    },
    getAllByMerma: (idmerma = undefined) => {
        return entity.findAll({
            where: {idmerma},
            include: [{model: merma, as: "idmerma_merma"}],
            order: [["idmerma_merma", "nombre", "asc"]]
        })
    },
    create: async (data) => {

        let logRegisterData = {
            ts: Date.now(),
            cantidad: data.cantidad,
            //horasdelturno: turnoRecordExistentpt.idhorario_horario.horasdelturno,
            //maquina: turnoRecordExistentpt.idmaquina,
            //horario: turnoRecordExistentpt.idhorario,
            //turno: turnoRecordExistentpt.id,
            producto: data.idordendetrabajo,
            ordendetrabajo: data.idordendetrabajo,
            //subproducto: existentPtRecord.idsubproducto,
            modo: "mermaOT",
        }
        let regLog = await prodlogsPersistence.registerProd(logRegisterData)


        let createdEntity = null
        try {
            createdEntity = await entity.create(data)

        } catch (e) {
            throwError(500, e.name)
        }
        return createdEntity
    },
    update: async (data) => {
        let updatedEntity = null
        try {
            updatedEntity = await entity.update(data, {where: {id: data.id}})

        } catch (e) {
            throwError(500, e.name)
        }
        return updatedEntity
    },
    delete: async (id) => {
        return entity.destroy({where: {id}})
    }
}