const login = require("../login/loginEvent");
const userPersistence = require("../users/usersPersistence");
const _sesionessocket = require("../../database/models/sesionessocket");
const sequelize = require("../../database/index");
const {DataTypes} = require("sequelize");

const sesionessocket = _sesionessocket(sequelize.sql, DataTypes);



module.exports = {
    registrarSesion : async data =>{

        let infoToken = await login.introspect(data.token)
        //infoToken.data.role = infoToken.data.family_name
        //let userData = await userPersistence.getUserByUsername(infoToken.data)
        let existentUserSession = await sesionessocket.findOne({where:{username:infoToken.data.username}})
        if(existentUserSession){
            await sesionessocket.destroy({where:{id:existentUserSession.id}})
        }
        await sesionessocket.create({
            username:infoToken.data.username,
            idsocket:data.idsocket,
        })
    },
    deleteSession : async data =>{
        await sesionessocket.destroy({where:{idsocket:data.idsocket}})
    }
}