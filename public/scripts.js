$(function() {
    var socket = io();

    socket.on('system-message', function(message) {
        console.info(message);
        $('.messages .list')
            .prepend(`<article class="system"><div class="user">SYSTEM</div><div class="message">${ message }</div><div class="time">${ (new Date()).toLocaleString()  }</div></article>`)
    });
    socket.on('register.failed', function(errorMessage) {
        console.error(errorMessage);
    });
    socket.on('register.success', function(rooms) {
        $('.overlay').fadeOut();
        console.info(rooms);
    });
    
    socket.on('message.failed', function(errorMessage) {
        console.error(errorMessage);
    });
    socket.on('message.success', function(rooms) {
        $('#txtMessage').val('');
    });
    socket.on('message', function(message) {
        $('.messages .list')
            .prepend(`<article class="message"><div class="user">${ message.user }</div><div class="message">${ message.message }</div><div class="time">${ (new Date()).toLocaleString()  }</div></article>`)
    });

    $('#btnSubmitUsername').click(function() {
        socket.emit('register', $('#txtUsername').val());
    });
    $('#btnSubmitMessage').click(function() {
        socket.emit('message', $('#txtMessage').val());
    });


});