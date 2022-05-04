const _administrador = require("../database/models/administrador")
const _supervisor = require("../database/models/supervisor")
const _operador = require("../database/models/operador")
const sequelize = require("../database/index");
const {DataTypes} = require("sequelize");

const administrador = _administrador(sequelize.sql, DataTypes);
const supervisor = _supervisor(sequelize.sql, DataTypes);
const operador = _operador(sequelize.sql, DataTypes);


module.exports = {
    getUserByRoleAndId: async (role,id)=>{
        switch(role) {
            case "administrador":
                return administrador.findOne({where:{id}})
            case "supervisor":
                return supervisor.findOne({where:{id}})
            case "operador":
                return operador.findOne({where:{id}})
        }
    }
}