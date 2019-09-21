require("dotenv").config();

var bot = require('./bot');
require('./web')(bot);

setInterval(function() {
    bot.comprobarEstados();
}, 15*60*1000); // Repetir una vez cada quince minutos
bot.comprobarEstados();
