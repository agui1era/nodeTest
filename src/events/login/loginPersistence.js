const DataTypes = require("sequelize").DataTypes;
const sequelize = require("../../database/index")
const _operador = require("../../database/models/operador");
const _supervisor = require("../../database/models/supervisor");
const _administrador = require("../../database/models/administrador");

const administrador = _administrador(sequelize.sql, DataTypes);
const supervisor = _supervisor(sequelize.sql, DataTypes);
const operador = _operador(sequelize.sql, DataTypes);

module.exports = {
    existeOperador: async (userData) => {
        let entity = await operador.findOrCreate({where: {usuario: userData.username,email:userData.email}})
        if(entity[0].nombre == null && entity[0].apellido == null){
            await operador.update({nombre:"sin nombre",apellido:"sin apellido"},{where: {id:entity[0].id}})
        }
    },
    existeSupervisor: async (userData) => {
        let entity = await supervisor.findOrCreate({where: {usuario: userData.username,email:userData.email}})
        if(entity[0].nombre == null && entity[0].apellido == null){
            await supervisor.update({nombre:"sin nombre",apellido:"sin apellido"},{where: {id:entity[0].id}})
        }
    },
    existeAdministrador: async (userData) => {
        let entity = await administrador.findOrCreate({where: {usuario: userData.username,email:userData.email}})
        console.log(entity);
        if(entity[0].nombre == null && entity[0].apellido == null){
            await administrador.update({nombre:"sin nombre",apellido:"sin apellido"},{where: {id:entity[0].id}})
        }


    }
}