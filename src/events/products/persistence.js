const DataTypes = require("sequelize").DataTypes;
const sequelize = require("../../database/index")
const _entity = require("../../database/models/producto");
const _subProducto = require("../../database/models/subproducto");

const entity = _entity(sequelize.sql, DataTypes);
const subProducto = _subProducto(sequelize.sql, DataTypes);
module.exports = {
    getAll: (subProductos = 'n') => {
        if (subProductos === 'n') {
            return entity.findAll({order: [['nombre', 'ASC']]})

        } else if (subProductos === 's') {
            return entity.findAll({
                include: [
                    {
                        model: subProducto,
                        as: "subproductos"
                    }
                ],
                order: [['nombre', 'ASC']]
            })
        }
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