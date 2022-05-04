const DataTypes = require("sequelize").DataTypes;
const sequelize = require("../../database/index")
const _entity = require("../../database/models/turno");
const _productoturno = require("../../database/models/productoturno");
const _ordendetrabajo = require("../../database/models/ordendetrabajo");
const _producto = require("../../database/models/producto");
const _iniciadorot = require("../../database/models/iniciadorot");
const _detalleproduccion = require("../../database/models/detproduccion");
const _diaspermitidos = require("../../database/models/diaspermitidos");
const _diashorarios = require("../../database/models/diashorarios");
const _ordendetrabajopausa = require("../../database/models/ordendetrabajopausa");
const _parada = require("../../database/models/parada");
const _interrupcion = require("../../database/models/interrupcion");
const _paradamaquina = require("../../database/models/paradamaquina");
const parada = _parada(sequelize.sql, DataTypes);
const paradamaquina = _paradamaquina(sequelize.sql, DataTypes);
const interrupcion = _interrupcion(sequelize.sql, DataTypes);
const _operador = require("../../database/models/operador");
const _turno = require("../../database/models/turno");
const _subproducto = require("../../database/models/subproducto");
const _horarios = require("../../database/models/horarios");
const _detturoperador = require("../../database/models/detturoperador");
const _maquina = require("../../database/models/maquina");
const _supervisorTurn = require("../../database/models/dettursupervisor");
const _operadorTurn = require("../../database/models/detturoperador");
const users = require("../users/usersPersistence")
const throwError = require("../../utils/throwError")
const {Op} = require('sequelize')
var moment = require('moment');
const h = require("../../utils/hour");

const entity = _entity(sequelize.sql, DataTypes);
const detturoperador = _detturoperador(sequelize.sql, DataTypes);
const maquina = _maquina(sequelize.sql, DataTypes);
const iniciadorot = _iniciadorot(sequelize.sql, DataTypes);
const ordendetrabajopausa = _ordendetrabajopausa(sequelize.sql, DataTypes);
const operadorTurn = _operadorTurn(sequelize.sql, DataTypes);
const subproducto = _subproducto(sequelize.sql, DataTypes);
const operador = _operador(sequelize.sql, DataTypes);
const ordendetrabajo = _ordendetrabajo(sequelize.sql, DataTypes);
const diaspermitidos = _diaspermitidos(sequelize.sql, DataTypes);
const horarios = _horarios(sequelize.sql, DataTypes);
const diashorarios = _diashorarios(sequelize.sql, DataTypes);
const turno = _turno(sequelize.sql, DataTypes);
const supervisorTurn = _supervisorTurn(sequelize.sql, DataTypes);
const productoturno = _productoturno(sequelize.sql, DataTypes);
const detalleproduccion = _detalleproduccion(sequelize.sql, DataTypes);
const producto = _producto(sequelize.sql, DataTypes);
const getLine = require("../../utils/getLine")
const createNotification = require("../../utils/createNotification");
const prodlogsPersistence = require('../prodlog/persistence')


