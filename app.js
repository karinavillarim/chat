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
    var endereço = client.request.connection.remoteAddress;
    var porta = client.request.connection.remotePort;
    var nome;
    var teste = 0;
    var mensagem = endereço + " : " + porta + "/";
    console.log("Joined: " + name + " Address = " + endereço + " Port = " +porta);
    //console.log("Joined: " + name);
    var id;
    Object.keys(io.sockets.sockets).forEach(function(id){
      //clients[client.id] = name;
      nome = clients[id];

      if(nome == name){
        teste = 1;
      }

    })
    if(teste == 1){
      //client.emit("update", "Nickname already taken. Reload the page and enter another nickname");
      delete clients[client.id];
      client.emit("att", clients[client.id]);
    }else{
      clients[client.id] = name;
      client.emit("update", "You have connected to the server.");
      client.broadcast.emit("update", name + " has joined the server.");
      client.emit("exibe-ip",mensagem);
    }
  });
    client.on("manual-disconnection", function(data) {
      var endereço = client.request.connection.remoteAddress;
      var porta = client.request.connection.remotePort;
      console.log(endereço + ":" + porta + "/" + clients[client.id] + ": bye");
      console.log(clients[client.id] + " was manually disconnected.");
    });
    client.on("list", function(name){
      var endereço = client.request.connection.remoteAddress;
      var porta = client.request.connection.remotePort;
      //console.log(endereço + ":" + porta + "/" + clients[client.id] + ": list");
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
      var endereço = client.request.connection.remoteAddress;
      var porta = client.request.connection.remotePort;
      //console.log("Address = " + endereço + " Port = " +porta);
      //console.log("Message: " + msg);
      var name = clients[client.id];
      var mensagem = msg;
      mensagem = endereço + ":" + porta + "/" + name + ": " + msg;
      console.log(mensagem);
      client.broadcast.emit("chat", clients[client.id], msg);
    });
    client.on("send -user", function(msg){
      var endereço = client.request.connection.remoteAddress;
      var porta = client.request.connection.remotePort;
      //console.log("Address = " + endereço + " porta = " +porta);
      var nome = msg[0]
      msg.shift();
      msg = msg.join(" ");
      var name1 = clients[client.id];
      //console.log("Message 0: " + nome + " Mensagem 1 = " + msg);
      mensagem = endereço + ":" + porta + "/" + name1 + ": send -user " + nome + " " + msg;
      console.log(mensagem);
      var id;
      var name;
      var teste = 0;
      Object.keys(io.sockets.sockets).forEach(function(name){
        //clients[client.id] = name;
        id = name;
        //console.log("User: " + clients[id] + " ID: " +id);
        if(clients[name] == nome){
          id = name;
          teste = 1;
          //console.log("User-certo: " + nome + " ID: " +id);
          client.broadcast.to(id).emit("chat",clients[client.id], msg, mensagem);
        }
      })
      if(teste == 0){
        client.emit("update", "Username " + nome + " invalid " );
      }
      //client.in(id).emit("update", msg);
    });
    client.on("rename", function(name){
      var endereço = client.request.connection.remoteAddress;
      var porta = client.request.connection.remotePort;
      var teste = 0;
      Object.keys(io.sockets.sockets).forEach(function(id){
        //clients[client.id] = name;
        nome = clients[id];

        if(nome == name){
          teste = 1;
        }

      })
      if(teste == 1){
        client.emit("update", "Username " + name +" is already taken");
      }else{
      console.log(endereço + ":" + porta + "/" + clients[client.id] + ": rename");
      console.log("Previous username: " + clients[client.id]);
      nameaux = clients[client.id];
      clients[client.id] = name;
      console.log("New username: " + clients[client.id]);
        client.emit("mudar-nome", name);
        client.emit("update", "Your new username is: " + clients[client.id]);
        client.broadcast.emit("update", nameaux + " changed their username to: " + name);
      }
    });

    client.on("disconnect", function(){
    	console.log(clients[client.id] + " was disconnected");
      if(clients[client.id] != undefined){
        io.emit("update", clients[client.id] + " has left the server.");
      }
        delete clients[client.id];
    });

});


http.listen(3000, "0.0.0.0");

//client.broadcast.to(socketid).emit('message', 'for your eyes only');
