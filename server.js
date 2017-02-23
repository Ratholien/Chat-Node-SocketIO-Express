//importa la libreria express,http,socketio


var express = require('express');
var multer = require('multer');
var app = express();
var http = require("http").Server(app);
var io = require('socket.io')(http);

/*var storage = multer.diskStorage({
    destination: function (req, file, callback) {
        callback(null, './public/upload');
    },
    filename: function (req, file, callback) {
        callback(null, file.originalname+"");
    }
});
var upload = multer({storage: storage}).single('userPhoto');*/

//array de usuarios totales
var users = [];

app.use(express.static(__dirname + '/public'));




io.on('connection', function (socket) {
    //emite la lista de usuarios en el chat
    socket.broadcast.emit("listaUsers", users);

    //NUEVO USUARIO EN EL CHAT!
    socket.on("userConnected", function (data) {
        //Creamos un objeto user con toda la info
        users.push(new User(data.nick, data.estado,data.avatar, socket.id));
        //a todos menos a mi les decimos que se ha conectado un usuario
        socket.broadcast.emit("Conectado", data.nick);
        //la lista de conectados se actualiza para todos
        io.emit("crearListaUsers", users);
        console.log("Usuario Conectado : " + data.nick);
    });
    socket.on("typing", function (data) {
        socket.broadcast.emit("typing", data);
    });
    socket.on('chat message', function (data) {
        io.emit("mensaje", data);
    });
    socket.on('disconnect', function () {
        //eliminar con socket :D
        for (var i = 0; i < users.length; i++) {
            if (socket.id == users[i].socketId) {
                socket.broadcast.emit("Desconectado", users[i].nombre);
                console.log("Usuario " + users[i].nombre + " Desconectado");
                users.splice(i, 1);
                io.emit("crearListaUsers", users);
                i = users.length;
            }
        }


    });
});
//HACER QUE PARE DE RECARGAR!
/*app.post('/', function (req, res) {
    upload(req, res, function (err) {
        if (err) {
            console.log("Error alsubir el archivo");
            res.end();
            /!*return res.end("Error al cargar la imagen.");*!/
        }
        console.log("Archivo subido");
        res.send("index.html");
        res.end();
        /!*res.end();*!/
        /!*res.render("index.html");*!/
    });
});*/

//Pone el servidor a escuchar el puerto 3000
http.listen(3000, function () {
    console.log('listening on *:3000');
});

//Clase para cada usuario
class User {
    constructor(nom, est, avatar,socketId) {
        this.nombre = nom;
        this.estado = est;
        this.avatar = avatar;
        this.socketId = socketId
    }
}