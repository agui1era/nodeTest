const validate = require("../../utils/validateRole")
const entityPersistence = require("./persistence")
const response = require("../../utils/response")
const oauth = require("../../utils/oauth")
const checkParams = require("../../utils/checkParams")
const throwError = require("../../utils/throwError")

module.exports = (app) => {
    app.get("/reportes/:idsp", oauth.introspect, async (req, res) => {
        if (await validate(req, res, "administrador,supervisor,operador")) {
            try {
                let otro = ""
                let lapso = req.query.lapso

                try {
                    otro = req.query.otro.split(":")

                } catch (e) {

                }
                let oeeReportes = await entityPersistence.getOeeBySp(req.params.idsp, lapso, otro);
                if (oeeReportes.error) {
                    response(res, 200, oeeReportes)
                } else {
                    let calidadReportes = await entityPersistence.getReporteCalidad(req.params.idsp, lapso, otro,null,oeeReportes);
                    let rendimientoReportes = await entityPersistence.getReporteRendimiento(req.params.idsp, lapso, otro,null,oeeReportes);
                    let disponibilidadReportes = await entityPersistence.getReporteDisponibilidad(req.params.idsp, lapso, otro, oeeReportes.lastTurnId);
                    let body = {
                        oee: oeeReportes,
                        calidad: calidadReportes,
                        rendimiento: rendimientoReportes,
                        disponibilidad: disponibilidadReportes,
                    }

                    response(res, 200, body)
                }

            } catch (e) {
                console.log(e);
                response(res, e.code, response.ERROR(e.data))
            }
        } else {
            response(res, 403, response.ERROR("rol no permitido"))
        }
    })
    app.get("/reportes/proceso/:id", oauth.introspect, async (req, res) => {
        if (await validate(req, res, "administrador,supervisor,operador")) {
            try {
                let otro = ""
                let idspSel = null

                let lapso = req.query.lapso

                try {
                    otro = req.query.otro.split(":")
                    idspSel = req.query.idsp

                } catch (e) {
                }

                let id = req.params.id
                let report = await entityPersistence.getByProc(id, lapso, otro,idspSel)


                response(res, 200, report)
            } catch (e) {
                console.log(e);
                response(res, e.code, response.ERROR(e.data))
            }
        } else {
            response(res, 403, response.ERROR("rol no permitido"))
        }
    })
    app.get("/reportes/planta/:id", oauth.introspect, async (req, res) => {
        if (await validate(req, res, "administrador,supervisor,operador")) {
            try {
                let otro = ""
                let idspSel = null

                let lapso = req.query.lapso

                try {
                    otro = req.query.otro.split(":")
                    idspSel = req.query.idsp

                } catch (e) {
                }

                let id = req.params.id
                let report = await entityPersistence.getByPlant(id, lapso, otro)


                response(res, 200, report)
            } catch (e) {
                console.log(e);
                response(res, e.code, response.ERROR(e.data))
            }
        } else {
            response(res, 403, response.ERROR("rol no permitido"))
        }
    })
    app.get("/reportes", oauth.introspect, async (req, res) => {
        if (await validate(req, res, "administrador,supervisor,operador")) {
            try {
                let report = await entityPersistence.getAll()
                response(res, 200, report)
            } catch (e) {
                console.log(e);
                response(res, e.code, response.ERROR(e.data))
            }
        } else {
            response(res, 403, response.ERROR("rol no permitido"))
        }
    })

    app.get("/reportes/maquina/:id", oauth.introspect, async (req, res) => {
        if (await validate(req, res, "administrador,supervisor,operador")) {
            try {
                let otro = ""
                let idspSel = null

                let lapso = req.query.lapso

                try {
                    otro = req.query.otro.split(":")
                    idspSel = req.query.idsp

                } catch (e) {
                }
                let id = req.params.id
                let report = await entityPersistence.getByMaq(id, lapso, otro,idspSel)


                response(res, 200, report)
            } catch (e) {
                console.log(e);
                response(res, e.code, response.ERROR(e.data))
            }
        } else {
            response(res, 403, response.ERROR("rol no permitido"))
        }
    })


}