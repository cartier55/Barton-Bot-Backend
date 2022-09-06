const mongoose = require('mongoose');
const proxyModel = require('./proxyModel');
const User = require('./userModel');


const pendingJobModel = new mongoose.Schema({
    date:{type:String, required: true, unique:true},
    startTime:{type:String, required: true},
    endTime:{type:String, required: true},
    courseList:{type:[String], required: true},
    member:{type:String},
    clubUsername:{type:String, required: true},
    clubPassword:{type:String, required: true},
    proxy:{type:Boolean, required: true, default:false},
    active:{type:Boolean, required: true, default:false},
},{collection:'pendingjobs'})

// pendingJobModel.pre('findOneAndDelete',function(next) {
//     User.update(
//         { },
//         { "$pull": { "pendingJobs": this._id } },
//         { "multi": true },
//         next
//     );
//     console.log('pre')
// })

module.exports = mongoose.model('PendingJob', pendingJobModel)