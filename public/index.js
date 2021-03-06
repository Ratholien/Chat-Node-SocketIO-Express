var users = [];
var socket = io();
var nick, estado, avatar = "";
var timeout;
$(document).ready(function () {

    //menu lateral
    $(".button-collapse").sideNav({
            menuWidth: 300, // Default is 300
            edge: 'left', // Choose the horizontal origin
            closeOnClick: false, // Closes side-nav on <a> clicks, useful for Angular/Meteor
            draggable: true // Choose whether you can drag to open on touch screens
        }
    );

    /*MODAL*/
    $('.modal').modal({
        dismissible: false, // Modal can't be dismissed by clicking outside of the modal
    });

    $('#datosModal').modal('open');

    //Imagenes predefinidas efecto
    $(".imgPred img").on("click", function () {
        $(".imgPred img").removeClass("ease z-depth-2 ");
        $(this).addClass("ease z-depth-2 ");
        avatar = $(this).attr("src");
        console.log(avatar);
    });

    //MODAL BUTTON CLICK EMPIEZA EL CHAT!
    $('#enviarDatosModal').on("click", function () {
        var nombre = $("#nombre").val().trim();
        if (nombre === "" || $('#estado').val() === "") {
            Materialize.toast('¡Los campos no pueden estar vacíos!', 4000);
        } else {
            if (users.indexOf(nombre) === -1) {
                datosOK();
            } else {
                Materialize.toast('¡El nombre ya esta en uso!', 4000);
            }
        }

    });

    //mensaje cuando alguien se conecta
    socket.on("Conectado", function (user) {
        Materialize.toast(user + ' se ha conectado', 4000);
    });

    //Lo unico que hace es copiar la lista de users en el cliente.
    socket.on("listaUsers", function (serverUsers) {
        users.splice(0, users.length);
        for (var i = 0; i < serverUsers.length; i++) {
            users.push(serverUsers[i].nombre);
        }
        console.log(users)
    });


    //Crea la lista de usuarios que hay en el chat
    socket.on("crearListaUsers", function (serverUsers) {
        $(".connectedUsers ul").html("");
        users.splice(0, users.length);
        for (var i = 0; i < serverUsers.length; i++) {
            users.push(serverUsers[i].nombre);
            if (serverUsers[i].nombre != nick) {
                $(".connectedUsers ul")
                    .append("" +
                        "<li class='collection-item avatar waves-effect waves-purple'>" +
                        "<img class='circle' src=" + serverUsers[i].avatar + ">" +
                        "<p><strong>" + serverUsers[i].nombre + "</strong></p>" +
                        "<p><i>" + serverUsers[i].estado + "</i></p>" +
                        "</li>"
                    );
            }

        }
    });

    //Enviar Mensaje
    $(document).on("submit", "form.form", function () {
        console.log($('.m'));
        data = {"nick": nick, "estado": estado, "msg": $('#m').val()};
        socket.emit('chat message', data);
        $('#m').val('');
        return false;
    });
    //Cuando llega un mensaje
    socket.on("mensaje", function (data) {
        if (data["cliente"].msg != "") {
            if (data["cliente"].nick === nick) {
                $('#messages').append($('<li>').append($('<div>')
                    .addClass("z-depth-2 msgYo ")
                    .html("<strong>" + data["cliente"].nick + "</strong><br>" + data["cliente"].msg)
                ));
            } else {
                if(data["whisper"]==="no") {
                    $('#messages').append($('<li>').append($('<div>')
                        .addClass("z-depth-2 msgOtros ")
                        .html("<strong>" + data["cliente"].nick + "</strong><br>" + data["cliente"].msg)
                    ));
                }else{
                    $('#messages').append($('<li>').append($('<div>')
                        .addClass("z-depth-2 msgWhisper ")
                        .html("<strong>" + data["cliente"].nick + "</strong><br>" + data["cliente"].msg)
                    ));
                }
            }
            $('#m').val("");
        }
        //Mantener los mensajes abajo
        $(window).scrollTop($(".chatMsg")[0].scrollHeight);
    });

    //Activar el typing
    $('#m').keyup(function (e) {
        if (e.key != "Enter") {
            data = {"nick": nick, "msg": " está escribiendo... "};
            socket.emit('typing', data);
            clearTimeout(timeout);
            timeout = setTimeout(timeoutFunction, 1500);
        }
    });

    socket.on('typing', function (data) {
        console.log(data);
        if (!data) {
            $('.typing').html("");
        } else {
            $('.typing').html(data.nick + data.msg);
        }
    });

    socket.on("Desconectado", function (user) {
        Materialize.toast(user + ' se ha desconectado', 4000);
    });

//Click en salas para cambiar sala
    $(".btnSala").on("click", function () {
        /*id boton como id sala*/
        var roomId = $(this)[0].id;
        //join room
        socket.emit("joinRoom", roomId);
        $(".btnSala").removeClass("disabled");

        //noinspection JSAnnotator
        document.getElementById(roomId).classList += " disabled";
        Materialize.toast("Has cambiado a " + $(this).html(), 4000);
        //añadir linea divisora
        $("#messages").append(
            $('<li>').append($('<hr>').addClass("separador"))
        );
    });
//Click en usuarios para mensaje privado
    $(document).on("click", ".connectedUsers ul li", mensajePrivado)
});
//funcion usuarios
function mensajePrivado() {
    //botones de sala ON
    $(".btnSala").removeClass("disabled");
    //nombre del user
    var nombre = $(this).find("strong")[0].innerHTML;
    //nos metemos en la sala de ese user
    socket.emit("joinRoom2", nombre);
    //añadir linea divisora
    $("#messages").append(
        $('<li>').append($('<hr>').addClass("separador2"))
    );
    Materialize.toast("Conversación con "+nombre,5000);
}


//Manda false para quitar el mensaje "escribiendo"
function timeoutFunction() {
    socket.emit("typing", false);
}

//Comprueba todos los datos y los manda al servidor
function datosOK() {
    //poner datos del usuario en SideNav
    nick = $('#nombre').val();
    estado = $('#estado').val();
    $('#sideNavNombre').html(nick);
    $('#sideNavEstado').html(estado);
    if (avatar != "") {
        $('#sideNavAvatar').attr("src", avatar);
    } else {
        avatar = "img/user.png";
        $('#sideNavAvatar').attr("src", avatar);
    }

    //emitimos el evento //me meto a mi en el array de usuarios
    data = {"nick": nick, "estado": estado, "avatar": avatar};
    socket.emit("userConnected", data);

    //cerramos modal satisfactoriamente
    $('#datosModal').modal("close");
}

