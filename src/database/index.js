const {Sequelize} = require('sequelize');

const dbhost = process.env.DBHOST || 'localhost'
const sequelize = new Sequelize('postgres://postgres:roota@' + dbhost + ':5432/mesdatabase_development', {
    logging: false
}) // Example for postgres
const initModels = require("./models/init-models")

module.exports.init = () => {
    let {
        subproducto,
        subproductosmaquina,
        parada,
        categoriadeparada,
        planta,
        tiposuscripcion,
        merma,
        proceso,
        categoriasensor,
        maquina,
        producto,
        horarios,
        diashorarios,
        configuraciones,
        diaspermitidos,
        inventario
    } = initModels(sequelize)
    if (process.env.VOLCOBD >= 1) {
        console.log("Rehaciendo BD");
        sequelize.sync({force: true}).then(async ok => {
            await diaspermitidos.create({
                nombre: "Lunes",
                permitido: true,
                num: "1"
            })
            await diaspermitidos.create({
                nombre: "Martes",
                permitido: true,
                num: "2"

            })
            await diaspermitidos.create({
                nombre: "Miercoles",
                permitido: true,
                num: "3"

            })
            await diaspermitidos.create({
                nombre: "Jueves",
                permitido: true,
                num: "4"

            })
            await diaspermitidos.create({
                nombre: "Viernes",
                permitido: true,
                num: "5"

            })
            await diaspermitidos.create({
                nombre: "Sabado",
                permitido: false,
                num: "6"

            })
            await diaspermitidos.create({
                nombre: "Domingo",
                permitido: false,
                num: "0"

            })
            await tiposuscripcion.create({
                gatillo: "nueva OT creada",
                tipo: 'Orden de trabajo',

            })
            await tiposuscripcion.create({
                gatillo: "OT comenzada",
                tipo: 'Orden de trabajo',

            })
            await tiposuscripcion.create({
                gatillo: "OT terminada",
                tipo: 'Orden de trabajo',

            })
            await tiposuscripcion.create({
                gatillo: "OT atrasada",
                tipo: 'Orden de trabajo',

            })

            await tiposuscripcion.create({
                gatillo: "Parada de alerta critica creada 10 min",
                tipo: 'Paradas',
            })
            await tiposuscripcion.create({
                gatillo: "Parada de alerta critica creada 30 min",
                tipo: 'Paradas',
            })
            await tiposuscripcion.create({
                gatillo: "Parada terminada, producción reanudada",
                tipo: 'Paradas',
            })
            await tiposuscripcion.create({
                gatillo: "Nueva orden de mantenimiento creada",
                tipo: 'Mantencion',

            })
            await tiposuscripcion.create({
                gatillo: "Orden de mantenimiento comenzada",
                tipo: 'Mantencion',

            })
            await tiposuscripcion.create({
                gatillo: "Orden de mantenimiento terminada",
                tipo: 'Mantencion',

            })

            await tiposuscripcion.create({
                gatillo: "Orden de mantenimiento atrasada",
                tipo: 'Mantencion',

            })
            await tiposuscripcion.create({
                gatillo: "Reporte semanal",
                tipo: 'Informativa',

            })
            await tiposuscripcion.create({
                gatillo: "Creación de parada critica",
                tipo: 'Paradas',

            })
            await merma.create({
                nombre: "Ajustes",

            })
            let pcp = await categoriadeparada.create({
                nombre: "Perdida de capacidad productiva",
                color: "#a4a4a4",
                colorText: "#090909",
                tipo: "ninguna",
                requiereInventario: true
            })

            let legallosses = await categoriadeparada.create({
                nombre: "Perdidas legales",
                color: "#a4a4a4",
                colorText: "#090909",
                tipo: "ninguna",
                requiereInventario: true
            })

            await parada.create({
                nombre: "Baja de velocidad",
                idmaqrel: "000",
            })
            await parada.create({
                nombre: "Vacaciones",
                idmaqrel: "000",
                idcategoriaparada: pcp.id
            })
            await parada.create({
                nombre: "Cambio de patrón",
                idmaqrel: "000",
                idcategoriaparada: pcp.id

            })
            await parada.create({
                nombre: "Motivo fuerza mayor",
                idmaqrel: "000",
                idcategoriaparada: pcp.id

            })
            await parada.create({
                nombre: "Feriado",
                idmaqrel: "000",
                idcategoriaparada: pcp.id

            })
            await horarios.create({
                nombre: "mañana",
                horainicio: "07:00",
                horasdelturno: 7,
                horafin: "14:00"
            })
            await horarios.create({
                nombre: "tarde",
                horainicio: "14:00",
                horasdelturno: 7,
                horafin: "21:00"
            })
            await horarios.create({
                nombre: "noche",
                horasdelturno: 10,
                horainicio: "21:00",
                horafin: "07:00"
            })

            await diashorarios.create({
                idhorarios: 1,
                iddiaspermitidos: 1,
            })
            await diashorarios.create({
                idhorarios: 2,
                iddiaspermitidos: 1,
            })
            await diashorarios.create({
                idhorarios: 3,
                iddiaspermitidos: 1,
            })
            await diashorarios.create({
                idhorarios: 1,
                iddiaspermitidos: 2,
            })
            await diashorarios.create({
                idhorarios: 2,
                iddiaspermitidos: 2,
            })
            await diashorarios.create({
                idhorarios: 3,
                iddiaspermitidos: 2,
            })

            await diashorarios.create({
                idhorarios: 1,
                iddiaspermitidos: 3,
            })
            await diashorarios.create({
                idhorarios: 2,
                iddiaspermitidos: 3,
            })
            await diashorarios.create({
                idhorarios: 3,
                iddiaspermitidos: 3,
            })

            await diashorarios.create({
                idhorarios: 1,
                iddiaspermitidos: 4,
            })
            await diashorarios.create({
                idhorarios: 2,
                iddiaspermitidos: 4,
            })
            await diashorarios.create({
                idhorarios: 3,
                iddiaspermitidos: 4,
            })

            await diashorarios.create({
                idhorarios: 1,
                iddiaspermitidos: 5,
            })
            await diashorarios.create({
                idhorarios: 2,
                iddiaspermitidos: 5,
            })
            await diashorarios.create({
                idhorarios: 3,
                iddiaspermitidos: 5,
            })

            await diashorarios.create({
                idhorarios: 1,
                iddiaspermitidos: 6,
            })
            await diashorarios.create({
                idhorarios: 2,
                iddiaspermitidos: 6,
            })
            await diashorarios.create({
                idhorarios: 3,
                iddiaspermitidos: 6,
            })

            await diashorarios.create({
                idhorarios: 1,
                iddiaspermitidos: 7,
            })
            await diashorarios.create({
                idhorarios: 2,
                iddiaspermitidos: 7,
            })
            await diashorarios.create({
                idhorarios: 3,
                iddiaspermitidos: 7,
            })

            await categoriadeparada.create({
                nombre: "Falta Servicio",
                clase: "MPL",
                color: "#0FD2BB",
                colorText: "#F3AA18",
                tipo: "no programada",
                requiereInventario: true
            })

            await categoriadeparada.create({
                nombre: "Falla maquina",
                clase: "PDL",
                colorText: "#EA3D2F",
                color: "#FEE4E2",
                tipo: "no programada",
                requiereInventario: false
            })
            await categoriadeparada.create({
                nombre: "Paros Programados",
                clase: "PDL",
                color: "#65105e",
                colorText: "#367BF5",
                tipo: "no programada",
                requiereInventario: false
            })
            await categoriadeparada.create({
                nombre: "Mantenimiento",
                clase: "PDL",

                color: "#edb50c",
                colorText: "#069697",
                tipo: "programada",
                requiereInventario: true
            })
            await categoriadeparada.create({
                nombre: "Situaciones externas",
                clase: "MPL",
                color: "#0c91d4",
                colorText: "#2FA84F",
                tipo: "no programada",
                requiereInventario: false
            })
            await categoriasensor.create({
                nombre:"Contador inicial"
            })
            await categoriasensor.create({
                nombre:"Scrap"
            })
            await categoriasensor.create({
                nombre:"Contador final"
            })


            await planta.create({
                nombre: "Planta A."
            })

            await proceso.create({
                nombre: "Proceso A",
                idplanta: "1"
            })


            await proceso.create({
                nombre: "Proceso AA",
                idplanta: "1"
            })

            await proceso.create({
                nombre: "Proceso B",
                idplanta: "1"
            })

            let producto1 = await producto.create({
                nombre: "AMPOLLAS",
            })


            /*   await producto.create({
                   nombre: 'ACETATO DE SODIO TRIHIDRATO',
                   categoria: 'Ampollas'
               })
               await producto.create({
                   nombre: 'AGUA PARA INYECTABLES',
                   categoria: 'Ampollas'
               })
               await producto.create({
                   nombre: 'AMINOFILINA',
                   categoria: 'Ampollas'
               })
               await producto.create({
                   nombre: 'CLINDAMICINA',
                   categoria: 'Ampollas'
               })
               await producto.create({
                   nombre: 'CIANOCOBALAMINA',
                   categoria: 'Ampollas'
               })
               await producto.create({
                   nombre: 'ACIDO ASCORBICO',
                   categoria: 'Ampollas'
               })
               await producto.create({
                   nombre: 'AMIKACINA',
                   categoria: 'Ampollas'
               })
               await producto.create({
                   nombre: 'ATROPINA SULFATO',
                   categoria: 'Ampollas'
               })
               await producto.create({
                   nombre: 'BESILATO DE ATRACURIO',
                   categoria: 'Ampollas'
               })
               await producto.create({
                   nombre: 'BETAMETASONA',
                   categoria: 'Ampollas'
               })
               await producto.create({
                   nombre: 'BICARBONATO SODIO',
                   categoria: 'Ampollas'
               })
               await producto.create({
                   nombre: 'BUPIVACAINA',
                   categoria: 'Ampollas'
               })
               await producto.create({
                   nombre: 'BURTEN',
                   categoria: 'Ampollas'
               })
               await producto.create({
                   nombre: 'Producto',
                   categoria: 'null'
               })
               await producto.create({
                   nombre: 'BIFOSFATO POTASIO',
                   categoria: 'Ampollas'
               })


               await producto.create({
                   nombre: "Producto C",
               })*/
            let subproducto1 = await subproducto.create({
                nombre: "atropina sulfatoV1",
                stdprod: 3200,
                condicion: "carboniza",
                velprod: 1500,
                formato: "ml",
                unidad: "1",
                idproducto: producto1.id,
                pesoenvase: 70,
                pesofinal: 230,
                sku: "0102f15"
            })

            let subproducto2 = await subproducto.create({
                nombre: "atropina sulfatoV2",
                stdprod: 200,
                condicion: "normal",
                velprod: 500,
                formato: "ml",
                unidad: "1",
                idproducto: producto1.id,
                pesoenvase: 200,
                pesofinal: 1500,
                sku: "0102f15"

            })

            let maquina1 = await maquina.create({
                nombre: "Maquina A",
                oeeesperado: "10",
                lugar: "Zona A, lado SUR",
                idproceso: "1",
                subproductoasignado: subproducto1.id

            })
            let maquina2 = await maquina.create({
                nombre: "Maquina AA",
                oeeesperado: "90",
                lugar: "Zona A, lado OESTE",
                idproceso: "2",
                subproductoasignado: subproducto1.id

            })
            let maquina3 = await maquina.create({
                nombre: "Maquina B",
                oeeesperado: "50",
                lugar: "Zona A, lado SUR 2",
                idproceso: "2",
                subproductoasignado: subproducto2.id
            })

            await subproductosmaquina.create({
                idmaquina: maquina1.id,
                idsubproducto: subproducto1.id
            })
            await subproductosmaquina.create({
                idmaquina: maquina2.id,
                idsubproducto: subproducto1.id
            })
            await subproductosmaquina.create({
                idmaquina: maquina3.id,
                idsubproducto: subproducto2.id
            })

            await configuraciones.create({
                pais: "Chile",
                nombreempresa: "Nombre",
                thingsboardurl: 'http://example.com'
            })

            await inventario.create({
                nombre: "motor a1",
                sku: "abcd12341",
                stock: "100"
            })
            await inventario.create({
                nombre: "motor b2",
                sku: "abcd12343",
                stock: "5"
            })
            await inventario.create({
                nombre: "manguera 10mm",
                sku: "abcd12342",
                stock: "1000"
            })
            await inventario.create({
                nombre: "tornillos",
                sku: "abcd12344",
                stock: "8500"
            })
        })
    }
}
module.exports.sql = sequelize
/*
categoriadeparada.create({
    nombre:"Paros programados",
    color:"#8db3e2",
    tipo:"programada",
    requiereInventario:true
});
categoriadeparada.create({
    nombre:"Falla en el equipo",
    color:"#fbd4b4",
    tipo:"programada",
    requiereInventario:true
});
categoriadeparada.create({
    nombre:"Inestabilidad del equipo o ajustes",
    color:"#92cddc",
    tipo:"programada",
    requiereInventario:true
});
categoriadeparada.create({
    nombre:"Falla de servicios",
    color:"#c2d69b",
    tipo:"programada",
    requiereInventario:true
});
categoriadeparada.create({
    nombre:"Falla por situaciones externas",
    color:"#d99594",
    tipo:"programada",
    requiereInventario:true
})
*/
