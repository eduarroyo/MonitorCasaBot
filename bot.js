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


bot.on('message', function(msg) {
    var name = msg.from.first_name;
    bot.sendMessage(msg.chat.id, 'Hello, ' + name + '!').then(function() {
        // reply sent!
    });
});

bot.comprobarEstados = function() {
    console.log("---> COMPROBAR ESTADOS", new Date());
    db.obtenerLista(procesarEstados);
}

function procesarEstados(err, dispositivos) {
    console.log(err, dispositivos);
}

console.log('Bot server started in the ' + process.env.NODE_ENV + ' mode');
module.exports = bot;