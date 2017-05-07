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
        mongo.saveUser(data);
    });

    client.on('answer', function (data) {
        console.log("Received answer from " + data.userId);
        console.log("received:" + JSON.stringify(data));
        //var answerData = JSON.parse(data);
        var answerData = data;
        var finalAnswer = {
            country: answerData.country,
            questionId: answerData.questionId,
            answer: answerData.answer,
            timeRemaining: answerData.timeRemaining
        };
        console.log(finalAnswer);
        mongo.addAnswer(finalAnswer, answerData.userId);


        //calculate and return the score
        mongo.getQuestion(answerData.country, function (question) {
            if (question.rightAnswer === answerData.answer) {
                //question is right, update the score
                var addedScore = calculateScore(answerData.timeRemaining);
                mongo.updateUserScore(answerData.userId, addedScore);
                client.emit('score', addedScore);
            } else {
                //do nothing, +0 points
            }
        });
    });

    client.on('question', function (data) {
        mongo.getQuestion(data, function (question, country) {
            var q = {
                country: country,
                questionId: question.id,
                question: question.question,
                answers: question.answers,
                rightAnswer: question.rightAnswer
            }
            console.log("Sending a new question.");
            io.sockets.emit('newQuestion', q);
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
            io.socket.emit('scoreboard', users);
        })
    });


    client.on('test', function () {
        console.log('app testing')
        client.emit('scoreboard', [{
            rank: 1,
            name: 2,
            country: 3,
            score: 4
        }, {
            rank: 5,
            name: 6,
            country: 7,
            score: 8
        }])
    })
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
