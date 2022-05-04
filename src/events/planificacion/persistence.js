const DataTypes = require("sequelize").DataTypes;
const sequelize = require("../../database/index")
const _mantencion = require("../../database/models/mantencion");
const _interrupcion = require("../../database/models/interrupcion");
const _parada = require("../../database/models/parada");
const _categoriadeparada = require("../../database/models/categoriadeparada");
const _paradamaquina = require("../../database/models/paradamaquina");
const _ordendetrabajo = require("../../database/models/ordendetrabajo");
const _maquina = require("../../database/models/maquina");
const moment = require("moment");

const mantencion = _mantencion(sequelize.sql, DataTypes);
const categoriadeparada = _categoriadeparada(sequelize.sql, DataTypes);
const parada = _parada(sequelize.sql, DataTypes);
const paradamaquina = _paradamaquina(sequelize.sql, DataTypes);
const maquina = _maquina(sequelize.sql, DataTypes);
const interrupcion = _interrupcion(sequelize.sql, DataTypes);
const ordendetrabajo = _ordendetrabajo(sequelize.sql, DataTypes);
module.exports = {

    getAll: async () => {
        let results = []
        let mants = await mantencion.findAll({
            include: [{
                model: interrupcion, as: "idinterrupcion_interrupcion", include: [{
                    model: parada, as: "tipo_parada",
                }]
            }],

        });
        for (let m of mants) {
            m.dataValues.idinterrupcion_interrupcion.dataValues.tipo_parada.dataValues.maquina = await
                paradamaquina.findAll({
                    where: {idparada: m.dataValues.idinterrupcion_interrupcion.dataValues.tipo_parada.dataValues.id},
                    include: [{model: maquina, as: "idmaquina_maquina"}]
                })
        }

        let interrupciones = await interrupcion.findAll({
            include: [{
                model: parada, as: "tipo_parada",include:[{
                    model:categoriadeparada,as:"idcategoriaparada_categoriadeparada",
                    where:{
                        "tipo" : 'no programada'
                    }
                }]
            }],

        });
        interrupciones = interrupciones.filter(o=>o.tipo_parada != null)
        for (let i of interrupciones) {
            i.dataValues.tipo_parada.dataValues.maquina = await
                paradamaquina.findAll({
                    where: {idparada: i.dataValues.tipo_parada.dataValues.id},
                    include: [{model: maquina, as: "idmaquina_maquina"}]
                })
        }

        let ots = await ordendetrabajo.findAll();

        results.push(...mants.map(o => {
            return {
                start: moment(o.idinterrupcion_interrupcion.horainicio).toDate(),
                end: moment(o.idinterrupcion_interrupcion.horainicio).add(o.idinterrupcion_interrupcion.duracion, "seconds").toDate(),
                maq:o.idinterrupcion_interrupcion.tipo_parada.dataValues.maquina[0].idmaquina,
                type:"mant",
                name:o.nombre
            }
        }))

        results.push(...interrupciones.map(o => {
            return {
                start: moment(o.horainicio).toDate(),
                end: moment(o.horainicio).add(o.duracion, "seconds").toDate(),
                maq:o.tipo_parada.dataValues.maquina[0].idmaquina,
                type:"int",
                name:o.tipo_parada.dataValues.nombre,
                idObj:o.id

            }
        }))

        results.push(...ots.map(o => {
            return {
                start: moment(o.horainicio).toDate(),
                end: moment(o.horafinpredecida).toDate(),
                maq:o.idmaquina,
                type:"ot",
                name:o.nombre
            }
        }))
        results.push(...ots.map(o => {
            return {
                start: moment(o.horainicioaccion).toDate(),
                end: moment(o.horafinconfirmada || Date.now()).toDate(),
                maq:o.idmaquina,
                type:"otAct",
                name:o.nombre+" Progreso actual"
            }
        }))


        return {
            datos: [mants, interrupciones, ots],
            results
        }
    }/*,
    create: async (data) => {
        return entity.create(data)
    },
    update: async (data) => {
        return entity.update(data, {where: {id: data.id}})
    },
    delete: async (id) => {
        return entity.destroy({where: {id}})
    }*/

}