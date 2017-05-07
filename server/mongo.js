const mongoose = require('mongoose')

mongoose.connect('mongodb://localhost/hack')
mongoose.set('debug', true)

const RoundSchema = new mongoose.Schema({
    country: {
        type: String
    },
    question: {
        type: String
    },
    answers: [{
        type: String
        }],
    rightAnswer: {
        type: String
    },
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
    score: {
        type: Number
    }
});

const Round = mongoose.model('Round', RoundSchema)
const User = mongoose.model('User', UserSchema)

function getQuestion(country, ack) {
    Round.findOne({
        country: country
    }, function (err, data) {
        if (err) {
            console.log(err);
        } else {
            console.log(country);
            ack(data, country);
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
    Round.findOne({
        country: country
    }, function (err, data) {
        if (err) {
            console.log(err);
        } else ack(data.info);
    })
};

function getUserScore(user, ack) {
    User.find({
        id: user
    }, function (err, data) {
        if (err) {
            console.log(err);
        } else ack(data[0].score);
    })
}

function getAllUsers(ack) {
    User.find({},[], {sort:{score:-1}, limit:5},function(err, data){
        if(err) {
            console.log(err);
        } else ack(data);
    });
}

function updateUserScore(user, addedScore) {
    getUserScore(user, function (currentScore) {
        var newScore = currentScore + addedScore;
        User.update({
            id: user
        }, {
            score: newScore
        }, function (err) {
            if (err) {
                console.log(err);
            }
        });
    });
}

exports.getQuestion = getQuestion
exports.getInfo = getInfo
exports.saveUser = saveUser
exports.addAnswer = addAnswer
exports.getAllUsers = getAllUsers
exports.getUserScore = getUserScore
exports.updateUserScore = updateUserScore
