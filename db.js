var MongoClient = require('mongodb').MongoClient;

var client = new MongoClient(process.env.CONNSTR, { useNewUrlParser: true });

var connectionUrl = 'mongodb+srv://lector:TGRXOtj4KAdlxQI9@monitordb-9o1ct.mongodb.net/MonitorDb';
var datosConexion = {
    url: "mongodb+srv://lector:TGRXOtj4KAdlxQI9@monitordb-9o1ct.mongodb.net/MonitorDb?retryWrites=true&w=majority",
    //url: "mongodb://lector:TGRXOtj4KAdlxQI9@monitordb-9o1ct.mongodb.net/MonitorDb",
    db: "MonitorDb",
    user: "lector",
    pass: "TGRXOtj4KAdlxQI9",
    collection: "devices"
};

function obtenerLista(monitorId, callback) {
    var db = MongoClient.connect(datosConexion.url, {useNewUrlParser: true, useUnifiedTopology: true})
        .then(function(client) {
            var collection = client.db(datosConexion.db).collection(datosColeccion.collection);
            collection.find({ monitorId: monitorId }).toArray(function(err2, dispositivos) {
                client.close();
                callback(err2, dispositivos);
            });
        });
}

function actualizarEstado(monitorId, callback) {
    console.log("-----> ACTUALIZARESTADO", monitorId);
    MongoClient.connect(datosConexion.url, {useNewUrlParser: true, useUnifiedTopology: true})
        .then(function(client) {
            var collection = client.db(datosConexion.db).collection(datosConexion.collection);
            collection.updateOne(
                { monitorId: {$eq: monitorId} }, // query
                { $set: { monitorId: monitorId, timestamp: new Date() } }, // datos para actualizar
                { upsert: true } // Opción insertar si no existe
            )
            .then(function(r) {
                callback(null, r);
            })
            .catch(callback);
        })
        .catch(callback);
    console.log("<----- ACTUALIZARESTADO", monitorId);
}

module.exports = {
    obtenerLista: obtenerLista,
    actualizarEstado: actualizarEstado
};