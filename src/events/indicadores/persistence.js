const DataTypes = require("sequelize").DataTypes;
const sequelize = require("../../database/index")
const {Op} = require("sequelize");

const _indicadores = require("../../database/models/indicadoresevents");
const indicadores = _indicadores(sequelize.sql, DataTypes);
const _maquina = require("../../database/models/maquina");
const moment = require("moment");
const maquina = _maquina(sequelize.sql, DataTypes);
module.exports = {
    getAll: async (body) => {
        let query = {...body}
        Object.keys(query).forEach(key => {
            if (query[key] === undefined || query[key] === null) {
                delete query[key];
            }
        });
        if (query.fecha) {
            query.ts = {
                [Op.gte]: body.fecha,
                [Op.lt]: moment(body.fecha).add("1", "d").toDate().getTime()
            }
            delete query.fecha
        }
        console.log(query);
        let indicadoresList = await indicadores.findAll({
            where: query,
            order: [
                ['ts', 'DESC'],
            ],
        })

        for (let indi of indicadoresList) {
            indi.dataValues.idmaquina_maquina = await maquina.findOne({where: {id: indi.maquina}})
        }
        return indicadoresList

    }
}