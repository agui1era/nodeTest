const {Op, Sequelize, DataTypes} = require("sequelize");
const sequelize = require("../../database/index");
const createNotification = require("../../utils/createNotification");
const _maquina = require("../../database/models/maquina");
const _paradamaquina = require("../../database/models/paradamaquina");
const paradamaquina = _paradamaquina(sequelize.sql, DataTypes);
const _parada = require("../../database/models/parada");
const parada = _parada(sequelize.sql, DataTypes);
const maquina = _maquina(sequelize.sql, DataTypes);
const _entity = require("../../database/models/mantencion");
const _interrupcion = require("../../database/models/interrupcion");
const interrupcion = _interrupcion(sequelize.sql, DataTypes);
const entity = _entity(sequelize.sql, DataTypes);
const moment = require("moment");
module.exports = {
    atrasadas: async (io) => {
        let mantencionesDeMaquina = await entity.findAll({
            where: {
                [Op.and]: [
                    Sequelize.literal(`NOW() > fechaprogramada + (idinterrupcion_interrupcion.duracion || 's')::interval `),
                ],
            },
            include: [
                {
                    model: interrupcion,
                    as: "idinterrupcion_interrupcion"
                }]
        })

        for (let mant of mantencionesDeMaquina) {
            let mantRecord = await entity.findOne({
                where: {id:mant.id},
                include: [{
                    model: interrupcion,
                    as: "idinterrupcion_interrupcion",
                    include: [{model: parada, as: "tipo_parada"}]
                }]
            })
            let maqRecord = await paradamaquina.findOne({
                where:
                    {idparada: mantRecord.idinterrupcion_interrupcion.tipo},
                include: [
                    {model: maquina, as: "idmaquina_maquina"}
                ]
            })
            await createNotification(11,
                `Orden de mantenimiento atrasada atrasada por ${moment.duration(moment().diff(moment(mant.fechaprogramada))).asHours()}`,
                {parada: {id: mantRecord.idinterrupcion_interrupcion.tipo}},
                maqRecord.idmaquina,io)
        }

    }
}