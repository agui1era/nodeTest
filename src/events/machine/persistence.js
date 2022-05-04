const DataTypes = require("sequelize").DataTypes;
const sequelize = require("../../database/index")
const throwError = require("../../utils/throwError")
const _entity = require("../../database/models/maquina");
const _productoturno = require("../../database/models/productoturno");
const _detproduccion = require("../../database/models/detproduccion");
const _sensor = require("../../database/models/sensor");
const _mantencion = require("../../database/models/mantencion");
const _entity2 = require("../../database/models/proceso");
const _entity3 = require("../../database/models/planta");
const _interrupcion = require("../../database/models/interrupcion");
const _entity4 = require("../../database/models/producto");
const _production = require("../../database/models/produccionmaquina");
const _parada = require("../../database/models/parada");
const _categoriasensor = require("../../database/models/categoriasensor");
const _sensordata = require("../../database/models/sensordata");
const _categoriadeparada = require("../../database/models/categoriadeparada");
const _paradamaquina = require("../../database/models/paradamaquina");
const _turno = require("../../database/models/turno");
const {Op, Sequelize} = require("sequelize");
const hour = require("../../utils/hour");
const moment = require("moment");

const entity = _entity(sequelize.sql, DataTypes);
const turno = _turno(sequelize.sql, DataTypes);
const entity2 = _entity2(sequelize.sql, DataTypes);
const mantencion = _mantencion(sequelize.sql, DataTypes);
const entity3 = _entity3(sequelize.sql, DataTypes);
const interrupcion = _interrupcion(sequelize.sql, DataTypes);
const sensor = _sensor(sequelize.sql, DataTypes);
const productoturno = _productoturno(sequelize.sql, DataTypes);
const detproduccion = _detproduccion(sequelize.sql, DataTypes);
const entity4 = _entity4(sequelize.sql, DataTypes);
const sensordata = _sensordata(sequelize.sql, DataTypes)
const categoriasensor = _categoriasensor(sequelize.sql, DataTypes)
const parada = _parada(sequelize.sql, DataTypes);
const production = _production(sequelize.sql, DataTypes);
const categoriadeparada = _categoriadeparada(sequelize.sql, DataTypes);
const paradamaquina = _paradamaquina(sequelize.sql, DataTypes);

const interruptionPersistence = require("../interruption/persistence")

