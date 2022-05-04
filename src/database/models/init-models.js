var DataTypes = require("sequelize").DataTypes;
var _administrador = require("./administrador");
var _alerta = require("./alerta");
var _categoriadeparada = require("./categoriadeparada");
var _categoriainventario = require("./categoriainventario");
var _configuraciones = require("./configuraciones");
var _turnomerma = require("./turnomerma");
var _ordendetrabajopausa = require("./ordendetrabajopausa");
var _prodevents = require("./prodevents");
var _indicadoresevents = require("./indicadoresevents");
var _diashorarios = require("./diashorarios");
var _diaspermitidos = require("./diaspermitidos");
var _iniciadorot = require("./iniciadorot");
var _detproduccion = require("./detproduccion");
var _grupnot = require("./gruponot");
var _detgruponot = require("./detgrupnot");
var _detturoperador = require("./detturoperador");
var _comentariosot = require("./comentariosot");
var _dettursupervisor = require("./dettursupervisor");
var _horarios = require("./horarios");
var _interrupcion = require("./interrupcion");
var _inventario = require("./inventario");
var _mantencion = require("./mantencion");
var _mantinventario = require("./mantinventario");
var _maquina = require("./maquina");
var _operador = require("./operador");
var _adminsus = require("./adminsus");
var _adminnoti = require("./adminoti");
var _maquinamant = require("./maquinamant");
var _merma = require("./merma");
var _notificacion = require("./notificacion");
var _openoti = require("./openoti");
var _opersus = require("./opersus");
var _supersus = require("./supersus");
var _supnoti = require("./supnoti");
var _tiponotificacion = require("./tiponotificacion");
var _tiposuscripcion = require("./tiposuscripcion");
var _parada = require("./parada");
var _paradamaquina = require("./paradamaquina");
var _planta = require("./planta");
var _proceso = require("./proceso");
var _produccionmaquina = require("./produccionmaquina");
var _ordendetrabajo = require("./ordendetrabajo");
var _subproductosmaquina = require("./subproductosmaquina");
var _producto = require("./producto");
var _productoturno = require("./productoturno");
var _sensor = require("./sensor");
var _categoriasensor = require("./categoriasensor");
var _sensordata = require("./sensordata");
var _subproducto = require("./subproducto");
var _supervisor = require("./supervisor");
var _supervisoroperadormsj = require("./supervisoroperadormsj");
var _turno = require("./turno");
var _sesionessocket = require("./sesionessocket");

