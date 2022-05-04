const response = require("../../utils/response")
const validate = require("../../utils/validateRole")
const userEvent = require("./usersEvent")
const oauth = require("../../utils/oauth")
const throwError = require("../../utils/throwError")
const checkRole = require("../../utils/checkRole")
const checkParams = require("../../utils/checkParams")
const userPersistence = require("./usersPersistence")
module.exports = (app) => {
    app.get("/supervisor", oauth.introspect, async (req, res) => {
        let ok = await validate(req, res, "administrador")
        if (ok) {
            res.send("ok")
        } else {
            response(res, 403, response.ERROR("rol no permitido"))
        }
    })
    app.get("/user", oauth.introspect, async (req, res) => {
        if (await validate(req, res, "administrador")) {
            try {
                let users = await userPersistence.getAllUser();
                response(res, 200, users)
            } catch (e) {
                console.log(e);
                response(res, e.code, response.ERROR(e.data))
            }
        } else {
            response(res, 403, response.ERROR("rol no permitido"))
        }

    })
    app.put("/user/", oauth.introspect, async (req, res) => {
        if (await validate(req, res, "administrador")) {

            try {
                if (!checkRole(req.body.role)) {
                    throwError(400, "rol no encontrado")
                }
                let data = {
                    firstName: req.body.firstName,
                    username: req.body.username,
                    lastName: req.body.role,
                    email: req.body.email,
                }
                let updatedUserKC = await userEvent.updateUser(data)
                data.idEmail = updatedUserKC.email
                data.idRole = updatedUserKC.role
                data.apellido = req.body.apellido
                data.role = req.body.role
                data.foto = req.body.foto
                data.nombre = req.body.firstName
                data.usuario = updatedUserKC.username
                if (req.body.role !== updatedUserKC.role) {
                    let deletedUser = await userPersistence.deleteUser(data)
                    let persistedUser = await userPersistence.addUser(data)

                } else {
                    let persistedUser = await userPersistence.updateUser(data)
                }
                response(res, 200, {})


            } catch (e) {
                console.log(e);
                response(res, e.code, response.ERROR(e.data))

            }
        } else {
            response(res, 403, response.ERROR("rol no permitido"))

        }
    })
    app.put("/user/recovery", oauth.introspect, async (req, res) => {
        if (await validate(req, res, "administrador")) {

            try {
                if (!checkRole(req.body.role)) {
                    throwError(400, "rol no encontrado")
                }
                let data = {
                    firstName: req.body.nombre,
                    username: req.body.usuario,
                    lastName: req.body.role,
                    email: req.body.email,
                }
                let updatedUserKC = await userEvent.recoveryPassUser(data)
               // console.log(updatedUserKC);

                response(res, 200, {})


            } catch (e) {
                console.log(e);
                response(res, e.code, response.ERROR(e.data))

            }
        } else {
            response(res, 403, response.ERROR("rol no permitido"))

        }
    })
    app.delete("/user/:id", oauth.introspect, async (req, res) => {
        if (await validate(req, res, "administrador")) {
            if (await validate(req, res, "administrador")) {
                try {
                    let id = req.params.id
                    let deletedUser = await userEvent.deleteUser(id)
                    let deletedPersistedUser = await userPersistence.deleteUser(deletedUser)
                    response(res, 200, {})

                } catch (e) {
                    console.log(e);
                    response(res, e.code, response.ERROR(e.data))
                }


            } else {
                response(res, 403, response.ERROR("rol no permitido"))

            }
        }
    })
    app.post("/user", oauth.introspect, async (req, res) => {
        let ok = await validate(req, res, "administrador")
        if (ok) {
            try {

                if (!checkRole(req.body.lastName)) {
                    throwError(400, "rol no encontrado")
                }
                if (!checkParams(req.body, ["firstName", "username", "email"])) {
                    throwError(400, "faltan datos")
                }


                let createdUser = await userEvent.create(req.body)

                let newUser = {
                    nombre: req.body.firstName,
                    apellido: req.body.apellido,
                    usuario: req.body.username,
                    email: req.body.email,
                    role: req.body.lastName,
                    foto: req.body.foto
                }

                let persistedUser = userPersistence.addUser(newUser)
                response(res, 201, createdUser)
            } catch (e) {
                console.log(e);
                response(res, e.code, response.ERROR(e.data))
            }
        } else {
            response(res, 403, response.ERROR("rol no permitido"))
        }
    })
}


