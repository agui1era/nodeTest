const DataTypes = require("sequelize").DataTypes;
const sequelize = require("../../database/index")
const _entity = require("../../database/models/categoriasensor");

const entity = _entity(sequelize.sql, DataTypes);
module.exports = {

    getAll: () => {
        return entity.findAll()
    },
    create: async (data) => {
        return entity.create(data)
    },
    update: async (data) => {
        return entity.update(data, {where: {id: data.id}})
    },
    delete: async (id) => {
        return entity.destroy({where: {id}})
    }

}