function initModels(sequelize) {
    var categoriadeparada = _categoriadeparada(sequelize, DataTypes);

    var parada = _parada(sequelize, DataTypes);

    var planta = _planta(sequelize, DataTypes);
    var sesionessocket = _sesionessocket(sequelize, DataTypes);

    var proceso = _proceso(sequelize, DataTypes);
    var maquina = _maquina(sequelize, DataTypes);
    var producto = _producto(sequelize, DataTypes);

    var subproducto = _subproducto(sequelize, DataTypes);

    var ordendetrabajo = _ordendetrabajo(sequelize, DataTypes);

    var tiposuscripcion = _tiposuscripcion(sequelize, DataTypes);
    var merma = _merma(sequelize, DataTypes);
    var gruponot = _grupnot(sequelize, DataTypes)
    var detgruponot = _detgruponot(sequelize, DataTypes)
    var tiponotificacion = _tiponotificacion(sequelize, DataTypes);

    var operador = _operador(sequelize, DataTypes);
    var indicadoresevents = _indicadoresevents(sequelize, DataTypes);


    var notificacion = _notificacion(sequelize, DataTypes);

    var administrador = _administrador(sequelize, DataTypes);


    var supervisor = _supervisor(sequelize, DataTypes);
    var adminsus = _adminsus(sequelize, DataTypes);
    var adminnoti = _adminnoti(sequelize, DataTypes);
    var maquinamant = _maquinamant(sequelize, DataTypes);
    var prodevents = _prodevents(sequelize, DataTypes);
    var turnomerma = _turnomerma(sequelize, DataTypes);
    var openoti = _openoti(sequelize, DataTypes);
    var opersus = _opersus(sequelize, DataTypes);
    var supersus = _supersus(sequelize, DataTypes);
    var supnoti = _supnoti(sequelize, DataTypes);

    var horarios = _horarios(sequelize, DataTypes);
    var diaspermitidos = _diaspermitidos(sequelize, DataTypes);

    var diashorarios = _diashorarios(sequelize, DataTypes);


    var categoriasensor = _categoriasensor(sequelize, DataTypes)
    var ordendetrabajopausa = _ordendetrabajopausa(sequelize, DataTypes);
    var comentariosot = _comentariosot(sequelize, DataTypes)
    var sensor = _sensor(sequelize, DataTypes)

    var turno = _turno(sequelize, DataTypes);

    var subproductosmaquina = _subproductosmaquina(sequelize, DataTypes);

    var productoturno = _productoturno(sequelize, DataTypes);
    var iniciadorot = _iniciadorot(sequelize, DataTypes);


    var alerta = _alerta(sequelize, DataTypes);
    var turnomerma = _turnomerma(sequelize, DataTypes);
    var categoriainventario = _categoriainventario(sequelize, DataTypes);
    var configuraciones = _configuraciones(sequelize, DataTypes);
    var detproduccion = _detproduccion(sequelize, DataTypes);
    var detturoperador = _detturoperador(sequelize, DataTypes);
    var dettursupervisor = _dettursupervisor(sequelize, DataTypes);
    var interrupcion = _interrupcion(sequelize, DataTypes);
    var inventario = _inventario(sequelize, DataTypes);
    var mantencion = _mantencion(sequelize, DataTypes);
    var mantinventario = _mantinventario(sequelize, DataTypes);
    var paradamaquina = _paradamaquina(sequelize, DataTypes);
    var produccionmaquina = _produccionmaquina(sequelize, DataTypes);
    var sensordata = _sensordata(sequelize, DataTypes);
    var supervisoroperadormsj = _supervisoroperadormsj(sequelize, DataTypes);

    parada.belongsTo(categoriadeparada, {
        as: "idcategoriaparada_categoriadeparada",
        foreignKey: "idcategoriaparada",
        onDelete: 'CASCADE'
    });


    categoriadeparada.hasMany(parada, {as: "paradas", foreignKey: "idcategoriaparada", onDelete: 'CASCADE'});
    turno.belongsTo(horarios, {as: "idhorario_horario", foreignKey: "idhorario", onDelete: 'CASCADE'});
    horarios.hasMany(turno, {as: "turnos", foreignKey: "idhorario", onDelete: 'CASCADE'});
    mantencion.belongsTo(interrupcion, {
        as: "idinterrupcion_interrupcion",
        foreignKey: "idinterrupcion",
        onDelete: 'CASCADE'
    });
    interrupcion.hasMany(mantencion, {as: "mantencions", foreignKey: "idinterrupcion", onDelete: 'CASCADE'});
    mantinventario.belongsTo(inventario, {
        as: "idinventario_inventario",
        foreignKey: "idinventario",
        onDelete: 'CASCADE'
    });
    inventario.hasMany(mantinventario, {as: "mantinventarios", foreignKey: "idinventario", onDelete: 'CASCADE'});
    paradamaquina.belongsTo(maquina, {as: "idmaquina_maquina", foreignKey: "idmaquina", onDelete: 'CASCADE'});
    maquina.hasMany(paradamaquina, {as: "paradamaquinas", foreignKey: "idmaquina", onDelete: 'CASCADE'});
    produccionmaquina.belongsTo(maquina, {as: "idmaquina_maquina", foreignKey: "idmaquina", onDelete: 'CASCADE'});
    maquina.hasMany(produccionmaquina, {as: "produccionmaquinas", foreignKey: "idmaquina", onDelete: 'CASCADE'});
    turno.belongsTo(maquina, {as: "idmaquina_maquina", foreignKey: "idmaquina", onDelete: 'CASCADE'});
    maquina.hasMany(turno, {as: "turnos", foreignKey: "idmaquina", onDelete: 'CASCADE'});

    maquinamant.belongsTo(maquina, {as: "idmaquina_maquina", foreignKey: "idmaquina", onDelete: 'CASCADE'});
    maquina.hasMany(maquinamant, {as: "maquinamants", foreignKey: "idmaquina", onDelete: 'CASCADE'});
    maquinamant.belongsTo(parada, {as: "idparada_parada", foreignKey: "idparada", onDelete: 'CASCADE'});
    parada.hasMany(maquinamant, {as: "maquinamants", foreignKey: "idparada", onDelete: 'CASCADE'});

    turnomerma.belongsTo(ordendetrabajo, {as: "idordendetrabajo_ordendetrabajo", foreignKey: "idordendetrabajo", onDelete: 'CASCADE'});
    ordendetrabajo.hasMany(turnomerma, {as: "turnomermas", foreignKey: "idordendetrabajo", onDelete: 'CASCADE'});
    turnomerma.belongsTo(merma, {as: "idmerma_merma", foreignKey: "idmerma", onDelete: 'CASCADE'});
    merma.hasMany(turnomerma, {as: "turnomermas", foreignKey: "idmerma", onDelete: 'CASCADE'});

    detturoperador.belongsTo(operador, {as: "idoperador_operador", foreignKey: "idoperador", onDelete: 'CASCADE'});
    operador.hasMany(detturoperador, {as: "detturoperadors", foreignKey: "idoperador", onDelete: 'CASCADE'});
    supervisoroperadormsj.belongsTo(operador, {
        as: "idoperador_operador",
        foreignKey: "idoperador",
        onDelete: 'CASCADE'
    });
    operador.hasMany(supervisoroperadormsj, {
        as: "supervisoroperadormsjs",
        foreignKey: "idoperador",
        onDelete: 'CASCADE'
    });
    interrupcion.belongsTo(ordendetrabajo, {as: "idordendetrabajo_ordendetrabajo", foreignKey: "idordendetrabajo", onDelete: 'CASCADE'});
    ordendetrabajo.hasMany(interrupcion, {as: "interrupcions", foreignKey: "idordendinterrupcionetrabajo", onDelete: 'CASCADE'});
    interrupcion.belongsTo(parada, {as: "tipo_parada", foreignKey: "tipo", onDelete: 'CASCADE'});
    parada.hasMany(interrupcion, {as: "interrupcions", foreignKey: "tipo", onDelete: 'CASCADE'});
    mantinventario.belongsTo(parada, {as: "tipo_parada", foreignKey: "tipo", onDelete: 'CASCADE'});
    parada.hasMany(mantinventario, {as: "mantinventarios", foreignKey: "tipo", onDelete: 'CASCADE'});
    paradamaquina.belongsTo(parada, {as: "idparada_parada", foreignKey: "idparada", onDelete: 'CASCADE'});
    parada.hasMany(paradamaquina, {as: "paradamaquinas", foreignKey: "idparada", onDelete: 'CASCADE'});
    proceso.belongsTo(planta, {as: "idplanta_plantum", foreignKey: "idplanta", onDelete: 'CASCADE'});
    planta.hasMany(proceso, {as: "procesos", foreignKey: "idplanta", onDelete: 'CASCADE'});
    maquina.belongsTo(proceso, {as: "idproceso_proceso", foreignKey: "idproceso", onDelete: 'CASCADE'});
    proceso.hasMany(maquina, {as: "maquinas", foreignKey: "idproceso", onDelete: 'CASCADE'});
    sensor.belongsTo(categoriasensor, {
        as: "idcategoriasensor_categoriasensor",
        foreignKey: "idcategoriasensor",
        onDelete: 'CASCADE'
    });
    categoriasensor.hasMany(sensor, {as: "sensors", foreignKey: "idcategoriasensor", onDelete: 'CASCADE'});

    sensordata.belongsTo(subproducto, {as: "idsubproducto_subproducto", foreignKey: "idsubproducto"});
    subproducto.hasMany(sensordata, {as: "sensordatas", foreignKey: "idsubproducto"});

    sensordata.belongsTo(ordendetrabajo, {as: "idordendetrabajo_ordendetrabajo", foreignKey: "idordendetrabajo"});
    ordendetrabajo.hasMany(sensordata, {as: "sensordatas", foreignKey: "idordendetrabajo"});

    sensor.belongsTo(maquina, {as: "idmaquina_maquina", foreignKey: "idmaquina", onDelete: 'CASCADE'});
    maquina.hasMany(sensor, {as: "sensors", foreignKey: "idmaquina", onDelete: 'CASCADE'});

    ordendetrabajo.belongsTo(maquina, {as: "idmaquina_maquina", foreignKey: "idmaquina", onDelete: 'CASCADE'});
    maquina.hasMany(ordendetrabajo, {as: "ordendetrabajos", foreignKey: "idmaquina", onDelete: 'CASCADE'});

    ordendetrabajo.belongsTo(proceso, {as: "idproceso_proceso", foreignKey: "idproceso", onDelete: 'CASCADE'});
    proceso.hasMany(ordendetrabajo, {as: "ordendetrabajos", foreignKey: "idproceso", onDelete: 'CASCADE'});

    ordendetrabajo.belongsTo(planta, {as: "idplanta_plantum", foreignKey: "idplanta", onDelete: 'CASCADE'});
    planta.hasMany(ordendetrabajo, {as: "ordendetrabajos", foreignKey: "idplanta", onDelete: 'CASCADE'});

    ordendetrabajo.belongsTo(subproducto, {
        as: "idsubproducto_subproducto",
        foreignKey: "idsubproducto",
        onDelete: 'CASCADE'
    });
    subproducto.hasMany(ordendetrabajo, {as: "ordendetrabajos", foreignKey: "idsubproducto", onDelete: 'CASCADE'});

    diashorarios.belongsTo(horarios, {as: "idhorarios_horarios", foreignKey: "idhorarios", onDelete: 'CASCADE'});
    horarios.hasMany(diashorarios, {as: "diashorarioss", foreignKey: "idhorarios", onDelete: 'CASCADE'});

    diashorarios.belongsTo(diaspermitidos, {
        as: "iddiaspermitidos_diaspermitidos",
        foreignKey: "iddiaspermitidos",
        onDelete: 'CASCADE'
    });
    diaspermitidos.hasMany(diashorarios, {as: "diashorarioss", foreignKey: "iddiaspermitidos", onDelete: 'CASCADE'});


    productoturno.belongsTo(ordendetrabajo, {
        as: "idordendetrabajo_ordendetrabajo",
        foreignKey: "idordendetrabajo",
        onDelete: 'CASCADE'
    });
    ordendetrabajo.hasMany(productoturno, {as: "productoturnos", foreignKey: "idordendetrabajo", onDelete: 'CASCADE'});

    comentariosot.belongsTo(ordendetrabajo, {
        as: "idordendetrabajo_ordendetrabajo",
        foreignKey: "idordendetrabajo",
        onDelete: 'CASCADE'
    });
    ordendetrabajo.hasMany(comentariosot, {as: "comentariosots", foreignKey: "idordendetrabajo", onDelete: 'CASCADE'});

    iniciadorot.belongsTo(ordendetrabajo, {
        as: "idordendetrabajo_ordendetrabajo",
        foreignKey: "idordendetrabajo",
        onDelete: 'CASCADE'
    });
    ordendetrabajo.hasMany(iniciadorot, {as: "iniciadorots", foreignKey: "idordendetrabajo", onDelete: 'CASCADE'});

    ordendetrabajopausa.belongsTo(ordendetrabajo, {
        as: "idordendetrabajo_ordendetrabajo",
        foreignKey: "idordendetrabajo",
        onDelete: 'CASCADE'
    });
    ordendetrabajo.hasMany(ordendetrabajopausa, {
        as: "ordendetrabajopausas",
        foreignKey: "idordendetrabajo",
        onDelete: 'CASCADE'
    });

    produccionmaquina.belongsTo(producto, {as: "idproducto_producto", foreignKey: "idproducto", onDelete: 'CASCADE'});
    producto.hasMany(produccionmaquina, {as: "produccionmaquinas", foreignKey: "idproducto", onDelete: 'CASCADE'});

    subproductosmaquina.belongsTo(maquina, {as: "idmaquina_maquina", foreignKey: "idmaquina", onDelete: 'CASCADE'});
    maquina.hasMany(subproductosmaquina, {as: "subproductosmaquinas", foreignKey: "idmaquina", onDelete: 'CASCADE'});


    subproductosmaquina.belongsTo(subproducto, {
        as: "idsubproducto_subproducto",
        foreignKey: "idsubproducto",
        onDelete: 'CASCADE'
    });
    subproducto.hasMany(subproductosmaquina, {
        as: "subproductosmaquinas",
        foreignKey: "idsubproducto",
        onDelete: 'CASCADE'
    });

    productoturno.belongsTo(subproducto, {
        as: "idsubproducto_subproducto",
        foreignKey: "idsubproducto",
        onDelete: 'CASCADE'
    });
    subproducto.hasMany(productoturno, {as: "subproductos", foreignKey: "idsubproducto", onDelete: 'CASCADE'});
    subproducto.belongsTo(producto, {as: "idproducto_producto", foreignKey: "idproducto", onDelete: 'CASCADE'});
    producto.hasMany(subproducto, {as: "subproductos", foreignKey: "idproducto", onDelete: 'CASCADE'});
    detproduccion.belongsTo(productoturno, {
        as: "idprodturn_productoturno",
        foreignKey: "idprodturn",
        onDelete: 'CASCADE'
    });
    productoturno.hasMany(detproduccion, {as: "detproduccions", foreignKey: "idprodturn", onDelete: 'CASCADE'});
    dettursupervisor.belongsTo(supervisor, {
        as: "idsupervisor_supervisor",
        foreignKey: "idsupervisor",
        onDelete: 'CASCADE'
    });
    supervisor.hasMany(dettursupervisor, {as: "dettursupervisors", foreignKey: "idsupervisor", onDelete: 'CASCADE'});
    supervisoroperadormsj.belongsTo(supervisor, {
        as: "idsupervisor_supervisor",
        foreignKey: "idsupervisor",
        onDelete: 'CASCADE'
    });
    supervisor.hasMany(supervisoroperadormsj, {
        as: "supervisoroperadormsjs",
        foreignKey: "idsupervisor",
        onDelete: 'CASCADE'
    });
    alerta.belongsTo(turno, {as: "idturno_turno", foreignKey: "idturno", onDelete: 'CASCADE'});
    turno.hasMany(alerta, {as: "alerta", foreignKey: "idturno", onDelete: 'CASCADE'});
    detturoperador.belongsTo(turno, {as: "idturno_turno", foreignKey: "idturno", onDelete: 'CASCADE'});
    turno.hasMany(detturoperador, {as: "detturoperadors", foreignKey: "idturno", onDelete: 'CASCADE'});
    dettursupervisor.belongsTo(turno, {as: "idturno_turno", foreignKey: "idturno", onDelete: 'CASCADE'});
    turno.hasMany(dettursupervisor, {as: "dettursupervisors", foreignKey: "idturno", onDelete: 'CASCADE'});
    interrupcion.belongsTo(turno, {as: "idturno_turno", foreignKey: "idturno", onDelete: 'CASCADE'});
    turno.hasMany(interrupcion, {as: "interrupcions", foreignKey: "idturno", onDelete: 'CASCADE'});
    productoturno.belongsTo(turno, {as: "idturno_turno", foreignKey: "idturno", onDelete: 'CASCADE'});
    turno.hasMany(productoturno, {as: "productoturnos", foreignKey: "idturno", onDelete: 'CASCADE'});

    detgruponot.belongsTo(gruponot, {as: "idgruponot_gruponot", foreignKey: "idgruponot", onDelete: 'CASCADE'});
    gruponot.hasMany(detgruponot, {as: "detgruponots", foreignKey: "idgruponot", onDelete: 'CASCADE'});

    detgruponot.belongsTo(maquina, {as: "idmaquina_maquina", foreignKey: "idmaquina", onDelete: 'CASCADE'});
    maquina.hasMany(detgruponot, {as: "detgruponots", foreignKey: "idmaquina", onDelete: 'CASCADE'});

    detgruponot.belongsTo(tiposuscripcion, {
        as: "idtiposuscripcion_tiposuscripcion",
        foreignKey: "idtiposuscripcion",
        onDelete: 'CASCADE'
    });
    tiposuscripcion.hasMany(detgruponot, {as: "detgruponots", foreignKey: "idtiposuscripcion", onDelete: 'CASCADE'});

    supnoti.belongsTo(supervisor, {as: "idsupervisor_supervisor", foreignKey: "idsupervisor", onDelete: 'CASCADE'});
    supervisor.hasMany(supnoti, {as: "supnotis", foreignKey: "idsupervisor", onDelete: 'CASCADE'});


    openoti.belongsTo(operador, {as: "idoperador_operador", foreignKey: "idoperador", onDelete: 'CASCADE'});
    operador.hasMany(openoti, {as: "openotis", foreignKey: "idoperador", onDelete: 'CASCADE'});
    adminnoti.belongsTo(administrador, {
        as: "idadministrador_administrador",
        foreignKey: "idadministrador",
        onDelete: 'CASCADE'
    });
    administrador.hasMany(adminnoti, {as: "adminnotis", foreignKey: "idadministrador", onDelete: 'CASCADE'});
    adminnoti.belongsTo(notificacion, {
        as: "idnotificacion_notificacion",
        foreignKey: "idnotificacion",
        onDelete: 'CASCADE'
    });
    notificacion.hasMany(adminnoti, {as: "adminnotis", foreignKey: "idnotificacion", onDelete: 'CASCADE'});
    supnoti.belongsTo(notificacion, {
        as: "idnotificacion_notificacion",
        foreignKey: "idnotificacion",
        onDelete: 'CASCADE'
    });
    notificacion.hasMany(supnoti, {as: "supnotis", foreignKey: "idnotificacion", onDelete: 'CASCADE'});
    openoti.belongsTo(notificacion, {
        as: "idnotificacion_notificacion",
        foreignKey: "idnotificacion",
        onDelete: 'CASCADE'
    });
    notificacion.hasMany(openoti, {as: "openotis", foreignKey: "idnotificacion", onDelete: 'CASCADE'});

    notificacion.belongsTo(tiponotificacion, {
        as: "idtiponotificacion_tiponotificacion",
        foreignKey: "idtiponotificacion",
        onDelete: 'CASCADE'
    });
    tiponotificacion.hasMany(notificacion, {
        as: "notificacions",
        foreignKey: "idtiponotificacion",
        onDelete: 'CASCADE'
    });

    tiponotificacion.belongsTo(ordendetrabajo, {
        as: "idordendetrabajo_ordendetrabajo",
        foreignKey: "idordendetrabajo",
        onDelete: 'CASCADE'
    });
    ordendetrabajo.hasMany(tiponotificacion, {
        as: "tiponotificacions",
        foreignKey: "idordendetrabajo",
        onDelete: 'CASCADE'
    });


    tiponotificacion.belongsTo(parada, {as: "idparada_parada", foreignKey: "idparada", onDelete: 'CASCADE'});
    parada.hasMany(tiponotificacion, {as: "tiponotificacions", foreignKey: "idparada", onDelete: 'CASCADE'});
    tiponotificacion.belongsTo(maquina, {as: "idmaquina_maquina", foreignKey: "idmaquina", onDelete: 'CASCADE'});
    maquina.hasMany(tiponotificacion, {as: "tiponotificacions", foreignKey: "idmaquina", onDelete: 'CASCADE'});
    tiponotificacion.belongsTo(tiposuscripcion, {
        as: "idtiposuscripcion_tiposuscripcion",
        foreignKey: "idtiposuscripcion",
        onDelete: 'CASCADE'
    });
    tiposuscripcion.hasMany(tiponotificacion, {
        as: "tiponotificacions",
        foreignKey: "idtiposuscripcion",
        onDelete: 'CASCADE'
    });
    adminsus.belongsTo(administrador, {
        as: "idadministrador_administrador",
        foreignKey: "idadministrador",
        onDelete: 'CASCADE'
    });
    administrador.hasMany(adminsus, {as: "adminsuss", foreignKey: "idadministrador", onDelete: 'CASCADE'});
    opersus.belongsTo(operador, {as: "idoperador_operador", foreignKey: "idoperador", onDelete: 'CASCADE'});
    operador.hasMany(opersus, {as: "opersuss", foreignKey: "idoperador", onDelete: 'CASCADE'});
    supersus.belongsTo(supervisor, {as: "idsupervisor_supervisor", foreignKey: "idsupervisor", onDelete: 'CASCADE'});
    supervisor.hasMany(supersus, {as: "supersuss", foreignKey: "idsupervisor", onDelete: 'CASCADE'});
    supersus.belongsTo(maquina, {as: "idmaquina_maquina", foreignKey: "idmaquina", onDelete: 'CASCADE'});
    maquina.hasMany(supersus, {as: "supersuss", foreignKey: "idmaquina", onDelete: 'CASCADE'});
    adminsus.belongsTo(maquina, {as: "idmaquina_maquina", foreignKey: "idmaquina", onDelete: 'CASCADE'});
    maquina.hasMany(adminsus, {as: "adminsuss", foreignKey: "idmaquina", onDelete: 'CASCADE'});
    opersus.belongsTo(maquina, {as: "idmaquina_maquina", foreignKey: "idmaquina", onDelete: 'CASCADE'});
    maquina.hasMany(opersus, {as: "opersuss", foreignKey: "idmaquina", onDelete: 'CASCADE'});

    opersus.belongsTo(tiposuscripcion, {
        as: "idtiposuscripcion_tiposuscripcion",
        foreignKey: "idtiposuscripcion",
        onDelete: 'CASCADE'
    });
    tiposuscripcion.hasMany(opersus, {as: "opersuss", foreignKey: "idtiposuscripcion", onDelete: 'CASCADE'});


    adminsus.belongsTo(tiposuscripcion, {
        as: "idtiposuscripcion_tiposuscripcion",
        foreignKey: "idtiposuscripcion",
        onDelete: 'CASCADE'
    });
    tiposuscripcion.hasMany(adminsus, {as: "adminsuss", foreignKey: "idtiposuscripcion", onDelete: 'CASCADE'});


    supersus.belongsTo(tiposuscripcion, {
        as: "idtiposuscripcion_tiposuscripcion",
        foreignKey: "idtiposuscripcion",
        onDelete: 'CASCADE'
    });
    tiposuscripcion.hasMany(supersus, {as: "supersuss", foreignKey: "idtiposuscripcion", onDelete: 'CASCADE'});


    return {
        administrador,
        alerta,
        categoriadeparada,
        categoriainventario,
        configuraciones,
        detproduccion,
        detturoperador,
        dettursupervisor,
        diashorarios,
        horarios,
        interrupcion,
        inventario,
        adminsus,
        adminnoti,
        maquinamant,
        notificacion,
        openoti,
        opersus,
        supersus,
        supnoti,
        tiposuscripcion,
        tiponotificacion,
        mantencion,
        mantinventario,
        maquina,
        operador,
        categoriasensor,
        sensor,
        parada,
        paradamaquina,
        planta,
        proceso,
        produccionmaquina,
        diaspermitidos,
        producto,
        productoturno,
        sensordata,
        subproducto,
        prodevents,
        ordendetrabajopausa,
        supervisor,
        supervisoroperadormsj,
        subproductosmaquina,
        sesionessocket,
        indicadoresevents,
        merma,
        turno,
    };
}

module.exports = initModels;
module.exports.initModels = initModels;
module.exports.default = initModels;
