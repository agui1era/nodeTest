const DataTypes = require("sequelize").DataTypes;
const sequelize = require("../../database/index")
const _entity = require("../../database/models/parada");
const _paradamaquina = require("../../database/models/paradamaquina");
const _maquina = require("../../database/models/maquina");
const _categoriadeparada = require("../../database/models/categoriadeparada");

const maquina = _maquina(sequelize.sql, DataTypes);
const categoriadeparada = _categoriadeparada(sequelize.sql, DataTypes);
const entity = _entity(sequelize.sql, DataTypes);
const paradamaquina = _paradamaquina(sequelize.sql, DataTypes);

module.exports = {
    getAll: () => {
        return entity.findAll()
    },
    createByMachine: async (data,idcategoriaparada = false) => {
        let resp = {}

        if(idcategoriaparada){
            let idCatName = await categoriadeparada.findOne({where:{nombre:data.idcategoriaparada}})
            data.idcategoriaparada =idCatName.id
            let idMaq = await maquina.findOne({where:{nombre:data.idmaquina}})
            data.idmaquina =idMaq.id
        }
        let exst = await entity.findOne({
            where: {
                nombre: data.nombre,
                idcategoriaparada: data.idcategoriaparada,
                idmaqrel: null
            }
        })

        if (exst) {
            let machExst = await paradamaquina.findOne({
                where: {
                    idmaquina: data.idmaquina,
                }, include: [
                    {
                        model: entity,
                        as: "idparada_parada",
                        where: {
                            nombre: data.nombre,
                            idcategoriaparada: data.idcategoriaparada
                        }
                    }
                ]
            })

            if (machExst) {

                resp = await entity.findOne({where:{id:machExst.idparada}})
            } else {
                let createdMach = await entity.create({
                    nombre:data.nombre,
                    idcategoriaparada:data.idcategoriaparada,
                    idmaqrel:exst.id
                })
                let createdRelation = await paradamaquina.create({
                    idmaquina:data.idmaquina,
                    idparada:createdMach.id
                })
                resp = createdMach
            }
        } else {
            let createdNew = await entity.create({
                nombre:data.nombre,
                idcategoriaparada:data.idcategoriaparada,
            })
            let createdMach = await entity.create({
                nombre:data.nombre,
                idcategoriaparada:data.idcategoriaparada,
                idmaqrel:createdNew.id
            })
            let createdRelation = await paradamaquina.create({
                idmaquina:data.idmaquina,
                idparada:createdMach.id
            })
            resp = createdMach
        }
        return resp

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