var express = require('express')
var path = require('path')
var io = require('socket.io')(8080);

var mongo = require('./server/mongo.js')

var app = express()

app.use(express.static('client'));



app.get('/', function (req, res) {
    res.sendFile(path.join(__dirname + '/client/home.html'))
})

app.get('/client', function (req, res) {
    res.sendFile(path.join(__dirname + '/client/client.html'))
})

app.get('/eurostaff', function (req, res) {
    res.sendFile(path.join(__dirname + '/client/eurostaff.html'))
})


app.listen(3000, function () {
    console.log("Server started on port 3000.")
})

io.on('connection', function (client) {
    console.log("A new client has connected...");

    client.on('register', function (data) {
        console.log("A new user has registered.");
        console.log(data);
        mongo.saveUser(data);
    });

    client.on('answer', function (data) {
        console.log("Received answer from " + data.userId);
        //var answerData = JSON.parse(data);
        var answerData = data;
        var finalAnswer = {
            country: answerData.country,
            answer: answerData.answer,
            timeRemaining: answerData.timeRemaining
        };
        mongo.addAnswer(finalAnswer, answerData.userId);

        //calculate and return the score
        mongo.getQuestion(answerData.country, function (question) {
            if (question.rightAnswer === answerData.answer) {
                //question is right, update the score
                var addedScore = calculateScore(answerData.timeRemaining);
                mongo.updateUserScore(answerData.userId, addedScore);
                client.emit('score', addedScore);
            } else {
                //+0 points
                client.emit('score', 0);
            }
        });
    });

    client.on('question', function (data) {
        mongo.getQuestion(data, function (question, country) {
            console.log(question);
            console.log("Sending a new question.");
            io.sockets.emit('newQuestion', question);
        });
    });

    client.on('info', function (data) {
        mongo.getInfo(data, function (info) {
            console.log("Sending country information.");
            client.emit('sendInfo', info);
        });
    });

    client.on('scores', function (data) {
        mongo.getAllUsers(function (users) {
            console.log("Sending current scores.");
            console.log(users);
            io.sockets.emit('scoreboard', users);
        })
    });
    
    client.on('requestJump', function(data){
        io.sockets.emit('jump', data);
    });
});

function calculateScore(timeRemaining) {
    var multiplier = 50;
    var bonus = 0;
    var base = 1000;
    if (timeRemaining > 0) {
        bonus = multiplier * timeRemaining;
    }
    return base + bonus;
}
