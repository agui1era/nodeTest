const DataTypes = require("sequelize").DataTypes;
const sequelize = require("../../database/index")
const _entity = require("../../database/models/producto");
const _subProducto = require("../../database/models/subproducto");

const entity = _entity(sequelize.sql, DataTypes);
const subProducto = _subProducto(sequelize.sql, DataTypes);
module.exports = {
    getAll: () => {
        return subProducto.findAll()
    },
    getById: id => {
        return subProducto.findOne({where:{id}})
    },
    create: async (data,nombreProd = false ) => {
        if(nombreProd){
            let existentName = await entity.findOne({
                where: {
                    nombre: data.idproducto
                }
            })
            if(existentName){
                data.idproducto = existentName.id
            }else{
                return null

            }
        }
        return subProducto.create(data)
    },
    update: async (data) => {
        return subProducto.update(data, {where: {id: data.id}})
    },
    delete: async (id) => {
        return subProducto.destroy({where: {id}})
    }
}