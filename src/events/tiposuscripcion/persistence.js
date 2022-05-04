const DataTypes = require("sequelize").DataTypes;
const sequelize = require("../../database/index")
const _entity = require("../../database/models/tiposuscripcion");
const entity = _entity(sequelize.sql, DataTypes);
const userUtils = require("../../utils/userUtils")
const _adminsus = require("../../database/models/adminsus")
const _supersus = require("../../database/models/supersus")
const _opesus = require("../../database/models/opersus")

const _tiposuscripcion = require("../../database/models/tiposuscripcion")
const tiposuscripcion = _tiposuscripcion(sequelize.sql, DataTypes);

const _planta = require("../../database/models/planta")
const planta = _planta(sequelize.sql, DataTypes);

const _proceso = require("../../database/models/proceso")
const proceso = _proceso(sequelize.sql, DataTypes);

const _maquina = require("../../database/models/maquina")
const maquina = _maquina(sequelize.sql, DataTypes);

const adminsus = _adminsus(sequelize.sql, DataTypes);
const supersus = _supersus(sequelize.sql, DataTypes);
const opesus = _opesus(sequelize.sql, DataTypes);

module.exports = {
    suscribir: async data => {
        let req = {
            idmaquina: data.idmaquina,
            idtiposuscripcion: data.idtiposuscripcion
        }
        switch (data.role) {
            case "administrador":
                req.idadministrador = data.idUser
                let existentRecord = await adminsus.findOne({
                    where: {
                        idadministrador: data.idUser,
                        idtiposuscripcion: data.idtiposuscripcion,
                        idmaquina: data.idmaquina
                    }
                })
                if (existentRecord) {
                    await adminsus.destroy({where: {id: existentRecord.id}})
                }
                if (data.activo) {
                    return adminsus.create(req)
                } else {
                    return {}
                }

            case "supervisor":
                req.idsupervisor = data.idUser
                let existentRecordS = await supersus.findOne({
                    where: {
                        idsupervisor: data.idUser,
                        idtiposuscripcion: data.idtiposuscripcion,
                        idmaquina: data.idmaquina
                    }
                })
                if (existentRecordS) {
                    await supersus.destroy({where: {id: existentRecordS.id}})
                }
                if (data.activo) {
                    return supersus.create(req)
                } else {
                    return {}
                }

            case "operador":
                req.idoperador = data.idUser
                let existentRecordO = await opesus.findOne({
                    where: {
                        idoperador: data.idUser,
                        idtiposuscripcion: data.idtiposuscripcion,
                        idmaquina: data.idmaquina
                    }
                })
                if (existentRecordO) {
                    await opesus.destroy({where: {id: existentRecordO.id}})
                }
                if (data.activo) {
                    return opesus.create(req)
                } else {
                    return {}
                }
        }

    },
    suscritos: async (role, userId) => {
        //let userDb =  await userUtils.getUserByRoleAndId(role, userId)
        switch (role) {
            case "administrador":
                return adminsus.findAll({where: {idadministrador: userId}})
            case "supervisor":
                return supersus.findAll({where: {idsupervisor: userId}})
            case "operador":
                return opesus.findAll({where: {idoperador: userId}})

        }
    },
    suscripcionesPorUsuario: async (data) => {
        let userDb = await userUtils.getUserByRoleAndId(data.role, data.idUser)
        switch (data.role) {
            case "administrador":
                return adminsus.findAll({where: {idadministrador: userDb.id}})
            case "supervisor":
                return supersus.findAll({where: {idsupervisor: userDb.id}})
            case "operador":
                return opesus.findAll({where: {idoperador: userDb.id}})

        }
    },
    suscribible: async () => {
        let allTipoSus = []
        let bdTipoSus = await tiposuscripcion.findAll()
        let plantas = await planta.findAll({
            include: [{
                model: proceso,
                as: "procesos",
                include: [{
                    model: maquina,
                    as: "maquinas",

                }],

            }],
            order: [["nombre", "asc"], ["procesos", "nombre", "asc"], ["procesos", "maquinas", "nombre", "asc"]]
        })
        allTipoSus = plantas.map(o => {
            return {
                ...o.dataValues,
                procesos: o.dataValues.procesos.map(oo => {
                    return {
                        ...oo.dataValues, maquinas: oo.dataValues.maquinas.map(ooo => {
                            return {...ooo.dataValues, suscribibles: bdTipoSus}
                        })
                    }
                })


            }
        })

        return allTipoSus
    },

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