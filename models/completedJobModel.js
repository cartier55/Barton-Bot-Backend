const mongoose = require('mongoose')


const completedJobModel = new mongoose.Schema({
    date:{type:String, required: true, unique:true},
    successful:{type:Boolean, required: true},
    time:{type:String},
    course:{type:String},
    member:{type:String},
    user:{type:String, required: true},
},{collection:'completedjobs'})

module.exports = mongoose.model('CompletedJob', completedJobModel)