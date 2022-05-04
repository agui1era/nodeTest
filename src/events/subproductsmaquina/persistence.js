const DataTypes = require("sequelize").DataTypes;
const sequelize = require("../../database/index")
const _entity = require("../../database/models/producto");
const _subproductosmaquina = require("../../database/models/subproductosmaquina");
const _subProducto = require("../../database/models/subproducto");
const _maquina = require("../../database/models/maquina");
const subProducto = _subProducto(sequelize.sql, DataTypes);

const entity = _entity(sequelize.sql, DataTypes);
const maquina = _maquina(sequelize.sql, DataTypes);
const subproductosmaquina = _subproductosmaquina(sequelize.sql, DataTypes);

module.exports = {
    getAll: (idmaquina) => {
        return subproductosmaquina.findAll({
            where: {idmaquina},
            include: [{
                model: subProducto,
                as: "idsubproducto_subproducto",
                include: [
                    {
                        model: entity,
                        as: "idproducto_producto"
                    }
                ]
            }]
        })
    },
    create: async (data) => {
        let haySeleccionado = await maquina.findOne({
            where: {id: data.idmaquina}
        })
        if (haySeleccionado.subproductoasignado) {
            let spAssigned = await subProducto.findOne({where: {id: haySeleccionado.subproductoasignado}})

            if (spAssigned) {
                return subproductosmaquina.create(data)

            } else {
                let newsubproduct = await subproductosmaquina.create(data)
                await maquina.update({subproductoasignado: data.idsubproducto}, {where: {id: data.idmaquina}})
                return newsubproduct
            }
        } else {
            let newsubproduct = await subproductosmaquina.create(data)
            await maquina.update({subproductoasignado: data.idsubproducto}, {where: {id: data.idmaquina}})
            return newsubproduct
        }


    },
    update: async (data) => {
        return subproductosmaquina.update(data, {where: {id: data.id}})
    },
    delete: async (id) => {
        let spMachineRecord = await subproductosmaquina.findOne({
            where: {id}
        })
        let spdemaquina = await subproductosmaquina.findAll({
            where: {
                idmaquina: spMachineRecord.idmaquina
            }
        })
        if (spdemaquina.length == 1) {
            return {error: "debe existir almenos 1 subproducto relacionado a la maquina"}
        } else {
            let maquinaRecord = await maquina.findOne({
                where: {id: spMachineRecord.idmaquina}
            })
            await subproductosmaquina.destroy({where: {id}})
            if (maquinaRecord.subproductoasignado == spMachineRecord.idsubproducto) {
                let listaspdemaquina = await subproductosmaquina.findAll({
                    where: {
                        idmaquina: spMachineRecord.idmaquina
                    }
                })
                await maquina.update({subproductoasignado: listaspdemaquina[0].idsubproducto}, {
                    where: {
                        id: spMachineRecord.idmaquina
                    }
                })
                return {ok: "subproducto asignado cambiado"}
            }
        }


    }
}