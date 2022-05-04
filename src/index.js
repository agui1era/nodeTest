const initDB = require("./database/index");
const loginEvent = require("./events/login/loginRouter")
const usersEvent = require("./events/users/usersRouter")
const plantEvent = require("./events/plant/plantRouter")
const processEvent = require("./events/process/processRouter")
const schedulerEvent = require("./events/scheduler/router")
const productsEvent = require("./events/products/router")
const subproductsEvent = require("./events/subproducts/router")
const reportesEvent = require("./events/reportes/router")
const notificacionEvent = require("./events/notificacion/router")
const subproductsMachineEvent = require("./events/subproductsmaquina/router")
const planificacionEvent = require("./events/planificacion/router")
const inventoryEvent = require("./events/inventory/router")
const prodLogsEvents = require("./events/prodlog/router")
const categoryDetentionEvent = require("./events/categoryDetention/router")
const detentionEvent = require("./events/detention/router")
const machineEvent = require("./events/machine/router")
const mermasEvent = require("./events/merma/router")
const turnoMermasEvent = require("./events/turnomermas/router")
const interrupcionEvent = require("./events/interruption/router")
const turnEvent = require("./events/turn/router")
const maintenanceEvent = require("./events/maintenance/router")
const mantinventarioEvent = require("./events/mantinventario/router")
const tiposuscripcionEvent = require("./events/tiposuscripcion/router")
const categorySensorevent = require("./events/sensorcategory/router")
const oeeEvent = require("./events/oee/router")
const settingsEvent = require("./events/settings/router")
const mantmaquinaEvent = require("./events/mantmaquina/router")
const planillasEvent = require("./events/planillas/router")
const uploadEvent = require("./events/cargasMasivas/router")
const ordenDeTrabajoEvent = require("./events/ordendetrabajo/router")
const comentariosotEvent = require("./events/comentariosot/router")
const sensorEvent = require("./events/sensores/router")
const express = require('express');
const turnEventClass = require("./events/turn/event")
const sesionesSocketEventClass = require("./events/sesionessocket/events")
const ordendetrabajoEventClass = require("./events/ordendetrabajo/events")
const mantenimientoEventClass = require("./events/maintenance/events")
const app = express();
const http = require('http');
const server = http.createServer(app);
const {Server} = require("socket.io")
const bodyParser = require('body-parser');
const getLine = require('./utils/getLine')
const cron = require('node-cron');
const logger = require("./utils/logger")
const indicadoresEvents = require("./events/indicadores/router")
const io = new Server(server, {
    cors: {
        origin: "*",
    }
});
console.log = function (...args) {
    let msg = {...args}[0];
    logger(msg)
}
/*
app.use(express.json());*/
var jsonParser = bodyParser.json({limit: 1024 * 1024 * 10, type: 'application/json'});
var urlencodedParser = bodyParser.urlencoded({
    extended: true,
    limit: 1024 * 1024 * 10,
    type: 'application/x-www-form-urlencoded'
});
app.use(jsonParser);
app.use(urlencodedParser);
const main = async () => {
    initDB.init();

    app.use((req, res, next) => {
        res.setHeader("Access-Control-Allow-Origin", "*")
        res.setHeader("Access-Control-Allow-Headers", "content-type,authorization,lahora")
        res.setHeader("Access-Control-Allow-Methods", "PUT, DELETE, PATCH")
        res.setHeader("Access-Control-Expose-Headers", "lahora")

        next()
    })

    uploadEvent(app)

    /*app.use(function (req, res, next) {
        req.rawBody = '';
        req.setEncoding('utf8');

        req.on('data', function (chunk) {
            req.rawBody += chunk;

        });

        req.on('end', function () {
            logger.entradas(req.url)
            logger.entradas(req.rawBody)
            console.log(req.rawBody);
            try {
                if(req.rawBody.length>=1){
                    console.log(JSON.parse(req.rawBody));
                }
            } catch (e) {
                console.log(e);
                res.send({})
            }

        });
        next();

    });
    */
    loginEvent(app)
    usersEvent(app)
    plantEvent(app)
    processEvent(app)
    reportesEvent(app)
    productsEvent(app)
    inventoryEvent(app)
    categoryDetentionEvent(app)
    machineEvent(app)
    turnEvent(app, io)
    interrupcionEvent(app, io)
    mantinventarioEvent(app)
    maintenanceEvent(app,io)
    detentionEvent(app)
    settingsEvent(app)
    oeeEvent(app)
    subproductsEvent(app)
    schedulerEvent(app)
    notificacionEvent(app)
    subproductsMachineEvent(app)
    ordenDeTrabajoEvent(app, io)
    tiposuscripcionEvent(app, io)
    categorySensorevent(app)
    turnoMermasEvent(app)
    mermasEvent(app)
    prodLogsEvents(app)
    comentariosotEvent(app)
    planillasEvent(app)
    sensorEvent(app, io)
    planificacionEvent(app)
    mantmaquinaEvent(app, io)
    indicadoresEvents(app)

    io.on('connection', (socket) => {
        socket.on('registerUserSession', (data) => {
            sesionesSocketEventClass.registrarSesion({token:data.token,idsocket:socket.id})
            //registrar en tabla sesiones el username y socket.id, para mensajes privados
            //verificar si el username ya existe en la tabla sesiones para que no sea nuevamente creado
            console.log('a user try register');
            console.log(data);
        });
        socket.on('disconnect', () => {
            sesionesSocketEventClass.deleteSession({idsocket:socket.id})
            //eliminar socket.id de la tabla sesiones
            console.log('a user disconnected');
            console.log(socket.id);
        });

    });

    //TAREAS CADA 1 HORA
    cron.schedule('0 0 */1 * * *', () => {
        io.emit("hora", Date.now())
        console.log("Task is running every hour " + new Date())
        turnEventClass.endActiveTurns()
        ordendetrabajoEventClass.otAtrasadas(io).then(ok=>{})
        mantenimientoEventClass.atrasadas(io).then(ok=>{})
        setTimeout(() => {
            turnEventClass.initTurnsIfNotExists()
        }, 10000)
    });
    //TAREAS CADA 1 MINUTO
    cron.schedule('0 */1 * * * *', () => {
        io.emit("minuto", Date.now())
        console.log("Task is running every minute " + new Date())

    });
    setTimeout(() => {
        turnEventClass.initTurnsIfNotExists()
    }, 30000)
    server.listen(3000)
}

main().then(ok => {
    console.log('ok');
})
