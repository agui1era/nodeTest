const validate = require("../../utils/validateRole")
const response = require("../../utils/response")
const oauth = require("../../utils/oauth")
const checkParams = require("../../utils/checkParams")
const throwError = require("../../utils/throwError")
const multer = require('multer');
const csv = require('csv-parser');
const fs = require('fs');
const detentionPersistence = require("../../events/detention/persistence")
const _catParada = require("../../database/models/categoriadeparada");
const _ordendetrabajo = require("../../database/models/ordendetrabajo");
const _maquina = require("../../database/models/maquina");
const _proceso = require("../../database/models/proceso");
const _planta = require("../../database/models/planta");
const _turno = require("../../database/models/turno");
const _producto = require("../../database/models/producto");
const _subproducto = require("../../database/models/subproducto");
const sequelize = require("../../database/index");
const {DataTypes} = require("sequelize");
const getLine = require("../../utils/getLine");
const moment = require("moment");

const proceso = _proceso(sequelize.sql, DataTypes);
const ordendetrabajo = _ordendetrabajo(sequelize.sql, DataTypes);
const maquina = _maquina(sequelize.sql, DataTypes);
const planta = _planta(sequelize.sql, DataTypes);
const turno = _turno(sequelize.sql, DataTypes);
const catParada = _catParada(sequelize.sql, DataTypes);
const subproducto = _subproducto(sequelize.sql, DataTypes);
const producto = _producto(sequelize.sql, DataTypes);

var storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, './src/uploads')
    },
    filename: function (req, file, cb) {
        cb(null, file.fieldname + '-' + Date.now())
    }
})

var upload = multer({storage: storage})


module.exports = (app) => {
    app.post("/upload/detentions", upload.single("myFile"), async (req, res) => {
        try {
            const file = req.file

            fs.createReadStream(file.path)
                .pipe(csv())
                .on('data', async (row) => {

                    try {

                        let catP = await catParada.findOne({
                            where: {nombre: row["nombre categoria de parada"]}
                        })
                        if (catP) {
                            let entity = {
                                nombre: row["nombre parada"],
                                idcategoriaparada: catP.id
                            }
                            let createdEntity = await detentionPersistence.createByMachine(entity)
                        }

                    } catch (e) {

                    }

                })
                .on('end', () => {
                    response(res, 200, {})

                });
        } catch (e) {
            console.log(e);
            console.log(getLine().default());

            response(res, e.code, response.ERROR(e.data))
        }
    })
    app.post("/upload/subproducts", upload.single("myFile"), async (req, res) => {
        if (await validate(req, res, "administrador,operador,supervisor")) {

            try {
                const file = req.file

                fs.createReadStream(file.path)
                    .pipe(csv())
                    .on('data', async (row) => {

                        try {
                            let p = await producto.findOne({
                                where: {nombre: row["nombre producto"]}
                            })
                            if (p) {
                                let entity = {
                                    nombre: row["nombre subproducto"],
                                    formato: row["formato"],
                                    unidad: row["unidad"],
                                    sku: row["sku"],
                                    condicion: row["condicion"],
                                    velprod: row["velocidad produccion"],
                                    pesoenvase: row["peso envase"],
                                    pesofinal: row["peso final"],
                                    //stdprod: row["estandar produccion"],
                                    idproducto: p.id
                                }

                                let createdEntity = await subproducto.findOrCreate({where:entity})
                            }
                        } catch (e) {

                        }


                    })
                    .on('end', () => {
                        response(res, 200, {})

                    });
            } catch (e) {
                console.log(e);
                console.log(getLine().default());

                response(res, e.code, response.ERROR(e.data))
            }
        } else {
            response(res, 403, {})

        }
    })
    app.post("/upload/ot", upload.single("myFile"), async (req, res) => {
        try {
            const file = req.file

            fs.createReadStream(file.path)
                .pipe(csv())
                .on('data', async (row) => {
                    console.log(row);
                    let sp = await subproducto.findOne({
                        where: {sku: row["sku subproducto"]}
                    })
                    let plant = await planta.findOne({
                        where: {nombre: row["planta"]}
                    })
                    let process = await proceso.findOne({
                        where: {nombre: row["proceso"]}
                    })
                    let maq = undefined
                    if (row["maquina"]) {
                        maq = await maquina.findOne({
                            where: {nombre: row["maquina"]}
                        })
                    }
                    if (sp && plant && process) {
                        let fechaDia = row["fecha dia"]
                        let fechaHora = row["fecha hora"]
                        console.log(fechaDia + " " + fechaHora);
                        let fechaDate = moment(fechaDia + " " + fechaHora, "DD-MM-YYYY HH:mm", true).toDate().getTime()
                        console.log(fechaDate);

                        let entity = {
                            nombre: row["nombre"],
                            codigo: row["serie"],
                            horainicio: fechaDate,
                            cantidadesperada: row["cantidad esperada"],
                            idplanta: plant?.id,
                            idproceso: process?.id,
                            idmaquina: maq?.id,
                            idsubproducto: sp?.id
                        }

                        let createdEntity = await ordendetrabajo.findOrCreate({where:entity})
                    }


                })
                .on('end', () => {
                    response(res, 200, {})

                });
        } catch (e) {
            console.log(e);
            console.log(getLine().default());

            response(res, e.code, response.ERROR(e.data))
        }
    })

    app.post("/upload/turno", oauth.introspect, async (req, res) => {

        if (await validate(req, res, "administrador,operador,supervisor")) {
            let entity = {
                idmaquina: req.body.idmaquina,
                idhorario: req.body.idhorario,
                horainicio: req.body.horainicio,
                dia: req.body.dia,
                horafin: req.body.horafin
            }
            if (req.query.idmaquina) {
                let existentM = await maquina.findOne({
                    where: {
                        nombre: req.body.idmaquina
                    }
                })
                if (existentM) {
                    entity.idmaquina = existentM.id
                } else {
                    response(res, 400, "bad machine")
                }
            }
            let createdEntity = await turno.create(entity)
            response(res, 201, createdEntity)
        } else {
            response(res, 403, response.ERROR("rol no permitido"))
        }

    })


}