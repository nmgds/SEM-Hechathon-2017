const mongoose = require('mongoose')

mongoose.connect('mongodb://localhost/hack')
mongoose.set('debug', true)

const RoundSchema = new mongoose.Schema({
    country: {
        type: String
    },
    questions: [{
        id: {
            type: Number
        },
        question: {
            type: String
        },
        answers: [{
            type: String
        }],
        rightAnswer: {
            type: String
        }
    }],
    info: {
        yearJoined: {
            type: String
        },
        participatedTimes: {
            type: Number
        },
        noWins: {
            type: Number
        },
        voters: {
            type: Number
        }
    }
})

const UserSchema = new mongoose.Schema({
    id: {
        type: String
    },
    username: {
        type: String
    },
    country: {
        type: String
    },
    answers: [{
        country: {
            type: String
        },
        questionId: {
            type: Number
        },
        answer: {
            type: String
        },
        timeRemaining: {
            type: Number
        }
    }],
    score: {type: Number}
});


const Round = mongoose.model('Round', RoundSchema)
const User = mongoose.model('User', UserSchema)

function getQuestion(country, ack) {
    Round.find({
        country: country
    }, function (err, data) {
        if (err) {
            console.log(err);
        } else {
            ack(data[0].questions[0],country);
        }
    })
};


function saveUser(data) {
    var user = new User(data);
    user.save(function (err) {
        if (err) {
            console.log(err);
        }
    })
}

function addAnswer(data, user) {
    console.log(user);
    User.update({
        id: user
    }, {
        "$push": {
            "answers": data
        }
    }, function (err) {
        if (err) {
            console.log(err);
        }
    });
}

function getInfo(country, ack) {
    Round.find({
        country: country
    }, function (err, data) {
        if (err) {
            console.log(err);
        } else ack(data[0].info);
    })
};

function getUserScores(user) {
    User.find({
        username: user
    }, function (err, data) {
        if (err) {
            console.log(err);
        } else ack(data[0].score);
    })

}

function getAllUsers(ack){
    Users.find({}, function(err, data){
         if (err) {
            console.log(err);
        } else ack(data);
    });
}
/*


function checkAnswer(country, questionID, answer){
    Round.find({country:country, questions.id:questionID}, function(err, data){
        if(err){
            console.log(err);
        }
        else{
            if(data[0].questions.rightAnswer.equals(answer)){
                //answer was right
                return true;
            }
            else{
                //answer was wrong
                return false;
                }
            
        }
    });
}
*/

exports.getQuestion = getQuestion
exports.getInfo = getInfo
exports.saveUser = saveUser
exports.addAnswer = addAnswer