module.exports = {
    getAll: () => {
        return entity.findAll()
    },
    getOperatorsByTurn: async id => {
        let results = await entity.findOne({
            where: {id},
            include: [{
                model: detturoperador,
                as: "detturoperadors",
                include: [{
                    model: operador,
                    as: "idoperador_operador"
                }]
            }]
        })

        return results.detturoperadors
    },
    getAllProductTurns: () => {
        return productoturno.findAll({
            include: [
                {
                    model: subproducto,
                    as: "idsubproducto_subproducto",
                },
                {
                    model: turno,
                    as: "idturno_turno",
                    include: [{
                        model: horarios,
                        as: "idhorario_horario"
                    }, {
                        model: maquina,
                        as: "idmaquina_maquina"
                    }, {
                        model: detturoperador,
                        as: "detturoperadors",
                        include: [{
                            model: operador,
                            as: "idoperador_operador"
                        }]
                    }

                    ]
                },
                {
                    model: detalleproduccion,
                    as: "detproduccions"
                }
            ],
            order: [["idturno_turno", 'horainicio', 'asc']],

        })
    },
    getAllProductTurnByTurn: (id) => {
        try {
            return productoturno.findAll({
                where: {
                    idturno: id
                },
                include: [
                    {
                        model: subproducto,
                        as: "idsubproducto_subproducto",
                    },
                    {
                        model: ordendetrabajo,
                        as: "idordendetrabajo_ordendetrabajo",
                    },

                ]
                /*   include: [
                       {
                           model: producto,
                           as:"idprodturn_productoturno",
                           where: {idturno: id},
                           include:[
                               {
                                   model:producto,
                                   as:"idproducto_producto"
                               }
                           ]
                       }
                   ]*/
            })

        } catch (e) {
            console.log(e);
            console.log(getLine().default());

        }
    },
    getAllProductionByTurn: async (id) => {
        let horasPermitidas = []
        let resp = []
        let data = {}
        let turnoRecord = await turno.findOne({
            where: {id},
            include: [
                {
                    model: horarios,
                    as: "idhorario_horario"
                }
            ]
        })

        if (turnoRecord) {

            let fechaAux = moment().hour(turnoRecord.idhorario_horario.horainicio.split(":")[0])
            /* console.log(fechaAux.format('HH'))
             console.log(fechaAux.format('HH:mm'))
            */
            while (fechaAux.format('HH') != turnoRecord.idhorario_horario.horafin.split(":")[0]) {
                horasPermitidas.push({h: fechaAux.format('HH'), dateH: moment(fechaAux.toDate().getTime()).minute(0)})
                fechaAux = fechaAux.add(1, "minute")
                /* console.log(fechaAux.format('HH:mm') )
                */ /*console.log(fechaAux.format('HH') )
                console.log("qqq");*/
            }
            resp = await detalleproduccion.findAll({
                include: [
                    {
                        model: productoturno,
                        as: "idprodturn_productoturno",
                        where: {idturno: id},
                        include: [
                            {
                                model: subproducto,
                                as: "idsubproducto_subproducto"

                            },
                            {
                                model: turno,
                                as: "idturno_turno"

                            },
                            {
                                model: ordendetrabajo,
                                as: "idordendetrabajo_ordendetrabajo",
                            },
                        ]
                    }
                ]
            })

            resp = resp.filter(o => horasPermitidas.find(oo => {
                return oo.h == o.hora.split(":")[0]
            }))
            resp = resp.map(o => {

                return {...o.dataValues, dateH: horasPermitidas.find(oo => oo.h == o.hora.split(":")[0])?.dateH}
            })

            if (resp.length > 1) {
                data.total = resp.map(o => o.cantidad).reduce((a, b) => +a + +b);
            } else if (resp.length == 1) {
                data.total = resp.map(o => o.cantidad)[0]
            } else {
                data.total = 0
            }
            data.total = parseInt(data.total)
            data.nRegistros = resp.length
            data.data = resp
        }

        return data
    },
    getAllProductionByProductTurn: async (id) => {
        let prodTurnRecord = await productoturno.findOne({
            where: {
                id
            }
        })
        if (prodTurnRecord) {
            let turnoProdTurnoRecord = await turno.findOne({
                where: {id: prodTurnRecord.idturno},
                include: [
                    {
                        model: horarios,
                        as: "idhorario_horario"
                    }
                ]
            })
            let horasPermitidas = []
            let fechaAux = moment(Date.now()).hour(turnoProdTurnoRecord.idhorario_horario.horainicio.split(":")[0])
            while (fechaAux.format('HH') != turnoProdTurnoRecord.idhorario_horario.horafin.split(":")[0]) {
                horasPermitidas.push(fechaAux.format('HH'))
                fechaAux.add(1, "hours")
            }

            let resp = await detalleproduccion.findAll({
                where: {
                    idprodturn: id
                }
                /*include: [
                    {
                        model: productoturno,
                        as: "idprodturn_productoturno",
                        where: {idturno: id},
                        include: [
                            {
                                model: producto,
                                as: "idproducto_producto"
                            }
                        ]
                    }
                ]*/
            })
            resp = resp.filter(o => horasPermitidas.find(oo => oo == o.hora.split(":")[0]))
            let data = {}
            if (resp.length > 1) {
                data.total = resp.map(o => o.cantidad).reduce((a, b) => +a + +b);
            } else if (resp.length == 1) {
                data.total = resp.map(o => o.cantidad)[0]
            } else {
                data.total = 0
            }
            data.total = parseInt(data.total)
            data.nRegistros = resp.length
            data.data = resp
            return data


        }

    },
    getAllDetentionsByTurn: (id) => {
        return parada.findAll({
            where: {
                idprodturn: id
            }
            /*include: [
                {
                    model: productoturno,
                    as: "idprodturn_productoturno",
                    where: {idturno: id},
                    include: [
                        {
                            model: producto,
                            as: "idproducto_producto"
                        }
                    ]
                }
            ]*/
        })
    },
    getInitedTurnByMachine: (id) => {
        return entity.findOne({
            order: [["horainicio", "DESC"]],
            where: {
                idmaquina: id,
                horafin: null
                //  dia: data.dia
            },
            include: [{model: maquina, as: "idmaquina_maquina"}, {model: horarios, as: "idhorario_horario"}]
        })
    },
    getTurnByMachineAndDay: (data) => {
        return entity.findAll({
            order: [["horainicio", "DESC"]],
            where: {
                idmaquina: data.idmaquina,
                //  dia: data.dia
            },
            include: [{model: maquina, as: "idmaquina_maquina"}, {model: horarios, as: "idhorario_horario"}]
        })
    },
    getTurnByMachineAndDayAndHourHand: (data) => {
        return entity.findOne({
            where: {
                idmaquina: data.idmaquina,
                dia: data.dia,
                horario: data.horario
            }
        })
    },
    getPendingsByUser: async (data) => {
        let userPersisted = await users.getUserByUsername(data)
        if (!userPersisted) {
            throwError(500, "bad rol")
        }
        switch (data.role) {
            case "supervisor":

                return supervisorTurn.findAll({
                    include: [{
                        model: entity,
                        as: 'idturno_turno',

                        include: [{model: maquina, as: "idmaquina_maquina"}, {
                            model: horarios,
                            as: "idhorario_horario"
                        }]
                    }], where: {idsupervisor: userPersisted.id, horafin: null}
                })
            case "operador":
                return operadorTurn.findAll({
                    include: [{
                        model: entity,
                        as: 'idturno_turno',

                        include: [{model: maquina, as: "idmaquina_maquina"}, {
                            model: horarios,
                            as: "idhorario_horario"
                        }]
                    }], where: {idoperador: userPersisted.id, horafin: null}
                })
        }
    },
    getAllowedHoursByTurn: async idTurn => {
        let turnoRecord = await turno.findOne({
            where: {id: idTurn}, include: [{
                model: horarios,
                as: "idhorario_horario"
            }]
        })
        let fechaInicio = moment(turnoRecord.horainicio)
        turnoRecord.dataValues.horasPermitidas = []
        let ultimaHora = turnoRecord.horafin == null ?
            moment(Date.now()).format("HH") :
            moment(turnoRecord.horafin).format("HH")
        while (fechaInicio.format("HH") != ultimaHora) {
            turnoRecord.dataValues.horasPermitidas.push(fechaInicio.format("HH:00"))
            fechaInicio.add(1, 'h')
        }
        if (turnoRecord.horafin == null) {
            turnoRecord.dataValues.horasPermitidas.push(moment(Date.now()).format("HH:mm"))
        }
        return turnoRecord

    },
    getBloqueByHour: async (data, dia = null) => {

        let hora = new Date(data)
        let resp = await horarios.findAll({where: {borrado: null}})
        if (dia) {
            let diaRecord = await diaspermitidos.findOne({where: {num: moment(dia).format("d")}})
            let horariosDelDia = await diashorarios.findAll({
                where: {iddiaspermitidos: diaRecord.id,}, include: [{
                    model: horarios,
                    as: "idhorarios_horarios"
                }]
            })
            resp = horariosDelDia.map(o => o.idhorarios_horarios.dataValues)
        }

        let horario = false

        //console.log(hora.getTime());
        for (let h of resp) {
            /* if (hora.getHours() >= h.horainicio.substring(0, 2)) {
                 horario = h
             }*/
            //console.log(h.horainicio);
            //console.log(h.horafin);
            let fIni = moment().hours(h.horainicio.split(":")[0]).minutes(0).seconds(0).milliseconds(0).toDate().getTime()
            let fFin = h.horainicio.split(":")[0] > h.horafin.split(":")[0] ?
                moment().hours(h.horafin.split(":")[0]).minutes(0).seconds(0).milliseconds(0).add(1, 'd').toDate().getTime()
                :
                moment().hours(h.horafin.split(":")[0]).minutes(0).seconds(0).milliseconds(0).toDate().getTime()
            /*console.log(fIni);
            console.log(fFin);
            console.log(hora.getTime() >= fIni && hora.getTime() < fFin)*/
            if (hora.getTime() >= fIni && hora.getTime() < fFin) {
                horario = h
            }
        }
        if (!horario) {
            for (let h of resp) {
                /* if (hora.getHours() >= h.horainicio.substring(0, 2)) {
                     horario = h
                 }*/
                /*console.log(h.horainicio);
                console.log(h.horafin);*/
                let fIni = moment().hours(h.horainicio.split(":")[0]).minutes(0).seconds(0).milliseconds(0).subtract(1, 'd').toDate().getTime()
                let fFin = h.horainicio.split(":")[0] > h.horafin.split(":")[0] ?
                    moment().hours(h.horafin.split(":")[0]).minutes(0).seconds(0).milliseconds(0).subtract(1, 'd').add(1, 'd').toDate().getTime()
                    :
                    moment().hours(h.horafin.split(":")[0]).minutes(0).seconds(0).milliseconds(0).subtract(1, 'd').toDate().getTime()
                /* console.log(fIni);
                 console.log(fFin);
                 console.log(hora.getTime() >= fIni && hora.getTime() < fFin)*/
                if (hora.getTime() >= fIni && hora.getTime() < fFin) {
                    horario = h
                    horario.diaAnterior = true;
                }
            }
        }

        return horario
    },
    createOrGetTurnOfNowOfMachine: async (idmaquina, idordendetrabajo = null, userData = {}, io) => {

        let respTurn = {}
        let machineR = await maquina.findOne({where: {id: idmaquina}})
        //let hora = await h.hora()
        let bloqueH = await module.exports.getBloqueByHour(Date.now())
        if (!bloqueH) {
            throwError("500", "no existe un turno")
        }
        let dia = {
            dia: bloqueH.diaAnterior ?
                moment().subtract(1, 'd').toDate().toISOString()
                :
                moment().toDate().toISOString(),
        }
        bloqueH = await module.exports.getBloqueByHour(moment(dia.dia).hours(bloqueH.horainicio.split(":")[0]).minutes(0).toDate().getTime(), dia.dia)
        if (!bloqueH) {
            throwError("500", "no existe un turno")
        }

        let horaTurnoEntrante = ""
        let horaFinalTurnoEntrante = ""

        if (!bloqueH.diaAnterior) {
            horaTurnoEntrante = moment()
                .hours(bloqueH.horainicio.split(":")[0])
                .minutes(0).milliseconds(0).seconds(0)
                .toDate().getTime()
            horaFinalTurnoEntrante = bloqueH.horainicio.split(":")[0] > bloqueH.horafin.split(":")[0] ? moment()
                .hours(bloqueH.horafin.split(":")[0])
                .minutes(0).milliseconds(0).seconds(0).add(1, "d")
                .toDate().getTime() : moment()
                .hours(bloqueH.horafin.split(":")[0])
                .minutes(0).milliseconds(0).seconds(0)
                .toDate().getTime()
        } else {

            horaTurnoEntrante = moment()
                .hours(bloqueH.horainicio.split(":")[0])
                .minutes(0).milliseconds(0).subtract(1, 'd').seconds(0)
                .toDate().getTime()
            horaFinalTurnoEntrante = bloqueH.horainicio.split(":")[0] > bloqueH.horafin.split(":")[0] ? moment()
                .hours(bloqueH.horafin.split(":")[0])
                .minutes(0).milliseconds(0).seconds(0)
                .toDate().getTime() : moment()
                .hours(bloqueH.horafin.split(":")[0])
                .minutes(0).milliseconds(0).seconds(0)
                .toDate().getTime()
        }
        let dataTurnoExistente = await turno.findOne({
            where: {
                idmaquina,
                horainicio: {
                    [Op.gte]: horaTurnoEntrante,
                    [Op.lt]: horaFinalTurnoEntrante
                }
            }
        })
        if (dataTurnoExistente) {
            if (idordendetrabajo) {
                let productoTurnoActivo = await productoturno.findOne({
                    where: {
                        idturno: dataTurnoExistente.id,
                        activoenturno: true
                    }, include: [
                        {model: turno, as: "idturno_turno"},
                        {model: ordendetrabajo, as: "idordendetrabajo_ordendetrabajo"}]
                })
                if (productoTurnoActivo?.idordendetrabajo) {
                    if (idordendetrabajo == productoTurnoActivo?.idordendetrabajo &&
                        productoTurnoActivo?.idordendetrabajo_ordendetrabajo?.estado != null &&
                        productoTurnoActivo?.idordendetrabajo_ordendetrabajo?.estado != "Comenzar") {
                        await productoturno.update({activoenturno: false}, {where: {id: productoTurnoActivo.id}})
                        await ordendetrabajo.update({estado: "Pausado"}, {where: {id: idordendetrabajo}})
                        await ordendetrabajopausa.create({
                            idordendetrabajo: idordendetrabajo,
                            horainicio: Date.now(),
                        })

                        let idMachine = productoTurnoActivo.idturno_turno.idmaquina
                        let entity = {
                            nombre: "Cambio de producto",
                            idmaqrel: idMachine.toString()
                        }
                        let okParada = await parada.findOrCreate({where: entity})
                        let findParadaMaquina = {
                            idparada: okParada[0].id,
                            idmaquina: idMachine

                        }
                        let okParadaMaquina = await paradamaquina.findOrCreate({where: findParadaMaquina})
                        let interru = {
                            horainicio: Date.now(),
                            duracion: "0",
                            tipo: okParada[0].id,
                            comentario: "Realización de cambio de producto",
                            idturno: productoTurnoActivo.idturno

                        }
                        await interrupcion.create(interru)


                        /*  "pausar"*/
                    } else {
                        await ordendetrabajo.update({estado: "Comenzado"}, {where: {id: idordendetrabajo}})

                    }


                } else {


                    let ordendetrabajoRecord = await ordendetrabajo.findOne({
                        where: {id: idordendetrabajo},
                        include: [{
                            model: subproducto,
                            as: "idsubproducto_subproducto"
                        }]
                    })
                    if (productoTurnoActivo) {
                        await productoturno.update({activoenturno: false}, {where: {id: productoTurnoActivo.id}})

                    } else {

                    }
                    let nSerie

                    if (ordendetrabajoRecord) {
                        nSerie = ordendetrabajoRecord.dataValues.codigo
                        await iniciadorot.create({
                            username: userData.username,
                            idordendetrabajo,
                            creador: `${userData.nombre} ${userData.apellido}`
                        })
                        await ordendetrabajo.update({
                            horainicioaccion: Date.now(),
                            quiencomienzauser: userData.username,
                            quiencomienza: `${userData.nombre} ${userData.apellido}`
                        }, {where: {id: idordendetrabajo}})

                        ordendetrabajoRecord = await ordendetrabajo.findOne({
                            where: {id: idordendetrabajo},
                            include: [{
                                model: subproducto,
                                as: "idsubproducto_subproducto"
                            }]
                        })
                        await ordendetrabajo.update({estado: "Comenzado"}, {where: {id: idordendetrabajo}})

                        await createNotification(2,
                            `Ha comenzado una Orden de trabajo`,
                            {ot: ordendetrabajoRecord},
                            ordendetrabajoRecord.idmaquina, io)
                    }

                    if (ordendetrabajoRecord.dataValues.estado == 'Pausado') {
                        let pausaRecord = await ordendetrabajopausa.findOne({
                            where: {
                                idordendetrabajo, horareanuda: null
                            }
                        })
                        if (pausaRecord) {
                            await ordendetrabajopausa.update({horareanuda: Date.now()}, {where: {id: pausaRecord.id}})

                        }
                        let prodTurn = await productoturno.findOne({
                            where: {
                                idordendetrabajo,
                                idturno: dataTurnoExistente.id,

                            }
                        })

                        let idMachine = idmaquina
                        let entity = {
                            nombre: "Cambio de producto",
                            idmaqrel: idMachine.toString()
                        }
                        let okParada = await parada.findOrCreate({where: entity})

                        let intInconclusa = await interrupcion.findOne({
                            where: {
                                duracion: "0",
                                tipo: okParada[0].id,
                                comentario: "Realización de cambio de producto",
                            }
                        })
                        if (intInconclusa) {
                            await interrupcion.update({
                                duracion: moment.duration(moment(Date.now()).diff(moment(intInconclusa.horainicio))).asSeconds().toString()
                            }, {where: {id: intInconclusa.id}})

                        }


                    }
                    if (ordendetrabajoRecord.dataValues.estado == 'Comenzar') {
                        await ordendetrabajo.update({horainicioaccion: Date.now()}, {where: {id: idordendetrabajo}})
                        let idMachine = idmaquina
                        let entity = {
                            nombre: "Cambio de producto",
                            idmaqrel: idMachine.toString()
                        }
                        let okParada = await parada.findOrCreate({where: entity})

                        let intInconclusa = await interrupcion.findOne({
                            where: {
                                duracion: "0",
                                tipo: okParada[0].id,
                                comentario: "Realización de cambio de producto",
                            }
                        })
                        if (intInconclusa) {
                            await interrupcion.update({
                                duracion: moment.duration(moment(Date.now()).diff(moment(intInconclusa.horainicio))).asSeconds().toString()
                            }, {where: {id: intInconclusa.id}})

                        }

                    }
                    let productoTurnoCreado = await productoturno.create({
                        idsubproducto: ordendetrabajoRecord.dataValues.idsubproducto_subproducto.id,
                        formato: ordendetrabajoRecord.dataValues.formatoelegido,
                        formatounidad: ordendetrabajoRecord.dataValues.unidadelegida,
                        cantidadesperada: ordendetrabajoRecord.dataValues.cantidadesperada,
                        condicion: ordendetrabajoRecord.dataValues.condicionelegida,
                        idturno: dataTurnoExistente.id,
                        serie: nSerie,
                        idordendetrabajo,
                        activoenturno: true

                    })
                    /* "si es pausado setiar hora reanuda"
                     "si es comenzar setiar horainicioaccion"
                     "orden de trabajo comenzado"*/
                }
            }


            respTurn = dataTurnoExistente
        } else {
            let createdTurn = await turno.create({
                idmaquina,
                horainicio: horaTurnoEntrante,
                idhorario: bloqueH.id,
                horastotales: parseInt(bloqueH.horasdelturno),
                dia: bloqueH.diaAnterior ?
                    moment().subtract(1, 'd').toDate().toISOString()
                    :
                    moment().toDate().toISOString(),
            })


            if (idordendetrabajo) {
                console.log("ID ORDEN DE TRABAJO");
                let ordendetrabajoRecord = await ordendetrabajo.findOne({
                    where: {id: idordendetrabajo},
                    include: [{
                        model: subproducto,
                        as: "idsubproducto_subproducto"
                    }]
                })
                if (ordendetrabajoRecord.dataValues.estado == 'Pausado') {
                    let pausaRecord = await ordendetrabajopausa.findOne({
                        where: {
                            idordendetrabajo, horareanuda: null
                        }
                    })
                    await ordendetrabajopausa.update({horareanuda: Date.now()}, {where: {id: pausaRecord.id}})
                    await ordendetrabajo.update({horainicioaccion: Date.now()}, {where: {id: ordendetrabajoRecord.dataValues.id}})

                    let idMachine = idmaquina
                    let entity = {
                        nombre: "Cambio de producto",
                        idmaqrel: idMachine.toString()
                    }
                    let okParada = await parada.findOrCreate({where: entity})

                    let intInconclusa = await interrupcion.findOne({
                        where: {
                            duracion: "0",
                            tipo: okParada[0].id,
                            comentario: "Realización de cambio de producto",
                        }
                    })
                    if (intInconclusa) {
                        await interrupcion.update({
                            duracion: moment.duration(moment(Date.now()).diff(moment(intInconclusa.horainicio))).asSeconds().toString()
                        }, {where: {id: intInconclusa.id}})
                    }


                }
                if (ordendetrabajoRecord.dataValues.estado == 'Comenzar') {
                    await ordendetrabajo.update({horainicioaccion: Date.now()}, {where: {id: idordendetrabajo}})
                }
                if (ordendetrabajoRecord.dataValues.estado == 'Pausado') {

                    let idMachine = idmaquina
                    let entity = {
                        nombre: "Cambio de producto",
                        idmaqrel: idMachine.toString()
                    }
                    let okParada = await parada.findOrCreate({where: entity})

                    let intInconclusa = await interrupcion.findOne({
                        where: {
                            duracion: "0",
                            tipo: okParada[0].id,
                            comentario: "Realización de cambio de producto",
                        }
                    })
                    if (intInconclusa) {
                        await interrupcion.update({
                            duracion: moment.duration(moment(Date.now()).diff(moment(intInconclusa.horainicio))).asSeconds().toString()
                        }, {where: {id: intInconclusa.id}})
                    }

                }

                let productoTurnoCreado = await productoturno.create({
                    idsubproducto: ordendetrabajoRecord.dataValues.idsubproducto_subproducto.id,
                    idturno: createdTurn.id,
                    formato: ordendetrabajoRecord.dataValues.formatoelegido,
                    formatounidad: ordendetrabajoRecord.dataValues.unidadelegida,
                    cantidadesperada: ordendetrabajoRecord.dataValues.cantidadesperada,
                    serie: ordendetrabajoRecord.dataValues.codigo,
                    condicion: ordendetrabajoRecord.dataValues.condicionelegida,
                    idordendetrabajo,
                    activoenturno: true
                })


                await iniciadorot.create({
                    username: userData.username,
                    idordendetrabajo,
                    creador: `${userData.nombre} ${userData.apellido}`
                })
                await ordendetrabajo.update({horainicioaccion: Date.now()}, {where: {id: idordendetrabajo}})

                ordendetrabajoRecord = await ordendetrabajo.findOne({
                    where: {id: idordendetrabajo},
                    include: [{
                        model: subproducto,
                        as: "idsubproducto_subproducto"
                    }]
                })
                await ordendetrabajo.update({
                    estado: "Comenzado",
                    quiencomienzauser: userData.username,
                    quiencomienza: `${userData.nombre} ${userData.apellido}`
                }, {where: {id: idordendetrabajo}})

                await createNotification(2,
                    `Ha comenzado una Orden de trabajo`,
                    {ot: ordendetrabajoRecord},
                    ordendetrabajoRecord.idmaquina, io)

            } else {
                let productoTurnoCreado = await productoturno.create({
                    idsubproducto: null,
                    idturno: createdTurn.id,
                    activoenturno: true
                })
            }

            let persistedCreatedTurn = turno.findOne({where: {id: createdTurn.id}})
            respTurn = persistedCreatedTurn
        }

        return respTurn;


        /*let fecha = new Date(data)



        console.log(exstTurn);
        let hoyTurnos = await turno.findOne({
            where: {
                horainicio: {
                    [Op.lte]: moment().toDate()
                }
            }
        })
        console.log(hoyTurnos);
*/

    },
    create: async (data) => {
        return entity.create(data)
    },
    createTurnProduct: async (data, dataTurno = false) => {
        let createdEntity = null
        console.log(data);
        if (dataTurno) {
            if (data.idordendetrabajo) {

                let otByName = await ordendetrabajo.findOne({where: {nombre: data.idordendetrabajo}})
                data.idordendetrabajo = otByName.id
            }
            let machByName = await maquina.findOne({where: {nombre: data.idmaquina}})
            data.idmaquina = machByName.id
            console.log(data.horainicio);
            data.horainicio = new Date(data.horainicio)
            console.log(data.horainicio);

            let turnRecordByData = await turno.findOne({
                where: {
                    idhorario: data.idhorario,
                    horainicio: data.horainicio,
                    dia: data.dia,
                    idmaquina: data.idmaquina
                }
            })
            data.idturno = turnRecordByData.id
            let spByName = await subproducto.findOne({where: {nombre: data.idsubproducto}})
            data.idsubproducto = spByName.id
        }
        try {
            let existente = await productoturno.findOne({
                where: {
                    idturno: data.idturno,
                    activoenturno: true
                }
            })
            if (existente) {
                let exstObj = {...existente.dataValues}
                await productoturno.update({
                    ...exstObj,
                    activoenturno: false
                }, {where: {id: exstObj.id}})
            }


            data.activoenturno = true;
            createdEntity = await productoturno.create(data)


        } catch (e) {
            console.log(e);
            throwError(500, e.name)
        }
        return createdEntity
    },
    editTurnProduct: async (data) => {
        if (data.mermas) {
            /* let existentPtRecord = await productoturno.findOne({
                 where: {
                     id: data.id
                 },
                 include: [{
                     model: subproducto,
                     as: "idsubproducto_subproducto"
                 }]
             })

             let turnoRecordExistentpt = await turno.findOne({
                 where: {id: existentPtRecord.idturno}, include: [{
                     model: horarios, as: 'idhorario_horario'
                 }, {model: maquina, as: 'idmaquina_maquina'}]
             })


             let logRegisterData = {
                 ts: turnoRecordExistentpt.horainicio,
                 cantidad: data.mermas,
                 horasdelturno: turnoRecordExistentpt.idhorario_horario.horasdelturno,
                 maquina: turnoRecordExistentpt.idmaquina,
                 horario: turnoRecordExistentpt.idhorario,
                 turno: turnoRecordExistentpt.id,
                 producto: existentPtRecord.idsubproducto_subproducto.idproducto,
                 subproducto: existentPtRecord.idsubproducto,
                 modo: "merma",
             }
             let regLog = await prodlogsPersistence.registerProd(logRegisterData)
 */
        }
        let updatedEntity = null
        try {
            updatedEntity = await productoturno.update(data, {
                where: {
                    id: data.id
                }
            })
        } catch (e) {
            throwError(500, e.name)
        }
        return updatedEntity
    },
    deleteTurnProduct: async (id) => {
        let entity = null
        let ptRecord = await productoturno.findOne({
            where: {
                id
            }
        })

        try {
            entity = await productoturno.destroy({
                where: {
                    id
                }
            })
            if (ptRecord.idordendetrabajo) {
                let ptOfThisOrder = await productoturno.findAll({
                    where:
                        {idturno: ptRecord.idturno, idordendetrabajo: ptRecord.idordendetrabajo}
                })
                for (let pt of ptOfThisOrder) {
                    await productoturno.destroy({
                        where: {
                            id: pt.id
                        }
                    })
                }
            }

            let ptOfTurns = await productoturno.findAll({where: {idturno: ptRecord.idturno}})
            if (ptOfTurns?.length > 0) {
                await productoturno.update({activoenturno: true}, {
                    where: {id: ptOfTurns[0].id}
                })
            }

        } catch (e) {
            console.log(e);
            throwError(500, e.name)
        }
        return entity
    },
    checkProductoOfTurn: async (data) => {
        return productoturno.findOne({
            where: {
                idproducto: data.idproducto,
                idturno: data.idturno
            }
        })
    },
    updateDetProduction: async (data) => {
        let existent = await detalleproduccion.findOne({
            where: {
                hora: data.hora,
                idprodturn: data.idprodturn
            }

        })
        if (existent) {
            return detalleproduccion.update(data, {
                where: {
                    id: existent.dataValues.id
                }
            })
        } else {
            return detalleproduccion.create(data)
        }
    },
    deleteDetProduction: async (id) => {
        return detalleproduccion.destroy({where: {id}})
    },
    createDetProduction: async (data, idpt = false) => {
        if (idpt) {
            data.horainicio = new Date(data.horainicio)

            let maqByName = await maquina.findOne({where: {nombre: data.idmaquina}})
            let spByName = await subproducto.findOne({where: {nombre: data.idsubproducto}})
            let otByName = await ordendetrabajo.findOne({where: {nombre: data.idordendetrabajo}})
            let turnoByName = await turno.findOne({
                where: {
                    idhorario: data.idhorario,
                    horainicio: data.horainicio,
                    dia: data.dia,
                    idmaquina: maqByName.id
                }
            })
            let ptByName = await productoturno.findOne({
                where: {
                    idturno: turnoByName.id,
                    idsubproducto: spByName.id,
                    idordendetrabajo: otByName.id,
                    formato: data.formato,
                    formatounidad: data.formatounidad,
                    condicion: data.condicion,

                }
            })
            data.idprodturn = ptByName.id

        }
        let entity = null
        let aRestar = 0
        try {
            let prodTurn = await productoturno.findOne({
                where: {id: data.idprodturn}, include: [{
                    model: subproducto,
                    as: "idsubproducto_subproducto"
                }]
            })
            await productoturno.update({velocidad: data.cantidad}, {where: {id: data.idprodturn}})

            let existenteHora = await detalleproduccion.findOne({
                where: {
                    hora: data.hora,
                },
                include: [{
                    model: productoturno,
                    as: "idprodturn_productoturno",
                    where: {
                        idturno: prodTurn.idturno,
                        idordendetrabajo: prodTurn.idordendetrabajo
                    }
                }]
            })
            if (existenteHora) {
                await detalleproduccion.destroy({where: {id: existenteHora.id}})
                aRestar = existenteHora.cantidad
            }


            let turnoRecordExistentpt = await turno.findOne({
                where: {id: prodTurn.idturno}, include: [{
                    model: horarios, as: 'idhorario_horario'
                }, {model: maquina, as: 'idmaquina_maquina'}]
            })

            let tsLog = 0
            if (data.hora.split(':')[0] < moment(turnoRecordExistentpt.horainicio).format("HH")) {
                tsLog = moment(turnoRecordExistentpt.horainicio).add(1, "d").hours(data.hora.split(':')[0]).toDate().getTime()
            } else {
                tsLog = moment(turnoRecordExistentpt.horainicio).hours(data.hora.split(':')[0]).toDate().getTime()
            }
            let ptActiveOfTurno = await productoturno.findOne(
                {
                    where:
                        {idturno: turnoRecordExistentpt.id, activoenturno: true}
                })
            let horasOt = null
            if (ptActiveOfTurno.idordendetrabajo) {
                let otRecord = await ordendetrabajo.findOne({where: {id: ptActiveOfTurno.idordendetrabajo}})
                horasOt = otRecord.tiempototal
            }
            let logRegisterData = {
                ts: tsLog,
                cantidad: data.cantidad,
                horasdelturno: turnoRecordExistentpt.idhorario_horario.horasdelturno,
                maquina: turnoRecordExistentpt.idmaquina,
                ordendetrabajo: ptActiveOfTurno?.idordendetrabajo,
                ordendetrabajotiempo: horasOt,
                horario: turnoRecordExistentpt.idhorario,
                turno: turnoRecordExistentpt.id,
                turnotiempo: turnoRecordExistentpt.horastotales,
                producto: prodTurn.idsubproducto_subproducto.idproducto,
                subproducto: prodTurn.idsubproducto,
                modo: "manual",
            }
            let regLog = await prodlogsPersistence.registerProd(logRegisterData)

            entity = await detalleproduccion.create(data)
            let recordDetalleP = await detalleproduccion.findOne({
                where: {id: entity.id}, include: [{
                    model: productoturno,
                    as: "idprodturn_productoturno",
                }]
            })
            let ordendetrabajoRecord = await ordendetrabajo.findOne({where: {id: recordDetalleP.idprodturn_productoturno.idordendetrabajo}})
            if (ordendetrabajoRecord) {
                await ordendetrabajo.update({
                    cantidadactual: +(+ordendetrabajoRecord.cantidadactual + +data.cantidad) - +aRestar

                }, {where: {id: recordDetalleP.idprodturn_productoturno.idordendetrabajo}})
                ordendetrabajoRecord = await ordendetrabajo.findOne({where: {id: recordDetalleP.idprodturn_productoturno.idordendetrabajo}})

                if (ordendetrabajoRecord.cantidadactual >= ordendetrabajoRecord.cantidadesperada &&
                    ordendetrabajoRecord.horafincorte == null) {
                    await ordendetrabajo.update({
                        horafincorte: Date.now()
                    }, {where: {id: ordendetrabajoRecord.id}})
                }
            }


            /*    let existent = await detalleproduccion.findOne({
                    where: {
                        hora: data.hora,
                        idprodturn: data.idprodturn
                    }
                })
                console.log(existent);
                if (existent) {
                    entity = await detalleproduccion.update(data, {
                        where: {
                            id: existent.dataValues.id
                        }
                    })
                } else {
                    entity = await detalleproduccion.create(data)
                }*/
        } catch (e) {
            throwError(500, e.name)
        }
        return entity

    },
    endTurn: async (data) => {

        let user = {}
        let endedTurn = {}
        //let hora = await h.hora()
        switch (data.role) {
            case "supervisor":
                user = await users.getUserByUsername(data.username)
                await supervisorTurn.update({horafin: Date.now()}, {where: {id: data.id}})
                endedTurn = await supervisorTurn.findOne({where: {id: data.id}})
                //await entity.update({horafin: Date.now()}, {where: {id: endedTurn.dataValues.idturno}})
                return endedTurn
            case "operador":
                user = await users.getUserByUsername(data.username)
                await operadorTurn.update({horafin: Date.now()}, {where: {id: data.id}})
                endedTurn = await operadorTurn.findOne({where: {id: data.id}})
                //await entity.update({horafin: Date.now()}, {where: {id: endedTurn.dataValues.idturno}})
                return endedTurn

        }
    },
    initTurnDetailsByRole: async (data) => {
        switch (data.role) {
            case "supervisor":
                let user = await users.getUserByUsername(data)
                let turnoEncontrado = await supervisorTurn.findOne({where: {idturno: data.idturno}})
                let turnoRecord = await turno.findOne({where: {id: data.idturno}})
                if (turnoEncontrado) {
                    await supervisorTurn.update({horafin: null}, {where: {id: turnoEncontrado.id}})
                    return {...turnoEncontrado.dataValues, ...turnoRecord.dataValues}
                } else {
                    data.idsupervisor = user.dataValues.id
                    return {...(await supervisorTurn.create(data)).dataValues, ...turnoRecord.dataValues}
                }

            case "operador":
                let op = await users.getUserByUsername(data)
                let turnoEncontradoO = await operadorTurn.findOne({
                    where: {
                        idturno: data.idturno,
                        idoperador: op.dataValues.id
                    }
                })
                let turnoRecordO = await turno.findOne({where: {id: data.idturno}})
                if (turnoEncontradoO) {
                    await operadorTurn.update({horafin: null}, {where: {id: turnoEncontradoO.id}})
                    return {...turnoEncontradoO.dataValues, ...turnoRecordO.dataValues}
                } else {
                    data.idoperador = op.dataValues.id
                    return {...(await operadorTurn.create(data)).dataValues, ...turnoRecordO.dataValues}
                }

        }
        return entity.findOne({where: {id: data.idturno}})
    },
    update: async (data) => {
        return entity.update(data, {where: {id: data.id}})
    },
    delete: async (id) => {
        return entity.destroy({where: {id}})
    }

}