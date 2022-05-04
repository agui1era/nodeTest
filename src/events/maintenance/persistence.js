const DataTypes = require("sequelize").DataTypes;
const sequelize = require("../../database/index")
const throwError = require("../../utils/throwError")
const _entity = require("../../database/models/mantencion");
const _entity2 = require("../../database/models/planta");
const _turno = require("../../database/models/turno");
const _interrupcion = require("../../database/models/interrupcion");
const _parada = require("../../database/models/parada");
const _maquina = require("../../database/models/maquina");
const _paradamaquina = require("../../database/models/paradamaquina");
const _mantinv = require("../../database/models/mantinventario");
const _inventario = require("../../database/models/inventario");
const moment = require("moment");
const {Op} = require("sequelize");

const _horarios = require("../../database/models/horarios");
const createNotification = require("../../utils/createNotification");

const horarios = _horarios(sequelize.sql, DataTypes);

const inventario = _inventario(sequelize.sql, DataTypes);
const paradamaquina = _paradamaquina(sequelize.sql, DataTypes);
const mantinv = _mantinv(sequelize.sql, DataTypes);
const entity = _entity(sequelize.sql, DataTypes);
const turno = _turno(sequelize.sql, DataTypes);
const entity2 = _entity2(sequelize.sql, DataTypes);
const interrupcion = _interrupcion(sequelize.sql, DataTypes);
const parada = _parada(sequelize.sql, DataTypes);
const maquina = _maquina(sequelize.sql, DataTypes);
module.exports = {
    getAll: (id) => {
        return entity.findAll({
            include: [
                {
                    model: interrupcion,
                    as: "idinterrupcion_interrupcion",
                    include: [
                        {
                            model: parada,
                            as: "tipo_parada",
                            include: [
                                {
                                    model: paradamaquina,
                                    as: "paradamaquinas",

                                },
                                {
                                    model: mantinv,
                                    as: "mantinventarios"

                                }
                            ]
                        }
                    ]
                }
            ],
            order: [["idinterrupcion_interrupcion", "horainicio", "desc"]]
        })
    },
    getAllByTurnAndHour: async (idturno, labelHora) => {
        let recordsResp = []

        let turnoRecord = await turno.findOne({
            where: {id: idturno},
            include: [
                {model: horarios, as: "idhorario_horario"}
            ]
        })
        if (turnoRecord) {
            let fechaQuery = moment(turnoRecord.horainicio)


            let horaInicioTurno = turnoRecord.idhorario_horario.horainicio.split(":")[0]
            let horaFinTurno = turnoRecord.idhorario_horario.horafin.split(":")[0]

            if (horaFinTurno <= horaInicioTurno) {
                if (labelHora >= 0 && labelHora < horaInicioTurno) {
                    fechaQuery.add(1, "day")
                }
                //el turno pasa las 00:00(diaanterior)
            }
            fechaQuery.hours(labelHora)

            let fechaQ = fechaQuery.toDate().getTime()

            //console.log(turnoRecord);
            let idmaquina = turnoRecord.idmaquina
            /*console.log(turnoRecord.horafin)
            console.log(turnoRecord.idhorario_horarios)
            console.log(moment(turnoRecord.horainicio).format("HH:mm"))
            console.log(moment(turnoRecord.horafin).format("HH:mm"))*/

            recordsResp = await entity.findAll({
                where: {
                    fecharealizada: {
                        [Op.gte]: moment(fechaQ).toDate().getTime(),
                        [Op.lt]: moment(fechaQ).add("1", "hours").toDate().getTime()
                    }
                },
                include: [
                    {
                        model: interrupcion,
                        as: "idinterrupcion_interrupcion",
                        include: [
                            {
                                model: parada,
                                as: "tipo_parada",
                                include: [
                                    {
                                        model: paradamaquina,
                                        as: "paradamaquinas",
                                        where: {
                                            idmaquina: idmaquina
                                        }

                                    }
                                ]
                            }
                        ]
                    }
                ]
            })


        }
        return recordsResp
    },
    getAllMaintenances: () => {
        return entity.findAll({
            include: [
                {
                    model: interrupcion,
                    as: "idinterrupcion_interrupcion",

                    include: [
                        {
                            model: parada,
                            as: "tipo_parada",
                            include: [
                                {
                                    model: paradamaquina,
                                    as: "paradamaquinas",

                                }
                                ,
                                {
                                    model: mantinv,
                                    as: "mantinventarios"

                                }
                            ]
                        }
                    ]
                }
            ]
        })
    },
    init: async (id,username,io) => {
        let entityReturned = {}
        try {
            let existent = await entity.findOne({where: {id}})

            if (existent) {
                let mantRecord = await entity.findOne({
                    where: {id},
                    include: [{
                        model: interrupcion,
                        as: "idinterrupcion_interrupcion",
                        include: [{model: parada, as: "tipo_parada"}]
                    }]
                })
                let maqRecord = await paradamaquina.findOne({
                    where:
                        {idparada: mantRecord.idinterrupcion_interrupcion.tipo},
                    include: [
                        {model: maquina, as: "idmaquina_maquina"}
                    ]
                })



                if (existent.fecharealizada) {

                    let dataFecha = new Date()
                    await entity.update({fecharealizadafin: dataFecha.getTime(),quientermina:username}, {where: {id}})
                    await createNotification(10,
                        `Orden de mantenimiento terminada`,
                        {parada: {id: mantRecord.idinterrupcion_interrupcion.tipo}},
                        maqRecord.idmaquina,io)

                    entityReturned = {fecha: dataFecha.getTime()}
                } else {

                    let dataFecha = new Date()
                    await entity.update({fecharealizada: dataFecha.getTime(),quienempieza:username}, {where: {id}})
                    await createNotification(9,
                        `Orden de mantenimiento comenzada`,
                        {parada: {id: mantRecord.idinterrupcion_interrupcion.tipo}},
                        maqRecord.idmaquina,io)
                    entityReturned = {fecha: dataFecha.getTime()}
                }
            }
        } catch (e) {
            console.log(e);
            console.log(getLine().default());

            throwError(500, e.name)
        }
        return entityReturned
    },
    create: async (data,io) => {
        let createdEntity = null
        try {
            createdEntity = await entity.create(data)
            let mantRecord = await entity.findOne({
                where: {id: createdEntity.id},
                include: [{
                    model: interrupcion,
                    as: "idinterrupcion_interrupcion",
                    include: [{model: parada, as: "tipo_parada"}]
                }]
            })
            let maqRecord = await paradamaquina.findOne({
                where:
                    {idparada: mantRecord.idinterrupcion_interrupcion.tipo},
                include: [
                    {model: maquina, as: "idmaquina_maquina"}
                ]
            })

            await createNotification(8,
                `Nueva orden de mantenimiento creada`,
                {parada: {id: mantRecord.idinterrupcion_interrupcion.tipo}},
                maqRecord.idmaquina,io)

        } catch (e) {
            throwError(500, e.name)
        }
        return createdEntity
    },


    restarInventario: async (data) => {

        let exstMantencion = await entity.findOne({where: {id: data.id}})

        if (exstMantencion.activo) {
            throwError(500, "ya activado")
        }

        let inventsOfDetention = await module.exports.inventarioDeParada(data.idparada)
        let inventoriesToUpdate = []
        if (inventsOfDetention) {
            for (let invmant of inventsOfDetention) {
                inventoriesToUpdate.push(await inventario.findOne({where: {id: invmant.idinventario}}))
            }

            for (let invmant of inventsOfDetention) {
                let inventoryExstObj = inventoriesToUpdate.find(o => o.id == invmant.idinventario)
                if ((inventoryExstObj.stock - invmant.cantidad) < 0) {
                    throwError(200, `Falta stock de ${inventoryExstObj.nombre} stock actual: ${inventoryExstObj.stock} stock requerido: ${invmant.cantidad} `)
                }
            }
            for (let invmant of inventsOfDetention) {
                let inventoryExstObj = inventoriesToUpdate.find(o => o.id == invmant.idinventario)
                await inventario.update({stock: inventoryExstObj.stock - invmant.cantidad}, {where: {id: inventoryExstObj.id}})
            }
            await entity.update({activo: true}, {where: {id: data.id}})


            return {ok: "ok"}
        }
        throwError(200, `no existen inventarios relacionados a la mantencion`)

    },

    sumarInventario: async (data) => {
        let exstMantencion = await entity.findOne({where: {id: data.id}})

        if (!exstMantencion.activo) {
            throwError(500, "ya desactivado")
        }
        let inventsOfDetention = await module.exports.inventarioDeParada(data.idparada)
        let inventoriesToUpdate = []
        if (inventsOfDetention) {

            for (let invmant of inventsOfDetention) {
                inventoriesToUpdate.push(await inventario.findOne({where: {id: invmant.idinventario}}))
            }
            for (let invmant of inventsOfDetention) {
                let inventoryExstObj = inventoriesToUpdate.find(o => o.id == invmant.idinventario)
                await inventario.update({stock: +inventoryExstObj.stock + +invmant.cantidad}, {where: {id: inventoryExstObj.id}})
            }
            await entity.update({activo: false}, {where: {id: data.id}})

            return {ok: "ok"}

        }
        throwError(200, `no existen inventarios relacionados a la mantencion`)


    },
    inventarioDeParada: async (idparada) => {

        let entities = await mantinv.findAll({
            where: {
                tipo: idparada
            }
        })

        return entities
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