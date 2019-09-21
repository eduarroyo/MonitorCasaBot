var token = process.env.TOKEN;

var db = require('./db');
var Bot = require('node-telegram-bot-api');
var bot;

var diferenciaMaximaMilisegundos = process.env.DIFERENCIA_MAXIMA_MILISEGUNDOS || (30*60*1000); // Por defecto 30 minutos

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
            console.log("Error al buscar dispositivo: ", err);
            enviarMensaje(msg.from.id, "Error al buscar dispositivo");
        } else if(usr) {
            enviarMensaje(msg.from.id, "Su ID de telegram ya estba registrado en el sistema. A partir de ahora su señal heartbeat deberá incluir el campo monitorId: " + msg.from.id);
        } else {
            db.nuevoDispositivo(msg.from.id, function(err, usu) {
                if(err) {
                    enviarMensaje(msg.from.id, "Ha ocurrido un error al registrar su id de dispositivo en la base de datos. " + JSON.stringify(err));
                } else {
                    enviarInstrucciones(msg);
                    enviarMensaje(msg.from.id, "Su ID de telegram se ha registrado en el sistema. A partir de ahora su señal heartbeat deberá incluir el campo monitorId: " + msg.from.id);
                }
            });
        }
    });
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

function comprobarUltimaActualizacion(msg) {
    db.buscarDispositivo(msg.from.id, function(err, dis) {
        var ahora = new Date();
        if(err) {
            console.log("Error al buscar dispositivo: ", err);
            enviarMensaje(msg.from.id, "Error al buscar dispositivo: " + JSON.stringify(err));
        } else if(!dis) {
            enviarMensaje(msg.from.id, "Su ID de telegram no está registrado. Utilice el comando /start.");
        } else {
            if(dis && !dis.timestamp) {
                enviarMensaje(msg.from.id, "Su dispositivo todavía no ha enviado ninguna actualización.");
            } else if(dis.timestamp && (ahora - dis.timestamp) >= diferenciaMaximaMilisegundos) {
                var dateES = (new Date(dis.timestamp)).toLocaleString("es-ES", {timeZone: "Europe/Madrid"});
                var dd = new Date(dateES);
                enviarMensaje(msg.from.id, "Su dispositivo está desconectado. Última actualización recibida: " + dd.toLocaleString());
            } else {
                var dateES = (new Date(dis.timestamp)).toLocaleString("es-ES", {timeZone: "Europe/Madrid"});
                var dd = new Date(dateES);
                enviarMensaje(msg.from.id, "Su dispositivo está conectado. Última actualización recibida: " + dd.toLocaleString());
            }
            enviarMensaje(msg.from.id, JSON.stringify(dis));
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

        var total = dispositivos.length;
        for(var i = 0; i < total; i++) {
            var disActual = dispositivos[i];
            procesarEstadoDispositivo(disActual);
        }
    }
}

function procesarEstadoDispositivo(dis) {
    var ahora = new Date();
    var dateES = (new Date(dis.timestamp)).toLocaleString("es-ES", {timeZone: "Europe/Madrid"});
    var ts = new Date(dateES);
    if(!dis || !dis.timestamp) {
        return;
    } else if((ahora - dis.timestamp) >= diferenciaMaximaMilisegundos) {
        if(!dis.ultimoMensaje || !dis.ultimaCaida || dis.ultimaCaida > dis.ultimoMensaje) {
            db.establecerCaida(dis.monitorId, function(err) {
                if(err) {
                    console.log("Error registrando caída del dispositivo " + dis.monitorId, err);
                    enviarMensaje(dis.monitorId, "Error registrando caída del dispositivo " + dis.monitorId + ": " + JSON.stringify(err));
                } else {
                    console.log("Caída del dispositivo " + dis.monitorId + " registrada.")
                    enviarMensaje(dis.monitorId, "Su dispositivo está DESCONECTADO. Última actualización recibida: " + ts.toLocaleString());
                    db.establecerUltimoMensaje(dis.monitorId, function(err) {
                        if(err) {
                            console.log("Error registrando fecha del último mensaje enviado al dispositivo " + dis.monitorId + ": " + JSON.stringify(err));
                        }
                    });
                }
            });
        } else {
            console.log("El dispositivo " + dis.monitorId + " sigue caído.");
        }
    } else if(dis.ultimaCaida && dis.timestamp > dis.ultimaCaida) {
        db.restaurarTrasCaida(dis.monitorId, function(err) {
            if(err) {
                console.log("Error registrando restauracion tras caída del dispositivo " + dis.monitorId + ": " + JSON.stringify(err));
                enviarMensaje(dis.monitorId, "Error registrando restauracion tras caída del dispositivo " + dis.monitorId + ": " + JSON.stringify(err));
            } else {
                console.log("Restauración del dispositivo " + dis.monitorId + " registrada.")
                enviarMensaje(dis.monitorId, "Su dispositivo está CONECTADO DE NUEVO. Última actualización recibida: " + ts.toLocaleString());
                db.establecerUltimoMensaje(dis.monitorId, function(err) {
                    if(err) {
                        console.log("Error registrando fecha del último mensaje enviado al dispositivo " + dis.monitorId + ": " + JSON.stringify(err));
                    }
                });
            }
        });
    } else {
        console.log("El dispositivo " + dis.monitorId + " sigue conectado.");
    }
}

console.log('Bot server started in the ' + process.env.NODE_ENV + ' mode');
module.exports = bot;