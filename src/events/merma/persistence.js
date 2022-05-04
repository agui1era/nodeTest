const DataTypes = require("sequelize").DataTypes;
const sequelize = require("../../database/index")
const _entity = require("../../database/models/merma");
const throwError = require("../../utils/throwError");

const entity = _entity(sequelize.sql, DataTypes);
module.exports = {

    getAll: () => {
        return entity.findAll({order:[["nombre","asc"]]})
    },
    create: async (data) => {
        let existentProcRec = await entity.findOne({where:{nombre:data.nombre}})
        if(existentProcRec){
            throwError(500, 'Nombre existente')

        }

        return entity.create(data)
    },
    update: async (data) => {
        return entity.update(data, {where: {id: data.id}})
    },
    delete: async (id) => {
        return entity.destroy({where: {id}})
    }

}