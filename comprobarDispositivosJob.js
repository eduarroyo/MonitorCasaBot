var https = require('https');

var url = "https://monitor-actividad.herokuapp.com/comprobarDispositivios";
console.log(url);

https.get(url, function(response) {
    console.log("Solicitud periódica realizada.");
});