var token = process.env.TOKEN;

var db = require('./db');
var Bot = require('node-telegram-bot-api');
var bot;

if (process.env.NODE_ENV === 'production') {
    bot = new Bot(token);
    bot.setWebHook(process.env.HEROKU_URL + bot.token);
} else {
    bot = new Bot(token, { polling: true });
}

bot.on("message", function(msg) {
    var name = msg.from.first_name;
    console.log("Nuevo mensaje recibido de " + name, JSON.stringify(msg));
    var comando = obtenerComando(msg);

    switch(comando) {
        case "/start": 
            iniciarDispositivo(msg);
            break;
        case "/stop":
            eliminarDispositivo(msg);
            break;
        case "/comprobar":
            comprobarUltimaActualizacion(msg);
            break;
        default:
            enviarInstrucciones(msg);
            break;
    }
});

function obtenerComando(msg) {
    if(msg.text.startsWith("/start")) {
        return "/start";
    } else if(msg.text.startsWith("/stop")) {
        return "/stop";
    } else if(msg.text.startsWith("/comprobar")) {
        return "/comprobar";
    } else {
        return null;
    }
}

function iniciarDispositivo(msg) {
    db.buscarDispositivo(msg.from.id, function(err, usr) {
        if(err) {
            console.log("Error al buscar usuario: ", err);
            enviarMensaje(msg.from.id, "Error al buscar usuario");
        } else if(usr) {
            enviarMensaje(msg.from.id, "Su ID de telegram ya estba registrado en el sistema. A partir de ahora su señal heartbeat deberá incluir el campo monitorId: " + msg.from.id);
        } else {
            db.nuevoDispositivo(msg.from.id, function(err, usu) {
                if(err) {
                    enviarMensaje(msg.from.id, "Ha ocurrido un error al registrar su id de usuario en la base de datos. " + JSON.stringify(err));
                } else {
                    enviarInstrucciones(msg);
                    enviarMensaje(msg.from.id, "Su ID de telegram se ha registrado en el sistema. A partir de ahora su señal heartbeat deberá incluir el campo monitorId: " + msg.from.id);
                }
            });
        }
    });
    // TODO Buscar el usuario. Si existe, nada. Si no existe, registrar monitorId = id de telegram.
}

function eliminarDispositivo(msg) {
    db.eliminarDispositivo(msg.from.id, function(err) {
        if(err) {
            var mensaje = "Error al eliminar dispositivo: " + JSON.stringify();
            console.log(mensaje);
            enviarMensaje(msg.from.id, mensaje);
        } else {
            console.log("Dispositivo eliminado: " + msg.from.id);
            enviarMensaje(msg.from.id, "Dispositivo eliminado. Puede eliminar el chat para detener el bot o bien volver a registrarse con el comando /start");
        }
    });
}

function enviarInstrucciones(msg) {
    var name = msg.from.first_name;
    var mensaje = "Bienvenido a MonitorCasaBot, " + name + ".\n"
    + "Este bot permite monitorizar el estado de una señal heartbeat. Usted recibirá un mensaje "
    + "en caso de que la señal deje de recibirse durante un periodo determinado y también cuando "
    + "la señal se restaure tras el periodo de ausencia.";
    enviarMensaje(msg.chat.id, mensaje);
};

function enviarMensaje(id, texto) {
    bot.sendMessage(id, texto)
        .then(function() {
            console.log("Mensaje enviado al usuario " + id + ": " + texto);
        })
        .catch(function(err) {
            console.log("Error al enviar mensaje al usuario " + id, err);
        });
}

bot.comprobarEstados = function() {
    console.log("---> COMPROBAR ESTADOS", new Date());
    db.obtenerLista(procesarEstados);
}

function procesarEstados(err, dispositivos) {
    if(err) {
        console.log("Error al obtener los dispositivos:", err);
    } else {
        console.log("Éxito al obtener los dispositivos: ", dispositivos)
    }
}

console.log('Bot server started in the ' + process.env.NODE_ENV + ' mode');
module.exports = bot;