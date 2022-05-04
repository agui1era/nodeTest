const sequelize = require("../database/index");
const {DataTypes} = require("sequelize");
const _notificacion = require("../database/models/notificacion")
const notificacion = _notificacion(sequelize.sql, DataTypes);
const _tiponotificacion = require("../database/models/tiponotificacion")
const tiponotificacion = _tiponotificacion(sequelize.sql, DataTypes);
const _paradamaquina = require("../database/models/paradamaquina")
const paradamaquina = _paradamaquina(sequelize.sql, DataTypes);
const _interrupcion = require("../database/models/interrupcion")
const interrupcion = _interrupcion(sequelize.sql, DataTypes);
const _tiposuscripcion = require("../database/models/tiposuscripcion")
const tiposuscripcion = _tiposuscripcion(sequelize.sql, DataTypes);
const _adminoti = require("../database/models/adminoti")
const adminoti = _adminoti(sequelize.sql, DataTypes);
const _supnoti = require("../database/models/supnoti")
const supnoti = _supnoti(sequelize.sql, DataTypes);
const _openoti = require("../database/models/openoti")
const openoti = _openoti(sequelize.sql, DataTypes);
const _adminsus = require("../database/models/adminsus")
const adminsus = _adminsus(sequelize.sql, DataTypes);
const _supersus = require("../database/models/supersus")
const supersus = _supersus(sequelize.sql, DataTypes);
const _mantencion = require("../database/models/mantencion")
const mantencion = _mantencion(sequelize.sql, DataTypes);
const _opensus = require("../database/models/opersus")
const opersus = _opensus(sequelize.sql, DataTypes);
const _administrador = require("../database/models/administrador")
const administrador = _administrador(sequelize.sql, DataTypes);
const _supervisor = require("../database/models/supervisor")
const supervisor = _supervisor(sequelize.sql, DataTypes);
const _operador = require("../database/models/operador")
const operador = _operador(sequelize.sql, DataTypes);
const _ordendetrabajo = require("../database/models/ordendetrabajo")
const ordendetrabajo = _ordendetrabajo(sequelize.sql, DataTypes);
const _parada = require("../database/models/parada")
const parada = _parada(sequelize.sql, DataTypes);
const _maquina = require("../database/models/maquina")
const maquinaModel = _maquina(sequelize.sql, DataTypes);
const _sesionessocket = require("../database/models/sesionessocket")
const sesionessocket = _sesionessocket(sequelize.sql, DataTypes);
const usersPersistence = require("../events/users/usersPersistence")

module.exports = async (tipo, infoData, dataObj, maquina = null,io) => {
    let reqNot = {}
    reqNot.idtiposuscripcion = tipo
    reqNot.idmaquina = maquina
    reqNot.idordendetrabajo = dataObj?.ot?.id
    reqNot.idparada = dataObj?.parada?.id
    reqNot.info = infoData
    reqNot.tipoObj = await tiposuscripcion.findOne({where: {id: tipo}})
    reqNot.dataObj = {...dataObj}
    if (dataObj?.ot?.id)
        reqNot.dataObj.ot = await ordendetrabajo.findOne({
            where: {id: dataObj.ot.id},
            include: [{model: maquinaModel, as: "idmaquina_maquina"}]
        })

    if (dataObj?.parada?.id) {
        reqNot.dataObj.parada = await parada.findOne({
            where: {id: dataObj.parada.id},
        })
        reqNot.dataObj.parada.dataValues.idmaquina_maquina = await paradamaquina.findOne({
            where: {idparada: dataObj.parada.id},
            include: [{model: maquinaModel, as: "idmaquina_maquina"}]
        })
        reqNot.dataObj.parada.dataValues.idinterrupcion_interrupcion = await interrupcion.findOne({
            where: {tipo: dataObj.parada.id},
            order: [["id", "desc"]]
        })
        let mantencionRecord = await mantencion.findOne({where: {idinterrupcion: reqNot.dataObj.parada.dataValues.idinterrupcion_interrupcion.dataValues.id}})
        if (mantencionRecord) {
            mantencionRecord.dataValues.quiencreaObj = await usersPersistence.getUserByUsernameForce({username: mantencionRecord.quiencrea})
            mantencionRecord.dataValues.quienempiezaObj = await usersPersistence.getUserByUsernameForce({username: mantencionRecord.quienempieza})
            mantencionRecord.dataValues.quienterminaObj = await usersPersistence.getUserByUsernameForce({username: mantencionRecord.quientermina})
            reqNot.dataObj.parada.dataValues.mantencion = mantencionRecord
        }
    
    }
    let newTipoNot = await tiponotificacion.create(reqNot)
    let newNot = await notificacion.create({idtiponotificacion: newTipoNot.id})
    //agregar a los 3 el modelo para obtener el usuario
    let adminSuscritos = await adminsus.findAll({
        where: {idtiposuscripcion: tipo, idmaquina: maquina},
        include: [{model: administrador, as: "idadministrador_administrador"}]
    })
    let supervisoresSuscritos = await supersus.findAll({
        where: {idtiposuscripcion: tipo, idmaquina: maquina},
        include: [{model: supervisor, as: "idsupervisor_supervisor"}]
    })
    let operadoresSuscritos = await opersus.findAll({
        where: {idtiposuscripcion: tipo, idmaquina: maquina},
        include: [{model: operador, as: "idoperador_operador"}]
    })

    //buscar por usuario el socket de sesion
    let usernames = []
    usernames.push(adminSuscritos.map(o => o.idadministrador_administrador.usuario))
    usernames.push(supervisoresSuscritos.map(o => o.idsupervisor_supervisor.usuario))
    usernames.push(operadoresSuscritos.map(o => o.idoperador_operador.usuario))
    for (let adm of adminSuscritos) {
        await adminoti.create({idadministrador: adm.idadministrador, idnotificacion: newNot.id})
    }
    for (let sup of supervisoresSuscritos) {
        await supnoti.create({idsupervisor: sup.idsupervisor, idnotificacion: newNot.id})
    }
    for (let ope of operadoresSuscritos) {
        await openoti.create({idoperador: ope.idoperador, idnotificacion: newNot.id})
    }
    for (let usr of usernames) {
        let session = await sesionessocket.findOne({where: {username: usr}})
        if (session) {

            io.to(session.idsocket).emit("notificacionCreada", {reqNot})
        }
    }


}