const mongoose = require('mongoose')


const userModel = new mongoose.Schema({
    username:{type:String, required: true, unique:true},
    password:{type:String, required: true,},
    refreshToken:{type:String, default: ''},
    proxyConfig:{type: mongoose.Types.ObjectId, ref:'Proxy'},
    pendingJobs:{type: [mongoose.Types.ObjectId], ref:'PendingJob'},
    completedJobs:{type: [mongoose.Types.ObjectId], ref:'CompletedJob'}
},{collection:'users'})


module.exports = mongoose.model('User', userModel)