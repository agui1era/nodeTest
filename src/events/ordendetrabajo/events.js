const _entity = require("../../database/models/ordendetrabajo");
const sequelize = require("../../database/index");
const {DataTypes, Op} = require("sequelize");
const createNotification = require("../../utils/createNotification");
const moment = require("moment");
const entity = _entity(sequelize.sql, DataTypes);


module.exports = {
    otAtrasadas: async (io) => {
        let ots = await entity.findAll({
            where: {
                horafinpredecida: {
                    [Op.lt]: Date.now()
                }
            }
        });
        for(let aOT of ots){

            await createNotification(4,
                `Orden de trabajo atrasada por ${moment.duration(moment().diff(moment(aOT.fechafinpredecida))).asHours()}`,
                {ot:aOT},
                aOT.idmaquina,io)
        }
    }



}