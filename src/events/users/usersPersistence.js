const DataTypes = require("sequelize").DataTypes;
const sequelize = require("../../database/index")
const _operador = require("../../database/models/operador");
const _supervisor = require("../../database/models/supervisor");
const _administrador = require("../../database/models/administrador");

const administrador = _administrador(sequelize.sql, DataTypes);
const supervisor = _supervisor(sequelize.sql, DataTypes);
const operador = _operador(sequelize.sql, DataTypes);

addSupervisor = async data => {
    let entity = await supervisor.create(data)

}
addOperador = async data => {
    let entity = await operador.create(data)
}
addAdministrador = async data => {
    let entity = await administrador.create(data)
}
updateSupervisor = async data => {
    let entity = await supervisor.update(data, {where: {email: data.idEmail}})
}
updateOperador = async data => {
    let entity = await operador.update(data, {where: {email: data.idEmail}})
}
updateAdministrador = async data => {
    let entity = await administrador.update(data, {where: {email: data.idEmail}})
}
deleteSupervisor = async data => {
    let entity = await supervisor.destroy({where: {email: data.idEmail}})
}
deleteOperador = async data => {
    let entity = await operador.destroy({where: {email: data.idEmail}})
}
deleteAdministrador = async data => {
    let entity = await administrador.destroy({where: {email: data.idEmail}})
}

module.exports = {
    addUser: data => {
        switch (data.role) {
            case 'administrador':
                return addAdministrador(data)
            case 'supervisor':
                return addSupervisor(data)
            case 'operador':
                return addOperador(data)
        }
    },
    updateUser: data => {
        switch (data.role) {
            case 'administrador':
                return updateAdministrador(data)
            case 'supervisor':
                return updateSupervisor(data)
            case 'operador':
                return updateOperador(data)
        }
    },
    deleteUser: data => {
        switch (data.idRole) {
            case 'administrador':
                return deleteAdministrador(data)
            case 'supervisor':
                return deleteSupervisor(data)
            case 'operador':
                return deleteOperador(data)
        }
    },
    getAllSupervisor: () => {
        return supervisor.findAll()
    },
    getAllOperador: () => {
        return operador.findAll()
    },
    getAllAdministrador: () => {
        return administrador.findAll()
    },
    getAllUser: async () => {

        let administradores = await module.exports.getAllAdministrador()
        let supervisores = await module.exports.getAllSupervisor()
        let operadores = await module.exports.getAllOperador()

        let administradoresList = administradores
        administradoresList = administradoresList.map(o => {
            return {...o.dataValues, role: "administrador"}
        })
        let supervisoresList = supervisores
        supervisoresList = supervisoresList.map(o => {
            return {...o.dataValues, role: "supervisor"}
        })
        let operadoresList = operadores
        operadoresList = operadoresList.map(o => {
            return {...o.dataValues, role: "operador"}
        })

        return [...administradoresList, ...supervisoresList, ...operadoresList]
    },
    getUserByUsername: (data) => {
        switch (data.role) {
            case 'administrador':
                return module.exports.getAdministradorByUsername(data.username)
            case 'supervisor':
                return module.exports.getSupervisorByUsername(data.username)
            case 'operador':
                return module.exports.getOperadorByUsername(data.username)
        }
    },
    getUserByUsernameForce: async (data) => {
        let usr = {}
        let admins = await module.exports.getAdministradorByUsername(data.username)
        let supervisors = await module.exports.getSupervisorByUsername(data.username)
        let operadors = await module.exports.getOperadorByUsername(data.username)

        if(admins)
            usr = admins
        if(supervisors)
            usr = supervisors
        if(operadors)
            usr = operadors
        return usr


    },
    getOperadorByUsername: (usuario) => {
        return operador.findOne({where:{usuario}})

    },
    getSupervisorByUsername: (usuario) => {
        return supervisor.findOne({where:{usuario}})


    },
    getAdministradorByUsername: (usuario) => {
        return administrador.findOne({where:{usuario}})


    },


}