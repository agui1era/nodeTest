const events = require("./loginEvent")
const response = require("../../utils/response")
const loginPersistence = require("./loginPersistence")
const userPersistence = require("../users/usersPersistence")
const getLine = require("../../utils/getLine")

module.exports = (app) => {
    app.post("/login", (req, res) => {

        let {user, pass} = parser(req)
        events.login(user, pass)
            .then(ok => {
                //console.log(ok.data.access_token);
                events.introspect(ok.data.access_token).then(userData => {

                    let existe = false;
                    if (userData.data.family_name === "operador") {
                        loginPersistence.existeOperador(userData.data)
                    } else if (userData.data.family_name === "supervisor") {
                        loginPersistence.existeSupervisor(userData.data)

                    } else if (userData.data.family_name === "administrador") {
                        loginPersistence.existeAdministrador(userData.data)

                    } else {
                        response(res, 500, response.ERROR("rol desconocido"))
                    }
                    //res.setHeader("Access-Control-Allow-Origin","*")
                    response(res, 200, {...ok.data, role: userData.data.family_name})
                }).catch(e=>{
                    console.log(e);
                    console.log(getLine().default());

                    response(res, 401, response.ERROR("error"))

                })
            })
            .catch(error => {
                console.log(error)
                console.log(getLine().default());

                response(res, 401, response.ERROR("error"))
            })

    })
    app.get("/introspect", (req, res) => {

        try {
            let token = req.headers.authorization.split("Bearer ")[1];
            events.introspect(token)
                .then(ok => {


                    //console.log(ok.data);
                    let dbQuery = {
                        role:ok.data.family_name,
                        username:ok.data.username,
                    }
                    userPersistence.getUserByUsername(dbQuery).then(okDB=>{
                        //console.log(okDB.dataValues);
                        res.send([ok.data].map(d => {
                            return d.active ? {
                                active: true,
                                username: d.username,
                                firstName: d.given_name,
                                lastName: okDB?.apellido,
                                okUser:okDB,
                                role: d.family_name,
                            } : {active: false}
                        })[0])
                    })



                })
                .catch(error => {
                    console.log(error)
                    console.log(getLine().default());

                    res.status(401).send({error: "error"})
                })
        } catch (e) {
            console.log(e)
            console.log(getLine().default());

            res.status(500).send({error: "error"})
        }
    })
}

function parser(req) {
    return {user: req.body.user, pass: req.body.pass}
}