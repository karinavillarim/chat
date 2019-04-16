var app = require('express')();
var http = require('http').Server(app);
var io = require('socket.io')(http);

var nameaux;

var clients = {};

app.get('/', function(req, res){
  res.send('server is running');
});


io.on("connection", function (client) {
    client.on("join", function(name){
      var address = client.handshake.address;
      console.log("adress = " + address);
    	console.log("Joined: " + name);
        clients[client.id] = name;
        client.emit("update", "You have connected to the server.");
        client.broadcast.emit("update", name + " has joined the server.")
    });
    client.on("manual-disconnection", function(data) {
      console.log("User Manually Disconnected. \n\tTheir ID: " + data);
    });
    client.on("list", function(name){
      //clients[client.id] = name;
      //console.log("User1:" + name);
      Object.keys(io.sockets.sockets).forEach(function(name){
        //clients[client.id] = name;
        name = clients[name];
        console.log("User: " + name);
        io.emit("update", name + " is connected to the server.")
      })
    });
    client.on("send", function(msg){
      console.log("Message: " + msg);
      client.broadcast.emit("chat", clients[client.id], msg);
      //console.log("endereço: ", address);
    });
    client.on("send -user", function(msg){
    	console.log("Message: " + msg);
      client.in(msg[0]).emit("update", msg[1]);
    });
    client.on("rename", function(name){
      console.log("Previous username: " + clients[client.id]);
      nameaux = clients[client.id];
      clients[client.id] = name;
      console.log("New username: " + clients[client.id]);
        client.emit("update", "Your new username is:" + clients[client.id]);
        client.broadcast.emit("update", nameaux + " changed their username to: " + name);
    });

    client.on("disconnect", function(){
    	console.log("Disconnect");
        io.emit("update", clients[client.id] + " has left the server.");
        delete clients[client.id];
    });

});


http.listen(3000, function(){
  console.log('listening on port 3000');
});

//client.broadcast.to(socketid).emit('message', 'for your eyes only');
