const mongoose = require('mongoose')


const completedJobModel = new mongoose.Schema({
    date:{type:String, required: true, unique:true},
    successful:{type:String, required: true},
    time:{type:String},
    course:{type:String},
    member:{type:String},
},{collection:'completedjobs'})

module.exports = mongoose.model('CompletedJob', completedJobModel)