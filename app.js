var app = require('express')();
var http = require('http').Server(app);
var io = require('socket.io')(http);

var clients = {};

app.get('/', function(req, res){
  res.send('server is running');
});

io.on("connection", function (client) {
    client.on("join", function(name){
    	console.log("Joined: " + name);
        clients[client.id] = name;
        client.emit("update", "You have connected to the server.");
        client.broadcast.emit("update", name + " has joined the server.")
    });
    client.on("manual-disconnection", function(data) {
      console.log("User Manually Disconnected. \n\tTheir ID: " + data);
    });
    client.on("list", function(name){
      clients[client.id] = name;
      Object.keys(io.sockets.sockets).forEach(function(name){
        console.log("User:" + name);
        clients[client.id] = name;
        io.emit("update", name + " is connected to the server.")
      })
    });
    client.on("send", function(msg){
    	console.log("Message: " + msg);
        client.broadcast.emit("chat", clients[client.id], msg);
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
