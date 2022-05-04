const DataTypes = require("sequelize").DataTypes;
const sequelize = require("../../database/index")
const throwError = require("../../utils/throwError")
const _entity = require("../../database/models/proceso");
const _entity2 = require("../../database/models/planta");


const entity = _entity(sequelize.sql, DataTypes);
const entity2 = _entity2(sequelize.sql, DataTypes);
module.exports = {
    getAll: () => {
        return entity.findAll({include: [{model: entity2, as: 'idplanta_plantum'}], order: [["nombre", "asc"]]})
    },
    create: async (data,nombrePlanta=false) => {

        let existentProcRec = await entity.findOne({where:{nombre:data.nombre}})
        if(existentProcRec){
            throwError(500, 'Nombre existente')

        }

        if(nombrePlanta){
            console.log("con nombre");
            let existentName = await entity2.findOne({
                where: {
                    nombre: data.idplanta
                }
            })
            if(existentName){
                data.idplanta = existentName.id
            }else{
                return null

            }
        }
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