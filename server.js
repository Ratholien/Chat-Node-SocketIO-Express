//importa la libreria express,http,socketio


var express = require('express');
var app = express();
var http = require("http").Server(app);
var io = require('socket.io')(http);

app.use(express.static(__dirname + '/public'));

//array de usuarios totales
var users = [];


io.on('connection', function (socket) {
    //emite la lista de usuarios en el chat
    io.emit("listaUsers",users);
    //Solo salta cuando alguien nuevo llega
    socket.on("userConnected", function (data) {
        users.push(new User(data.nick, data.estado, socket.id));
        io.emit("crearListaUsers", users);
        console.log("Usuario Conectado : " + data.nick);
    });
    socket.on('chat message', function (data) {
        io.emit("mensaje", data);
    });
    socket.on('disconnect', function () {
        //eliminar con socket :D
        for (var i = 0; i < users.length; i++) {
            if (socket.id == users[i].socketId) {
                console.log("Usuario " + users[i].nombre + " Desconectado");
                users.splice(i, 1);
                io.emit("crearListaUsers", users);
                i = users.length;
            }
        }


    });
});

/*app.post('/upload', function(req, res) {
 //El modulo 'fs' (File System) que provee Nodejs nos permite manejar los archivos
 var fs = require('fs')

 var path = req.files.archivo.path
 var newPath = 'carpetaArchivos'

 var is = fs.createReadStream(path)
 var os = fs.createWriteStream(newPath)

 is.pipe(os)

 is.on('end', function() {
 //eliminamos el archivo temporal
 fs.unlinkSync(path)
 })
 res.send('¡archivo subido!')
 })*/
//Pone el servidor a escuchar el puerto 3000
http.listen(3000, function () {
    console.log('listening on *:3000');
});

class User {
    constructor(nom, est, socketId) {
        this.nombre = nom;
        this.estado = est;
        this.socketId = socketId
    }

    getNom() {
        return this.nombre;
    }

    getEst() {
        return this.estado;
    }

    getId() {
        return this.socketId;
    }
}