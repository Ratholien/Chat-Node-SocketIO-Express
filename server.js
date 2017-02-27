//importa la libreria express,http,socketio
var express = require('express');
var app = express();
var http = require("http").Server(app);
var io = require('socket.io')(http);

//array de usuarios totales
var users = [];

app.use(express.static(__dirname + '/public'));


io.on('connection', function (socket) {
    //emite la lista de usuarios en el chat
    io.emit("listaUsers", users);


    //NUEVO USUARIO EN EL CHAT!
    socket.on("userConnected", function (data) {
        //Creamos un objeto user con toda la info
        users.push(new User(data.nick, data.estado, data.avatar, socket.id));

        //a todos menos a mi les decimos que se ha conectado un usuario
        socket.broadcast.emit("Conectado", data.nick);
        //la lista de conectados se actualiza para todos
        io.emit("crearListaUsers", users);
        //lo metemos en la sala general y su propia sala (de la que nunca se saldrá)
        socket.username = data.nick;
        socket.room = "btnChatGeneral";
        socket.join(socket.room);
        //mensaje en el server
        console.log("Usuario Conectado : " + socket.username);
    });
    socket.on("joinRoom", function (room) {
        socket.leave(socket.room);
        socket.room = room;
        socket.join(socket.room);
    });
    socket.on("joinRoom2", function (room) {
        var destino = "";
        //obtener usuario.socketID por nombre
        users.forEach(function (user) {
            if (user.nombre === room) {
                destino = user.socketId;
            }
        });
        if (socket.room != destino) {
            socket.leave(socket.room);
            socket.room = destino;
            socket.join(destino);
        }

        //Lo metemos en la sala con el ID de la otra persona.
        //Cada socket se escucha a si mismo por su id, para asi recibir privados de otros

    });
    socket.on("typing", function (data) {
        socket.broadcast.to(socket.room).emit("typing", data);
    });

    //saber en que sala esta el user que manda el evento
    socket.on('chat message', function (data) {
        if( socket.room != "btnChatGeneral" &&
            socket.room != "btnChatRoja" &&
            socket.room != "btnChatAmarilla"){
            var newdata = {"whisper": "si", "cliente": data};
            io.sockets.in(socket.room).emit("mensaje", newdata);
        }else{
            var newdata = {"whisper": "no", "cliente": data};
            io.sockets.in(socket.room).emit("mensaje", newdata);
        }
        /*socket.broadcast.to(socket.room).emit();*/ //manda a todos(en sala) menos a mi
    });

    socket.on('disconnect', function () {
        //eliminar con socket :D
        for (var i = 0; i < users.length; i++) {
            if (socket.id == users[i].socketId) {
                io.sockets.in(socket.room).emit("Desconectado", users[i].nombre);
                console.log("Usuario " + users[i].nombre + " Desconectado");
                users.splice(i, 1);
                io.emit("crearListaUsers", users);
                i = users.length;
            }
        }
    });
});


//Pone el servidor a escuchar el puerto 3000
http.listen(process.env.PORT || 3000, function () {
    console.log('listening on *:3000');
});

//Clase para cada usuario
class User {
    constructor(nom, est, avatar, socketId) {
        this.nombre = nom;
        this.estado = est;
        this.avatar = avatar;
        this.socketId = socketId
    }
}