const mongoose = require('mongoose')


const proxyModel = new mongoose.Schema({
    url:{type:String, required: true},
    username:{type:String, required: true},
    encryptedToken:{type:String, required: true},
    iv:{type:String, required: true},
},{collection:'proxy'})


module.exports = mongoose.model('Proxy', proxyModel)