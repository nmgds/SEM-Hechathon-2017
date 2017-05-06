const mongoose = require('mongoose')

mongoose.connect('mongodb://localhost/hack')
mongoose.set('debug', true)

const RoundSchema = new mongoose.Schema({
    country: {type: String},
    question: {type: String},
    answer: {type: String},
    info: {type: String}
})

const Round = mongoose.model('Round', RoundSchema)


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

exports.getQuestion = getQuestion