const mongoose = require('mongoose')

mongoose.connect('mongodb://localhost/hack')
mongoose.set('debug', true)

const RoundSchema = new mongoose.Schema({
    country: {type: String},
    questions: [{
        id: {type: Number},
        question:  {type: String}, 
        answers: [{type:String}],
        rightAnswer: {type: String}
    }],
    answer: {type: String},
    info: {type: String}
})

const UserSchema = new mongoose.Schema({
    id: {type: String},
    username: {type:String},
    country: {type:String},
    answers: [{
        country: {type: String}, 
        questionId: {type: Number}, 
        answer: {type: String}
    }]
})


const Round = mongoose.model('Round', RoundSchema)
const User = mongoose.model('User', UserSchema)

var getQuestion = (country) => {
    return new Promise((accept, reject) => {
    	Round.find({country: country}, (err, round) => {
    		if (err){
    			console.log(err)
    			accept()
    		}
    		else {
    			accept(round.question)
    		}
    	})
    })
}

var getUserAnswers = (username) => {
    return new Promise((accept, reject) => {
        User.find({username: username}, (err, user) => {
            if(err){
                console.log(err)
                accept()
            }
            else{
                accept(user.answers)
            }
        })
    })
}

function saveUser(data){
    var user = new User(data);
    user.save(function(err){
        if(err){
            console.log(err);
        }
    })
}

function addAnswer(data, user){
    User.update({username: user}, {"$push": {"answers": data.answer}});
}


exports.getQuestion = getQuestion
exports.getUserAnswers = getUserAnswers
exports.saveUser = saveUser
exports.addAnswer = addAnswer
