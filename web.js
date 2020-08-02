var express = require('express');
var bodyParser = require('body-parser');
var packageInfo = require('./package.json');
var db = require('./dbrepo');
var bot = require('./bot');

var app = express();
app.use(bodyParser.json());

app.get('/', function(req, res) {
    res.json({ version: packageInfo.version });
});

app.get('/comprobarDispositivos', function(req, res) {
    bot.comprobarEstados();
    res.send("OK");
});

// Esta URL permitirá a los clientes Raspberry Pi indicar que han actualizado su estado.
app.post('/actualizar', function(req, res) {
    console.log("-----> solicitud recibida POST /actualizar", req.connection.remoteAddress, req.body);
    db.actualizarEstado(req.body.monitorId, function(err, resul) {
        if(err) {
            console.log(err);
            res.sendStatus(500);
        } else {
            res.sendStatus(200);
        }
    });
});

var server = app.listen(process.env.PORT, "0.0.0.0", function() {
    var host = server.address().address;
    var port = server.address().port;
    console.log('Web server started at http://%s:%s', host, port);
});

module.exports = function(bot) {
    app.post('/' + bot.token, function(req, res) {
        bot.processUpdate(req.body);
        res.sendStatus(200);
    });
};