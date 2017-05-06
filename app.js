var express = require('express')
var io = require('socket.io')(8080);

var mongo = require('./server/mongo.js')

var app = express()

app.use(express.static('client'));

app.get('/', function (req, res) {
    res.send("SEM Hackathon 2017")
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
        console.log(data);
        var answerData = JSON.parse(data);
        var finalAnswer = {
        country: answerData.country, 
        questionId: answerData.questionId, 
        answer: answerData.answer
    };
        mongo.addAnswer(JSON.stringify(finalAnswer), answerData.userId)
        
    });

    client.on('question', function (data) {
        mongo.getQuestion(data, function(question){
            console.log("Sending a new question.");
        io.sockets.emit('newQuestion', question);
        });   
    });
    
    client.on('info', function(data){
       mongo.getInfo(data, function(info){
            client.emit('sendInfo', info);   
       });
        
    });
    
    
});