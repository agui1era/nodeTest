const DataTypes = require("sequelize").DataTypes;
const sequelize = require("../../database/index")
const _entity = require("../../database/models/notificacion");
const _adminnoti = require("../../database/models/adminoti")
const _supnoti = require("../../database/models/supnoti")
const _notificacion = require("../../database/models/notificacion")
const notificacion = _notificacion(sequelize.sql, DataTypes);
const _tiponotificacion = require("../../database/models/tiponotificacion")
const tiponotificacion = _tiponotificacion(sequelize.sql, DataTypes);
const _openoti = require("../../database/models/openoti")
const entity = _entity(sequelize.sql, DataTypes);
const adminnoti = _adminnoti(sequelize.sql, DataTypes);
const supnoti = _supnoti(sequelize.sql, DataTypes);
const openoti = _openoti(sequelize.sql, DataTypes);
module.exports = {

    getAll: async (userData) => {
        let include = [{
            model: notificacion,
            as: "idnotificacion_notificacion",
            include: [{
                model: tiponotificacion,
                as: "idtiponotificacion_tiponotificacion"
            }]
        }]

        switch (userData.dataValues.role) {
            case "administrador":
                let notis = await adminnoti.findAll({
                    where: {idadministrador: userData.dataValues.id}, include: [{
                        model: notificacion,
                        as: "idnotificacion_notificacion"
                    }],
                    order: [["id", "desc"]],
                    limit:100
                })
                notis = notis.map(async o => {
                    let tipoNot = await tiponotificacion.findOne({
                        where:
                            {
                                id: o.dataValues.idnotificacion_notificacion.idtiponotificacion
                            }
                    })
                    let obj = {...o.dataValues}
                    obj.idnotificacion_notificacion.dataValues.idtiponotificacion_tiponotificacion = tipoNot
                    return obj
                })
                notis = await Promise.all(notis)

                return notis
            case "supervisor":
                let notifs = await supnoti.findAll({
                    where: {idsupervisor: userData.dataValues.id}, include: [{
                        model: notificacion,
                        as: "idnotificacion_notificacion"
                    }], order: [["id", "desc"]],
                    limit:100


                })
                for (let n of notifs) {
                    let tipoNot = await tiponotificacion.findOne({
                        where:
                            {
                                id: n.dataValues.idnotificacion_notificacion.idtiponotificacion
                            }
                    })
                    n.dataValues.idnotificacion_notificacion.dataValues.idtiponotificacion_tiponotificacion = tipoNot
                }
                return notifs
            case "operador":
                let notif = await openoti.findAll({
                    where: {idoperador: userData.dataValues.id}, include: [{
                        model: notificacion,
                        as: "idnotificacion_notificacion"
                    }], order: [["id", "desc"]],
                    limit:100


                })
                for (let n of notif) {
                    let tipoNot = await tiponotificacion.findOne({
                        where:
                            {
                                id: n.dataValues.idnotificacion_notificacion.idtiponotificacion
                            }
                    })
                    n.dataValues.idnotificacion_notificacion.dataValues.idtiponotificacion_tiponotificacion = tipoNot
                }
                return notif
        }
    },
    leer: async data => {
        switch (data.userData.dataValues.role) {
            case "administrador":
                return adminnoti.update({fechaleido: Date.now()}, {where: {id: data.id}})
            case "supervisor":
                return supnoti.update({fechaleido: Date.now()}, {where: {id: data.id}})
            case "operador":
                return openoti.update({fechaleido: Date.now()}, {where: {id: data.id}})
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