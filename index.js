require("dotenv").config();

var bot = require('./bot');
require('./web')(bot);

setInterval(function() {
    bot.comprobarEstados();
}, 5*60*1000);
bot.comprobarEstados();
