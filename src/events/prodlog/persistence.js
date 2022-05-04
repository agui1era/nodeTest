const DataTypes = require("sequelize").DataTypes;
const sequelize = require("../../database/index")
const _entity = require("../../database/models/prodevents");
const throwError = require("../../utils/throwError");
const _turno = require("../../database/models/turno")
const _subproducto = require("../../database/models/subproducto")
const _productoturno = require("../../database/models/productoturno")
const {Op} = require("sequelize");

const entity = _entity(sequelize.sql, DataTypes);
const turno = _turno(sequelize.sql, DataTypes);
const subproducto = _subproducto(sequelize.sql, DataTypes);
const productoturno = _productoturno(sequelize.sql, DataTypes);
module.exports = {
    registerProd: (data) => {
        return entity.create(data)
    },
    obtenerCalculos: async () => {
        let dataResp = {}
        //obtener todos los turnos que existen
        let totalTurnos = await turno.findAll()
        //mapear turnos a campos seleccionados
        dataResp.turnos = totalTurnos.map(o => {
            return {
                horainicio: new Date(o.horainicio).getTime(),
                horafin: o.horafin || Date.now(),
                maquina: o.idmaquina,
                idturno: o.id
            }
        })
        //recorrer turnos para agregar info en cada uno
        for (let t of dataResp.turnos) {
            //obtener produccion total del turno
            t.prodTotal = await entity.findAll({
                where: {
                    maquina: t.maquina,
                    ts: {
                        [Op.gte]: t.horainicio,
                        [Op.lt]: t.horafin,
                    },
                    subproducto: {[Op.not]: null}
                },
                attributes: ['cantidad']
            })
            t.prodTotal = t.prodTotal.map(o => o.cantidad).reduce((a, b) => +a + +b, 0)
            //lista de subproductos fabricados en el turno
            t.spList = await entity.findAll({
                where: {
                    maquina: t.maquina,
                    ts: {
                        [Op.gte]: t.horainicio,
                        [Op.lt]: t.horafin,
                    }
                },
                attributes: ['subproducto']
            })
            t.spList = t.spList.map(o => o.subproducto).filter(o => o != null)
            t.spList = Array.from(new Set(t.spList))
            t.spObjs = []
            //recorrer subproductos para obtener prod y vel prod y mermas
            for (let sp of t.spList) {
                //obtener info del subproducto
                let spDb = await subproducto.findOne({
                    where: {id: sp}
                })
                //obtener produccion del subproducto en este turno
                let prodOfSp = await entity.findAll({
                    where: {
                        maquina: t.maquina,
                        ts: {
                            [Op.gte]: t.horainicio,
                            [Op.lt]: t.horafin,
                        },
                        subproducto: sp
                    },
                    attributes: ['cantidad']
                })
                prodOfSp = prodOfSp.map(o => o.cantidad).reduce((a, b) => +a + +b, 0)

                //obtener las mermas del subproducto
                let ptTurnOfSp = await productoturno.findAll({
                    where: {
                        idturno: t.idturno,
                        idsubproducto: sp
                    },
                })
                console.log(ptTurnOfSp);
                let mermasDelSp = ptTurnOfSp.map(o => o.mermas).filter(o => o != null).reduce((a, b) => +a + +b, 0)
                //armar objeto con los datos del subproducto
                let spData = {
                    nombre: spDb.nombre,
                    velprod: spDb.velprod,
                    prodOfSp,
                    mermas: mermasDelSp,
                    vot: (prodOfSp - mermasDelSp) / spDb.velprod
                }
                //push a lista de productos del turno
                t.spObjs.push(spData)
            }
            //obtener todas las mermas del turno
            let ptTurn = await productoturno.findAll({
                where: {idturno: t.idturno},
            })
            t.mermasTotales = ptTurn.map(o => o.mermas).reduce((a, b) => +a + +b, 0)
        }
        return dataResp
    },
    /*    create: async (data) => {
            let existentProcRec = await entity.findOne({where:{nombre:data.nombre}})
            if(existentProcRec){
                throwError(500, 'Nombre existente')

            }

            return entity.create(data)
        },
        update: async (data) => {
            return entity.update(data, {where: {id: data.id}})
        },
        delete: async (id) => {
            return entity.destroy({where: {id}})
        }*/

}