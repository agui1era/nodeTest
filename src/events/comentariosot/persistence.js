const DataTypes = require("sequelize").DataTypes;
const sequelize = require("../../database/index")
const _entity = require("../../database/models/comentariosot");

const entity = _entity(sequelize.sql, DataTypes);
module.exports = {

    getAll: () => {
        return entity.findAll({where:{borrado:null}})
    },
    getById: (id) => {
        return entity.findAll({where: {id,borrado:null}})
    },
    getByIdOT: (idordendetrabajo) => {
        return entity.findAll({where: {idordendetrabajo,borrado:null}})
    },
    create: async (data) => {
        return entity.create(data)
    },
    update: async (data) => {
        return entity.update(data, {where: {id: data.id}})
    },
    delete: async (id) => {
        return entity.update({borrado:true}, {where: {id}})
        //return entity.destroy({where: {id}})
    }

}