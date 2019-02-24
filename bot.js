var token = "791288056:AAHy0K-jGsOG1jmFaMzX7Z1ASfwL4OF5Gp8";

var Bot = require('node-telegram-bot-api');
var bot;

if (process.env.NODE_ENV === 'production') {
    bot = new Bot(token);
    bot.setWebHook("https://monitor-actividad.herokuapp.com/" + bot.token);
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