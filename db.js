var MongoClient = require('mongodb').MongoClient;

var client = new MongoClient(process.env.CONNSTR, { useNewUrlParser: true });

var datosConexion = {
    url: "mongodb+srv://lector:TGRXOtj4KAdlxQI9@monitordb-9o1ct.mongodb.net/admin?retryWrites=true&w=majority",
    db: "MonitorDb",
    user: "lector",
    pass: "TGRXOtj4KAdlxQI9",
    collection: "devices"
};

function obtenerLista(callback) {
    console.log("-----> OBTENER_LISTA", datosConexion.url);
    var db = MongoClient.connect(datosConexion.url, {useNewUrlParser: true, useUnifiedTopology: true})
        .then(function(client) {
            var collection = client.db(datosConexion.db).collection(datosConexion.collection);
            collection.find().toArray(function(err2, dispositivos) {
                client.close();
                callback(err2, dispositivos);
            });
        })
        .catch(callback);
    console.log("<----- OBTENER_LISTA");
}

function actualizarEstado(monitorId, callback) {
    console.log("-----> ACTUALIZAR_ESTADO", monitorId, datosConexion.url);
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
    console.log("<----- ACTUALIZAR_ESTADO", monitorId);
}

function buscarDispositivo(monitorId, callback) {
    console.log("-----> BUSCAR_USUARIO", monitorId);
    var db = MongoClient.connect(datosConexion.url, {useNewUrlParser: true, useUnifiedTopology: true})
        .then(function(client) {
            var collection = client.db(datosConexion.db).collection(datosConexion.collection);
            collection.findOne(
                { monitorId: {$eq: monitorId} } // query
            )
            .then(function(data) {
                callback(null, data);
            })
            .catch(callback);
        })
        .catch(callback);
    console.log("<----- BUSCAR_USUARIO", monitorId);
}

function nuevoDispositivo(monitorId, callback) {
    console.log("-----> ACTUALIZAR_ESTADO", monitorId, datosConexion.url);
    MongoClient.connect(datosConexion.url, {useNewUrlParser: true, useUnifiedTopology: true})
        .then(function(client) {
            var collection = client.db(datosConexion.db).collection(datosConexion.collection);
            var ahora = new Date();
            collection.updateOne(
                { monitorId: {$eq: monitorId} }, // query
                { $set: { monitorId: monitorId, timestamp: null, ultimoMensaje: ahora,  ultimaCaida: null } },
                { upsert: true } // Opción insertar si no existe
            )
            .then(function(r) {
                callback(null, r);
            })
            .catch(callback);
        })
        .catch(callback);
    console.log("<----- ACTUALIZAR_ESTADO", monitorId);
}

function eliminarDispositivo(monitorId, callback) {
    console.log("-----> ELIMINAR_DISPOSITIVO", monitorId);
    MongoClient.connect(datosConexion.url, {useNewUrlParser: true, useUnifiedTopology: true})
        .then(function(client) {
            var collection = client.db(datosConexion.db).collection(datosConexion.collection);
            var ahora = new Date();
            collection.deleteOne({ monitorId: {$eq: monitorId} })
                .then(function(r) {
                    callback(null, r);
                })
                .catch(callback);
        })
        .catch(callback);
    console.log("<----- ELIMINAR_DISPOSITIVO", monitorId);
}

function establecerCaida(monitorId, callback) {
    console.log("-----> ESTABLECER_CAIDA", monitorId, datosConexion.url);
    MongoClient.connect(datosConexion.url, {useNewUrlParser: true, useUnifiedTopology: true})
        .then(function(client) {
            var collection = client.db(datosConexion.db).collection(datosConexion.collection);
            collection.updateOne(
                { monitorId: {$eq: monitorId} }, // query
                { $set: { ultimaRecuperacion: null, ultimaCaida: new Date() } } // datos para actualizar
            )
            .then(function(r) {
                callback(null, r);
            })
            .catch(callback);
        })
        .catch(callback);
    console.log("<----- ESTABLECER_CAIDA", monitorId);
}

function establecerUltimoMensaje(monitorId, callback) {
    console.log("-----> ESTABLECER_ULTIMO_MENSAJE", monitorId, datosConexion.url);
    MongoClient.connect(datosConexion.url, {useNewUrlParser: true, useUnifiedTopology: true})
        .then(function(client) {
            var collection = client.db(datosConexion.db).collection(datosConexion.collection);
            collection.updateOne(
                { monitorId: {$eq: monitorId} }, // query
                { $set: { ultimoMensaje: new Date() } } // datos para actualizar
            )
            .then(function(r) {
                callback(null, r);
            })
            .catch(callback);
        })
        .catch(callback);
    console.log("<----- ESTABLECER_ULTIMO_MENSAJE", monitorId);
}

function restaurarTrasCaida(monitorId, callback) {
    console.log("-----> RESTAURAR_TRAS_CAIDA", monitorId, datosConexion.url);
    MongoClient.connect(datosConexion.url, {useNewUrlParser: true, useUnifiedTopology: true})
        .then(function(client) {
            var collection = client.db(datosConexion.db).collection(datosConexion.collection);
            collection.updateOne(
                { monitorId: {$eq: monitorId} }, // query
                { $set: { ultimaCaida: null, ultimaRecuperacion: new Date() } } // datos para actualizar
            )
            .then(function(r) {
                callback(null, r);
            })
            .catch(callback);
        })
        .catch(callback);
    console.log("<----- RESTAURAR_TRAS_CAIDA", monitorId);
}

module.exports = {
    obtenerLista: obtenerLista,
    actualizarEstado: actualizarEstado,
    buscarDispositivo: buscarDispositivo,
    nuevoDispositivo: nuevoDispositivo,
    eliminarDispositivo: eliminarDispositivo,
    establecerCaida: establecerCaida,
    restaurarTrasCaida: restaurarTrasCaida,
    establecerUltimoMensaje: establecerUltimoMensaje
};