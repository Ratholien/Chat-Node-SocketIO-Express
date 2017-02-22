var users = [];
var socket = io();
var nick, estado, foto;
$(document).ready(function () {

    //menu lateral
    $(".button-collapse").sideNav({
            menuWidth: 300, // Default is 300
            edge: 'left', // Choose the horizontal origin
            closeOnClick: true, // Closes side-nav on <a> clicks, useful for Angular/Meteor
            draggable: true // Choose whether you can drag to open on touch screens
        }
    );

    /*MODAL*/
    $('.modal').modal({
        dismissible: false, // Modal can be dismissed by clicking outside of the modal
    });

    $('#datosModal').modal('open');

    //MODAL BUTTON CLICK
    $('#enviarDatosModal').on("click", function () {
        if ($('#nombre').val() === "" || $('#estado').val() === "") {
            //NocerrarMODAL
            //MOSTRAR ERROR
        } else {
            if (users.indexOf($('#nombre').val()) == -1) {
                datosOK();
            } else {
                console.log("ERROR!_>NOMBRE YA USADO");
            }
        }

    });

    //Lo unico que hace es copiar la lista de users en el cliente.
    socket.on("listaUsers", function (serverUsers) {
        users.splice(0, users.length);
        for (var i = 0; i < serverUsers.length; i++) {
            users.push(serverUsers[i].nombre);
        }
    });


    //Crea la lista de usuarios que hay en el chat
    socket.on("crearListaUsers", function (serverUsers) {
        $(".connectedUsers ul").html("");
        users.splice(0, users.length);
        for (var i = 0; i < serverUsers.length; i++) {
            users.push(serverUsers[i].nombre);
            $(".connectedUsers ul")
                .append("" +
                    "<li class='collection-item avatar waves-effect'>" +
                    "<img class='circle' src='img/westworldmaze.png'>" +
                    "<p><strong>" + serverUsers[i].nombre + "</strong></p>" +
                    "<p><i>" + serverUsers[i].estado + "</i></p>" +
                    "</li>"
                );
        }
    });

    //Cuando llega un mensaje
    socket.on("mensaje", function (data) {
        if (data.msg != "") {
            if (data.nick === nick) {
                $('#messages').append($('<li>').append($('<div>')
                    .addClass("z-depth-2  ")
                    .css("background-color", "lightgreen")
                    .css("float", "right")
                    .css("clear", "both")
                    .css("margin-right", "1%")
                    .html("<strong>" + data.nick + "</strong><br>" + data.msg)));
            } else {
                $('#messages').append($('<li>').append($('<div>')
                    .addClass("z-depth-2 ")
                    .css("float", "left")
                    .css("clear", "both")
                    .html("<strong>" + data.nick + "</strong><br>" + data.msg)));
            }
            $('#m').val("");
        }
        $(window).scrollTop($(".chatMsg")[0].scrollHeight);
    });

    //Emviar Mensaje
    $('#form').submit(function () {
        data = {"nick": nick, "estado": estado, "msg": $('#m').val()};
        socket.emit('chat message', data);
        $('#m').val('');
        return false;
    });

    $('#m').keyup(function() {
        console.log('happening');
        typing = true;
        socket.emit('typing', 'typing...');
        clearTimeout(timeout);
        timeout = setTimeout(timeoutFunction, 2000);
    });
});

function datosOK() {
    //poner datos del usuario en SideNav
    $('#sideNavNombre').html($('#nombre').val());
    nick = $('#nombre').val();
    $('#sideNavEstado').html($('#estado').val());
    estado = $('#estado').val();

    //emitimos el evento //me meto a mi en el array de usuarios
    data = {"nick": nick, "estado": estado};
    socket.emit("userConnected", data);

    //cerramos modal satisfactoriamente
    $('#datosModal').modal("close");
}

