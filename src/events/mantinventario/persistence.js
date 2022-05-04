const DataTypes = require("sequelize").DataTypes;
const sequelize = require("../../database/index")
const throwError = require("../../utils/throwError")
const _entity = require("../../database/models/mantinventario");
const _entity2 = require("../../database/models/planta");
const _mantencion = require("../../database/models/mantencion");
const _inventario = require("../../database/models/inventario");
const _parada = require("../../database/models/parada");


const entity = _entity(sequelize.sql, DataTypes);
const parada = _parada(sequelize.sql, DataTypes);
const entity2 = _entity2(sequelize.sql, DataTypes);
const mantencion = _mantencion(sequelize.sql, DataTypes);
const inventario = _inventario(sequelize.sql, DataTypes);
module.exports = {
    getAll: (id) => {
        return entity.findAll({
            where:{
                tipo:id
            },
            include:[
                {
                    model:inventario,
                    as:"idinventario_inventario"
                },
                {
                    model:parada,
                    as:"tipo_parada",
                    include:[

                    ]
                }
            ]
        })
    },
    create: async (data) => {
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