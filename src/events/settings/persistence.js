const DataTypes = require("sequelize").DataTypes;
const throwError = require("../../utils/throwError")
const sequelize = require("../../database/index")
const _horarios = require("../../database/models/horarios");
const _diaspermitidos = require("../../database/models/diaspermitidos");
const _configuraciones = require("../../database/models/configuraciones");
const _diashorarios = require("../../database/models/diashorarios");

const diaspermitidos = _diaspermitidos(sequelize.sql, DataTypes);
const diashorarios = _diashorarios(sequelize.sql, DataTypes);
const horarios = _horarios(sequelize.sql, DataTypes);
const configuraciones = _configuraciones(sequelize.sql, DataTypes);

module.exports = {
    getDays: () => {
        return diaspermitidos.findAll({order: [["createdAt", "asc"]]})
    },
    updateDay: (data) => {
        return diaspermitidos.update({permitido: data.permitido}, {where: {nombre: data.nombre}})
    },
    getAllHandHours: () => {
        return horarios.findAll({
            include: [{
                model: diashorarios,
                as: "diashorarioss"
            }], order: [["nombre", "asc"]]
        })
    },
    delete: async (id) => {
        return horarios.update({borrado:true}, {where: {id}})
        //return horarios.destroy({where: {id}})
    },
    create: async (data) => {
        return horarios.create(data)
    },
    update: async (data) => {
        return horarios.update(data, {where: {id: data.id}})
    },
    getSettings: () => {
        return configuraciones.findOne()
    },
    updateSettings: (data) => {
        return configuraciones.update(data, {where: {id: data.id}})
    },
    assign: async (data) => {
        let existentRecord
        try {
            existentRecord = await diashorarios.findOne({
                where: {
                    idhorarios: data.idhorarios,
                    iddiaspermitidos: data.iddiaspermitidos,
                }
            })

            if (existentRecord) {
                return await diashorarios.destroy({
                    where: {id: existentRecord.id}
                })
            } else {
                return await diashorarios.create(data)
            }

        } catch (e) {
            throwError(500, e.name)
        }

    }
    /*,
    create: async (data) => {
        return entity.create(data)
    },
    update: async (data) => {
        return entity.update(data, {where: {id: data.id}})
    },

    }*/
}