module.exports = {
    getAll: () => {
        return entity.findAll({
            order: [["nombre", "ASC"]],
            include: [{
                model: entity2,
                as: 'idproceso_proceso',
                include: [{model: entity3, as: 'idplanta_plantum'}]
            }]
        })
    },
    getById: async id => {
        return entity.findOne({
            where: {id}, include: [{
                model: sensor, as: "sensors",
                include: [{model: categoriasensor, as: "idcategoriasensor_categoriasensor"}]
            }]
        })
    },
    getAllActives: async () => {
        let allTurnos = await turno.findAll({where: {horafin: null}})
        let maquinas = allTurnos.map(o => o.idmaquina)
        maquinas = Array.from(new Set(maquinas))
        let result = []
        for (let m of maquinas) {
            let dataM = await entity.findOne({where: {id: m}})
            result.push(dataM)
        }
        return result


    },
    getAllInDetention: async () => {
        let allDetentionsIn0 = await interrupcion.findAll({
            where: {
                duracion: '0'
            }, include: [
                {
                    model: parada,
                    as: 'tipo_parada',
                    include: [{
                        model: paradamaquina,
                        as: 'paradamaquinas',
                        include: [{
                            model: entity,
                            as: 'idmaquina_maquina'
                        }
                        ]
                    }]
                }
            ]
        })
        return allDetentionsIn0

    },
    getInDetention: async (idmaq) => {
        //Buscando interrupciones en 0
        let catMant = await categoriadeparada.findOne({
            where: {tipo: "programada"}
        })
        let ints0 = await interrupcion.findAll({
            where: {
                duracion: '0',

            }, include: [
                {
                    model: parada,
                    as: 'tipo_parada',
                    where: {
                        idcategoriaparada: {
                            [Op.not]: catMant.id,
                        },
                        /*  [Op.and]: [
                              Sequelize.literal(``),
                          ],*/
                    },
                    include: [{
                        model: paradamaquina,
                        as: 'paradamaquinas',
                        include: [{
                            model: entity,
                            as: 'idmaquina_maquina',
                            where: {id: idmaq}
                        }
                        ]
                    }]
                }
            ]
        })
        ints0 = ints0.filter(o => o.tipo_parada.paradamaquinas.length >= 1)
        console.log(ints0);
        if (ints0.length >= 1) {
            return ints0
        } else {
            //Buscando interrupciones en curso

            let intsEnCurso = await interrupcion.findAll({
                group: ["interrupcion.id", "tipo_parada.id", "tipo_parada.paradamaquinas.id",
                    "tipo_parada.paradamaquinas.idmaquina_maquina.id"],
                raw: true,
                attributes: [
                    "duracion",
                    "horainicio",
                    /*[ Sequelize.literal(
                        `horainicio + (duracion || 's')::interval `
                    ), 'iniciomasduracion'
                    ]*/
                ],
                where: {

                    [Op.and]: [
                        Sequelize.literal(`NOW() <=  horainicio + (duracion || 's')::interval and horainicio <= NOW() `),
                    ],
                },
                include: [
                    {
                        attributes: [],
                        model: parada,
                        where: {
                            idcategoriaparada: {
                                [Op.not]: catMant.id
                            }
                        },
                        as: 'tipo_parada',
                        include: [{
                            attributes: [],
                            model: paradamaquina,
                            as: 'paradamaquinas',
                            include: [{

                                model: entity,
                                as: 'idmaquina_maquina',
                                where: {id: idmaq}
                            }
                            ]
                        }]
                    }
                ]
            })

            intsEnCurso = intsEnCurso.filter(o => o['tipo_parada.paradamaquinas.idmaquina_maquina.id'] != null)
            console.log(intsEnCurso);
            if (intsEnCurso.length >= 1) {
                return intsEnCurso
            } else {
                let intsDelSensor = await interrupcion.findAll({
                    group: ["interrupcion.id", "tipo_parada.id", "tipo_parada.paradamaquinas.id",
                        "tipo_parada.paradamaquinas.idmaquina_maquina.id"],
                    raw: true,
                    attributes: [
                        "duracion",
                        "horainicio",
                        /*[ Sequelize.literal(
                            `horainicio + (duracion || 's')::interval `
                        ), 'iniciomasduracion'
                        ]*/
                    ],
                    where: {

                        [Op.and]: [
                            Sequelize.literal(` (NOW()- (60 || 's')::interval) <=  horainicio + (duracion || 's')::interval and horainicio <= NOW() `),
                        ],
                    },
                    include: [
                        {
                            attributes: [],
                            model: parada,
                            where: {
                                nombre: "Maquina sin producir",
                                idcategoriaparada: null
                            },
                            as: 'tipo_parada',
                            include: [{
                                attributes: [],
                                model: paradamaquina,
                                as: 'paradamaquinas',
                                include: [{

                                    model: entity,
                                    as: 'idmaquina_maquina',
                                    where: {id: idmaq}
                                }
                                ]
                            }]
                        }
                    ]
                })

                intsDelSensor = intsDelSensor.filter(o => o['tipo_parada.paradamaquinas.idmaquina_maquina.id'] != null)
                console.log(intsDelSensor);
                if (intsDelSensor.length >= 1) {
                    return intsDelSensor
                }
            }

        }

    },
    getInLowVelocity: async (idmaq) => {
        //Buscando interrupciones en 0


        let intsDelSensor = await interrupcion.findAll({
            group: ["interrupcion.id", "tipo_parada.id", "tipo_parada.paradamaquinas.id",
                "tipo_parada.paradamaquinas.idmaquina_maquina.id"],
            raw: true,
            attributes: [
                "duracion",
                "horainicio",
                /*[ Sequelize.literal(
                    `horainicio + (duracion || 's')::interval `
                ), 'iniciomasduracion'
                ]*/
            ],
            where: {

                [Op.and]: [
                    Sequelize.literal(`(NOW()- (60 || 's')::interval)  <=  horainicio + (duracion || 's')::interval and horainicio <= NOW() `),
                ],
            },
            include: [
                {
                    attributes: [],
                    model: parada,
                    where: {
                        nombre: "Baja de velocidad",
                        idcategoriaparada: null
                    },
                    as: 'tipo_parada',
                    include: [{
                        attributes: [],
                        model: paradamaquina,
                        as: 'paradamaquinas',
                        include: [{

                            model: entity,
                            as: 'idmaquina_maquina',
                            where: {id: idmaq}
                        }
                        ]
                    }]
                }
            ]
        })

        intsDelSensor = intsDelSensor.filter(o => o['tipo_parada.paradamaquinas.idmaquina_maquina.id'] != null)
        console.log(intsDelSensor);
        if (intsDelSensor.length >= 1) {
            return intsDelSensor
        }


    },
    getAllInMaintenance: async () => {
        //let hora = await hour.hora()
        let allMachineInMaintenance = await mantencion.findAll({
            where: {
                fecharealizadafin: null,
                fecharealizada: {
                    [Op.lte]: moment(Date.now()).toDate().getTime(),
                }
            }
        })
        let resp = []
        for (let mnt of allMachineInMaintenance) {
            let interruptionOfMaintenance = await interrupcion.findOne({
                where: {
                    id: mnt.idinterrupcion
                }, include: [
                    {
                        model: parada,
                        as: 'tipo_parada',
                        include: [{
                            model: paradamaquina,
                            as: 'paradamaquinas',
                            include: [{
                                model: entity,
                                as: 'idmaquina_maquina'
                            }
                            ]
                        }]
                    }
                ]
            })
            resp.push(interruptionOfMaintenance)
        }

        return resp


    },
    getInMaintenance: async (idmaquina) => {
        let maquinaRecord = await entity.findOne({where: {id: idmaquina}})

        let mantencionesDeMaquina = await mantencion.findAll({

            where: {
                fecharealizadafin: null,
                fecharealizada: {
                    [Op.ne]: null
                },
                [Op.and]: [
                    Sequelize.literal(`NOW() <=  fecharealizada + (idinterrupcion_interrupcion.duracion || 's')::interval `),
                ],
            },
            include: [
                {
                    model: interrupcion,
                    as: "idinterrupcion_interrupcion",
                    include: [
                        {
                            model: parada,
                            as: "tipo_parada",
                            /*  where: {
                                  idcategoriaparada: {
                                      [Op.eq]: catMant.id
                                  }
                              },*/
                            include: [{
                                model: paradamaquina,
                                as: 'paradamaquinas',
                                where: {
                                    idmaquina
                                }
                            }]
                        }
                    ]
                }
            ]
        })
        mantencionesDeMaquina = mantencionesDeMaquina.filter(o => o.idinterrupcion_interrupcion.tipo_parada != null)
        if (maquinaRecord.conSensor) {

            if ((await sensordata.findAll({
                where: {
                    timestamp: {
                        [Op.gte]: moment(Date.now()).subtract(2.5, "minutes").toDate().getTime()
                    },
                    idmaquina: idmaquina.toString()
                }
            })).length == 0) {
                mantencionesDeMaquina.push({laSensor: true})
            }
        }
        let turnoPending = await turno.findAll({
            where: {
                idmaquina,
                horafin: null
            }, include: [{
                model: productoturno,
                as: "productoturnos",
                include: [{
                    model: detproduccion,
                    as: "detproduccions"
                }]
            }]
        })
        if (turnoPending) {
            let totalProd = turnoPending
                .map(o => o.productoturnos.map(oo => oo.detproduccions)).flat(2)
                .map(o => o.cantidad)
                .reduce((a, b) => +a + +b, 0)

            if (totalProd == 0) {
                mantencionesDeMaquina.push({laSensor: true})
            }
        }


        if (mantencionesDeMaquina.length >= 1) {
            return mantencionesDeMaquina
        }


    },
    getAllGood: async () => {
        let allTurnos = await turno.findAll()
        let maquinas = allTurnos.map(o => o.idmaquina)
        maquinas = Array.from(new Set(maquinas))
        let result = []
        for (let m of maquinas) {
            let dataM = await entity.findOne({where: {id: m}})
            result.push(dataM)
        }
        return result


    },
    getProductionByMachine: (idmaquina) => {
        return production.findAll({
            where: {idmaquina}, include: [{
                model: entity4,
                as: 'idproducto_producto',
            }]
        })
    },
    getDetentionsByMachine: async (idmaquina, idCat = null) => {
        let intOfMachine = await interruptionPersistence.getAllByMachine(idmaquina)
        if (idCat) {
            intOfMachine = intOfMachine.filter(o => o.tipo_parada != null && o.tipo_parada.idcategoriaparada == idCat)
            let objTop = {}
            for (let int of intOfMachine) {
                if (objTop[int.tipo_parada.nombre]) {
                    objTop[int.tipo_parada.nombre].value += 1
                } else {
                    objTop[int.tipo_parada.nombre] = {
                        nombre: int.tipo_parada.nombre,
                        value: 1
                    }
                }
            }

            let paradas = await paradamaquina.findAll({
                where: {idmaquina},
                include: [
                    {
                        model: parada,
                        as: 'idparada_parada',
                        where: {
                            idcategoriaparada: idCat
                        }
                    }
                ]
            })
            paradas = paradas.map(o => {
                return {...o.dataValues, top: objTop[o.idparada_parada.nombre]?.value || 0}
            })
            paradas = paradas.sort((a, b) => -a.top - -b.top)


            return paradas

        } else {
            return paradamaquina.findAll({
                where: {idmaquina},
                include: [
                    {
                        model: parada,
                        as: 'idparada_parada'
                    }
                ]
            })
        }


    },
    getAllDetentions: () => {
        return parada.findAll({
            include: [
                {
                    model: categoriadeparada,
                    as: 'idcategoriaparada_categoriadeparada'
                }
            ]
        })
    },
    create: async (data, nombreProceso = false) => {
        if (nombreProceso) {
            let existentProcess = await entity2.findOne({
                where: {
                    nombre: data.idproceso
                }
            })
            if(existentProcess){
                data.idproceso = existentProcess.id
            }else{
                return null

            }
        }
        let maquinaMismoName = await entity.findOne({where: {nombre: data.nombre}})
        if (maquinaMismoName) {
            throwError(200, "ya existe una maquina con el mismo nombre")
        } else {
            return entity.create(data)
        }
    },
    createDetentionsByMachine: async (dataArray) => {
        let resp = []
        for (let d of dataArray) {
            let exst = await parada.findOne({
                where: {
                    nombre: d.nombre,
                    idcategoriaparada: d.idcategoriaparada,
                    idmaqrel: null
                }
            })


            if (exst) {
                let exst2 = await parada.findOne({
                    where: {
                        nombre: exst.nombre,
                        idcategoriaparada: exst.idcategoriaparada,
                        idmaqrel: null
                    }
                })

                let nParada = {
                    nombre: exst.nombre,
                    idcategoriaparada: exst.idcategoriaparada,
                    idmaqrel: exst.id
                }
                let createdNParada = await parada.create(nParada)
                resp.push(createdNParada)
            } else {
                let nParada = {
                    nombre: d.nombre,
                    idcategoriaparada: d.idcategoriaparada,
                }
                let createdNParada = await parada.create(nParada)
                nParada = {
                    nombre: createdNParada.nombre,
                    idcategoriaparada: createdNParada.idcategoriaparada,
                    idmaqrel: createdNParada.id
                }
                createdNParada = await parada.create(nParada)
                resp.push(createdNParada)
            }
        }

        return resp
    },
    createDetentionsMachine: async (dataArray) => {
        return paradamaquina.bulkCreate(dataArray)
    },
    findDetentionNull: async (nombre) => {
        return !!(await parada.findOne({
            where: {
                nombre: nombre, idmaqrel: null
            }
        }));
    },
    update: async (data) => {
        return entity.update(data, {where: {id: data.id}})
    },
    updateProductOfMachine: async (data) => {
        return production.update(data, {where: {id: data.id}})
    },
    updateDetentionOfMachine: async (data) => {
        return parada.update(data, {where: {id: data.id}})
    },
    delete: async (id) => {
        return entity.destroy({where: {id}})
    },
    deleteProductOfMachine: async (id) => {
        return production.destroy({where: {id}})
    },
    deleteDetentionOfMachine: async (id) => {
        return parada.destroy({where: {id}})
    },
    createProductions: async (data) => {
        let createdEntity = null
        try {
            createdEntity = await production.bulkCreate(data)
        } catch (e) {
            throwError(500, e.name)
        }
        return createdEntity

    },
    checkMachineProduct(idmaquina, idproducto) {
        return production.findOne({
            where: {
                idmaquina,
                idproducto
            },
        })
    }


}