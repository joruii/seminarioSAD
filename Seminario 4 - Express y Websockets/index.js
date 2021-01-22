var app = require('express')();
var http = require('http').Server(app);
var io = require('socket.io')(http);
var nicknames=[];

app.get('/', function(req, res){
	res.sendFile(__dirname + '/index.html');
});

io.on('connection', function(socket){

  //Cuando alguien se desconecta
  socket.on('disconnect', function(data){
    console.log('user disconnected');
    socket.broadcast.emit('conectat' , 'El usuario: '+socket.nickname+' acaba de desconectarse!' );
    removeItemFromArr(nicknames, socket.nickname);

  });
  function removeItemFromArr ( arr, item ) {
    var i = arr.indexOf( item );
 
    if ( i !== -1 ) {
        arr.splice( i, 1 );
        io.emit('listaUsers', nicknames);
    }
  }
  socket.on('chat message', function(msg){
    console.log('message: ' + msg);
    socket.broadcast.emit('chat message', socket.nickname+ ": " +msg);
  });
  //Avisar cuando un usuario se conecta,soporte a nicknames y lista de usuarios conectados
  socket.on('nickname', function(data){
    if(nicknames.indexOf(data) != -1){
    socket.emit('error nick', 'nick ya escogido!');
    } else{
    nicknames.push(data);
    socket.nickname = data;
    console.log('Los usuarios son: ' + nicknames);
    socket.emit('bien nick');
    console.log('a user connected');
    io.emit('listaUsers', nicknames);
    socket.broadcast.emit('conectat' , 'El usuario: '+data+' acaba de conectarse!' );
    
    }});

  //Funcionalidad USER IS TYPING
  socket.on('usuarioEscribiendo', function(usuario){
    socket.broadcast.emit('typering',usuario);
  });

});

http.listen(4040, function(){
  console.log('listening on *:4040');
});
