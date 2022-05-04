const DataTypes = require("sequelize").DataTypes;
const sequelize = require("../../database/index")
const _entity = require("../../database/models/categoriadeparada");

const entity = _entity(sequelize.sql, DataTypes);
module.exports = {
    getAll: () => {
        return entity.findAll({where:{deleted:null},order:[["nombre","asc"]]})
    },
    create: async (data) => {
        return entity.create(data)
    },
    update: async (data) => {
        return entity.update(data, {where: {id: data.id}})
    },
    delete: async (id) => {
        return entity.update({deleted:true}, {where: {id}})
    }
}