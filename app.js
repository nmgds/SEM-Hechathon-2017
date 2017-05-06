var express = require('express')
var io = require('socket.io')(8080);

var mongo = require('./server/mongo.js')

var app = express()

app.get('/', function (req, res) {
    res.send("SEM Hackathon 2017")
})

app.listen(3000, function () {
    console.log("Server started on port 3000.")
})

io.on('connection', function (client) {
    console.log("A new client has connected...");

    client.on('register', function (data) {
        console.log(data);
    });

    client.on('answer', function (data) {
        console.log(data);
    });

    client.on('question', function (data) {
        console.log(data);
        client.broadcast.emit('newQuestion', data);
    });
});
