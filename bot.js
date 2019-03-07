var token = process.env.TOKEN;

var Bot = require('node-telegram-bot-api');
var bot;

var MongoClient = require('mongodb').MongoClient;
var connectionUrl = 'mongodb+srv://lector:TGRXOtj4KAdlxQI9@monitordb-9o1ct.mongodb.net/MonitorDb';

function consultarEstados(exito, error) {
    try {
        MongoClient.connect(connectionUrl, function(err1, client) {
            if(err1) {
                console.log("Error al obtener la conexión", err1);
                error(err1);
            }
            console.log("Conexión al servidor de bases de datos.");
            var db = client.db("MonitorDb");
            console.log("Obtenida la base de datos");
            var devices = db.collection("devices");
            console.log("Obtenida la colección devices");

            devices.find().toArray(function(err2, docs) {
                if(err2) {
                    console.log("Error al realizar la consulta", JSON.stringify(err));
                    error(err2);
                } else {
                    exito(docs);
                    console.log("Consulta correcta", docs);
                }
            });
        });
    } catch (err2) {
        console.log("Excepción al realizar consulta", JSON.stringify(error));
        error(err3);
    }
}


if (process.env.NODE_ENV === 'production') {
    bot = new Bot(token);
    bot.setWebHook(process.env.HEROKU_URL + bot.token);
} else {
    bot = new Bot(token, { polling: true });
}

console.log('Bot server started in the ' + process.env.NODE_ENV + ' mode');

bot.on('message', function(msg) {
    var name = msg.from.first_name;
    bot.sendMessage(msg.chat.id, 'Hello, ' + name + '!').then(function() {
        // reply sent!
    });
});

module.exports = bot;