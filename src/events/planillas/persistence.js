const DataTypes = require("sequelize").DataTypes;
const sequelize = require("../../database/index")
const _entity = require("../../database/models/planta");
const _subproducto = require("../../database/models/subproducto")
const _productoturno = require("../../database/models/productoturno")
const _detproduccion = require("../../database/models/detproduccion")
const _turno = require("../../database/models/turno")
const moment = require("moment");
const {Op} = require("sequelize");

const entity = _entity(sequelize.sql, DataTypes);
const subproducto = _subproducto(sequelize.sql, DataTypes);
const productoturno = _productoturno(sequelize.sql, DataTypes)
const turno = _turno(sequelize.sql, DataTypes)
const detproduccion = _detproduccion(sequelize.sql, DataTypes);
module.exports = {

    planillaProduccion: async (dia) => {
        console.log(dia);
        let desde = moment(dia).startOf("day")
        let hasta = moment(dia).endOf("day")
        console.log(desde);
        console.log(hasta);
        let allSp = await subproducto.findAll({
            include: [{
                model: productoturno,
                as: "subproductos",
                include: [
                    {
                        model: turno,
                        as: "idturno_turno",
                        where: {
                            horainicio: {
                                [Op.gte]: desde.toDate().getTime(),
                                [Op.lt]: hasta.toDate().getTime()
                            }
                        }
                    },
                    {
                        model: detproduccion,
                        as: "detproduccions"
                    }]
            }]
        })
        allSp = allSp.filter(o=>o.subproductos.length >= 1)
        allSp = allSp.map(o => {
            let total = o.subproductos.map(oo => oo.detproduccions).flat().map(o => o.cantidad).reduce((a,b)=>+a + +b,0)
            return {
                //...o.dataValues,
                nombre:o.dataValues.nombre,
                sku:o.dataValues.sku,
                total
            }
        })


        return allSp
    }

}